const logos = [
  ["FM Latina", "https://www.radiofmlatina.com/favicon.ico"],
  ["Radio Cooperativa", "https://www.cooperativa.cl/favicon.ico"],
  ["Radio Bío Bío", "https://www.biobiochile.cl/favicon.ico"],
  ["Radio Pudahuel", "https://www.pudahuel.cl/favicon.ico"],
  ["Radio Corazón", "https://www.corazon.cl/favicon.ico"],
  ["Radio Carolina", "https://www.carolina.cl/favicon.ico"],
  ["Radio Futuro", "https://www.futuro.cl/favicon.ico"],
  ["Radio Concierto", "https://www.concierto.cl/favicon.ico"],
  ["Radio Sonar", "https://sonarfm.cl/favicon.ico"],
  ["Radio Activa", "https://www.radioactiva.cl/favicon.ico"],
];
const results = await Promise.all(logos.map(async ([name, url]) => {
  try {
    const response = await fetch(url, { method: "GET", signal: AbortSignal.timeout(10000) });
    return { name, url, status: response.status, contentType: response.headers.get("content-type"), ok: response.ok };
  } catch (error) {
    return { name, url, status: null, contentType: null, ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}));
console.log(JSON.stringify(results, null, 2));
