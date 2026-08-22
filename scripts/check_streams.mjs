const radios = [
  ["FM Latina", "https://stream.zeno.fm/0r0xa792kwzuv"],
  ["Radio Cooperativa", "https://redirector.dps.live/cooperativafm/aac/icecast.audio"],
  ["Radio Bío Bío", "https://unlimited3-cl.dps.live/biobiosantiago/mp3/icecast.audio"],
  ["Radio Pudahuel", "https://playerservices.streamtheworld.com/api/livestream-redirect/PUDAHUEL_SC.mp3"],
  ["Radio Corazón", "https://playerservices.streamtheworld.com/api/livestream-redirect/CORAZON_SC.mp3"],
  ["Radio Carolina", "https://stream.zeno.fm/sri2de2qdlivv"],
  ["Radio Futuro", "https://playerservices.streamtheworld.com/api/livestream-redirect/FUTURO_SC.mp3"],
  ["Radio Concierto", "https://playerservices.streamtheworld.com/api/livestream-redirect/CONCIERTOAAC.aac"],
  ["Radio Sonar", "https://mdstrm.com/audio/5c915724519bce27671c4d15/icecast.audio?property=radiobox"],
  ["Radio Activa", "https://stream.zeno.fm/pvs6hqz3crtvv"],
];
const results = await Promise.all(radios.map(async ([name, url]) => {
  const started = Date.now();
  try {
    const response = await fetch(url, { method: "GET", headers: { "Icy-MetaData": "1" }, signal: AbortSignal.timeout(12000) });
    return { name, url, status: response.status, contentType: response.headers.get("content-type"), elapsedMs: Date.now() - started, ok: response.ok };
  } catch (error) {
    return { name, url, status: null, contentType: null, elapsedMs: Date.now() - started, ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}));
console.log(JSON.stringify(results, null, 2));
