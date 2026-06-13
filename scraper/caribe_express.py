"""
Direct-from-source rates for Caribe Express (caribeexpress.com.do).

Caribe Express publishes one panel of buy-only rates on their homepage
covering 5 currencies (USD, EUR, GBP, CHF, CAD). They do NOT expose a
"venta" rate publicly — the corresponding sell + spread fields stay
null in the feed so the iOS app can render the row buy-only.

Why scrape this in addition to infodolar.com.do: infodolar is a third
party aggregator that can lag or stop scraping these houses entirely
(it does not cover Caribe Express at all). Pulling straight from the
remittance house's own page removes the middleman dependency for any
entity we already maintain a direct selector for.
"""

from __future__ import annotations

import re
import urllib.request
from typing import List

from bs4 import BeautifulSoup

SOURCE_URL = "https://caribeexpress.com.do/"
LOGO_URL   = "https://caribeexpress.com.do/images/logotop.png"
BANK_NAME  = "Caribe Express"
UA         = "Mozilla/5.0 (+github-actions; scraper educativo; contacto: issues del repo)"
TIMEOUT_S  = 12

# Each homepage panel row reads e.g. "DOLARES AMERICANOS $ 58.00 compra".
# Capture the label + the rate as a single sweep so a layout shuffle on
# the source doesn't quietly break the order of the captures.
_RATE_RE = re.compile(
    r"(DOLARES\s+AMERICANOS|EUROS|LIBRAS\s+ESTERLINAS|"
    r"FRANCOS\s+SUIZOS|DOLARES\s+CANADIENSES)"
    r"\s*\$?\s*(\d+(?:\.\d{1,2})?)\s*compra",
    re.IGNORECASE,
)

# Source label → ISO currency code we publish in the feed.
_LABEL_TO_CODE = {
    "DOLARES AMERICANOS":   "USD",
    "EUROS":                "EUR",
    "LIBRAS ESTERLINAS":    "GBP",
    "FRANCOS SUIZOS":       "CHF",
    "DOLARES CANADIENSES":  "CAD",
}


def _fetch_html() -> str:
    req = urllib.request.Request(SOURCE_URL, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=TIMEOUT_S) as r:
        return r.read().decode("utf-8", errors="ignore")


def fetch_rates() -> List[dict]:
    """Returns one dict per currency, shaped to merge directly into
    `main.py`'s items list. `sell` and `spread` are intentionally None —
    the source doesn't publish them."""
    try:
        html = _fetch_html()
    except Exception as e:
        print(f"[WARN] Caribe Express failed: {e}")
        return []

    text = " ".join(
        BeautifulSoup(html, "html.parser").get_text(" ", strip=True).split()
    )

    out: List[dict] = []
    seen_codes: set[str] = set()
    for m in _RATE_RE.finditer(text):
        label = re.sub(r"\s+", " ", m.group(1).upper())
        code = _LABEL_TO_CODE.get(label)
        if not code or code in seen_codes:
            continue
        try:
            buy = round(float(m.group(2)), 2)
        except ValueError:
            continue
        seen_codes.add(code)
        out.append({
            "bank":         BANK_NAME,
            "currency":     code,
            "buy":          buy,
            "sell":         None,
            "spread":       None,
            "as_of_local":  None,
            "source":       SOURCE_URL,
            "logo_url":     LOGO_URL,
        })

    print(f"[DEBUG][Caribe Express] {len(out)} tasas: "
          f"{[(x['currency'], x['buy']) for x in out]}")
    return out
