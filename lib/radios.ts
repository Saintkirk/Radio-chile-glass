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
};

export const RADIOS: Radio[] = [
  { id: "fmlatina", name: "FM Latina", frequency: "101.7 FM", city: "Santiago", genre: "Pop latino", description: "La música que conecta a Chile, con clásicos y novedades en español.", streamUrl: "https://stream.zeno.fm/0r0xa792kwzuv", initials: "FL", accent: "#FF6B5F", featured: true },
  { id: "cooperativa", name: "Radio Cooperativa", frequency: "93.3 FM", city: "Santiago", genre: "Noticias", description: "Información, actualidad y conversación para acompañar tu día.", streamUrl: "https://redirector.dps.live/cooperativafm/aac/icecast.audio", initials: "CO", accent: "#8B7CFF", featured: true },
  { id: "biobio", name: "Radio Bío Bío", frequency: "99.7 FM", city: "Concepción", genre: "Noticias", description: "La radio con cobertura nacional y mirada local.", streamUrl: "https://redirector.dps.live/biobio/aac/icecast.audio", initials: "BB", accent: "#64D8FF" },
  { id: "infinita", name: "Radio Infinita", frequency: "100.1 FM", city: "Santiago", genre: "Actualidad", description: "Ideas, entrevistas y música para pensar distinto.", streamUrl: "https://redirector.dps.live/infinita/aac/icecast.audio", initials: "IN", accent: "#76E0B5" },
  { id: "play", name: "Play FM", frequency: "100.9 FM", city: "Santiago", genre: "Música", description: "Una selección de música para bajar el ritmo y disfrutar.", streamUrl: "https://redirector.dps.live/playfm/aac/icecast.audio", initials: "PL", accent: "#F2B6FF" },
  { id: "pudahuel", name: "Radio Pudahuel", frequency: "90.5 FM", city: "Santiago", genre: "Romántica", description: "Canciones que acompañan generaciones de oyentes.", streamUrl: "https://redirector.dps.live/pudahuel/aac/icecast.audio", initials: "PU", accent: "#FFD36A" },
];
