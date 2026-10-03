// Sinh i18n/<lang>/<key>.json từ i18n/tr/<lang>.mjs và kiểm cấu trúc khớp i18n/src/<key>.json (nguồn EN).
//   node i18n/make.mjs vi es ko zh
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
const P = (r) => fileURLToPath(new URL(r, import.meta.url));
let bad = 0;
function check(src, tr, path) {
  if (Array.isArray(src)) {
    if (!Array.isArray(tr) || tr.length !== src.length) return void (bad++, console.error(`✗ ${path}: mảng ${tr?.length} ≠ ${src.length}`));
    src.forEach((x, i) => check(x, tr[i], `${path}[${i}]`));
  } else if (src && typeof src === "object") {
    if (!tr || typeof tr !== "object") return void (bad++, console.error(`✗ ${path}: thiếu object`));
    for (const k of Object.keys(src)) check(src[k], tr[k], `${path}.${k}`);
  } else if (typeof tr !== "string" || !tr.trim()) { bad++; console.error(`✗ ${path}: thiếu chuỗi`); }
}
for (const lang of process.argv.slice(2)) {
  const { doctors } = await import(`./tr/${lang}.mjs`);
  mkdirSync(P(`./${lang}/`), { recursive: true });
  for (const [key, d] of Object.entries(doctors)) {
    const src = JSON.parse(readFileSync(P(`./src/${key}.json`), "utf8"));
    check(src, d, `${lang}/${key}`);
    writeFileSync(P(`./${lang}/${key}.json`), JSON.stringify(d, null, 2) + "\n");
  }
  console.log(lang, Object.keys(doctors).length, "bác sĩ");
}
if (bad) { console.error(bad, "lỗi cấu trúc"); process.exit(1); }
