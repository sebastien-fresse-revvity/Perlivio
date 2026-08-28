import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git") return [];
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const htmlFiles = walk(root).filter((path) => path.endsWith(".html"));

for (const file of htmlFiles) {
  const source = readFileSync(file, "utf8");
  const display = relative(root, file);
  const h1Count = (source.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) errors.push(`${display}: ${h1Count} balise(s) h1`);
  if (source.includes("/manus-storage/")) errors.push(`${display}: référence /manus-storage interdite`);

  for (const match of source.matchAll(/<button\b[^>]*>/gi)) {
    const implicitButton = /\b(?:data-menu-toggle|data-stone-filter)\b/i.test(match[0]);
    if (!/\btype\s*=/i.test(match[0]) && !/\bdisabled\b/i.test(match[0]) && !implicitButton) {
      errors.push(`${display}: bouton actif sans attribut type`);
    }
  }

  for (const match of source.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
    const value = match[1];
    if (!value || /^(?:#|[a-z]+:|\/\/)/i.test(value)) continue;
    const clean = decodeURIComponent(value.split(/[?#]/, 1)[0]);
    let target = clean.startsWith("/") ? join(root, clean.slice(1)) : resolve(dirname(file), clean);
    if (existsSync(target) && statSync(target).isDirectory()) target = join(target, "index.html");
    if (!existsSync(target)) errors.push(`${display}: référence manquante ${value}`);
  }
}

const composer = readFileSync(join(root, "composer/index.html"), "utf8");
if (/data:image/i.test(composer)) errors.push("composer/index.html: image embarquée en base64");
for (const [, count] of composer.matchAll(/data-count=["'](\d+)["']/gi)) {
  if (Number(count) > 18) errors.push(`composer/index.html: capacité supérieure à 18 (${count})`);
}

const dataSource = readFileSync(join(root, "assets/js/data.js"), "utf8");
const signature = dataSource.match(/"slug":"signature".*?"socle":"([^"]+)".*?"origin":"([^"]+)".*?"paths":\[\]/);
if (!signature || signature[1] !== signature[2]) {
  errors.push("assets/js/data.js: la composition initiale Signature doit rester monochrome");
}

const expectedBeads = [
  "agate-blanche", "agate-brin-dentelle", "agate-rouge", "agate-verte", "amethyste",
  "aventurine-jaune", "aventurine-verte", "gres-bleu", "gres-or", "howlite", "jaspe",
  "lapis-lazuli", "obsidienne-or", "oeil-de-tigre", "onyx-noir", "quartz-clair",
  "quartz-rose", "sodalite"
];
for (const bead of expectedBeads) {
  const path = join(root, `assets/beads/${bead}.webp`);
  if (!existsSync(path)) errors.push(`assets/beads/${bead}.webp: image manquante`);
}
for (const path of [
  "assets/media/clasp-cutout.webp", "assets/media/hero-lifestyle.webp",
  "assets/media/packshot-essentiel.webp", "assets/media/packshot-metal.webp",
  "assets/media/packshot-inox.webp", "assets/media/packshot-argent.webp",
  "assets/media/packshot-signature.webp", "assets/media/stones-catalogue.webp"
]) {
  if (!existsSync(join(root, path))) errors.push(`${path}: image manquante`);
}

if (errors.length) {
  console.error(`Validation échouée (${errors.length})\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log(`Validation réussie : ${htmlFiles.length} pages, 18 pierres, liens locaux et structure contrôlés.`);
