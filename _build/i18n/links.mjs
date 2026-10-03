// Bản đồ link theo ngôn ngữ (03/10/2026). es/ko/zh lấy từ thẻ <link rel="alternate" hreflang> của từng trang
// greenfield.clinic (gc-hreflang.json); vi theo menu nhakhoagreenfield.com. Thiếu bản dịch → trang gần nhất cùng ngôn ngữ
// (All-on-4 → trang implant) hoặc bỏ khỏi menu.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const GC = "https://greenfield.clinic";
const NK = "https://www.nhakhoagreenfield.com";
const H = JSON.parse(readFileSync(fileURLToPath(new URL("./gc-hreflang.json", import.meta.url)), "utf8"));

const KEY2GC = {
  home: "home", doctors: "our-doctors", implants: "dental-implants-vietnam", allon4: "all-on-4-dental-implants-vietnam",
  crowns: "dental-crowns", veneers: "porcelain-veneers", invisalign: "invisalign-in-vietnam", braces: "teeth-braces",
  general: "general-dentistry", whitening: "teeth-whitening-2", nightguards: "night-guards-mouthguards-retainers-hanoi",
  sleep: "sleep-dentistry-hanoi", gallery: "smile-gallery", reviews: "patient-reviews", about: "about-us", contact: "contact-us",
  tourism: "dental-tourism", overseas: "overseas-vietnamese", expat: "expat-dentist-hanoi", faq: "faq", blog: "blog",
  privacy: "privacy-policy", terms: "terms-and-conditions",
};
const abs = (u) => (u.startsWith("http") ? u : GC + u);

function gcLinks(hl) {
  const out = {};
  for (const [k, p] of Object.entries(KEY2GC)) {
    const alt = H[p] || {};
    const u = hl === "en" ? (alt.en ? abs(alt.en) : `${GC}/${p === "home" ? "" : p + "/"}`) : alt[hl] ? abs(alt[hl]) : null;
    if (u) out[k] = u;
  }
  return out;
}
export const LINKS = {
  en: gcLinks("en"),
  es: gcLinks("es"),
  ko: gcLinks("ko"),
  zh: gcLinks("zh-Hans"),
  vi: {
    home: `${NK}/vi`, doctors: `${NK}/vi/bac-si`, implants: `${NK}/vi/dich-vu/implant`, allon4: `${NK}/vi/dich-vu/implant/toan-ham`,
    crowns: `${NK}/vi/dich-vu/rang-su`, veneers: `${NK}/vi/dich-vu/rang-su/mao-su-hay-veneer`, ortho: `${NK}/vi/dich-vu/nieng-rang`,
    invisalign: `${NK}/vi/dich-vu/nieng-rang/invisalign`, braces: `${NK}/vi/dich-vu/nieng-rang/mac-cai`, general: `${NK}/vi/dich-vu/tong-quat`,
    endo: `${NK}/vi/dich-vu/dieu-tri-tuy`, combined: `${NK}/vi/dich-vu/ke-hoach-dieu-tri-phoi-hop`, whitening: `${NK}/vi/dich-vu/tay-trang`,
    gallery: `${NK}/vi/ket-qua`, reviews: `${NK}/vi/danh-gia`, about: `${NK}/vi/ve-chung-toi`, facility: `${NK}/vi/co-so`,
    contact: `${NK}/vi/lien-he`, book: `${NK}/vi/dat-lich`, faq: `${NK}/vi/faq`, privacy: `${NK}/vi/chinh-sach-bao-mat`,
    terms: `${NK}/vi/dieu-khoan`, warranty: `${NK}/vi/bao-hanh`, blog: `${NK}/vi/tin-tuc`, overseas: `${NK}/vi/ve-nuoc-lam-rang`,
  },
};
// Trang không có bản dịch: All-on-4 → trang implant cùng ngôn ngữ.
for (const l of ["es", "ko", "zh"]) if (!LINKS[l].allon4) LINKS[l].allon4 = LINKS[l].implants;
for (const l of ["es", "ko", "zh", "vi"]) LINKS[l].book = LINKS[l].book || LINKS[l].contact;
LINKS.en.book = LINKS.en.contact;

/** Link EN (greenfield.clinic/<path>/) → khoá trong LINKS. */
export function keyOfUrl(u) {
  const p = u.replace(GC, "").replace(/^\/|\/$/g, "");
  return Object.entries(KEY2GC).find(([, v]) => v === p)?.[0] || null;
}
