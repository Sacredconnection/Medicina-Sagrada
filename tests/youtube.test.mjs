import test from "node:test";
import assert from "node:assert/strict";
import { getYouTubeVideos } from "../lib/youtube.ts";

test("entidade Unicode inválida não descarta os demais vídeos do feed", async () => {
  const originalFetch = globalThis.fetch;
  const entry = (id, title) =>
    `<entry><yt:videoId>${id}</yt:videoId><title>${title}</title>` +
    `<media:description>Uma conversa sobre saberes e cultura da floresta amazônica.</media:description>` +
    `<published>2026-09-28</published></entry>`;
  const feed = `<feed>${entry("video1", "Arte &amp; cultura")}${entry("video2", "Floresta &#x110000; viva")}${entry("video3", "Natureza &#x1F33F;")}</feed>`;

  globalThis.fetch = async () => ({ ok: true, text: async () => feed });
  try {
    const videos = await getYouTubeVideos();
    assert.deepEqual(videos.map(({ title }) => title), [
      "Arte & cultura",
      "Floresta \uFFFD viva",
      "Natureza 🌿",
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
