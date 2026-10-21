import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Read-only HTTP audit. Sequential requests, persisted progress and early stop
// on infrastructure errors prevent another burst against the WordPress host.
const origin = "https://medicinasagrada.com.br";
const target = "https://medicina-sagrada.vercel.app";
const file = "artifacts/slug-audit.json";
const pause = () => new Promise(resolve => setTimeout(resolve, 750));
const save = () => { state.updatedAt = new Date().toISOString(); writeFileSync(file, JSON.stringify(state, null, 2)); };
const state = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : { origin, target, startedAt: new Date().toISOString(), inventory: [], results: [], discoveredLinks: {} };
const recheck = process.argv.slice(3).filter(arg => arg.startsWith("/"));
if (recheck.length) state.results = state.results.filter(item => !recheck.includes(item.path));
mkdirSync("artifacts", { recursive: true });
async function get(url) {
  const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(20_000) });
  return { response, body: await response.text() };
}
function add(path, source) {
  let item = state.inventory.find(item => item.path === path);
  if (!item) { item = { path, sources: [] }; state.inventory.push(item); }
  if (!item.sources.some(entry => JSON.stringify(entry) === JSON.stringify(source))) item.sources.push(source);
}
function links(html, base) {
  const paths = new Set();
  for (const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)) {
    try {
      const url = new URL(match[1].replaceAll("&amp;", "&"), base);
      if (![origin, target].includes(url.origin) || url.search || /\.(jpg|png|webp|pdf|svg|xml|php)\/?$/i.test(url.pathname) || /^\/(wp-|api\/|feed\/|comments\/)/.test(url.pathname)) continue;
      paths.add(url.pathname);
    } catch { /* Ignore invalid/non-HTTP links. */ }
  }
  return [...paths];
}
if (!state.inventoryComplete) {
  const groups = [["pages", "wp/v2/pages", "id,slug,link,title"], ["posts", "wp/v2/posts", "id,slug,link,title"], ["products", "wc/store/v1/products", "id,slug,permalink,name"], ["productCategories", "wc/store/v1/products/categories", "id,slug,permalink,name,count,parent"], ["postCategories", "wp/v2/categories", "id,slug,link,name,count,parent"], ["tags", "wp/v2/tags", "id,slug,link,name,count"]];
  for (const [kind, endpoint, fields] of groups) {
    for (let page = 1; page <= 50; page++) {
      await pause();
      const { response, body } = await get(`${origin}/wp-json/${endpoint}?per_page=100&page=${page}&_fields=${fields}`);
      if (!response.ok) throw new Error(`Inventário ${kind}: HTTP ${response.status}`);
      const items = JSON.parse(body);
      for (const item of items) if (item.link || item.permalink) add(new URL(item.link || item.permalink).pathname, { kind, id: item.id, slug: item.slug, name: item.name ?? item.title?.rendered, count: item.count });
      const totalPages = Number(response.headers.get("x-wp-totalpages"));
      save();
      if ((totalPages && page >= totalPages) || items.length < 100) break;
    }
    console.log("Inventário", kind, state.inventory.filter(item => item.sources.some(source => source.kind === kind)).length);
  }
  state.catalogPaths = state.inventory.length;
  for (const base of [origin, target]) {
    await pause();
    const { response, body } = await get(base + "/");
    if (!response.ok) throw new Error(`Home ${base}: ${response.status}`);
    for (const path of links(body, base)) add(path, { kind: base === origin ? "originalHomeLink" : "newHomeLink" });
  }
  const { response, body } = await get(target + "/sitemap.xml");
  if (!response.ok) throw new Error("Sitemap indisponível");
  state.sitemapPaths = [...body.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => new URL(match[1]).pathname);
  state.inventoryComplete = true; save();
}

if (process.argv.includes("--product-tags") && !state.productTagsComplete) {
  // Base confirmed from the live product page's rel=tag links, not translated.
  for (let page = 1; page <= 50; page++) {
    await pause();
    const { response, body } = await get(`${origin}/wp-json/wc/store/v1/products/tags?per_page=100&page=${page}`);
    if (!response.ok) throw new Error(`Etiquetas de produto: HTTP ${response.status}`);
    const items = JSON.parse(body);
    for (const item of items) add(`/product-tag/${item.slug}/`, { kind: "productTags", id: item.id, slug: item.slug, name: item.name, count: item.count, pathBasis: "base confirmed in native rel=tag link" });
    save();
    const pages = Number(response.headers.get("x-wp-totalpages"));
    if ((pages && page >= pages) || items.length < 100) break;
  }
  state.catalogPaths = state.inventory.filter(item => item.sources.some(source => source.id)).length;
  state.productTagsComplete = true; save();
}
if (process.argv.includes("--links")) {
  for (const [path, pages] of Object.entries(state.discoveredLinks)) {
    if (!state.inventory.some(item => item.path === path)) add(path, { kind: "internalLink", foundOn: pages });
  }
  save();
}
console.log("Auditoria", state.results.length, "/", state.inventory.length);
let completed = 0;
const limit = Number(process.argv[2] ?? 250);
for (const entry of state.inventory) {
  if (state.results.some(result => result.path === entry.path)) continue;
  if (completed >= limit) break;
  await pause();
  try {
    const { response, body } = await get(target + entry.path);
    const title = body.match(/<title>(.*?)<\/title>/s)?.[1] ?? "";
    const canonicalTag = [...body.matchAll(/<link\b[^>]+>/gi)].map(match => match[0]).find(tag => /rel=["']canonical["']/i.test(tag));
    const canonical = canonicalTag?.match(/href=["']([^"']+)/i)?.[1];
    const notFound = response.status === 404 || /não encontrad|page not found|404:/i.test(title) || body.includes("NEXT_HTTP_ERROR_FALLBACK;404");
    const infrastructureError = response.status >= 500 || /application error/i.test(title) || /Error establishing a database connection/.test(body);
    if (infrastructureError) {
      state.interruptions ??= []; state.interruptions.push({ path: entry.path, status: response.status, at: new Date().toISOString() }); save();
      console.log("PAUSA: erro de infraestrutura", entry.path, response.status); break;
    }
    const redirectMeta = body.match(/<meta[^>]*http-equiv=["']refresh["'][^>]*content=["'][^"']*url=([^"']+)/i)?.[1];
    const location = response.headers.get("location") ?? (redirectMeta ? new URL(redirectMeta, target + entry.path).href : null);
    const kind = notFound ? "missing" : location ? "redirect" : response.ok ? "ok" : "http-error";
    state.results.push({ path: entry.path, status: response.status, kind, title, canonicalPath: canonical ? new URL(canonical).pathname : null, location, redirectMechanism: location ? response.headers.has("location") ? "http" : "html-refresh" : undefined });
    for (const path of links(body, target)) {
      state.discoveredLinks[path] ??= [];
      if (state.discoveredLinks[path].length < 3 && !state.discoveredLinks[path].includes(entry.path)) state.discoveredLinks[path].push(entry.path);
    }
    save(); completed++;
    if (completed % 10 === 0 || kind !== "ok") console.log("Verificado", state.results.length, "/", state.inventory.length, kind !== "ok" ? JSON.stringify({ path: entry.path, kind, status: response.status, location }) : "");
  } catch (error) {
    state.interruptions ??= []; state.interruptions.push({ path: entry.path, error: error.message, at: new Date().toISOString() }); save();
    console.log("PAUSA: falha de rede", entry.path); break;
  }
}
console.log("RESUMO", JSON.stringify({ inventory: state.inventory.length, catalog: state.catalogPaths, tested: state.results.length, counts: state.results.reduce((out, item) => ({ ...out, [item.kind]: (out[item.kind] ?? 0) + 1 }), {}), pending: state.inventory.length - state.results.length }));

if (process.argv.includes("--baseline")) {
  state.baseline ??= [];
  const candidates = state.results.filter(item => item.kind !== "ok");
  const representatives = [...new Map(candidates.map(item => [state.inventory.find(entry => entry.path === item.path)?.sources[0]?.kind, item])).values()];
  const selected = [...new Map([...representatives, ...candidates].map(item => [item.path, item])).values()].slice(0, 16);
  for (const item of selected) {
    if (state.baseline.some(row => row.path === item.path)) continue;
    await pause();
    try {
      const { response, body } = await get(origin + item.path);
      if (response.status >= 500) { console.log("PAUSA baseline", item.path, response.status); break; }
      const row = { path: item.path, status: response.status, location: response.headers.get("location"), title: body.match(/<title>(.*?)<\/title>/s)?.[1] ?? "" };
      state.baseline.push(row); save(); console.log("ORIGINAL", JSON.stringify(row));
    } catch { console.log("PAUSA baseline rede", item.path); break; }
  }
}

const escapeCell = value => String(value ?? "—").replaceAll("|", "\\|").replaceAll("\n", " ");
const report = [
  "# Verificação de caminhos — Medicina Sagrada", "",
  `Atualizado em: ${state.updatedAt}. Origem: ${origin}. Destino: ${target}.`, "",
  "Comparação do caminho após o domínio, incluindo barra final. Requisições sequenciais; nenhuma configuração da loja foi alterada.", "",
  `Inventário: ${state.catalogPaths} caminhos únicos publicados na API do WordPress/WooCommerce, ampliado para ${state.inventory.length} com links encontrados nas páginas. Verificados: ${state.results.length}. Pendentes: ${state.inventory.length - state.results.length}.`, "",
  "Limites: não representa todo o histórico do Google/Search Console, arquivos de mídia, parâmetros de filtro, todas as paginações ou conteúdo protegido por login. Resposta 200 não comprova equivalência funcional de formulários/conteúdo. Páginas de erro com status 200 foram classificadas como ausentes.", "",
  "## Resumo por grupo", "", "| Grupo | Inventário | Válidas | Redirecionamentos | Ausentes | Pendentes |", "|---|---:|---:|---:|---:|---:|",
  ...["pages", "posts", "products", "productCategories", "postCategories", "tags", "productTags", "internalLink"].map(group => {
    const entries = state.inventory.filter(item => item.sources.some(source => source.kind === group));
    const rows = state.results.filter(item => entries.some(entry => entry.path === item.path));
    return `| ${group} | ${entries.length} | ${rows.filter(item => item.kind === "ok").length} | ${rows.filter(item => item.kind === "redirect").length} | ${rows.filter(item => item.kind === "missing").length} | ${entries.length - rows.length} |`;
  }), "", "Há sobreposição entre grupos: /rape/ está cadastrado como página e artigo. Não somar as linhas como se fossem caminhos únicos.", "",
  "## Resultados", "", "| Caminho | Origem do inventário | HTTP novo | Resultado | Destino / canonical | HTTP original se conferido |", "|---|---|---:|---|---|---:|",
  ...state.results.map(item => {
    const sources = state.inventory.find(entry => entry.path === item.path)?.sources.map(source => source.kind).join(", ");
    const original = state.baseline?.find(row => row.path === item.path);
    return `| ${escapeCell(item.path)} | ${escapeCell(sources)} | ${item.status} | ${item.kind} | ${escapeCell(item.location ?? item.canonicalPath)} | ${escapeCell(original?.status)} |`;
  }), "", "## Colisões de conteúdo", "",
  ...state.inventory.filter(item => item.sources.filter(source => source.id).length > 1).map(item => `- ${item.path}: ${item.sources.filter(source => source.id).map(source => `${source.kind} #${source.id}`).join(" e ")}. O mesmo caminho não identifica dois conteúdos distintos.`), "",
  "## Caminhos ausentes do sitemap", "",
  ...state.inventory.filter(item => item.sources.some(source => source.id) && !state.sitemapPaths?.includes(item.path)).map(item => `- ${item.path}`), "",
  "O JSON contém também os locais onde os links internos foram encontrados e o histórico de interrupções.", "",
];
writeFileSync("artifacts/slug-audit.md", report.join("\n"));
