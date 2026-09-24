import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { crc32 } from "node:zlib";

// A single-file ZIP with POSIX entry names on every OS. Windows Compress-Archive
// wrote backslashes into the previous package, which WordPress did not discover.
const root = dirname(dirname(fileURLToPath(import.meta.url)));
// This identity must stay unchanged across releases. Only the ZIP filename and
// PHP Version header are versioned, never the installed folder/main PHP file.
const slug = "medicina-sagrada-headless";
const entry = `${slug}/${slug}.php`;
const source = readFileSync(join(root, "wordpress", slug, `${slug}.php`));
const version = source.toString("utf8").match(/^\s*\* Version: (\d+\.\d+\.\d+)\s*$/m)?.[1];
if (!version) throw new Error("Cabeçalho Version do plugin inválido.");
const name = Buffer.from(entry, "utf8");
const checksum = crc32(source);

// ZIP stored method (no compression), UTF-8 names, fixed valid DOS date.
const local = Buffer.alloc(30);
local.writeUInt32LE(0x04034b50, 0);
local.writeUInt16LE(20, 4);
local.writeUInt16LE(0x0800, 6);
local.writeUInt16LE(33, 12); // 1980-01-01.
local.writeUInt32LE(checksum, 14);
local.writeUInt32LE(source.length, 18);
local.writeUInt32LE(source.length, 22);
local.writeUInt16LE(name.length, 26);

const central = Buffer.alloc(46);
central.writeUInt32LE(0x02014b50, 0);
central.writeUInt16LE(0x0314, 4); // Unix, ZIP 2.0.
central.writeUInt16LE(20, 6);
central.writeUInt16LE(0x0800, 8);
central.writeUInt16LE(33, 14);
central.writeUInt32LE(checksum, 16);
central.writeUInt32LE(source.length, 20);
central.writeUInt32LE(source.length, 24);
central.writeUInt16LE(name.length, 28);
central.writeUInt32LE((0o100644 * 0x10000) >>> 0, 38);

const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(1, 8);
end.writeUInt16LE(1, 10);
end.writeUInt32LE(central.length + name.length, 12);
end.writeUInt32LE(local.length + name.length + source.length, 16);

const archive = Buffer.concat([local, name, source, central, name, end]);
const directory = join(root, "artifacts");
mkdirSync(directory, { recursive: true });
const filename = `${slug}-${version}.zip`;
writeFileSync(join(directory, filename), archive);
// Stable download path for subsequent releases.
writeFileSync(join(directory, `${slug}.zip`), archive);
console.log(`Pacote gerado: artifacts/${filename}`);
console.log(`Única entrada: ${entry} (${source.length} bytes)`);
console.log(`Atualização do mesmo plugin: ${slug}, versão ${version}.`);
console.log("No WordPress, enviar o ZIP e escolher substituir a versão atual. Não desinstalar o plugin.");
