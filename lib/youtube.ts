const YOUTUBE_CHANNEL_ID = "UCHRF9M18Uiuj3R8CIZNOh6w";
const YOUTUBE_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;

export type YouTubeVideo = {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  publishedAt: string;
};

const decodeCodePoint = (code: string, radix: number) => {
  const point = Number.parseInt(code, radix);
  return point > 0 && point <= 0x10ffff && (point < 0xd800 || point > 0xdfff)
    ? String.fromCodePoint(point)
    : "\uFFFD";
};

const decodeXml = (value: string) =>
  value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      decodeCodePoint(code, 16),
    )
    .replace(/&#(\d+);/g, (_, code: string) =>
      decodeCodePoint(code, 10),
    )
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();

const readTag = (source: string, tag: string) => {
  const match = source.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return match ? decodeXml(match[1]) : "";
};

const excerptDescription = (description: string, title: string) => {
  const normalizeText = (value: string) =>
    value
      .toLocaleLowerCase("pt-BR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  const normalizedTitle = normalizeText(title);
  const paragraphs = description
    .replace(/<[^>]+>/g, " ")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter((paragraph) => {
      const normalizedParagraph = normalizeText(paragraph);

      return (
        paragraph.length >= 35 &&
        normalizedParagraph !== normalizedTitle &&
        !normalizedTitle.includes(normalizedParagraph) &&
        !normalizedParagraph.includes(normalizedTitle) &&
        !/^(?:produto dispon[ií]vel[^.]*https?:\/\/|https?:\/\/|www\.|#|@)/i.test(
          paragraph,
        )
      );
    });
  const excerpt = paragraphs[0] ?? description.replace(/\s+/g, " ").trim();

  if (excerpt.length <= 180) return excerpt;

  const shortened = excerpt.slice(0, 177);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, lastSpace > 120 ? lastSpace : 177).trim()}…`;
};

const parseYouTubeFeed = (xml: string): YouTubeVideo[] =>
  Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g))
    .map(([, entry]) => {
      const id = readTag(entry, "yt:videoId");
      const title = readTag(entry, "title");
      const rawDescription = readTag(entry, "media:description");

      return {
        id,
        title,
        description: excerptDescription(rawDescription, title),
        url: `https://www.youtube.com/watch?v=${id}`,
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        publishedAt: readTag(entry, "published"),
      };
    })
    .filter((video) => video.id && video.title && video.description);

export async function getYouTubeVideos(): Promise<YouTubeVideo[]> {
  try {
    const response = await fetch(YOUTUBE_FEED_URL, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/atom+xml, application/xml, text/xml" },
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) return [];
    return parseYouTubeFeed(await response.text());
  } catch {
    return [];
  }
}
