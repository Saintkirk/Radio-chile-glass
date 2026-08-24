from __future__ import annotations

import csv
import json
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

source = (Path(__file__).resolve().parents[1] / "lib" / "radios.ts").read_text()
records = [{"id": m.group(1), "name": m.group(2), "url": m.group(3)} for m in re.finditer(r'\{ id: "([^"]+)".*?name: "([^"]+)".*?streamUrl: "([^"]+)"', source, re.S)]

def probe(record: dict[str, str]) -> dict[str, str]:
    row = {**record, "status": "error", "codec": "", "sample_rate": "", "channels": "", "bit_rate": "", "duration": ""}
    try:
        command = ["ffprobe", "-v", "error", "-rw_timeout", "12000000", "-timeout", "12000000", "-user_agent", "RadioChileGlass-Audit/1.0", "-show_entries", "stream=codec_name,sample_rate,channels,bit_rate,duration", "-of", "json", record["url"]]
        completed = subprocess.run(command, capture_output=True, text=True, timeout=20)
        payload = json.loads(completed.stdout or "{}")
        stream = (payload.get("streams") or [{}])[0]
        row.update({key: str(stream.get(key, "")) for key in ("codec_name", "sample_rate", "channels", "bit_rate", "duration")})
        row["codec"] = row.pop("codec_name")
        row["status"] = "ok" if completed.returncode == 0 and row["codec"] else "unavailable"
    except Exception as exc:
        row["status"] = type(exc).__name__
    return row

with ThreadPoolExecutor(max_workers=6) as pool:
    futures = [pool.submit(probe, record) for record in records]
    rows = sorted((future.result() for future in as_completed(futures)), key=lambda row: row["id"])
fields = ["id", "name", "status", "codec", "sample_rate", "channels", "bit_rate", "duration", "url"]
writer = csv.DictWriter(__import__("sys").stdout, fieldnames=fields, delimiter="\t", lineterminator="\n")
writer.writeheader()
writer.writerows(rows)
