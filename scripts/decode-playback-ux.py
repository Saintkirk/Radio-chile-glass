#!/usr/bin/env python3
import base64
import json
from pathlib import Path

payload = {}
for name in ("scripts/playback-ux-files-1.json", "scripts/playback-ux-files-2.json", "scripts/playback-ux-files.json"):
    path = Path(name)
    if path.exists():
        payload.update(json.loads(path.read_text()))
if not payload:
    raise SystemExit("no payload json found")
for path, b64 in payload.items():
    data = base64.b64decode(b64)
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_bytes(data)
    print("wrote", path, len(data))
print("done")
