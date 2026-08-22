const targets = ["ADN Radio", "Agricultura", "Los 40", "FM Dos", "Imagina", "Duna", "Radio Universidad de Chile", "Oasis", "Radio Disney", "Radio La Clave", "Radio Agricultura", "Radio Beethoven"];
for (const target of targets) {
  try {
    const url = `https://de1.api.radio-browser.info/json/stations/search?name=${encodeURIComponent(target)}&country=Chile&hidebroken=true&limit=15&order=clickcount&reverse=true`;
    const response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10000) });
    const stations = await response.json();
    const matches = stations.filter((station) => station.lastcheckok === 1 && (station.url_resolved || station.url)).slice(0, 5).map((station) => ({ name: station.name, favicon: station.favicon, homepage: station.homepage, stream: station.url_resolved || station.url, contentType: station.codec, clicks: station.clickcount }));
    console.log(JSON.stringify({ target, status: response.status, matches }));
  } catch (error) {
    console.log(JSON.stringify({ target, error: error instanceof Error ? error.message : String(error) }));
  }
}
