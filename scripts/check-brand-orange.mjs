import { readdir, readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const orange = [239, 73, 41];
const aliases = /var\(--(?:brand-orange|brand-text|cta-accent|clay-500|sun-400)\)/;
const failures = [];
let checked = 0;

function isOrange([r, g, b]) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
  if (!delta || delta / max < 0.08) return false;
  const hue = (60 * (max === r ? (g - b) / delta : max === g ? 2 + (b - r) / delta : 4 + (r - g) / delta) + 360) % 360;
  return hue >= 7 && hue <= 35;
}

function validate(text, file) {
  checked += 1;
  for (const match of text.matchAll(/#([\da-f]{6}|[\da-f]{3})\b|rgba?\(([^)]+)\)/gi)) {
    let values;
    if (match[1]) {
      const hex = match[1].length === 3 ? [...match[1]].map(c => c + c).join("") : match[1];
      values = hex.match(/../g).map(c => parseInt(c, 16));
    } else {
      values = match[2].split(/[\s,/]+/).map(Number);
    }
    if (isOrange(values) && (orange.some((channel, i) => values[i] !== channel) || (values[3] !== undefined && values[3] !== 1))) {
      failures.push(`${file}: laranja divergente ou translúcido ${match[0]}`);
    }
  }
  for (const rule of text.matchAll(/([^{}]+)\{([^{}]+)\}/g)) {
    if (aliases.test(rule[2]) && /(?:color-mix|(?:linear|radial|conic)-gradient)\([^;]*var\(--(?:brand-orange|brand-text|cta-accent|clay-500|sun-400)\)/.test(rule[2])) {
      failures.push(`${file}: mistura ou gradiente do laranja em ${rule[1].trim()}`);
    }
  }
}

async function scan(directory) {
  for (const entry of await readdir(new URL(`${directory}/`, root), { withFileTypes: true })) {
    const file = `${directory}/${entry.name}`;
    if (entry.isDirectory()) await scan(file);
    else if (file.endsWith(".css")) validate(await readFile(new URL(file, root), "utf8"), file);
  }
}

for (const directory of ["app", "components", "lib"]) await scan(directory);
// Brand vectors only: partner identities and ethnicity accents have their own palettes.
for (const directory of ["public/assets/logo", "public/assets/contato"]) {
  for (const file of await readdir(new URL(`${directory}/`, root))) {
    if (file.endsWith(".svg")) validate(await readFile(new URL(`${directory}/${file}`, root), "utf8"), `${directory}/${file}`);
  }
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else console.log(`Laranja #EF4929 sem variantes ou transparência nos ${checked} arquivos de estilos e vetores de marca verificados.`);
