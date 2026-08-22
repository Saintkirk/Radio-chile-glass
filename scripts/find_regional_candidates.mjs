const targets = [
  ["Radio Festival", "Valparaíso"],
  ["Radio Punto 7 Valparaíso", "Valparaíso"],
  ["Mi Radio FM", "La Serena"],
  ["Radio San Bartolomé", "La Serena"],
  ["Radio La Sureña Carahue", "Carahue"],
  ["Radio Punto 7 Temuco", "Temuco"],
  ["Radio Edelweiss", "Temuco"],
  ["Radio Ñuble", "Chillán"],
  ["Radio Santa Cruz", "Santa Cruz"],
  ["Radio Caramelo Ovalle", "Ovalle"],
  ["Radio Caramelo Rengo", "Rengo"],
  ["Radio Frontera", "Temuco"],
];
for (const [target, city] of targets) {
  const url = `https://de1.api.radio-browser.info/json/stations/search?name=${encodeURIComponent(target)}&country=Chile&hidebroken=true&limit=10&order=clickcount&reverse=true`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const stations = await response.json();
    const matches = stations.filter((s) => s.lastcheckok === 1).slice(0, 5).map((s) => ({ name: s.name, city, homepage: s.homepage, favicon: s.favicon, url: s.url_resolved || s.url, codec: s.codec, clicks: s.clickcount }));
    console.log(JSON.stringify({ target, matches }));
  } catch (error) { console.log(JSON.stringify({ target, error: String(error) })); }
}
