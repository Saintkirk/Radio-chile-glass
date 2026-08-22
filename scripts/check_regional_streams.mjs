const candidates = [
  ["Radio Festival", "https://static.mytuner.mobi/media/radios-150px/000/radio-festival.jpg", "https://stream.festival.cl/1"],
  ["Radio Punto 7 Temuco", "https://static.mytuner.mobi/media/radios-150px/zskhvcfxt4xp.png", "https://redirector.dps.live/p7temuco/aac/icecast.audio"],
  ["Radio Edelweiss", "https://edelweiss.fm/wp-content/uploads/2022/07/logo-edelweiss-100x100.png", "https://encoder.stationlink.cl/listen/edelweiss/radio.mp3"],
];
for (const [name, logo, stream] of candidates) {
  const [logoResult, streamResult] = await Promise.all([
    fetch(logo, { signal: AbortSignal.timeout(15000) }).then(async r => ({ status: r.status, type: r.headers.get("content-type"), ok: r.ok && (r.headers.get("content-type") || "").startsWith("image/") })).catch(e => ({ status: null, type: null, ok: false, reason: String(e) })),
    fetch(stream, { headers: { "Icy-MetaData": "1" }, signal: AbortSignal.timeout(20000) }).then(async r => { const reader = r.body?.getReader(); const first = reader ? await reader.read() : { value: undefined }; if (reader) await reader.cancel(); const type = r.headers.get("content-type") || ""; return { status: r.status, finalUrl: r.url, type, icyName: r.headers.get("icy-name"), bytes: first.value?.length ?? 0, ok: r.ok && (type.startsWith("audio/") || type.includes("mpegurl")) && Boolean(first.value?.length) }; }).catch(e => ({ status: null, type: null, bytes: 0, ok: false, reason: String(e) })),
  ]);
  console.log(JSON.stringify({ name, logo, logoResult, stream, streamResult }));
}
