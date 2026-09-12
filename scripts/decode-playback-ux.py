#!/usr/bin/env python3
import base64
import json
from pathlib import Path

payload = json.loads(Path("scripts/playback-ux-files.json").read_text())
for path, b64 in payload.items():
    data = base64.b64decode(b64)
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_bytes(data)
    print("wrote", path, len(data))
print("done")
