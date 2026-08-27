import AsyncStorage from "@react-native-async-storage/async-storage";

export type Radio = {
  id: string;
  name: string;
  frequency: string;
  city: string;
  genre: string;
  description: string;
  streamUrl: string;
  initials: string;
  accent: string;
  featured?: boolean;
  regional?: boolean;
  region?: string;
  favicon?: string;
  homepage?: string;
};

type RemoteStation = {
  stationuuid?: string;
  name?: string;
  url_resolved?: string;
  url?: string;
  homepage?: string;
  favicon?: string;
  state?: string;
  tags?: string;
  country?: string;
  lastcheckok?: number;
};

export const CATALOG_URL = "https://de1.api.radio-browser.info/json/stations/bycountryexact/Chile?hidebroken=true&limit=100";
const CACHE_KEY = "radio-catalog-cache-v1";
const EDITORIAL_RADIOS: Radio[] = [
  { id: "fmlatina", name: "FM Latina", frequency: "89.1 FM", city: "Santiago", genre: "Pop latino", description: "La música que conecta a Chile, con clásicos y novedades en español.", streamUrl: "https://jm8n.com/proxy/radiofmlatina/stream", initials: "FL", accent: "#1DB954", featured: true, homepage: "https://www.radiofmlatina.com/", favicon: "https://www.radiofmlatina.com/wp-content/uploads/2020/06/LogoLatina1024x1024.png" },
  { id: "cooperativa", name: "Radio Cooperativa", frequency: "93.3 FM", city: "Santiago", genre: "Noticias", description: "Información, actualidad y conversación para acompañar tu día.", streamUrl: "https://redirector.dps.live/cooperativafm/mp3/icecast.audio", initials: "CO", accent: "#8B7CFF", featured: true, homepage: "https://cooperativa.cl/", favicon: "https://www.cooperativa.cl/favicon.ico" },
  { id: "biobio", name: "Radio Bío Bío", frequency: "99.7 FM", city: "Concepción", genre: "Noticias", description: "La radio con cobertura nacional y mirada local.", streamUrl: "https://unlimited3-cl.dps.live/biobiosantiago/mp3/icecast.audio", initials: "BB", accent: "#64D8FF", featured: true, homepage: "https://www.biobiochile.cl/", favicon: "https://www.biobiochile.cl/favicon.ico" },
  { id: "pudahuel", name: "Radio Pudahuel", frequency: "90.5 FM", city: "Santiago", genre: "Romántica", description: "Canciones que acompañan generaciones de oyentes.", streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/PUDAHUEL_SC.mp3", initials: "PU", accent: "#FFD36A", featured: true, homepage: "https://www.pudahuel.cl/", favicon: "https://www.prisamedia.cl/site/wp-content/uploads/2024/04/pudahuel_1200x1200.png" },
  { id: "corazon", name: "Radio Corazón", frequency: "101.3 FM", city: "Santiago", genre: "Música latina", description: "Música, humor y compañía para todo Chile.", streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/CORAZON_SC.mp3", initials: "CR", accent: "#1ED760", featured: true, homepage: "https://www.corazon.cl/", favicon: "https://www.prisamedia.cl/site/wp-content/uploads/2024/04/corazon_1200x1200.png" },
  { id: "carolina", name: "Radio Carolina", frequency: "99.3 FM", city: "Santiago", genre: "Música", description: "Los éxitos y la energía que mueven a nuevas generaciones.", streamUrl: "https://stream.zeno.fm/sri2de2qdlivv", initials: "CA", accent: "#F2B6FF", featured: true, homepage: "https://www.carolina.cl/", favicon: "https://www.carolina.cl/_templatesB/desktop/includes/img/header/btn-carolina-online.png?v=1" },
  { id: "futuro", name: "Radio Futuro", frequency: "88.9 FM", city: "Santiago", genre: "Rock", description: "Rock, conversación y actualidad con identidad propia.", streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/FUTURO_SC.mp3", initials: "FU", accent: "#1ED760", featured: true, homepage: "https://www.futuro.cl/", favicon: "https://www.prisamedia.cl/site/wp-content/uploads/2024/04/futuro_1200x1200.png" },
  { id: "concierto", name: "Radio Concierto", frequency: "88.5 FM", city: "Santiago", genre: "Música", description: "Una selección musical curada para escuchar distinto.", streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/CONCIERTOAAC.aac", initials: "CN", accent: "#8B7CFF", featured: true, homepage: "https://www.concierto.cl/", favicon: "https://www.prisamedia.cl/site/wp-content/uploads/2024/04/concierto_1200x1200.png" },
  { id: "sonar", name: "Radio Sonar", frequency: "105.3 FM", city: "Santiago", genre: "Rock", description: "Rock y cultura pop para una audiencia inquieta.", streamUrl: "https://mdstrm.com/audio/5c915724519bce27671c4d15/icecast.audio?property=radiobox", initials: "SO", accent: "#64D8FF", featured: true, homepage: "https://sonarfm.cl/", favicon: "https://ott-assets.mdstrm.com/5c58a34e176c2c0813b22e4b/62962ecb3aabd15c7cd55bbc/assets/favicon.png" },
  { id: "activa", name: "Radio Activa", frequency: "92.5 FM", city: "Santiago", genre: "Música", description: "Energía, humor y música para acompañar el día.", streamUrl: "https://stream.zeno.fm/pvs6hqz3crtvv", initials: "AC", accent: "#FFD36A", featured: true, homepage: "https://radioactiva.cl/", favicon: "https://www.prisamedia.cl/site/wp-content/uploads/2024/04/radioactiva_1200x1200.png" },
  { id: "adn", name: "ADN Radio", frequency: "Cubre Chile", city: "Santiago", genre: "Noticias", description: "Noticias, análisis y conversación durante todo el día.", streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/ADNAAC.aac", initials: "ADN", accent: "#1ED760", featured: true, homepage: "https://www.adnradio.cl/", favicon: "https://www.prisamedia.cl/site/wp-content/uploads/2024/04/adn_1200x1200.png" },
  { id: "agricultura", name: "Radio Agricultura", frequency: "92.1 FM", city: "Santiago", genre: "Noticias", description: "Actualidad, opinión y conversación con sello chileno.", streamUrl: "https://unlimited4-us.dps.live/agricultura/gotardis/audio/now/livestream1.m3u8", initials: "AG", accent: "#1ED760", featured: true, homepage: "https://www.radioagricultura.cl/", favicon: "https://static.mytuner.mobi/media/radios-150px/046/radio-agricultura.3fbc5dd8.jpg" },
  { id: "los40", name: "Los 40", frequency: "Cubre Chile", city: "Santiago", genre: "Música", description: "Los éxitos que marcan la música contemporánea.", streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_CHILE_SC.mp3", initials: "40", accent: "#F2B6FF", featured: true, homepage: "https://www.los40.cl/", favicon: "https://www.prisamedia.cl/site/wp-content/uploads/2024/04/los40_1200x1200.png" },
  { id: "fmdos", name: "FM Dos", frequency: "98.5 FM", city: "Santiago", genre: "Música", description: "Música y compañía para todos los momentos del día.", streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/FMDOSAAC_SC.aac", initials: "F2", accent: "#FFD36A", featured: true, homepage: "https://www.fmdos.cl/", favicon: "https://www.prisamedia.cl/site/wp-content/uploads/2024/04/fmdos_1200x1200.png" },
  { id: "imagina", name: "Radio Imagina", frequency: "88.1 FM", city: "Santiago", genre: "Romántica", description: "Canciones inolvidables y compañía cercana.", streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/IMAGINA_SC.mp3", initials: "IM", accent: "#1ED760", featured: true, homepage: "https://www.radioimagina.cl/", favicon: "https://www.prisamedia.cl/site/wp-content/uploads/2024/04/imagina_1200x1200.png" },
  { id: "duna", name: "Radio Duna", frequency: "89.7 FM", city: "Santiago", genre: "Actualidad", description: "Información, cultura y música cuidadosamente seleccionada.", streamUrl: "https://mdstrm.com/audio/67f42f96e464d19a6eda3c7d/icecast.audio", initials: "DU", accent: "#64D8FF", featured: true, homepage: "https://www.duna.cl/", favicon: "https://static.mytuner.mobi/media/radios-150px/351/radio-duna.2949e2d8.jpg" },
  { id: "oasis", name: "Oasis FM", frequency: "102.1 FM", city: "Santiago", genre: "Música", description: "Música y contenidos para disfrutar con calma.", streamUrl: "https://mdstrm.com/audio/5c915497c6fd7c085b29169d/live.m3u8", initials: "OA", accent: "#1ED760", homepage: "https://oasisfm.cl/home", favicon: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663063551577/rNImIzxCBkdoXKEq.png" },
  { id: "beethoven", name: "Radio Beethoven", frequency: "97.7 FM", city: "Santiago", genre: "Clásica", description: "Música clásica, cultura y conocimiento para escuchar distinto.", streamUrl: "https://unlimited5-us.dps.live/beethovenfm/aac/icecast.audio", initials: "BE", accent: "#F2B6FF", featured: true, homepage: "https://www.beethovenfm.cl/", favicon: "https://static.mytuner.mobi/media/radios-150px/827/radio-beethoven.6119e830.png" },
  { id: "play-fm", name: "Play FM", frequency: "100.9 FM", city: "Santiago", region: "Región Metropolitana", genre: "Música", description: "Pop, clásicos y canciones para escuchar con calma.", streamUrl: "https://mdstrm.com/audio/5c8d6406f98fbf269f57c82c/icecast.audio", initials: "PL", accent: "#F2B6FF", homepage: "https://playfm.cl/", favicon: "https://ott-assets.mdstrm.com/5c58a34e176c2c0813b22e4b/633db501b938191960de607d/assets/playconfondo.png" },
  { id: "conquistador", name: "El Conquistador FM", frequency: "91.3 FM", city: "Santiago", region: "Región Metropolitana", genre: "Actualidad", description: "Información, conversación y compañía desde Santiago.", streamUrl: "https://stream10.usastreams.com/9314/stream", initials: "EC", accent: "#FFD36A", homepage: "https://www.elconquistadorfm.net/", favicon: "https://www.elconquistadorfm.net/favicon.ico" },
  { id: "rock-pop", name: "Rock & Pop", frequency: "94.1 FM", city: "Santiago", region: "Región Metropolitana", genre: "Rock", description: "Rock, pop, clásicos y tendencias desde Santiago.", streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/ROCK_AND_POPAAC_SC", initials: "R&P", accent: "#EF233C", homepage: "https://www.rockandpop.cl/", favicon: "https://www.rockandpop.cl/favicon.ico" },
  { id: "la-clave", name: "Radio La Clave", frequency: "92.9 FM", city: "Santiago", region: "Región Metropolitana", genre: "Noticias", description: "Noticias, análisis y conversación con mirada actual.", streamUrl: "https://unlimited1-cl-isp.dps.live/laclavetv/laclavetv.smil/playlist.m3u8", initials: "LC", accent: "#8B7CFF", homepage: "https://radiolaclave.cl/", favicon: "https://radiolaclave.cl/favicon.ico" },
  { id: "13c", name: "13C Radio", frequency: "102.1 FM", city: "Santiago", region: "Región Metropolitana", genre: "Cultura", description: "Cultura, conversación y música para descubrir nuevas ideas.", streamUrl: "https://us-b4-p-e-cg11-audio.cdn.mdstrm.com/live-audio-aw/5c915497c6fd7c085b29169d", initials: "13C", accent: "#64D8FF", homepage: "https://13cradio.cl/", favicon: "https://ott-assets.mdstrm.com/5c58a34e176c2c0813b22e4b/6305400df11545083964b856/assets/Logo13cRadio_sitio.png" },
  { id: "la-mexicana", name: "Radio La Mexicana", frequency: "95.3 FM", city: "San Vicente", region: "O'Higgins", genre: "Ranchera", description: "Música ranchera y tropical desde la zona central de Chile.", streamUrl: "https://audio0.tustreaming.cl/7160/aire", initials: "MX", accent: "#FFD36A", regional: true, homepage: "https://radiolamexicana.cl/", favicon: "https://radiolamexicana.cl/wp-content/uploads/2023/06/logomx.png" },
  { id: "carnaval-la-serena", name: "Radio Carnaval La Serena", frequency: "104.5 FM", city: "La Serena", region: "Coquimbo", genre: "Música latina", description: "Música y compañía desde La Serena y Coquimbo.", streamUrl: "https://cp2.streamchileno.cl/listen/radiocarnaval/radio.mp3", initials: "CA", accent: "#F2B6FF", regional: true, homepage: "https://radiocarnavalfm.cl/", favicon: "https://radiocarnavalfm.cl/wp/wp-content/uploads/2022/05/cropped-RADIO-CARNAVAL-300x300.jpg" },
  { id: "radio-recuerdos", name: "FM de Los Recuerdos", frequency: "Online", city: "Online", region: "Nacional / Online", genre: "Recuerdos", description: "La radio con memoria: clásicos, baladas y canciones de todos los tiempos.", streamUrl: "https://sonando-us.digitalproserver.com/fmdelosrecuerdos.aac", initials: "FR", accent: "#D89B5B", regional: true, homepage: "https://www.fmdelosrecuerdos.cl/", favicon: "https://www.fmdelosrecuerdos.cl/wp-content/uploads/2021/07/logohead.png" },
  { id: "festival", name: "Radio Festival", frequency: "93.7 FM", city: "Valparaíso", region: "Región de Valparaíso", genre: "Música y compañía", description: "La radio de Valparaíso y Viña del Mar, con música y compañía regional.", streamUrl: "https://stream.festival.cl/1", initials: "FE", accent: "#FFD36A", regional: true, homepage: "https://www.radiofestival.cl/", favicon: "https://static.mytuner.mobi/media/radios-150px/170/radio-festival.8d55ce30.jpg" },
  { id: "punto7-temuco", name: "Radio Punto 7 Temuco", frequency: "95.7 FM", city: "Temuco", region: "Región de La Araucanía", genre: "Música y noticias", description: "Información, música y compañía desde La Araucanía.", streamUrl: "https://redirector.dps.live/p7temuco/aac/icecast.audio", initials: "P7", accent: "#64D8FF", regional: true, homepage: "https://www.punto7.cl/", favicon: "https://static.mytuner.mobi/media/radios-150px/zskhvcfxt4xp.png" },
  { id: "edelweiss", name: "Radio Edelweiss", frequency: "Cubre Temuco", city: "Temuco", region: "Región de La Araucanía", genre: "Música", description: "Selección musical y compañía desde Temuco.", streamUrl: "https://encoder.stationlink.cl/listen/edelweiss/radio.mp3", initials: "ED", accent: "#1ED760", regional: true, homepage: "https://edelweiss.fm/", favicon: "https://edelweiss.fm/wp-content/uploads/2022/07/logo-edelweiss-100x100.png" },
];

const accents = ["#64D8FF", "#8B7CFF", "#1ED760", "#F2B6FF", "#FFD36A", "#1ED760"];
const initials = (name: string) => name.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "FM";
const genreFromTags = (tags: string) => { const value = tags.toLowerCase(); if (/news|noticia|talk|actual/.test(value)) return "Noticias"; if (/rock/.test(value)) return "Rock"; if (/pop|hit/.test(value)) return "Pop"; if (/jazz/.test(value)) return "Jazz"; if (/classic|clásic/.test(value)) return "Clásica"; return "Música"; };
const isKnownBrokenStream = (url: string) => /radio\.digitalfm\.cl:8000/i.test(url);
const fallbackFavicon = (homepage?: string) => { if (!homepage) return undefined; try { return `${new URL(homepage).origin}/favicon.ico`; } catch { return undefined; } };

export function regionFromCity(city: string): string {
  const value = city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (value.includes("santiago") || value.includes("metropolitana")) return "Región Metropolitana";
  if (value.includes("arica") || value.includes("parinacota")) return "Arica y Parinacota";
  if (value.includes("iquique") || value.includes("alto hospicio") || value.includes("tarapaca")) return "Tarapacá";
  if (value.includes("antofagasta") || value.includes("calama") || value.includes("tocopilla")) return "Antofagasta";
  if (value.includes("copiapo") || value.includes("vallenar") || value.includes("atacama")) return "Atacama";
  if (value.includes("la serena") || value.includes("coquimbo") || value.includes("ovalle") || value.includes("coquimbo")) return "Coquimbo";
  if (value.includes("valparaiso") || value.includes("vina") || value.includes("quilpue") || value.includes("san antonio")) return "Valparaíso";
  if (value.includes("rancagua") || value.includes("san fernando") || value.includes("ohiggins")) return "O'Higgins";
  if (value.includes("talca") || value.includes("curico") || value.includes("linares") || value.includes("maule")) return "Maule";
  if (value.includes("chillan") || value.includes("nuble")) return "Ñuble";
  if (value.includes("concepcion") || value.includes("talcahuano") || value.includes("los angeles") || value.includes("biobio")) return "Biobío";
  if (value.includes("temuco") || value.includes("villarrica") || value.includes("pucon") || value.includes("araucania")) return "La Araucanía";
  if (value.includes("valdivia") || value.includes("rio bueno") || value.includes("rios")) return "Los Ríos";
  if (value.includes("puerto montt") || value.includes("osorno") || value.includes("castro") || value.includes("chiloe") || value.includes("lagos")) return "Los Lagos";
  if (value.includes("coyhaique") || value.includes("aysen")) return "Aysén";
  if (value.includes("punta arenas") || value.includes("puerto natales") || value.includes("magallanes")) return "Magallanes";
  return "Sin región";
}

export function normalizeRemoteStations(input: RemoteStation[]): Radio[] {
  const seen = new Set<string>();
  const result: Radio[] = [];
  input.filter((station) => station.country === "Chile" && station.lastcheckok === 1 && !!(station.url_resolved || station.url) && !!station.name?.trim()).forEach((station, index) => {
    const streamUrl = (station.url_resolved || station.url || "").trim();
    const key = streamUrl.toLowerCase().replace(/\/$/, "");
    if (seen.has(key)) return;
    seen.add(key);
    const name = station.name!.trim().replace(/\s+/g, " ");
    const city = station.state?.trim() || "Chile";
    if (isKnownBrokenStream(streamUrl)) return;
    const genre = genreFromTags(station.tags || "");
    const homepage = station.homepage?.trim();
    const favicon = station.favicon?.trim() || fallbackFavicon(homepage);
    result.push({ id: `remote-${station.stationuuid || index}-${key.length}`, name, frequency: "En línea", city, region: regionFromCity(city), genre, description: `${genre} desde ${city}.`, streamUrl, initials: initials(name), accent: accents[index % accents.length], ...(favicon ? { favicon } : {}), ...(homepage ? { homepage } : {}) });
  });
  return result;
}

export function mergeCatalog(remote: Radio[]): Radio[] {
  const editorialUrls = new Set(EDITORIAL_RADIOS.map((radio) => radio.streamUrl.toLowerCase()));
  return [...EDITORIAL_RADIOS, ...remote.filter((radio) => !editorialUrls.has(radio.streamUrl.toLowerCase()) && radio.id !== "fmlatina")];
}

export async function fetchRemoteCatalog(): Promise<Radio[]> {
  const response = await fetch(CATALOG_URL, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Radio Browser respondió ${response.status}`);
  const payload = await response.json() as RemoteStation[];
  const normalized = normalizeRemoteStations(payload);
  if (!normalized.length) throw new Error("La fuente remota no devolvió radios válidas");
  return mergeCatalog(normalized);
}

export async function loadCatalog(): Promise<{ radios: Radio[]; updatedAt: string | null; source: "remote" | "cache" | "local" }> {
  try {
    const radios = await fetchRemoteCatalog();
    const updatedAt = new Date().toISOString();
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ radios, updatedAt }));
    return { radios, updatedAt, source: "remote" };
  } catch {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as { radios: Radio[]; updatedAt: string };
      return { radios: parsed.radios, updatedAt: parsed.updatedAt, source: "cache" };
    }
    return { radios: EDITORIAL_RADIOS, updatedAt: null, source: "local" };
  }
}

export function selectStartupRadio(catalog: Radio[], lastRadioId?: string | null): Radio | null {
  return catalog.find((radio) => radio.id === lastRadioId) ?? catalog[0] ?? EDITORIAL_RADIOS[0] ?? null;
}

export const RADIOS = EDITORIAL_RADIOS;
