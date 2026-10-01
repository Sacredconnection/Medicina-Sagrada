import sanitizeHtml from "sanitize-html";
import { parseDocument } from "htmlparser2";
import { appendChild, findAll, getOuterHTML, removeElement, replaceElement, textContent } from "domutils";
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
      "img",
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

  const document = parseDocument(cleanHtml(prepared));
  // Strip only spacer breaks at paragraph edges, including breaks inside emphasis.
  for (const paragraph of findAll((element) => element.name === "p", document.children)) {
    const leaves: typeof paragraph.children = [];
    const collect = (nodes: typeof paragraph.children) => {
      for (const node of nodes) {
        if ("children" in node && node.children.length) collect(node.children);
        else if ("data" in node ? node.data.trim() : "name" in node && /^(br|img|iframe|video|audio)$/.test(node.name)) leaves.push(node);
      }
    };
    collect(paragraph.children);
    const isBreak = (node: (typeof leaves)[number] | undefined) => node && "name" in node && node.name === "br";
    while (isBreak(leaves[0])) removeElement(leaves.shift()!);
    while (isBreak(leaves.at(-1))) removeElement(leaves.pop()!);
  }
  // Legacy editors used blank paragraphs for spacing; let the article CSS own it.
  findAll((element) => /^(p|h[2-4])$/.test(element.name) &&
    !textContent(element).replace(/\s|\u00a0/g, "") &&
    !findAll((child) => /^(img|iframe|video|audio|source|svg)$/.test(child.name), element.children).length,
  document.children).forEach(removeElement);

  // Some old button shortcodes were wrapped in a heading by the editor.
  for (const heading of findAll((element) => /^h[2-4]$/.test(element.name), document.children)) {
    const button = findAll((element) => /\barticle-inline-cta\b/.test(element.attribs.class ?? ""), heading.children)[0];
    if (button && textContent(heading).trim() === textContent(button).trim()) {
      removeElement(button);
      replaceElement(heading, button);
    }
  }

  const sourceHeadings = findAll((element) => /^h[2-4]$/.test(element.name) &&
    /^(fontes|referências|referencias|bibliografia)\s*:?[\s]*$/i.test(textContent(element).trim()),
  document.children);
  for (const heading of sourceHeadings) {
    const section = findAll((element) => element.name === "section", parseDocument('<section class="article-sources" aria-label="Fontes da matéria"></section>').children)[0];
    let sibling = heading.next;
    replaceElement(heading, section);
    appendChild(section, heading);
    while (sibling) {
      if ("name" in sibling && (/^h[1-6]$/.test(sibling.name) ||
        ("attribs" in sibling && /\barticle-(?:inline|shop)-cta\b/.test(sibling.attribs.class ?? "")))) break;
      const next = sibling.next;
      removeElement(sibling);
      appendChild(section, sibling);
      sibling = next;
    }
  }
  return getOuterHTML(document, { encodeEntities: false });
}

export const excerpt = (html: string, maximumLength = 160) => {
  const text = plainText(html);
  if (text.length <= maximumLength) return text;
  return `${text.slice(0, maximumLength - 1).replace(/\s+\S*$/, "")}…`;
};
