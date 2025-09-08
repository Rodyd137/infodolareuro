import re
from bs4 import BeautifulSoup

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

def parse_table(html: str, currency: str, source_url: str):
    """
    Estrategia robusta:
    - Buscar todas las filas <tr> de las tablas.
    - Para cada fila, si el texto contiene alguno de los bancos objetivo, extraer
      los primeros 2 números de la fila (compra, venta).
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
            buy = nums[0] if len(nums) >= 1 else None
            sell = nums[1] if len(nums) >= 2 else None
            spread = round(sell - buy, 2) if (buy is not None and sell is not None) else None

            rows_out.append({
                "bank": matched_nice,
                "currency": currency,
                "buy": buy,
                "sell": sell,
                "spread": spread,
                "as_of_local": updated_text,
                "source": source_url
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
