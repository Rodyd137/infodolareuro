import os, json, csv, datetime as dt, urllib.request
from parse import parse_table

USD_URL = "https://www.infodolar.com.do/"
EUR_URLS = [
    "https://www.infodolar.com.do/precio-euro.aspx",
    "https://www.infodolar.com.do/precio-euro-provincia-santo-domingo.aspx",
]

UA = "Mozilla/5.0 (+github-actions; scraper educativo; contacto: issues del repo)"

def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read().decode("utf-8", errors="ignore")

def try_fetch_eur() -> tuple[str, str]:
    last_err = None
    for u in EUR_URLS:
        try:
            return fetch(u), u
        except Exception as e:
            last_err = e
    raise last_err if last_err else RuntimeError("No EUR URL fetched")

def main():
    usd_html = fetch(USD_URL)
    eur_html, eur_used = try_fetch_eur()

    usd_rows, ts_usd = parse_table(usd_html, "USD", USD_URL)
    eur_rows, ts_eur = parse_table(eur_html, "EUR", eur_used)

    items_map = {}
    for row in usd_rows + eur_rows:
        key = (row["bank"], row["currency"])
        items_map[key] = row

    data = {
        "generated_at_utc": dt.datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "as_of_local_usd": ts_usd,
        "as_of_local_eur": ts_eur,
        "items": list(items_map.values()),
    }

    os.makedirs("data", exist_ok=True)
    with open("data/latest.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    with open("data/latest.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["bank", "currency", "buy", "sell", "spread", "as_of_local", "source"])
        for it in data["items"]:
            w.writerow([it["bank"], it["currency"], it["buy"], it["sell"], it["spread"], it["as_of_local"], it["source"]])

    ts = dt.datetime.now().strftime("%Y/%m/%d-%H%M")
    path = f"history/{ts}.json"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)

if __name__ == "__main__":
    main()
