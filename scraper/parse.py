import re
import urllib.request
from urllib.parse import urljoin
from bs4 import BeautifulSoup

# Tiny in-memory cache for the PNG-availability probe in `_extract_logo`.
# Same bank logo URL appears in every row across both pages, so we cap
# the extra HEAD requests at one per distinct path per run.
_LOGO_PROBE_CACHE: dict[str, str] = {}

TARGET_BANKS = {
    "banreservas": "Banreservas",
    "banco popular": "Banco Popular",
    "popular dominicano": "Banco Popular",
    "banco bhd": "Banco BHD",
    "bhd": "Banco BHD",
    "banco vimenca": "Banco Vimenca",
    "vimenca": "Banco Vimenca",
    "asociación cibao": "Asociación Cibao de Ahorros y Préstamos",
    "asociacion cibao": "Asociación Cibao de Ahorros y Préstamos",
    "asociación cibao de ahorros y préstamos": "Asociación Cibao de Ahorros y Préstamos",
    "asociacion cibao de ahorros y prestamos": "Asociación Cibao de Ahorros y Préstamos",
    "banco caribe": "Banco Caribe",
}

def _clean(txt: str) -> str:
    return re.sub(r"\s+", " ", (txt or "").strip()).replace("\xa0", " ")

def _norm(txt: str) -> str:
    return _clean(txt).lower()

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


def parse_table(html: str, currency: str, source_url: str):
    """
    Estrategia robusta:
    - Buscar todas las filas <tr> de las tablas.
    - Para cada fila, si el texto contiene alguno de los bancos objetivo, extraer
      los primeros 2 números de la fila (compra, venta) y el logo del banco.
    """
    soup = BeautifulSoup(html, "html.parser")
    updated_text = find_updated_text(soup)
    rows_out = []

    # Recorre TODAS las filas de TODAS las tablas
    for table in soup.find_all("table"):
        for tr in table.find_all("tr"):
            row_text = _clean(tr.get_text(" ", strip=True))
            norm = _norm(row_text)
            matched_nice = None
            for key, nice in TARGET_BANKS.items():
                if key in norm:
                    matched_nice = nice
                    break
            if not matched_nice:
                continue

            nums = numbers_in_text(row_text)
            # Filtra solo valores razonables (tasas reales, no variaciones u otros)
            nums = [n for n in nums if 10 <= n <= 300]
            buy = nums[0] if len(nums) >= 1 else None
            sell = nums[1] if len(nums) >= 2 else None
            spread = round(sell - buy, 2) if (buy is not None and sell is not None) else None
            logo_url = _extract_logo(tr, source_url)

            rows_out.append({
                "bank": matched_nice,
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
