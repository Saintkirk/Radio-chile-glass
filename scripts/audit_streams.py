from __future__ import annotations

import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import requests

SOURCE = Path(__file__).resolve().parents[1] / "lib" / "radios.ts"
PATTERN = re.compile(r'\{ id: "([^"]+)".*?name: "([^"]+)".*?streamUrl: "([^"]+)"', re.S)
text = SOURCE.read_text()
records = []
for match in PATTERN.finditer(text):
    records.append({"id": match.group(1), "name": match.group(2), "url": match.group(3)})

headers = {"User-Agent": "RadioChileGlass-Audit/1.0", "Icy-MetaData": "1"}

def audit(record: dict[str, str]) -> dict[str, str]:
    result = {**record, "status": "error", "http": "", "content_type": "", "bytes": "0", "prefix": ""}
    try:
        response = requests.get(record["url"], headers=headers, stream=True, timeout=(8, 12), allow_redirects=True)
        result["http"] = str(response.status_code)
        result["content_type"] = response.headers.get("content-type", "").split(";")[0]
        chunk = next(response.iter_content(65536), b"")
        result["bytes"] = str(len(chunk))
        result["prefix"] = chunk[:12].hex()
        result["status"] = "ok" if response.ok and len(chunk) > 0 else "unavailable"
        response.close()
    except Exception as exc:
        result["prefix"] = type(exc).__name__
    return result

with ThreadPoolExecutor(max_workers=8) as pool:
    futures = [pool.submit(audit, record) for record in records]
    results = [future.result() for future in as_completed(futures)]
results.sort(key=lambda item: item["id"])
print("id\tname\tstatus\thttp\tcontent_type\tbytes\tprefix\turl")
for item in results:
    print("\t".join(item[field].replace("\t", " ") for field in ("id", "name", "status", "http", "content_type", "bytes", "prefix", "url")))
