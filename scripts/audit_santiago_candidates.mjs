const targets = ["María", "Conquistador", "Clave", "Universo", "Rock", "Usach", "Disney", "Nuevo Tiempo", "Infinita", "Pauta", "Play", "Tele 13", "Recuerdos", "La Metro"];
const url = "https://de1.api.radio-browser.info/json/stations/bycountryexact/Chile?hidebroken=true&limit=250";
const response = await fetch(url, { headers: { Accept: "application/json" } });
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const stations = await response.json();
const rows = stations
  .filter((station) => station.lastcheckok === 1 && (station.url_resolved || station.url))
  .filter((station) => targets.some((target) => String(station.name || "").toLowerCase().includes(target.toLowerCase())))
  .map((station) => ({ name: station.name, state: station.state, homepage: station.homepage, favicon: station.favicon, stream: station.url_resolved || station.url, tags: station.tags }));
console.log(JSON.stringify(rows, null, 2));
