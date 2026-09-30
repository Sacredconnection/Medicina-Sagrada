import sanitizeHtml from "sanitize-html";
import type { WordPressMedia } from "@/lib/types";

export const cleanHtml = (
  html: string,
  textFilter?: (text: string, tagName: string) => string,
  { removeHeadings = false }: { removeHeadings?: boolean } = {},
) =>
  sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "figure",
      "figcaption",
      "iframe",
      "picture",
      "source",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["id", "class", "title", "aria-label"],
      a: ["href", "name", "target", "rel"],
      img: [
        "src",
        "srcset",
        "sizes",
        "alt",
        "title",
        "width",
        "height",
        "loading",
        "decoding",
      ],
      iframe: [
        "src",
        "title",
        "width",
        "height",
        "allow",
        "allowfullscreen",
        "loading",
        "referrerpolicy",
      ],
      source: ["src", "srcset", "sizes", "type", "media"],
    },
    allowedIframeHostnames: [
      "www.youtube.com",
      "youtube.com",
      "www.youtube-nocookie.com",
      "player.vimeo.com",
    ],
    transformTags: {
      a: (_tagName, attribs) => {
        const external = /^https?:\/\//.test(attribs.href ?? "");
        return {
          tagName: "a",
          attribs: external
            ? { ...attribs, rel: "noopener noreferrer" }
            : attribs,
        };
      },
      iframe: (_tagName, attribs) => ({
        tagName: "iframe",
        attribs: { ...attribs, loading: "lazy" },
      }),
    },
    ...(removeHeadings
      ? { exclusiveFilter: (frame) => /^h[1-6]$/.test(frame.tag) }
      : {}),
    ...(textFilter ? { textFilter } : {}),
  });

const namedEntities: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&#x([\da-f]+);/gi, (entity, code: string) => {
      const point = Number.parseInt(code, 16);
      return Number.isSafeInteger(point) ? String.fromCodePoint(point) : entity;
    })
    .replace(/&#(\d+);/g, (entity, code: string) => {
      const point = Number.parseInt(code, 10);
      return Number.isSafeInteger(point) ? String.fromCodePoint(point) : entity;
    })
    .replace(/&(amp|apos|gt|lt|nbsp|quot);/gi, (entity, name: string) =>
      namedEntities[name.toLowerCase()] ?? entity,
    );

export const plainText = (html: string) =>
  decodeHtmlEntities(
    sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }),
  )
    .replace(/\s+/g, " ")
    .trim();

const shortcodeMediaIdPattern = /\[(?:ux_image\b[^\]]*\bid|ux_banner\b[^\]]*\bbg)=?(?:&(?:#8221|#8243|quot);|["“”″])?(\d+)/gi;

export const articleShortcodeMediaIds = (html: string) =>
  [...html.matchAll(shortcodeMediaIdPattern)]
    .map((match) => Number(match[1]))
    .filter((id, index, ids) => Number.isSafeInteger(id) && ids.indexOf(id) === index);

const normalizeShortcode = (shortcode: string) =>
  decodeHtmlEntities(shortcode)
    .replace(/[“”″]/g, '"')
    .replace(/&amp;/g, "&");

const shortcodeAttribute = (shortcode: string, attribute: string) => {
  const normalized = normalizeShortcode(shortcode);
  const quoted = normalized.match(new RegExp(`\\b${attribute}\\s*=\\s*"([^"]*)"`, "i"));
  if (quoted) return quoted[1].trim();
  return normalized.match(new RegExp(`\\b${attribute}\\s*=\\s*([^\\s\\]]+)`, "i"))?.[1]?.trim() ?? "";
};

const localizeArticleUrl = (value: string) => {
  try {
    const url = new URL(value);
    if (url.hostname === "medicinasagrada.com.br" || url.hostname === "www.medicinasagrada.com.br") {
      return `${url.pathname}${url.search}${url.hash}`;
    }
    if (
      (url.hostname === "sacred-snuff.com" || url.hostname === "www.sacred-snuff.com") &&
      url.pathname === "/product/kuntanawa-rape-samauma-flower/"
    ) {
      return "/product/rape-kuntanawa-flor-de-samauma/";
    }
  } catch {
    // Relative and fragment URLs already point at the current site.
  }
  return value;
};

const youtubeEmbedUrl = (value: string) => {
  try {
    const url = new URL(value);
    const id = url.hostname === "youtu.be" ? url.pathname.slice(1) : url.searchParams.get("v");
    return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : "";
  } catch {
    return "";
  }
};

const escapedAttribute = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function prepareArticleHtml(html: string, media: WordPressMedia[] = []) {
  const mediaById = new Map(media.flatMap((item) => item.id ? [[item.id, item] as const] : []));
  const layoutShortcodes = new Set(["section", "row", "col", "text_box"]);

  let prepared = html.replace(/\[(\/)?([a-z_][\w-]*)(?:\s[^\]]*)?\]/gi, (shortcode, closing: string | undefined, rawName: string) => {
    const name = rawName.toLowerCase();
    if (layoutShortcodes.has(name) || (closing && name === "ux_banner")) return "";

    if (name === "ux_video" && !closing) {
      const embedUrl = youtubeEmbedUrl(shortcodeAttribute(shortcode, "url"));
      return embedUrl
        ? `<div class="article-video"><iframe src="${escapedAttribute(embedUrl)}" title="Vídeo da matéria" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`
        : "";
    }

    if ((name === "ux_image" || name === "ux_banner") && !closing) {
      const id = Number(shortcodeAttribute(shortcode, name === "ux_image" ? "id" : "bg"));
      const item = mediaById.get(id);
      if (!item?.source_url) return "";
      const width = item.media_details?.width ?? 1200;
      const height = item.media_details?.height ?? 675;
      const image = `<img src="${escapedAttribute(item.source_url)}" alt="${escapedAttribute(item.alt_text ?? "")}" width="${width}" height="${height}" loading="lazy" decoding="async">`;
      const href = localizeArticleUrl(shortcodeAttribute(shortcode, "link"));
      return `<figure class="article-media">${href ? `<a href="${escapedAttribute(href)}">${image}</a>` : image}</figure>`;
    }

    if (name === "button" && !closing) {
      const label = shortcodeAttribute(shortcode, "text") || "Conheça nossos produtos";
      const href = localizeArticleUrl(shortcodeAttribute(shortcode, "link"));
      return href ? `<p class="article-inline-cta"><a href="${escapedAttribute(href)}">${escapedAttribute(label)}</a></p>` : "";
    }

    if ((name === "ux_bestseller_products" || name === "ux_featured_products") && !closing) {
      const label = shortcodeAttribute(shortcode, "title") || "Conheça também";
      return `<p class="article-inline-cta"><a href="/product-category/rape/">${escapedAttribute(label)}</a></p>`;
    }

    return shortcode;
  });

  prepared = prepared
    .replace(/href=(["'])https?:\/\/(?:www\.)?medicinasagrada\.com\.br(\/[^"']*)\1/gi, 'href=$1$2$1')
    .replace(/<h([1-6])\b[^>]*>(?:\s|&nbsp;|<br\s*\/?\s*>)*<\/h\1>/gi, "")
    .replace(/<h1\b([^>]*)>/gi, "<h2$1>")
    .replace(/<\/h1>/gi, "</h2>")
    .replace(/<h[56]\b([^>]*)>/gi, "<h3$1>")
    .replace(/<\/h[56]>/gi, "</h3>");

  return prepared;
}

export const excerpt = (html: string, maximumLength = 160) => {
  const text = plainText(html);
  if (text.length <= maximumLength) return text;
  return `${text.slice(0, maximumLength - 1).replace(/\s+\S*$/, "")}…`;
};
