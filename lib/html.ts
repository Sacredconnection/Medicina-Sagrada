import sanitizeHtml from "sanitize-html";

export const cleanHtml = (html: string) =>
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

export const excerpt = (html: string, maximumLength = 160) => {
  const text = plainText(html);
  if (text.length <= maximumLength) return text;
  return `${text.slice(0, maximumLength - 1).replace(/\s+\S*$/, "")}…`;
};
