const radios = [
  ["ADN Radio", "https://playerservices.streamtheworld.com/api/livestream-redirect/ADNAAC.aac"],
  ["Radio Agricultura", "https://unlimited4-us.dps.live/agricultura/gotardis/audio/now/livestream1.m3u8"],
  ["Los 40 Principales", "https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_CHILE_SC.mp3"],
  ["FM Dos", "https://playerservices.streamtheworld.com/api/livestream-redirect/FMDOSAAC_SC.aac"],
  ["Radio Imagina", "https://playerservices.streamtheworld.com/api/livestream-redirect/IMAGINA_SC.mp3"],
  ["Radio Duna", "https://mdstrm.com/audio/67f42f96e464d19a6eda3c7d/icecast.audio"],
  ["Radio Universidad de Chile", "https://sonic-us.arkeo.cl/8186/stream"],
  ["Oasis FM", "https://mdstrm.com/audio/5c915497c6fd7c085b29169d/live.m3u8"],
  ["Radio Beethoven", "https://unlimited5-us.dps.live/beethovenfm/aac/icecast.audio"],
];
const results = await Promise.all(radios.map(async ([name, url]) => {
  try {
    const response = await fetch(url, { headers: { "Icy-MetaData": "1" }, signal: AbortSignal.timeout(12000) });
    const reader = response.body?.getReader();
    const first = reader ? await reader.read() : { value: undefined };
    if (reader) await reader.cancel();
    return { name, url, status: response.status, contentType: response.headers.get("content-type"), bytes: first.value?.length ?? 0, ok: response.ok && Boolean(first.value?.length) };
  } catch (error) {
    return { name, url, status: null, contentType: null, bytes: 0, ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}));
console.log(JSON.stringify(results, null, 2));
