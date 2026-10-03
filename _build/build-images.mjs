// Ảnh web cho 5 trang bác sĩ (bản chạy thật, 03/10/2026).
//   node build-images.mjs            → mọi bác sĩ trong doctors/*.json
//   node build-images.mjs henry kate → chỉ vài bác sĩ
// Gốc: _build/originals/<slug>/ (ảnh của trang cũ), sau này: Thư viện media OS / S3.
// Ra: dist/<slug>/img/<tên>-<w>.{avif,webp} (480/800/1200, không phóng to), ảnh dùng chung vào dist/shared/img,
//     ảnh chia sẻ 1200×630 dist/<slug>/img/<key>-og-1200x630.jpg, logo trắng, favicon. In manifest.json (bề rộng + tỉ lệ thật).
import sharp from "sharp";
import { mkdirSync, writeFileSync, existsSync, readdirSync, readFileSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const P = (rel) => fileURLToPath(new URL(rel, import.meta.url));
const DIST = P("./dist/");
const keys = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(P("./doctors/")).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
const Q = { avif: 55, webp: 74 };
const manifest = existsSync(P("./manifest.json")) ? JSON.parse(readFileSync(P("./manifest.json"), "utf8")) : {};

/** Chân dung tách nền: cắt viền trong suốt (ảnh gốc có khoảng trống lớn trên đầu → hero không thấy mặt), chừa ~4% phía trên. */
async function trimPortrait(input) {
  const t = await sharp(input).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 10 }).png().toBuffer();
  const m = await sharp(t).metadata();
  return sharp(t).extend({ top: Math.round(m.height * 0.04), background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
}
async function variants(input, outDir, name, widths, key) {
  if (/-portrait(-seated|-smile)?$/.test(name)) input = await trimPortrait(input);
  const meta = await sharp(input).metadata();
  const ws = [...new Set(widths.map((w) => Math.min(w, meta.width)))];
  for (const w of ws) {
    const base = sharp(input).resize({ width: w, withoutEnlargement: true });
    await base.clone().avif({ quality: Q.avif, effort: 5 }).toFile(join(outDir, `${name}-${w}.avif`));
    await base.clone().webp({ quality: Q.webp, effort: 5 }).toFile(join(outDir, `${name}-${w}.webp`));
  }
  manifest[key] = { widths: ws, ratio: +(meta.height / meta.width).toFixed(4) };
}

// Ảnh dùng chung (không thuộc riêng bác sĩ nào).
const SHARED_SRC = P("./originals/dr-nguyen-duc-hieu/");
const SHARED = [
  [join(SHARED_SRC, "t-i-xu-ng-2-mugfmn2y-s597.webp"), "all-on-4-fixed-bridge", [480, 800]],
  [join(SHARED_SRC, "8z8a3280-large-mu23juy1-2j45.webp"), "greenfield-clinic-lounge", [480, 800, 1200]],
  [P("./originals/dr-ta-hong-nhung/chatgpt-image-17-19-07-8-thg-9-2026.webp"), "clear-aligner-in-hand", [480, 800]],
  [P("./originals/dr-ta-hong-nhung/5913b9c3-d062-40a6-8993-82a877844304.webp"), "dental-examination", [480, 800]],
  // Giao diện mới (03/10/2026): nền màn đầu (lớp xanh rêu của thiết kế)
  [P("./originals/dr-ta-hong-nhung/3149498-mudi0z1l-5dwo.webp"), "hero-bg", [800, 1200, 1600]],
];
const sharedDir = join(DIST, "shared/img"); mkdirSync(sharedDir, { recursive: true });
for (const [src, name, ws] of SHARED) await variants(src, sharedDir, name, ws, `shared/${name}`);

// Logo trắng (từ logo greenfield.clinic, nền trong) + favicon.
const logoSrc = P("./shared/img/logo-white-300.webp");
{
  const { data, info } = await sharp(logoSrc).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) { data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; }
  await sharp(data, { raw: info }).resize({ width: 160 }).webp({ quality: 90 }).toFile(join(sharedDir, "greenfield-logo-white-160.webp"));
  // Logo ngang màu xanh (header giao diện mới)
  await sharp(P("./shared/img/greenfield-logo-green.png")).resize({ height: 60 }).webp({ quality: 92 }).toFile(join(sharedDir, "greenfield-logo-green-60.webp"));
  for (const f of ["favicon-32.png", "favicon-192.png"]) copyFileSync(P(`./shared/img/${f}`), join(sharedDir, f));
  await sharp(P("./shared/img/favicon-32.png")).resize(32, 32).png().toFile(join(DIST, "favicon.png"));
}

for (const key of keys) {
  const D = JSON.parse(readFileSync(P(`./doctors/${key}.json`), "utf8"));
  const out = join(DIST, D.slug, "img"); mkdirSync(out, { recursive: true });
  for (const im of D.images) {
    const src = P("./" + im.src);
    if (!existsSync(src)) { console.warn("thiếu", im.src); continue; }
    await variants(src, out, im.name, im.widths, `${D.slug}/${im.name}`);
  }
  // Ảnh chia sẻ 1200×630
  const portrait = await sharp(P("./" + D.ogPortrait)).resize({ width: 400, height: 600, fit: "inside" }).toBuffer();
  const pm = await sharp(portrait).metadata();
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#16261E"/>
  <rect x="64" y="96" width="56" height="2" fill="#C9974A"/>
  <text x="64" y="80" font-family="Helvetica, Arial, sans-serif" font-size="20" letter-spacing="3" fill="#C9974A">GREENFIELD DENTAL · HANOI</text>
  <text x="64" y="186" font-family="Georgia, serif" font-size="54" font-weight="600" fill="#FFFFFF">${esc(D.name)}</text>
  <text x="64" y="244" font-family="Georgia, serif" font-size="40" font-style="italic" fill="#C9974A">${esc(D.nick)}</text>
  <text x="64" y="296" font-family="Helvetica, Arial, sans-serif" font-size="25" font-weight="bold" fill="#FFFFFF">${esc(D.card)}</text>
  <text x="64" y="360" font-family="Helvetica, Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.86)">${esc(D.ogLine[0])}</text>
  <text x="64" y="398" font-family="Helvetica, Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.86)">${esc(D.ogLine[1])}</text>
  <text x="64" y="560" font-family="Helvetica, Arial, sans-serif" font-size="22" fill="rgba(255,255,255,0.7)">doctors.greenfield.clinic/${D.slug}</text></svg>`;
  await sharp(Buffer.from(svg)).composite([{ input: portrait, left: 1200 - pm.width - 30, top: 630 - pm.height }]).jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(out, `${D.key}-og-1200x630.jpg`));
  console.log("xong", D.slug, D.images.length, "ảnh");
}
writeFileSync(P("./manifest.json"), JSON.stringify(manifest, null, 1));
