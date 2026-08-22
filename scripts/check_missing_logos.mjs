const logos = {
  "Radio Agricultura": "https://static.mytuner.mobi/media/radios-150px/046/radio-agricultura.3fbc5dd8.jpg",
  "Los 40": "https://static.mytuner.mobi/media/radios-150px/290/los-40-principales-chile.b3eabffc.jpg",
  "FM Dos": "https://static.mytuner.mobi/media/radios-150px/327/radio-fm2.de2001c8.png",
  "Radio Duna": "https://static.mytuner.mobi/media/radios-150px/351/radio-duna.2949e2d8.jpg",
  "Oasis FM": "https://static.mytuner.mobi/media/radios-150px/000/oasis-fm.jpg",
  "Radio Beethoven": "https://static.mytuner.mobi/media/radios-150px/827/radio-beethoven.6119e830.png",
};
for (const [name, url] of Object.entries(logos)) {
  try { const r = await fetch(url, { signal: AbortSignal.timeout(15000) }); console.log(JSON.stringify({ name, url, status: r.status, contentType: r.headers.get("content-type"), ok: r.ok && (r.headers.get("content-type") || "").startsWith("image/") })); }
  catch (e) { console.log(JSON.stringify({ name, url, status: null, contentType: null, ok: false, error: String(e) })); }
}
