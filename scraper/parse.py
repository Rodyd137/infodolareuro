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
    # Deja solo dígitos, coma y punto
    raw = re.sub(r"[^0-9\.,]", "", (s or ""))
    if not raw:
        return None

    # Si hay ambos separadores, asumimos formato con miles y decimales
    # Normalizamos a punto decimal.
    if "." in raw and "," in raw:
        # Detecta cuál parece miles (el que aparece primero y repetido)
        # Caso típico RD: "64,050.00" -> quitar comas, mantener punto
        raw = raw.replace(",", "")
        try:
            n = float(raw)
        except:
            n = None
    else:
        # Solo uno de los separadores
        try:
            n = float(raw.replace(",", "."))
        except:
            n = None

    if n is None:
        return None

    # Corregir magnitud absurda (p. ej. 6405000.00 => 64.05)
    if n > 1000:
        # si tiene más de 3 dígitos extra, divide por 100000
        if n >= 100000 and n < 10000000:
            n = n / 100000.0
        elif n >= 10000 and n < 100000:
            n = n / 1000.0

    return round(n, 4)
def find_updated_text(soup: BeautifulSoup) -> str | None:
    for t in soup.find_all(string=True):
        tt = _clean(t)
        if tt.lower().startswith("actualizado") or "actualización" in tt.lower():
            return tt
    return None

def parse_table(html: str, currency: str, source_url: str):
    soup = BeautifulSoup(html, "html.parser")
    updated_text = find_updated_text(soup)
    rows_out = []

    tables = soup.find_all("table")
    for table in tables:
        headers = []
        thead = table.find("thead")
        if thead:
            ths = thead.find_all(["th", "td"])
        else:
            first_tr = table.find("tr")
            ths = first_tr.find_all(["th", "td"]) if first_tr else []
        for th in ths:
            headers.append(_norm(th.get_text(" ")))

        def idx_of(*alts):
            for a in alts:
                if a in headers:
                    return headers.index(a)
            for i, h in enumerate(headers):
                if any(a in h for a in alts):
                    return i
            return None

        idx_ent = idx_of("entidad", "banco", "agente", "casa de cambio")
        idx_buy = idx_of("compra")
        idx_sell = idx_of("venta")
        if idx_ent is None or idx_buy is None or idx_sell is None:
            continue

        body_rows = table.find_all("tr")
        if not body_rows:
            continue
        start = 1 if thead is None and len(body_rows) > 0 else 0

        for tr in body_rows[start:]:
            tds = tr.find_all(["td", "th"])
            if len(tds) <= max(idx_ent, idx_buy, idx_sell):
                continue
            entidad = _clean(tds[idx_ent].get_text(" "))
            buy_s  = _clean(tds[idx_buy].get_text(" "))
            sell_s = _clean(tds[idx_sell].get_text(" "))

            entity_norm = _norm(entidad)
            matched_nice = None
            for key, nice in TARGET_BANKS.items():
                if key in entity_norm:
                    matched_nice = nice
                    break
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
