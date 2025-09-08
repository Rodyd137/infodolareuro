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

def _to_num(s: str):
    """Convierte '64,050.00' o '64.05' a float y corrige magnitudes absurdas (e.g., 6405000 -> 64.05)."""
    if not s:
        return None
    # Limpia espacios, NBSP y símbolos de moneda
    raw = s.replace("\xa0", "").replace("RD$", "").replace("$", "")
    raw = raw.replace("DOP", "").replace("US$", "").replace("€", "")
    raw = raw.strip()

    # Elimina cualquier caracter no numérico salvo punto y coma
    raw = re.sub(r"[^0-9\.,]", "", raw)

    if not raw:
        return None

    # Caso típico: "64,050.00" → quitar comas
    if "," in raw and "." in raw:
        try:
            return float(raw.replace(",", ""))
        except:
            pass
    # Si solo hay comas → tratarlas como punto decimal
    if "," in raw and "." not in raw:
        try:
            return float(raw.replace(",", "."))
        except:
            pass
    # Si solo hay punto
    try:
        return float(raw)
    except:
        return None
        
def find_updated_text(soup: BeautifulSoup) -> str | None:
    for t in soup.find_all(string=True):
        tt = _clean(t)
        low = tt.lower()
        if low.startswith("actualizado") or "actualización" in low or "actualizacion" in low:
            return tt
    return None

def parse_table(html: str, currency: str, source_url: str):
    """Devuelve (rows, updated_text). rows: [{bank,currency,buy,sell,spread,as_of_local,source}]"""
    soup = BeautifulSoup(html, "html.parser")
    updated_text = find_updated_text(soup)
    rows_out = []

    for table in soup.find_all("table"):
        # Headers
        headers = []
        thead = table.find("thead")
        if thead:
            ths = thead.find_all(["th","td"])
        else:
            first_tr = table.find("tr")
            ths = first_tr.find_all(["th","td"]) if first_tr else []
        for th in ths:
            headers.append(_norm(th.get_text(" ")))

        def idx_of(*alts):
            for a in alts:
                if a in headers:
                    return headers.index(a)
            for i,h in enumerate(headers):
                if any(a in h for a in alts):
                    return i
            return None

        idx_ent = idx_of("entidad","banco","agente","casa de cambio")
        idx_buy = idx_of("compra")
        idx_sell = idx_of("venta")
        if idx_ent is None or idx_buy is None or idx_sell is None:
            continue

        rows = table.find_all("tr")
        if not rows: continue
        start = 1 if thead is None and len(rows) > 0 else 0

        for tr in rows[start:]:
            tds = tr.find_all(["td","th"])
            if len(tds) <= max(idx_ent, idx_buy, idx_sell):
                continue
            entidad = _clean(tds[idx_ent].get_text(" "))
            buy_s  = _clean(tds[idx_buy].get_text(" "))
            sell_s = _clean(tds[idx_sell].get_text(" "))

            entity_norm = _norm(entidad)
            matched_nice = None
            for key, nice in TARGET_BANKS.items():
                if key in entity_norm:
                    matched_nice = nice; break
            if not matched_nice:
                continue

            buy = _to_num(buy_s)
            sell = _to_num(sell_s)
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

    return rows_out, updated_text
