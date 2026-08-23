import { mkdir, writeFile } from "node:fs/promises";

const inputPath = process.argv[2] ?? ".eas-build.json";
const outputPath = process.argv[3] ?? "dist/android/Radio-Chile-Glass.apk";

const payload = JSON.parse(await (await import("node:fs/promises")).readFile(inputPath, "utf8"));

function findBuildUrl(value) {
  if (!value || typeof value !== "object") return null;
  if (typeof value.artifacts?.buildUrl === "string") return value.artifacts.buildUrl;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findBuildUrl(item);
      if (found) return found;
    }
  } else {
    for (const item of Object.values(value)) {
      const found = findBuildUrl(item);
      if (found) return found;
    }
  }
  return null;
}

const buildUrl = findBuildUrl(payload);
if (!buildUrl) {
  throw new Error("No se encontró artifacts.buildUrl en la respuesta JSON de EAS.");
}

const response = await fetch(buildUrl);
if (!response.ok || !response.body) {
  throw new Error(`No se pudo descargar el APK: HTTP ${response.status}`);
}

await mkdir(outputPath.substring(0, outputPath.lastIndexOf("/")), { recursive: true });
await writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
console.log(`APK descargado en ${outputPath}`);
