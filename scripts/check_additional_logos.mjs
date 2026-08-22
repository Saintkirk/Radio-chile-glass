const logos = [
  ["ADN Radio", "https://www.adnradio.cl/pf/resources/adn-radio/favicon.ico?d=91"],
  ["Radio Agricultura", "https://www.radioagricultura.cl/favicon.ico"],
  ["Los 40", "https://www.los40.cl/favicon.ico"],
  ["FM Dos", "https://www.fmdos.cl/favicon.ico"],
  ["Radio Imagina", "https://www.radioimagina.cl/favicon.ico"],
  ["Radio Duna", "https://www.duna.cl/favicon.ico"],
  ["Radio Universidad de Chile", "https://radio.uchile.cl/favicon.ico"],
  ["Oasis FM", "https://oasisfm.cl/favicon.ico"],
  ["Radio Beethoven", "https://www.beethovenfm.cl/favicon.ico"],
];
const results = await Promise.all(logos.map(async ([name, url]) => {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    return { name, url, status: response.status, contentType: response.headers.get("content-type"), ok: response.ok && /^image\//.test(response.headers.get("content-type") || "") };
  } catch (error) {
    return { name, url, status: null, contentType: null, ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}));
console.log(JSON.stringify(results, null, 2));
