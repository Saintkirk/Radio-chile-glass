const targets = ["Radio Carolina", "Carolina Chile"];
for (const target of targets) {
  const url = `https://de1.api.radio-browser.info/json/stations/search?name=${encodeURIComponent(target)}&country=Chile&hidebroken=true&limit=20&order=clickcount&reverse=true`;
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  const stations = await response.json();
  console.log(JSON.stringify({ target, matches: stations.filter((s) => s.lastcheckok === 1).slice(0, 10).map((s) => ({ name: s.name, homepage: s.homepage, favicon: s.favicon, url: s.url_resolved || s.url, codec: s.codec, clicks: s.clickcount })) }, null, 2));
}
