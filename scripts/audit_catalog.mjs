import fs from "node:fs/promises";

const root = new URL("..", import.meta.url);
const radiosPath = new URL("../lib/radios.ts", import.meta.url);
const source = await fs.readFile(radiosPath, "utf8");
const editorial = source.split("\n").filter((line) => line.includes("{ id:")).map((line) => ({ id: line.match(/id: "([^"]+)"/)?.[1] ?? "unknown", name: line.match(/name: "([^"]+)"/)?.[1] ?? "unknown", streamUrl: line.match(/streamUrl: "([^"]+)"/)?.[1] ?? "", logoUrl: line.match(/favicon: "([^"]+)"/)?.[1] ?? null, source: "editorial" })).filter((radio) => radio.streamUrl);

const catalogUrl = "https://de1.api.radio-browser.info/json/stations/bycountryexact/Chile?hidebroken=true&limit=100";
const timeoutMs = 12000;
const headers = { "user-agent": "RadioChileGlass-Audit/1.0", accept: "*/*" };

async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, headers: { ...headers, ...(init.headers ?? {}) }, signal: controller.signal, redirect: "follow" });
  } finally {
    clearTimeout(timer);
  }
}

async function inspectStream(radio) {
  const result = { ...radio, streamStatus: "error", streamHttpStatus: null, streamContentType: null, streamFinalUrl: null, streamNote: null };
  try {
    const response = await fetchWithTimeout(radio.streamUrl, { method: "GET", headers: { range: "bytes=0-1023" } });
    result.streamHttpStatus = response.status;
    result.streamContentType = response.headers.get("content-type");
    result.streamFinalUrl = response.url;
    const reader = response.body?.getReader();
    const chunk = reader ? await reader.read() : { value: undefined };
    const text = chunk.value ? new TextDecoder().decode(chunk.value) : "";
    const contentType = (result.streamContentType ?? "").toLowerCase();
    const playlist = contentType.includes("mpegurl") || text.includes("#EXTM3U");
    const audio = contentType.startsWith("audio/") || /audio|mpeg|aac|ogg|opus|icecast|stream/i.test(contentType + " " + radio.streamUrl);
    result.streamStatus = response.ok && (audio || playlist) ? "ok" : response.ok ? "unknown" : "error";
    result.streamNote = playlist ? "playlist" : audio ? "audio" : "unexpected-content";
    await reader?.cancel();
  } catch (error) {
    result.streamNote = error instanceof Error ? error.name + ": " + error.message : String(error);
  }
  return result;
}

async function inspectLogo(radio) {
  const result = { ...radio, logoStatus: radio.logoUrl ? "error" : "missing", logoHttpStatus: null, logoContentType: null, logoFinalUrl: null, logoNote: null };
  if (!radio.logoUrl) return result;
  try {
    let response = await fetchWithTimeout(radio.logoUrl, { method: "HEAD" });
    if (!response.ok) response = await fetchWithTimeout(radio.logoUrl, { method: "GET", headers: { range: "bytes=0-2047" } });
    result.logoHttpStatus = response.status;
    result.logoContentType = response.headers.get("content-type");
    result.logoFinalUrl = response.url;
    result.logoStatus = response.ok && /image|svg/i.test(result.logoContentType ?? "") ? "ok" : response.ok ? "unknown" : "error";
    result.logoNote = result.logoContentType ?? "no-content-type";
    if (response.body) await response.body.cancel();
  } catch (error) {
    result.logoNote = error instanceof Error ? error.name + ": " + error.message : String(error);
  }
  return result;
}

async function mapLimit(items, limit, worker) {
  const output = new Array(items.length);
  let cursor = 0;
  async function runner() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      output[index] = await worker(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runner));
  return output;
}

let remote = [];
try {
  const response = await fetchWithTimeout(catalogUrl, { method: "GET", headers: { accept: "application/json" } });
  if (response.ok) {
    const stations = await response.json();
        remote = stations.filter((station) => station.name && (station.url_resolved || station.url)).map((station, index) => { const streamUrl = (station.url_resolved || station.url).trim(); let homepageLogo = null; try { homepageLogo = station.homepage ? `${new URL(station.homepage).origin}/favicon.ico` : null; } catch {} return { id: `remote-${station.stationuuid ?? index}`, name: station.name.trim().replace(/\s+/g, " "), streamUrl, logoUrl: station.favicon || homepageLogo, source: "remote" }; }).filter((station) => !/radio\.digitalfm\.cl:8000/i.test(station.streamUrl));
  }
} catch {
  remote = [];
}

const all = [...editorial, ...remote.filter((radio) => !editorial.some((item) => item.streamUrl.toLowerCase() === radio.streamUrl.toLowerCase()))];
const streamResults = await mapLimit(all, 8, inspectStream);
const logoResults = await mapLimit(all, 8, inspectLogo);
const byId = new Map(streamResults.map((item) => [item.id, item]));
const results = logoResults.map((logo) => ({ ...byId.get(logo.id), ...logo }));
const report = { auditedAt: new Date().toISOString(), editorialCount: editorial.length, remoteCount: remote.length, totalCount: results.length, results };
await fs.writeFile(new URL("../docs/catalog-audit.json", import.meta.url), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ auditedAt: report.auditedAt, editorialCount: report.editorialCount, remoteCount: report.remoteCount, totalCount: report.totalCount, streamOk: results.filter((item) => item.streamStatus === "ok").length, streamProblems: results.filter((item) => item.streamStatus !== "ok").length, logoOk: results.filter((item) => item.logoStatus === "ok").length, logoProblems: results.filter((item) => item.logoStatus !== "ok").length }, null, 2));
console.log(results.filter((item) => item.source === "editorial" && (item.streamStatus !== "ok" || item.logoStatus !== "ok")));
if (results.some((item) => item.source === "editorial" && item.streamStatus !== "ok")) process.exitCode = 2;
if (results.some((item) => item.source === "editorial" && item.logoStatus !== "ok")) process.exitCode = 3;
void root;
void logoResults;
void byId;
void mapLimit;
void inspectLogo;
void inspectStream;
void fetchWithTimeout;
void headers;
void timeoutMs;
void catalogUrl;
void source;
void radiosPath;
void editorial;
void remote;
void all;
void results;
void report;
void root;
