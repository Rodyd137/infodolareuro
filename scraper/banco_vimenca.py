"""
Direct-from-source rates for Banco Vimenca (bancovimenca.com).

Their SPA proxies a clean JSON API exposing every currency they trade,
both buy AND sell values — strictly better than what infodolar publishes
for them (which is nothing — they're not even on infodolar's table).

    GET https://devops.bancovimenca.com/api-proxy.php

    {
      "status": "OK",
      "data": [
        {"coinCode": 2,  "coinName": "DOLAR EE.UU",      "purchaseValue": 58.0, "saleValue": 60.2},
        {"coinCode": 4,  "coinName": "EURO",             "purchaseValue": 66.8, "saleValue": 70.9},
        {"coinCode": 32, "coinName": "Dolar Canadiense", "purchaseValue": 39.3, "saleValue": 43.7},
        {"coinCode": 33, "coinName": "Franco Suizo",     "purchaseValue": 70.6, "saleValue": 76.0},
        {"coinCode": 59, "coinName": "Libra Esterlina",  "purchaseValue": 75.45, "saleValue": 81.0}
      ]
    }

CORS is wide open (`access-control-allow-origin: *`) and no auth header
is required — straight GET.
"""

from __future__ import annotations

import json
import urllib.request
from typing import List

API_URL    = "https://devops.bancovimenca.com/api-proxy.php"
SOURCE_URL = "https://www.bancovimenca.com/"
LOGO_URL   = "https://grupovimenca.com.do/wp-content/uploads/2025/08/BancoVimencaIcon.png"
BANK_NAME  = "Banco Vimenca"
UA         = "Mozilla/5.0 (+github-actions; scraper educativo; contacto: issues del repo)"
TIMEOUT_S  = 12

# Vimenca's internal `coinCode` int → ISO currency code we publish in
# the feed. Anything outside this map is silently dropped (they don't
# trade any other currencies today, but the map keeps us strict if a
# new coin shows up unexpectedly).
_COIN_TO_CODE = {
    2:  "USD",
    4:  "EUR",
    32: "CAD",
    33: "CHF",
    59: "GBP",
}


def _fetch_json() -> dict:
    req = urllib.request.Request(API_URL, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=TIMEOUT_S) as r:
        return json.loads(r.read().decode("utf-8", errors="ignore"))


def fetch_rates() -> List[dict]:
    """Returns one dict per traded currency. Shape matches `parse_table`
    so the rows slot into `main.py`'s items map alongside the infodolar
    rows and the Caribe Express rows."""
    try:
        payload = _fetch_json()
    except Exception as e:
        print(f"[WARN] Banco Vimenca failed: {e}")
        return []

    if payload.get("status") != "OK":
        print(f"[WARN] Banco Vimenca: unexpected status {payload.get('status')!r}")
        return []

    items: List[dict] = []
    for row in payload.get("data") or []:
        code = _COIN_TO_CODE.get(row.get("coinCode"))
        if not code:
            continue
        try:
            buy  = round(float(row["purchaseValue"]), 2)
            sell = round(float(row["saleValue"]), 2)
        except (KeyError, TypeError, ValueError):
            continue
        items.append({
            "bank":         BANK_NAME,
            "currency":     code,
            "buy":          buy,
            "sell":         sell,
            "spread":       round(sell - buy, 2),
            "as_of_local":  row.get("fecha"),
            "source":       SOURCE_URL,
            "logo_url":     LOGO_URL,
        })

    print(f"[DEBUG][Banco Vimenca] {len(items)} tasas: "
          f"{[(x['currency'], x['buy'], x['sell']) for x in items]}")
    return items
