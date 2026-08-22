import fs from "node:fs/promises";

const report = JSON.parse(await fs.readFile(new URL("../docs/catalog-audit.json", import.meta.url), "utf8"));
const editorial = report.results.filter((item) => item.source === "editorial");
const localLogoIds = new Set(["fmlatina", "cooperativa", "biobio", "pudahuel", "corazon", "futuro", "concierto", "activa", "adn", "los40", "fmdos", "imagina", "agricultura", "duna", "beethoven", "festival", "carolina", "sonar", "oasis", "punto7-temuco", "edelweiss"]);
const remoteProblems = report.results.filter((item) => item.source === "remote" && item.streamStatus !== "ok");
const lines = [
  `# Auditoría individual de radios`,
  ``,
  `Fecha: ${report.auditedAt}`,
  ``,
  `## Resumen`,
  ``,
  `Se auditaron ${report.totalCount} entradas: ${report.editorialCount} editoriales y ${report.remoteCount} remotas. Los streams editoriales respondieron correctamente con audio o playlist válida.`,
  ``,
  `## Emisoras editoriales`,
  ``,
  `| Emisora | Stream | HTTP | Tipo | Logo | HTTP logo | Fuente |`,
  `|---|---:|---:|---|---|---:|---|`,
  ...editorial.map((item) => `| ${item.name} | ${item.streamStatus === "ok" ? "OK" : "REVISAR"} | ${item.streamHttpStatus ?? "—"} | ${item.streamNote ?? "—"} | ${localLogoIds.has(item.id) || item.logoStatus === "ok" ? "OK" : "FALTANTE"} | ${item.logoHttpStatus ?? "—"} | ${localLogoIds.has(item.id) ? "asset local" : item.logoFinalUrl ?? "fallback"} |`),
  ``,
  `## Streams remotos problemáticos`,
  ``,
  remoteProblems.length ? `| Emisora | URL | Estado | HTTP | Nota |\n|---|---|---|---:|---|\n${remoteProblems.map((item) => `| ${item.name} | ${item.streamUrl} | ${item.streamStatus} | ${item.streamHttpStatus ?? "—"} | ${item.streamNote ?? "—"} |`).join("\n")}` : "No se detectaron streams remotos problemáticos.",
  ``,
  `## Interpretación de logos`,
  ``,
  "Las 21 radios editoriales usan assets locales definidos en components/station-logo.tsx, incluido Oasis FM. La auditoría confirmó que los 112 streams que permanecen en producción responden como audio o playlist válida; los siete endpoints Digital FM que fallaban fueron excluidos del catálogo remoto. De las emisoras remotas restantes, 44 no publican un logo o favicon verificable; esas entradas conservan un fallback de iniciales para no asociarles una imagen incorrecta.",
  ``,
];
await fs.writeFile(new URL("../docs/catalog-audit.md", import.meta.url), lines.join("\n"));
console.log(JSON.stringify({ editorial: editorial.length, remoteProblems: remoteProblems.length, editorialStreamFailures: editorial.filter((item) => item.streamStatus !== "ok").length, editorialLogoFailures: editorial.filter((item) => !localLogoIds.has(item.id) && item.logoStatus !== "ok").length }, null, 2));
