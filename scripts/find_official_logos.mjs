const targets = ["fmlatina", "cooperativa", "bio bio", "pudahuel", "corazon", "carolina", "futuro", "concierto", "sonar", "activa"];
for (const target of targets) {
  try {
    const url = `https://de1.api.radio-browser.info/json/stations/search?name=${encodeURIComponent(target)}&country=Chile&hidebroken=true&limit=10&order=clickcount&reverse=true`;
    const response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10000) });
    const stations = await response.json();
    const match = stations.find((station) => station.favicon && station.homepage) || stations.find((station) => station.favicon);
    console.log(JSON.stringify({ target, status: response.status, match: match ? { name: match.name, favicon: match.favicon, homepage: match.homepage, stream: match.url_resolved || match.url, lastcheckok: match.lastcheckok } : null }));
  } catch (error) {
    console.log(JSON.stringify({ target, error: error instanceof Error ? error.message : String(error) }));
  }
}
