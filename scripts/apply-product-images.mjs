import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const archive = "C:\\Users\\danie\\Downloads\\Fotos-MS-900x900.rar";
const env = Object.fromEntries((await fs.readFile(path.join(root, ".env.local"), "utf8"))
  .split(/\r?\n/)
  .filter((line) => line && !line.startsWith("#") && line.includes("="))
  .map((line) => { const i = line.indexOf("="); return [line.slice(0, i), line.slice(i + 1).trim().replace(/^['\"]|['\"]$/g, "")]; }));

const wooBase = (env.WORDPRESS_API_URL || `${env.WORDPRESS_SITE_URL}/wp-json`).replace(/\/$/, "");
const wooUrl = `${wooBase}/wc/v3`;
const wpApi = `${wooBase}`;
const basic = Buffer.from(`${env.WP_USER}:${env.WP_PASSWORD}`).toString("base64");
const wooAuth = Buffer.from(`${env.WORDPRESS_CONSUMER_KEY}:${env.WORDPRESS_CONSUMER_SECRET}`).toString("base64");
const dryRun = process.env.MS_DRY_RUN === "1";

const mappings = [
  ["rape-caboclo-flor-de-jaci", "Caboclo\\Flor de Jaci"],
  ["rape-huni-kuin-tradicao", "Huni Kuin\\Tradição"],
  ["rape-huni-kuin-emburana", "Huni Kuin\\Emburana"],
  ["rape-huni-kuin-7-ervas", "Huni Kuin\\7 Ervas"],
  ["rape-huni-kuin-capemba", "Huni Kuin\\Capemba"],
  ["rape-huni-kuin-canela-de-velho", "Huni Kuin\\Canela de Velho"],
  ["rape-katukina-sonhos-sagrados", "Katukina\\Sonhos Sagrados"],
  ["rape-katukina-nissural", "Katukina\\Nisural"],
  ["rape-katukina-cactus", "Katukina\\Cactus"],
  ["rape-kuntanawa-sananga", "Kuntanawa\\Sananga"],
  ["rape-kuntanawa-yru-kawa", "Kuntanawa\\Kawãnayrû"],
  ["rape-kuntanawa-tete-pawa", "Kuntanawa\\Tetê Pawã"],
  ["rape-kuntanawa-flor-de-samauma", "Kuntanawa\\Flor de Samaúma"],
  ["rape-kuntanawa-cidoca", "Kuntanawa\\Cidoca"],
  ["rape-kuntanawa-propolis", "Kuntanawa\\Própolis"],
  ["rape-nukini-rawni", "Nukini\\Rawni"],
  ["rape-nukini-gelsinho", "Nukini\\Gelzinho"],
  ["rape-nukini-limpeza-astral", "Nukini\\Limpeza Astral"],
  ["rape-nukini-fresh-eucalipto", "Nukini\\Fresh"],
  ["rape-nukini-limpeza-elixir", "Nukini\\Elixir"],
  ["puyanawa-pixuri", "Puyanawa\\Pixuri"],
  ["rape-shawadawa-relax", "Shawãdawa\\Relax"],
  ["rape-yawanawa-cacique", "Yawanawã\\Cacique"],
];

async function json(url, options = {}) {
  const response = await fetch(url, options);
  const body = await response.text();
  if (!response.ok) throw new Error(`${response.status} ${url}: ${body.slice(0, 500)}`);
  return body ? JSON.parse(body) : null;
}

async function findFiles(dir) {
  const result = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await findFiles(full));
    else if (entry.name.toLowerCase().endsWith('.webp')) result.push(full);
  }
  return result;
}

const temp = await fs.mkdtemp(path.join(os.tmpdir(), "ms-fotos-"));
try {
  await execFileAsync("C:\\Program Files\\WinRAR\\UnRAR.exe", ["x", "-y", archive, `${temp}\\`]);
  const extracted = await findFiles(temp);
  const report = [];
  for (const [slug, folder] of mappings.slice(1)) {
    console.error(`PROCESSANDO ${slug}`);
    const productRows = await json(`${wooUrl}/products?slug=${encodeURIComponent(slug)}`, { headers: { Authorization: `Basic ${wooAuth}` } });
    if (!productRows.length) throw new Error(`Produto não encontrado: ${slug}`);
    const product = productRows[0];
    const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const [group, productName] = folder.split('\\');
    const groupKey = normalize(group);
    const productKey = normalize(productName);
    const ordered = extracted.filter((file) => { const normalized = normalize(file); return normalized.includes(groupKey) && normalized.includes(productKey); }).sort((a, b) => path.basename(a).includes("FAMILIA") ? -1 : path.basename(b).includes("FAMILIA") ? 1 : path.basename(a).localeCompare(path.basename(b)));
    if (ordered.length !== 4) throw new Error(`Esperadas 4 imagens para ${slug}; encontradas ${ordered.length}: ${ordered.map((file) => path.basename(file)).join(', ')}`);
    const media = [];
    for (const file of ordered) {
      if (product.id === 13219) continue;
      const name = path.basename(file);
      if (dryRun) { media.push({ id: 0, name }); continue; }
      const content = await fs.readFile(file);
      const form = new FormData();
      form.append("file", new Blob([content], { type: "image/webp" }), name);
      form.append("title", name.replace(/\.webp$/i, ""));
      const uploaded = await json(`${wpApi}/wp/v2/media`, { method: "POST", headers: { Authorization: `Basic ${basic}` }, body: form });
      media.push({ id: uploaded.id, src: uploaded.source_url, name });
    }
    if (product.id === 13219) media.push(...[22120, 22121, 22122, 22123].map((id) => ({ id })));
    if (dryRun) { console.log(JSON.stringify({ dryRun: true, id: product.id, slug, files: ordered.map((file) => path.basename(file)) })); continue; }
    await json(`${wooUrl}/products/${product.id}`, {
      method: "PUT",
      headers: { Authorization: `Basic ${wooAuth}`, "Content-Type": "application/json" },
      body: JSON.stringify({ images: media.map(({ id }) => ({ id })) }),
    });
    const variations = await json(`${wooUrl}/products/${product.id}/variations?per_page=100`, { headers: { Authorization: `Basic ${wooAuth}` } });
    for (const variation of variations) {
      const options = JSON.stringify(variation.attributes).toLowerCase();
      const match = media.find((item) => item.name && /(10g|20g|50g)/i.test(item.name) && options.includes(item.name.match(/-(10g|20g|50g)\.webp/i)?.[1].toLowerCase() ?? ''));
      if (match) await json(`${wooUrl}/products/${product.id}/variations/${variation.id}`, { method: 'PUT', headers: { Authorization: `Basic ${wooAuth}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ image: { id: match.id } }) });
    }
    report.push({ id: product.id, slug, name: product.name, images: media.map(({ id, name }) => ({ id, name })), variations: variations.length });
    console.log(JSON.stringify(report.at(-1)));
  }
} finally {
  await fs.rm(temp, { recursive: true, force: true });
}
