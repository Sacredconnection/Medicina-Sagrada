import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

if (existsSync(".env.local")) {
  console.log(".env.local já existe e foi preservado. Execute npm run dev.");
} else {
  const template = readFileSync(".env.example", "utf8");
  writeFileSync(".env.local", template.replace(/^REVALIDATION_SECRET=.*$/m, `REVALIDATION_SECRET=${randomBytes(32).toString("hex")}`), { flag: "wx" });
  console.log(".env.local criado para desenvolvimento. Nenhuma credencial de pagamento é necessária no Next.js.");
}
