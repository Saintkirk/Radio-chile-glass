import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { parseICYMetadata } from "../lib/player-utils.js";

/**
 * Lee metadatos ICY de un stream de radio en vivo.
 * Extrae título y artista del StreamTitle usando parseICYMetadata para consistencia.
 * Timeout: 7s para no bloquear la UI.
 */
async function readNowPlaying(streamUrl: string) {
  const parsed = new URL(streamUrl);
  if (parsed.protocol !== "https:") throw new Error("Only HTTPS streams are supported");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(streamUrl, { headers: { "Icy-MetaData": "1", "User-Agent": "RadioChileGlass/1.0" }, signal: controller.signal, redirect: "follow" });
    const metaInt = Number(response.headers.get("icy-metaint"));
    if (!response.ok || !response.body || !Number.isFinite(metaInt) || metaInt <= 0) return { artist: null, title: null, available: false, fetchedAt: Date.now() };
    const reader = response.body.getReader();
    let audioBytes = 0;
    let metadataLength: number | null = null;
    let metadataBytes = 0;
    const metadataParts: Uint8Array[] = [];
    while (audioBytes < metaInt || metadataBytes < (metadataLength ?? 0)) {
      const chunk = await reader.read();
      if (chunk.done || !chunk.value) break;
      let offset = 0;
      while (offset < chunk.value.length) {
        if (audioBytes < metaInt) {
          const take = Math.min(metaInt - audioBytes, chunk.value.length - offset);
          audioBytes += take;
          offset += take;
          continue;
        }
        if (metadataLength === null) {
          metadataLength = chunk.value[offset] * 16;
          metadataBytes = 0;
          offset += 1;
          if (metadataLength === 0) return { artist: null, title: null, available: false, fetchedAt: Date.now() };
        }
        const take = Math.min((metadataLength ?? 0) - metadataBytes, chunk.value.length - offset);
        metadataParts.push(chunk.value.slice(offset, offset + take));
        metadataBytes += take;
        offset += take;
      }
      if (metadataLength !== null && metadataBytes >= metadataLength) break;
    }
    await reader.cancel().catch(() => undefined);
    const raw = new TextDecoder().decode(Buffer.concat(metadataParts.map((part) => Buffer.from(part))));
    const match = raw.match(/StreamTitle='([^']*)'/i);
    const titleLine = match?.[1]?.trim() || "";
    if (!titleLine) return { artist: null, title: null, available: false, fetchedAt: Date.now() };
    
    // Usar parseICYMetadata para consistencia con el cliente
    const parsedMetadata = parseICYMetadata(titleLine);
    return { 
      artist: parsedMetadata.artist ?? null, 
      title: parsedMetadata.title ?? null, 
      available: true, 
      fetchedAt: Date.now() 
    };
  } finally { clearTimeout(timeout); }
}

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  metadata: router({
    nowPlaying: publicProcedure.input(z.object({ streamUrl: z.string().url().max(2048) })).query(({ input }) => readNowPlaying(input.streamUrl)),
  }),
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
