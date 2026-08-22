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
  { id: "fmlatina", name: "FM Latina", frequency: "89.1 FM", city: "Santiago", genre: "Pop latino", description: "La música que conecta a Chile, con clásicos y novedades en español.", streamUrl: "https://stream.zeno.fm/0r0xa792kwzuv", initials: "FL", accent: "#FF6B5F", featured: true, homepage: "https://www.radiofmlatina.com/" },
  { id: "cooperativa", name: "Radio Cooperativa", frequency: "93.3 FM", city: "Santiago", genre: "Noticias", description: "Información, actualidad y conversación para acompañar tu día.", streamUrl: "https://redirector.dps.live/cooperativafm/aac/icecast.audio", initials: "CO", accent: "#8B7CFF", featured: true },
  { id: "biobio", name: "Radio Bío Bío", frequency: "99.7 FM", city: "Concepción", genre: "Noticias", description: "La radio con cobertura nacional y mirada local.", streamUrl: "https://redirector.dps.live/biobio/aac/icecast.audio", initials: "BB", accent: "#64D8FF" },
  { id: "infinita", name: "Radio Infinita", frequency: "100.1 FM", city: "Santiago", genre: "Actualidad", description: "Ideas, entrevistas y música para pensar distinto.", streamUrl: "https://redirector.dps.live/infinita/aac/icecast.audio", initials: "IN", accent: "#76E0B5" },
  { id: "play", name: "Play FM", frequency: "100.9 FM", city: "Santiago", genre: "Música", description: "Una selección de música para bajar el ritmo y disfrutar.", streamUrl: "https://redirector.dps.live/playfm/aac/icecast.audio", initials: "PL", accent: "#F2B6FF" },
  { id: "pudahuel", name: "Radio Pudahuel", frequency: "90.5 FM", city: "Santiago", genre: "Romántica", description: "Canciones que acompañan generaciones de oyentes.", streamUrl: "https://redirector.dps.live/pudahuel/aac/icecast.audio", initials: "PU", accent: "#FFD36A" },
];

const accents = ["#64D8FF", "#8B7CFF", "#76E0B5", "#F2B6FF", "#FFD36A", "#FF8C7F"];
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
