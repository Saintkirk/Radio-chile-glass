const radios = [
  ["Radio Pudahuel", "https://playerservices.streamtheworld.com/api/livestream-redirect/PUDAHUEL_SC.mp3"],
  ["Radio Corazón", "https://playerservices.streamtheworld.com/api/livestream-redirect/CORAZON_SC.mp3"],
  ["Radio Carolina", "https://stream.zeno.fm/sri2de2qdlivv"],
  ["Radio Activa", "https://stream.zeno.fm/pvs6hqz3crtvv"],
];
const results = await Promise.all(radios.map(async ([name, url]) => {
  try {
    const response = await fetch(url, { method: "GET", headers: { "Icy-MetaData": "1" }, signal: AbortSignal.timeout(12000) });
    return { name, url, status: response.status, contentType: response.headers.get("content-type"), ok: response.ok };
  } catch (error) {
    return { name, url, status: null, contentType: null, ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}));
console.log(JSON.stringify(results, null, 2));
