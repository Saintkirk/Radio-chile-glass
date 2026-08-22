const targets = ["Universidad de Chile", "13c", "Bío Bío Puerto Montt", "Bio Bio Puerto Montt", "Portales", "Tentacion", "Nuevo Mundo", "Caricia", "Dinamica", "Ignacio Serrano", "Sinfónica", "Sabrosona", "Carnaval", "Nostalgica", "Armonia", "Sur FM", "Punto 7 Valparaíso", "La Mexicana", "Rock&Pop", "Radio Recuerdos"];
const url = "https://de1.api.radio-browser.info/json/stations/bycountryexact/Chile?hidebroken=true&limit=500";
const response = await fetch(url, { headers: { Accept: "application/json" } });
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const stations = await response.json();
const rows = stations.filter((station) => station.lastcheckok === 1 && (station.url_resolved || station.url) && targets.some((target) => String(station.name || "").toLowerCase().includes(target.toLowerCase()))).map((station) => ({ name: station.name, state: station.state, homepage: station.homepage, favicon: station.favicon, stream: station.url_resolved || station.url, tags: station.tags }));
console.log(JSON.stringify(rows, null, 2));
