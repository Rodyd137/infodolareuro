import re
import urllib.request
from urllib.parse import urljoin
from bs4 import BeautifulSoup

# Tiny in-memory cache for the PNG-availability probe in `_extract_logo`.
# Same bank logo URL appears in every row across both pages, so we cap
# the extra HEAD requests at one per distinct path per run.
_LOGO_PROBE_CACHE: dict[str, str] = {}

# Name normalisation. The <img alt> on infodolar.com.do rows already
# carries the canonical entity name once we strip the leading "Dólar "
# or "Euro " currency word; this map only exists to rewrite a few
# noisier alt texts to the form the iOS app expects.
NAME_OVERRIDES = {
    "Asociación Cibao": "Asociación Cibao de Ahorros y Préstamos",
}

# Entities to drop from the feed even though they appear on the source
# page. Matched after name resolution, case-insensitively + diacritic-
# insensitive so "Motor Crédito" and "motor credito" both match. The
# list is intentionally small and reviewed by the app owner — keep it
# in sync with their preferred surface set rather than auto-pruning.
EXCLUDED_ENTITIES = {
    "abonap",
    "taveras",
    "motor credito",
    "moneycorps",
    "sct",
    "rm",
    "gamelin",
    "capla",
    "cambio extranjero",
    "panora exchange",
    "asociacion peravia de ahorros y prestamos",
}


def _is_excluded(name: str) -> bool:
    norm = (
        name.lower()
        .replace("á", "a").replace("é", "e").replace("í", "i")
        .replace("ó", "o").replace("ú", "u").replace("ñ", "n")
    )
    return norm in EXCLUDED_ENTITIES

def _clean(txt: str) -> str:
    return re.sub(r"\s+", " ", (txt or "").strip()).replace("\xa0", " ")

def _fix_magnitude(n: float) -> float:
    # Corrige cuando el número llega como 6405000.00 en vez de 64.05
    if n > 1000:
        if 100000 <= n < 10000000:
            n /= 100000.0
        elif 10000 <= n < 100000:
            n /= 1000.0
    return n

def _to_num(s: str):
    """Convierte strings a float soportando '64,050.00', '64.05', 'RD$ 64.05'."""
    if not s:
        return None
    raw = s.replace("\xa0", "")
    raw = re.sub(r"[^\d\.,]", "", raw)  # deja solo dígitos . ,
    if not raw:
        return None

    # Caso '64,050.00' (coma miles + punto decimal)
    if "," in raw and "." in raw:
        try:
            n = float(raw.replace(",", ""))
            return round(_fix_magnitude(n), 2)
        except:
            pass
    # Caso '64,05' (coma decimal)
    if "," in raw and "." not in raw:
        try:
            n = float(raw.replace(",", "."))
            return round(_fix_magnitude(n), 2)
        except:
            pass
    # Caso '64.05'
    try:
        n = float(raw)
        return round(_fix_magnitude(n), 2)
    except:
        return None

def find_updated_text(soup: BeautifulSoup) -> str | None:
    for t in soup.find_all(string=True):
        tt = _clean(t)
        low = tt.lower()
        if low.startswith("actualizado") or "actualización" in low or "actualizacion" in low:
            return tt
    return None

def numbers_in_text(txt: str):
    """
    Devuelve todos los números tipo 64,050.00 | 64.05 | 64,05 presentes en el texto.
    """
    txt = txt.replace("\xa0", "")
    # quita símbolos de moneda para no romper las capturas
    txt = re.sub(r"(rd\$|us\$|dop|€)", "", txt, flags=re.IGNORECASE)
    # captura secuencias con miles/decimales
    candidates = re.findall(r"\d{1,3}(?:[\.,]\d{3})*(?:[\.,]\d{2})|\d+(?:[\.,]\d{2})", txt)
    out = []
    for c in candidates:
        n = _to_num(c)
        if n is not None:
            out.append(n)
    return out

def _probe(url: str) -> bool:
    """HEAD-style probe — returns True if the URL is 2xx."""
    try:
        req = urllib.request.Request(url, method="HEAD",
                                     headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=8) as r:
            return 200 <= r.status < 300
    except Exception:
        return False


# Basenames whose PNG variants on infodolar have a baked-in white
# rectangle background — promoting them would force the iOS hero card
# to show a white block over the colored gradient. Keep these as `.svg`
# so the client falls through to its bundled (transparent) asset.
_PNG_DENYLIST = {"banreservas"}


def _prefer_png(src_abs: str) -> str:
    """Most logos are published as `<name>.svg`, but iOS's `AsyncImage`
    cannot decode SVG over a URL — it only handles raster formats. The
    site happens to also publish raster variants at predictable paths.
    Probe the most desirable variants in order and return the first one
    that exists, falling back to the original `.svg` URL when nothing
    else does (the client will then degrade to its bundled asset)."""
    if src_abs in _LOGO_PROBE_CACHE:
        return _LOGO_PROBE_CACHE[src_abs]
    if not src_abs.lower().endswith(".svg"):
        _LOGO_PROBE_CACHE[src_abs] = src_abs
        return src_abs
    base = src_abs[:-4]  # drop ".svg"
    basename = base.rsplit("/", 1)[-1].lower()
    if basename in _PNG_DENYLIST:
        _LOGO_PROBE_CACHE[src_abs] = src_abs
        return src_abs
    for candidate in (base + "-2x.png", base + ".png"):
        if _probe(candidate):
            _LOGO_PROBE_CACHE[src_abs] = candidate
            return candidate
    _LOGO_PROBE_CACHE[src_abs] = src_abs
    return src_abs


def _extract_logo(tr, source_url: str) -> str | None:
    """Each <tr> on infodolar.com.do carries the bank's logo as the
    leading <img>, e.g. `<img src="/images/entidades/banreservas.svg">`.
    Resolve the relative src to an absolute URL and, when only the SVG
    variant is referenced, prefer the raster PNG that exists at the
    same path so the iOS client (which can't render remote SVG via
    AsyncImage) can hotlink it directly."""
    for img in tr.find_all("img"):
        src = img.get("src") or img.get("data-src")
        if not src:
            continue
        if "/images/entidades/" in src:
            return _prefer_png(urljoin(source_url, src))
    return None


def _row_entity_img(tr):
    """Return the first <img> that points at /images/entidades/, or
    None when the row isn't an entity row (headers, summary rows, etc)."""
    for img in tr.find_all("img"):
        src = img.get("src") or img.get("data-src") or ""
        if "/images/entidades/" in src:
            return img
    return None


def _entity_name(img) -> str:
    """Canonical entity name from the <img alt>, stripped of the
    currency-word prefix infodolar adds for SEO."""
    alt = (img.get("alt") or "").strip()
    for prefix in ("Dólar ", "Euro ", "Dolar "):
        if alt.startswith(prefix):
            alt = alt[len(prefix):]
            break
    alt = _clean(alt)
    return NAME_OVERRIDES.get(alt, alt)


def parse_table(html: str, currency: str, source_url: str):
    """
    Estrategia:
    - Recorrer todas las filas <tr> de todas las tablas.
    - Una fila cuenta como dato de tasa cuando tiene un <img> de
      /images/entidades/ Y al menos dos números en rango (10..300) —
      compra y venta. Cualquier banco, asociación o cambista que
      cumpla ambas condiciones entra al feed sin necesidad de
      hardcodear su nombre.
    """
    soup = BeautifulSoup(html, "html.parser")
    updated_text = find_updated_text(soup)
    rows_out = []

    for table in soup.find_all("table"):
        for tr in table.find_all("tr"):
            img = _row_entity_img(tr)
            if img is None:
                continue
            name = _entity_name(img)
            if not name:
                continue
            if _is_excluded(name):
                continue

            row_text = _clean(tr.get_text(" ", strip=True))
            nums = numbers_in_text(row_text)
            # Filtra solo valores razonables (tasas reales, no variaciones u otros)
            nums = [n for n in nums if 10 <= n <= 300]
            # Skip rows that only published a partial rate — a row
            # without both buy AND sell isn't actionable in the app.
            if len(nums) < 2:
                continue

            buy = nums[0]
            sell = nums[1]
            spread = round(sell - buy, 2)
            logo_url = _extract_logo(tr, source_url)

            rows_out.append({
                "bank": name,
                "currency": currency,
                "buy": buy,
                "sell": sell,
                "spread": spread,
                "as_of_local": updated_text,
                "source": source_url,
                "logo_url": logo_url,
            })

    # Dedupe por banco (si la página repite tablas)
    seen = set()
    deduped = []
    for r in rows_out:
        k = (r["bank"], r["currency"])
        if k in seen: 
            continue
        seen.add(k)
        deduped.append(r)

    return deduped, updated_text
