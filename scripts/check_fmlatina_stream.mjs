const streams = [
  ["configurado", "https://stream.zeno.fm/0r0xa792kwzuv"],
  ["reproductor oficial", "https://jm8n.com/proxy/radiofmlatina/stream"],
];
for (const [name, url] of streams) {
  const started = Date.now();
  try {
    const response = await fetch(url, { headers: { "Icy-MetaData": "1" }, signal: AbortSignal.timeout(15000) });
    const reader = response.body?.getReader();
    const first = reader ? await reader.read() : { value: undefined };
    if (reader) await reader.cancel();
    const bytes = first.value ? Array.from(first.value.slice(0, 16)) : [];
    console.log(JSON.stringify({ name, url, status: response.status, contentType: response.headers.get("content-type"), bytes, elapsedMs: Date.now() - started, ok: response.ok && bytes.length > 0 }));
  } catch (error) {
    console.log(JSON.stringify({ name, url, status: null, contentType: null, elapsedMs: Date.now() - started, ok: false, error: error instanceof Error ? error.message : String(error) }));
  }
}
