import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Inventário estático: referências em código não comprovam visibilidade no navegador.
const root = fileURLToPath(new URL("../", import.meta.url));
const files = [];
async function walk(directory) {
  for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
    const relative = `${directory}/${entry.name}`;
    if (entry.isDirectory()) await walk(relative);
    else if (/\.(?:css|tsx?|jsx?|mjs)$/.test(entry.name)) {
      files.push({ path: relative, text: await readFile(path.join(root, relative), "utf8") });
    }
  }
}
for (const directory of ["app", "components", "lib"]) await walk(directory);
files.sort((a, b) => a.path.localeCompare(b.path));
const css = files.filter((file) => file.path.endsWith(".css"));
const global = files.find((file) => file.path === "app/globals.css").text;
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const tokens = [...global.slice(0, global.indexOf("}")).matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => {
  const references = files.flatMap((file) => {
    const matches = [...file.text.matchAll(new RegExp(`var\\(\\s*${escape(name)}\\s*[,)]`, "g"))];
    return matches.length ? [{ file: file.path, count: matches.length }] : [];
  });
  return { name, value, referenced: references.length > 0, references };
}).filter((token) => token.referenced);
const cssDeclarations = css.flatMap((file) => {
  const result = [];
  // O seletor permanece como contexto textual; não é uma análise da cascata CSS.
  const rules = /([^{}]+)\{([^{}]*)\}/g;
  for (const rule of file.text.matchAll(rules)) {
    const selector = rule[1].replace(/\/\*[\s\S]*?\*\//g, "").trim();
    for (const declaration of rule[2].matchAll(/([\w-]+)\s*:\s*([^;{}]+)\s*;?/g)) {
      const [, property, value] = declaration;
      if (selector === ":root" && property.startsWith("--") && !tokens.some((token) => token.name === property)) continue;
      if (/(?:#[\da-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(|color-mix\(|\b(?:white|black|transparent)\b)/i.test(value) || /^(?:font-family|font-size|font-weight|line-height|letter-spacing)$/.test(property)) {
        result.push({ file: file.path, selector, property, value: value.trim() });
      }
    }
  }
  return result;
});
const themes = files.find((file) => file.path === "lib/ethnicity-colors.ts").text;
const ethnicityColors = [...themes.matchAll(/name: "([^"]+)", accent: "([^"]+)", foreground: "([^"]+)"/g)]
  .map(([, name, accent, foreground]) => ({ name, accent, foreground }));
const report = {
  schemaVersion: 1,
  method: "Leitura estática de app/, components/ e lib/. Inclui somente tokens globais com referências var(). Declarações locais registram uso no CSS, não visibilidade ou precedência na cascata. Não determina seletores mortos, carregamento de fontes ou disponibilidade externa. SVGs, bitmaps e estilos remotos não são inventariados.",
  sources: files.map((file) => file.path),
  globalTokens: tokens,
  ethnicityColors,
  mediaQueries: css.map((file) => ({ file: file.path, queries: [...new Set([...file.text.matchAll(/@media\s*([^{}]+)\{/g)].map((match) => match[1].trim()))] })),
  cssDeclarations,
};
const destination = path.join(root, "docs/INVENTARIO-VISUAL.json");
if (process.argv.includes("--check")) {
  const current = await readFile(destination, "utf8");
  if (current !== `${JSON.stringify(report, null, 2)}\n`) {
    console.error("Inventário desatualizado. Execute npm.cmd run docs:visual.");
    process.exitCode = 1;
  } else console.log("Inventário visual corresponde ao código atual.");
} else {
  await writeFile(destination, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Inventário atualizado: ${tokens.length} tokens globais, ${ethnicityColors.length} cores de etnias.`);
}
