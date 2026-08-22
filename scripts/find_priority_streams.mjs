const targets = ["carolina", "corazon", "concierto", "sonar", "pudahuel", "futuro", "activa"];
for (const target of targets) {
  try {
    const url = `https://de1.api.radio-browser.info/json/stations/search?name=${encodeURIComponent(target)}&country=Chile&hidebroken=true&limit=20&order=clickcount&reverse=true`;
    const response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10000) });
    const stations = await response.json();
    console.log(JSON.stringify({ target, status: response.status, stations: stations.slice(0, 8).map((station) => ({ name: station.name, url: station.url_resolved || station.url, homepage: station.homepage, lastcheckok: station.lastcheckok, clickcount: station.clickcount })) }));
  } catch (error) {
    console.log(JSON.stringify({ target, error: error instanceof Error ? error.message : String(error) }));
  }
}
