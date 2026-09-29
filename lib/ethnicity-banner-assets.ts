import "server-only";

import { statSync } from "node:fs";
import { join } from "node:path";

const assetDirectory = join(process.cwd(), "public", "assets", "ethnicity-headers");
const publicDirectory = "/assets/ethnicity-headers";

export function getEthnicityBannerAsset(slug: string) {
  if (!/^[a-z0-9-]+$/.test(slug)) return undefined;

  const filename = `medicina-sagrada-etnia-${slug}-banner.webp`;
  const filePath = join(assetDirectory, filename);

  try {
    const version = Math.trunc(statSync(filePath).mtimeMs);
    return `${publicDirectory}/${filename}?v=${version}`;
  } catch {
    return undefined;
  }
}
