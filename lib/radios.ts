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
  { id: "cooperativa", name: "Radio Cooperativa", frequency: "93.3 FM", city: "Santiago", genre: "Noticias", description: "Información, actualidad y conversación para acompañar tu día.", streamUrl: "https://redirector.dps.live/cooperativafm/aac/icecast.audio", initials: "CO", accent: "#8B7CFF", featured: true, homepage: "https://cooperativa.cl/", favicon: "https://www.cooperativa.cl/favicon.ico" },
  { id: "biobio", name: "Radio Bío Bío", frequency: "99.7 FM", city: "Concepción", genre: "Noticias", description: "La radio con cobertura nacional y mirada local.", streamUrl: "https://unlimited3-cl.dps.live/biobiosantiago/mp3/icecast.audio", initials: "BB", accent: "#64D8FF", homepage: "https://www.biobiochile.cl/", favicon: "https://www.biobiochile.cl/favicon.ico" },
  { id: "pudahuel", name: "Radio Pudahuel", frequency: "90.5 FM", city: "Santiago", genre: "Romántica", description: "Canciones que acompañan generaciones de oyentes.", streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/PUDAHUEL_SC.mp3", initials: "PU", accent: "#FFD36A", homepage: "https://www.pudahuel.cl/", favicon: "https://www.pudahuel.cl/favicon.ico" },
  { id: "corazon", name: "Radio Corazón", frequency: "101.3 FM", city: "Santiago", genre: "Música latina", description: "Música, humor y compañía para todo Chile.", streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/CORAZON_SC.mp3", initials: "CR", accent: "#1ED760", homepage: "https://www.corazon.cl/", favicon: "https://www.corazon.cl/favicon.ico" },
  { id: "carolina", name: "Radio Carolina", frequency: "99.3 FM", city: "Santiago", genre: "Música", description: "Los éxitos y la energía que mueven a nuevas generaciones.", streamUrl: "https://stream.zeno.fm/sri2de2qdlivv", initials: "CA", accent: "#F2B6FF", homepage: "https://www.carolina.cl/", favicon: "https://www.carolina.cl/_templatesB/desktop/includes/img/carolina.svg" },
  { id: "futuro", name: "Radio Futuro", frequency: "88.9 FM", city: "Santiago", genre: "Rock", description: "Rock, conversación y actualidad con identidad propia.", streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/FUTURO_SC.mp3", initials: "FU", accent: "#1ED760", homepage: "https://www.futuro.cl/", favicon: "https://upload.wikimedia.org/wikipedia/commons/d/da/Futuro_logo_2021.svg" },
  { id: "concierto", name: "Radio Concierto", frequency: "88.5 FM", city: "Santiago", genre: "Música", description: "Una selección musical curada para escuchar distinto.", streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/CONCIERTOAAC.aac", initials: "CN", accent: "#8B7CFF", homepage: "https://www.concierto.cl/", favicon: "https://www.concierto.cl/favicon.ico" },
  { id: "sonar", name: "Radio Sonar", frequency: "105.3 FM", city: "Santiago", genre: "Rock", description: "Rock y cultura pop para una audiencia inquieta.", streamUrl: "https://mdstrm.com/audio/5c915724519bce27671c4d15/icecast.audio?property=radiobox", initials: "SO", accent: "#64D8FF", homepage: "https://sonarfm.cl/", favicon: "https://ott-assets.mdstrm.com/5c58a34e176c2c0813b22e4b/62962ecb3aabd15c7cd55bbc/assets/favicon.png" },
  { id: "activa", name: "Radio Activa", frequency: "92.5 FM", city: "Santiago", genre: "Música", description: "Energía, humor y música para acompañar el día.", streamUrl: "https://stream.zeno.fm/pvs6hqz3crtvv", initials: "AC", accent: "#FFD36A", homepage: "https://radioactiva.cl/", favicon: "https://www.radioactiva.cl/favicon.ico" },
  { id: "adn", name: "ADN Radio", frequency: "Cubre Chile", city: "Santiago", genre: "Noticias", description: "Noticias, análisis y conversación durante todo el día.", streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/ADNAAC.aac", initials: "ADN", accent: "#1ED760", homepage: "https://www.adnradio.cl/", favicon: "https://www.adnradio.cl/pf/resources/adn-radio/favicon.ico?d=91" },
  { id: "agricultura", name: "Radio Agricultura", frequency: "92.1 FM", city: "Santiago", genre: "Noticias", description: "Actualidad, opinión y conversación con sello chileno.", streamUrl: "https://unlimited4-us.dps.live/agricultura/gotardis/audio/now/livestream1.m3u8", initials: "AG", accent: "#1ED760", homepage: "https://www.radioagricultura.cl/", favicon: "https://static.mytuner.mobi/media/radios-150px/046/radio-agricultura.3fbc5dd8.jpg" },
  { id: "los40", name: "Los 40", frequency: "Cubre Chile", city: "Santiago", genre: "Música", description: "Los éxitos que marcan la música contemporánea.", streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_CHILE_SC.mp3", initials: "40", accent: "#F2B6FF", homepage: "https://www.los40.cl/", favicon: "https://static.mytuner.mobi/media/radios-150px/290/los-40-principales-chile.b3eabffc.jpg" },
  { id: "fmdos", name: "FM Dos", frequency: "98.5 FM", city: "Santiago", genre: "Música", description: "Música y compañía para todos los momentos del día.", streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/FMDOSAAC_SC.aac", initials: "F2", accent: "#FFD36A", homepage: "https://www.fmdos.cl/", favicon: "https://static.mytuner.mobi/media/radios-150px/327/radio-fm2.de2001c8.png" },
  { id: "imagina", name: "Radio Imagina", frequency: "88.1 FM", city: "Santiago", genre: "Romántica", description: "Canciones inolvidables y compañía cercana.", streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/IMAGINA_SC.mp3", initials: "IM", accent: "#1ED760", homepage: "https://www.radioimagina.cl/", favicon: "https://www.radioimagina.cl/favicon.ico" },
  { id: "duna", name: "Radio Duna", frequency: "89.7 FM", city: "Santiago", genre: "Actualidad", description: "Información, cultura y música cuidadosamente seleccionada.", streamUrl: "https://mdstrm.com/audio/67f42f96e464d19a6eda3c7d/icecast.audio", initials: "DU", accent: "#64D8FF", homepage: "https://www.duna.cl/", favicon: "https://static.mytuner.mobi/media/radios-150px/351/radio-duna.2949e2d8.jpg" },
  { id: "oasis", name: "Oasis FM", frequency: "102.1 FM", city: "Santiago", genre: "Música", description: "Música y contenidos para disfrutar con calma.", streamUrl: "https://mdstrm.com/audio/5c915497c6fd7c085b29169d/live.m3u8", initials: "OA", accent: "#1ED760", homepage: "https://oasisfm.cl/home" },
  { id: "beethoven", name: "Radio Beethoven", frequency: "97.7 FM", city: "Santiago", genre: "Clásica", description: "Música clásica, cultura y conocimiento para escuchar distinto.", streamUrl: "https://unlimited5-us.dps.live/beethovenfm/aac/icecast.audio", initials: "BE", accent: "#F2B6FF", homepage: "https://www.beethovenfm.cl/", favicon: "https://static.mytuner.mobi/media/radios-150px/827/radio-beethoven.6119e830.png" },
  { id: "festival", name: "Radio Festival", frequency: "93.7 FM", city: "Valparaíso", genre: "Música y compañía", description: "La radio de Valparaíso y Viña del Mar, con música y compañía regional.", streamUrl: "https://stream.festival.cl/1", initials: "FE", accent: "#FFD36A", regional: true, homepage: "https://www.radiofestival.cl/", favicon: "https://static.mytuner.mobi/media/radios-150px/170/radio-festival.8d55ce30.jpg" },
  { id: "punto7-temuco", name: "Radio Punto 7 Temuco", frequency: "95.7 FM", city: "Temuco", genre: "Música y noticias", description: "Información, música y compañía desde La Araucanía.", streamUrl: "https://redirector.dps.live/p7temuco/aac/icecast.audio", initials: "P7", accent: "#64D8FF", regional: true, homepage: "https://www.punto7.cl/", favicon: "https://static.mytuner.mobi/media/radios-150px/zskhvcfxt4xp.png" },
  { id: "edelweiss", name: "Radio Edelweiss", frequency: "Cubre Temuco", city: "Temuco", genre: "Música", description: "Selección musical y compañía desde Temuco.", streamUrl: "https://encoder.stationlink.cl/listen/edelweiss/radio.mp3", initials: "ED", accent: "#1ED760", regional: true, homepage: "https://edelweiss.fm/", favicon: "https://edelweiss.fm/wp-content/uploads/2022/07/logo-edelweiss-100x100.png" },
];

const accents = ["#64D8FF", "#8B7CFF", "#1ED760", "#F2B6FF", "#FFD36A", "#1ED760"];
const initials = (name: string) => name.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "FM";
const genreFromTags = (tags: string) => { const value = tags.toLowerCase(); if (/news|noticia|talk|actual/.test(value)) return "Noticias"; if (/rock/.test(value)) return "Rock"; if (/pop|hit/.test(value)) return "Pop"; if (/jazz/.test(value)) return "Jazz"; if (/classic|clásic/.test(value)) return "Clásica"; return "Música"; };

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
    const genre = genreFromTags(station.tags || "");
    result.push({ id: `remote-${station.stationuuid || index}-${key.length}`, name, frequency: "En línea", city, genre, description: `${genre} desde ${city}.`, streamUrl, initials: initials(name), accent: accents[index % accents.length], ...(station.favicon ? { favicon: station.favicon } : {}), ...(station.homepage ? { homepage: station.homepage } : {}) });
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

export const RADIOS = EDITORIAL_RADIOS;
