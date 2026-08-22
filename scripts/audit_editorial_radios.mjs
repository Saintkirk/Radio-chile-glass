const radios = [
  ["FM Latina", "https://www.radiofmlatina.com/wp-content/uploads/2020/06/LogoLatina1024x1024.png", "https://jm8n.com/proxy/radiofmlatina/stream"],
  ["Radio Cooperativa", "https://www.cooperativa.cl/favicon.ico", "https://redirector.dps.live/cooperativafm/aac/icecast.audio"],
  ["Radio Bío Bío", "https://www.biobiochile.cl/favicon.ico", "https://unlimited3-cl.dps.live/biobiosantiago/mp3/icecast.audio"],
  ["Radio Pudahuel", "https://www.pudahuel.cl/favicon.ico", "https://playerservices.streamtheworld.com/api/livestream-redirect/PUDAHUEL_SC.mp3"],
  ["Radio Corazón", "https://www.corazon.cl/favicon.ico", "https://playerservices.streamtheworld.com/api/livestream-redirect/CORAZON_SC.mp3"],
  ["Radio Carolina", "https://www.carolina.cl/favicon.ico", "https://stream.zeno.fm/sri2de2qdlivv"],
  ["Radio Futuro", "https://www.futuro.cl/favicon.ico", "https://playerservices.streamtheworld.com/api/livestream-redirect/FUTURO_SC.mp3"],
  ["Radio Concierto", "https://www.concierto.cl/favicon.ico", "https://playerservices.streamtheworld.com/api/livestream-redirect/CONCIERTOAAC.aac"],
  ["Radio Sonar", "https://ott-assets.mdstrm.com/5c58a34e176c2c0813b22e4b/62962ecb3aabd15c7cd55bbc/assets/favicon.png", "https://mdstrm.com/audio/5c915724519bce27671c4d15/icecast.audio?property=radiobox"],
  ["Radio Activa", "https://www.radioactiva.cl/favicon.ico", "https://stream.zeno.fm/pvs6hqz3crtvv"],
  ["ADN Radio", "https://www.adnradio.cl/pf/resources/adn-radio/favicon.ico?d=91", "https://playerservices.streamtheworld.com/api/livestream-redirect/ADNAAC.aac"],
  ["Radio Agricultura", "", "https://unlimited4-us.dps.live/agricultura/gotardis/audio/now/livestream1.m3u8"],
  ["Los 40", "", "https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_CHILE_SC.mp3"],
  ["FM Dos", "", "https://playerservices.streamtheworld.com/api/livestream-redirect/FMDOSAAC_SC.aac"],
  ["Radio Imagina", "https://www.radioimagina.cl/favicon.ico", "https://playerservices.streamtheworld.com/api/livestream-redirect/IMAGINA_SC.mp3"],
  ["Radio Duna", "", "https://mdstrm.com/audio/67f42f96e464d19a6eda3c7d/icecast.audio"],
  ["Oasis FM", "https://oasisfm.cl/favicon.ico", "https://mdstrm.com/audio/5c915497c6fd7c085b29169d/live.m3u8"],
  ["Radio Beethoven", "https://www.beethovenfm.cl/favicon.ico", "https://unlimited5-us.dps.live/beethovenfm/aac/icecast.audio"],
];

async function checkLogo(url) {
  if (!url) return { status: null, contentType: null, ok: false, reason: "sin logo remoto; usa fallback" };
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
    const type = response.headers.get("content-type") || "";
    return { status: response.status, contentType: type, ok: response.ok && type.startsWith("image/") };
  } catch (error) { return { status: null, contentType: null, ok: false, reason: error instanceof Error ? error.message : String(error) }; }
}

async function checkStream(url) {
  try {
    const response = await fetch(url, { headers: { "Icy-MetaData": "1" }, signal: AbortSignal.timeout(15000) });
    const type = response.headers.get("content-type") || "";
    const reader = response.body?.getReader();
    const first = reader ? await reader.read() : { value: undefined };
    if (reader) await reader.cancel();
    const hls = type.includes("mpegurl") || type.includes("x-mpegurl");
    const audio = type.startsWith("audio/") || type.includes("octet-stream") || hls;
    return { status: response.status, contentType: type, bytes: first.value?.length ?? 0, ok: response.ok && audio && Boolean(first.value?.length), hls };
  } catch (error) { return { status: null, contentType: null, bytes: 0, ok: false, reason: error instanceof Error ? error.message : String(error) }; }
}

const results = await Promise.all(radios.map(async ([name, logo, stream]) => ({ name, logo: await checkLogo(logo), stream: await checkStream(stream) })));
console.log(JSON.stringify(results, null, 2));
