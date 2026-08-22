const sites = [
  ["FM Latina", "https://www.radiofmlatina.com/"],
  ["Radio Sonar", "https://sonarfm.cl/"],
];
for (const [name, url] of sites) {
  try {
    const html = await (await fetch(url, { signal: AbortSignal.timeout(12000) })).text();
    const candidates = [...html.matchAll(/<(?:link|meta)[^>]+(?:href|content)=["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]).filter((value) => /logo|icon|apple-touch|og:image|png|svg|jpg/i.test(value)).slice(0, 20);
    console.log(JSON.stringify({ name, candidates }));
  } catch (error) {
    console.log(JSON.stringify({ name, error: error instanceof Error ? error.message : String(error) }));
  }
}
