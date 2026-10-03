// Kiểm 25 trang: hreflang hai chiều + canonical, link nội bộ/ảnh tồn tại, từ cấm theo ngôn ngữ, chữ Anh sót ở KO/ZH.
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
const P = (r) => fileURLToPath(new URL(r, import.meta.url));
const SITE = "https://doctors.greenfield.clinic";
const LANGS = ["en", "vi", "es", "ko", "zh"];
const HL = { en: "en", vi: "vi", es: "es", ko: "ko", zh: "zh-Hans" };
const SLUGS = ["dr-ta-hong-nhung", "dr-do-nhu-chuyen", "dr-nguyen-duc-hieu", "dr-tran-thi-giang", "dr-pham-thi-thu-hien"];
const FORBID = { en: [/cosmetic/i, /aesthetic/i], vi: [/thẩm mỹ/i], es: [/est[ée]tic[ao]/i, /cosm[ée]tic[ao]/i], ko: [/미용/, /심미/, /성형/], zh: [/美容/, /美学/, /整形/, /医美/] };
const BRANDS = /\b(Greenfield|Dental|Invisalign|WhatsApp|Google|CBCT|All-on-[46]|Dentium|Neodent|Straumann|Ceramill|Zolid|E\.max|Press|Biodentine|DENTIS|Vietnam|DMG|JM|Ortho|Excellere|Asia|Pacific|3M|Peace|of|Mind|for|Dentists|Tín|Nha|DDS|MSc|DIU|TMJ|OTP|HAO|Dr|Kate|Chris|Henry|Giang|Hailey|Ta|Hong|Nhung|Do|Nhu|Chuyen|Nguyen|Duc|Hieu|Tran|Thi|Pham|Thu|Hien|Trung|Hoa|Company|Limited|Cookie|EN|VI|ES|KO|hello|nhakhoagreenfield|com|greenfield|clinic|Typodont|Master|Class)\b/g;
const pageFile = (l, s) => P(`../dist/${l === "en" ? "" : l + "/"}${s}/index.html`);
let errs = 0; const err = (m) => { errs++; console.log("✗", m); };
const ext = new Set();
for (const l of LANGS) for (const s of SLUGS) {
  const f = pageFile(l, s); if (!existsSync(f)) { err(`thiếu ${l}/${s}`); continue; }
  const h = readFileSync(f, "utf8");
  const self = `${SITE}${l === "en" ? "" : "/" + l}/${s}`;
  if (!h.includes(`<html lang="${HL[l]}">`)) err(`${l}/${s}: html lang`);
  if (!h.includes(`<link rel="canonical" href="${self}">`)) err(`${l}/${s}: canonical`);
  const alts = [...h.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)].map((m) => [m[1], m[2]]);
  if (alts.length !== 6) err(`${l}/${s}: ${alts.length} hreflang`);
  for (const [hl, u] of alts) { // hai chiều: trang đích phải trỏ ngược về trang này
    const tl = hl === "x-default" ? "en" : LANGS.find((x) => HL[x] === hl);
    const tf = pageFile(tl, u.split("/").pop());
    if (!existsSync(tf)) { err(`${l}/${s}: hreflang ${hl} → không có trang`); continue; }
    if (!readFileSync(tf, "utf8").includes(`hreflang="${HL[l]}" href="${self}"`)) err(`${l}/${s}: ${hl} không trỏ ngược`);
  }
  // link + tài nguyên nội bộ
  for (const m of h.matchAll(/(?:href|src)="(\/[^"#]*)"/g)) { const u = m[1]; const fp = existsSync(P(`../dist${u}/index.html`)) || existsSync(P(`../..${u}`)) || existsSync(P(`../dist${u}`)); if (!fp) err(`${l}/${s}: link hỏng ${u}`); }
  for (const m of h.matchAll(/srcset="([^"]+)"/g)) for (const part of m[1].split(",")) { const u = part.trim().split(" ")[0]; if (u.startsWith("/") && !existsSync(P(`../..${u}`))) err(`${l}/${s}: ảnh thiếu ${u}`); }
  for (const m of h.matchAll(/href="(https:\/\/(?:greenfield\.clinic|www\.nhakhoagreenfield\.com)[^"]*)"/g)) ext.add(m[1]);
  // chữ hiển thị (bỏ script/style/thẻ) + alt/aria/title/description
  const vis = h.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ") + " " + [...h.matchAll(/(?:alt|aria-label|content)="([^"]*)"/g)].map((m) => m[1]).join(" ");
  const cookie = (h.match(/TX=(\{[^}]*\})/) || [])[1] || "";
  for (const re of FORBID[l]) { const m = (vis + cookie).match(re); if (m) err(`${l}/${s}: từ cấm "${m[0]}"`); }
  if (l === "ko" || l === "zh") {
    const txt = (vis + " " + cookie).replace(/https?:\/\/\S+/g, " ").replace(BRANDS, " ");
    const runs = [...txt.matchAll(/[A-Za-z][A-Za-z'’-]+(?:[ ,.;:]+[A-Za-z][A-Za-z'’-]+){1,}/g)].map((m) => m[0]).filter((r) => !/^(summary|large|image|profile|width|device|initial|scale|viewport|fit|cover|utf)/i.test(r));
    if (runs.length) console.log(`? ${l}/${s} chữ Latin còn lại:`, [...new Set(runs)].slice(0, 12).join(" | "));
  }
}
console.log("link ngoài cần kiểm:", ext.size);
if (process.argv.includes("--ext")) console.log([...ext].join("\n"));
console.log(errs ? `${errs} lỗi` : "OK — không lỗi");
