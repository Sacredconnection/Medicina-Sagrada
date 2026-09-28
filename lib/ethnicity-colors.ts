type ProductCategory = {
  name: string;
  slug: string;
};

export type EthnicityTheme = {
  name: string;
  accent: string;
  foreground: string;
  aliases: readonly string[];
};

export const ethnicityThemes: readonly EthnicityTheme[] = [
  { name: "Apurinã", accent: "#83bc43", foreground: "#000000", aliases: ["apurina", "rape-apurina"] },
  { name: "Caboclo", accent: "#997052", foreground: "#000000", aliases: ["caboclo", "rape-caboclo"] },
  { name: "Huni Kuin", accent: "#bfa771", foreground: "#000000", aliases: ["huni-kuin", "rape-huni-kuin"] },
  { name: "Katukina", accent: "#79bc43", foreground: "#000000", aliases: ["katukina", "rape-katukina"] },
  { name: "Kuntanawa", accent: "#606161", foreground: "#ffffff", aliases: ["kuntanawa", "rape-kuntanawa"] },
  { name: "Nukini", accent: "#dc9c41", foreground: "#000000", aliases: ["nukini", "rape-nukini"] },
  { name: "Puyanawa", accent: "#ba9b80", foreground: "#000000", aliases: ["puyanawa", "rape-puyanawa"] },
  { name: "Shanenawa", accent: "#0568a7", foreground: "#ffffff", aliases: ["shanenawa", "rape-shanenawa"] },
  { name: "Shawãdawa", accent: "#ec2326", foreground: "#000000", aliases: ["shawadawa", "rape-shawadawa"] },
  { name: "Yawanawá", accent: "#2f2f2a", foreground: "#ffffff", aliases: ["yawanawa", "rape-yawanawa"] },
] as const;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getEthnicityTheme(categories: readonly ProductCategory[]) {
  const categoryKeys = new Set(categories.flatMap((category) => [
    normalize(category.slug),
    normalize(category.name),
  ]));

  return ethnicityThemes.find((theme) =>
    theme.aliases.some((alias) => categoryKeys.has(alias))
  );
}

const preserveCase = (source: string, canonical: string) => {
  if (source === source.toLocaleUpperCase("pt-BR")) {
    return canonical.toLocaleUpperCase("pt-BR");
  }
  if (source === source.toLocaleLowerCase("pt-BR")) {
    return canonical.toLocaleLowerCase("pt-BR");
  }
  return canonical;
};

export function canonicalizeEthnicityNames(value: string) {
  return ethnicityThemes.reduce((result, theme) => {
    const unaccentedName = theme.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (unaccentedName === theme.name) return result;

    return result.replace(
      new RegExp(`\\b${unaccentedName}\\b`, "giu"),
      (match) => preserveCase(match, theme.name),
    );
  }, value);
}
