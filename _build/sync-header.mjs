// Header trang bác sĩ = header 2 web chính (owner 03/10/2026: "menu phải đồng bộ hoàn toàn với 2 trang chính").
//   EN/ES/KO/ZH: lấy NGUYÊN khối #gfh (HTML + CSS + JS) đang chạy trên greenfield.clinic/{,es/,ko/,zh/}.
//   VI: cùng khung #gfh, nội dung theo header nhakhoagreenfield.com (greenfield-platform apps/website/src/components/Header.tsx):
//       menu đọc từ trang đang chạy; thêm nút Zalo (desktop), WhatsApp (mobile), gọi + Zalo trong menu mobile.
// Chạy lại mỗi khi menu web chính đổi:  node sync-header.mjs  → header/<lang>.html, header/gfh.css, header/gfh.js
// Ô chèn khi dựng trang: {{LANG_PANEL}} (menu ngôn ngữ desktop), {{LANG_MOB}} (ngôn ngữ trong menu mobile), {{WA}} (link WhatsApp có mã click).
import { writeFileSync, mkdirSync } from "node:fs";
const OUT = new URL("./header/", import.meta.url);
mkdirSync(OUT, { recursive: true });
const get = async (u) => { const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0 (doctors.greenfield.clinic header sync)" } }); if (!r.ok) throw new Error(`${u} → ${r.status}`); return r.text(); };

/** Cắt phần tử <div id="gfh"> … </div> cân bằng thẻ div. */
function cutGfh(h) {
  const a = h.indexOf('<div id="gfh">'); if (a < 0) throw new Error("không thấy #gfh");
  const re = /<\/?div\b[^>]*>/g; re.lastIndex = a; let d = 0, m;
  while ((m = re.exec(h))) { d += m[0][1] === "/" ? -1 : 1; if (!d) return h.slice(a, re.lastIndex); }
  throw new Error("#gfh không đóng");
}
const LOGO = '<img src="/shared/img/greenfield-logo-white-160.webp" width="160" height="118" alt="Greenfield Dental" fetchpriority="high">';
/** Thay ô ngôn ngữ + WhatsApp + logo bằng ô chèn. */
function holes(x) {
  return x
    .replace(/(<a class="gfh-logo"[^>]*>)<img[^>]*>/, `$1${LOGO}`)
    .replace(/(<div class="gfh-panel" id="gfh-lp">)[\s\S]*?(<\/div>)/, "$1{{LANG_PANEL}}$2")
    .replace(/(<div class="gfh-mob-langs"[^>]*>)[\s\S]*?(<\/div>)/, "$1{{LANG_MOB}}$2")
    .replace(/(<a class="gfh-icon gfh-wa" href=")[^"]*/, "$1{{WA}}");
}

const home = { en: "https://greenfield.clinic/", es: "https://greenfield.clinic/es/", ko: "https://greenfield.clinic/ko/", zh: "https://greenfield.clinic/zh/" };
let css = "", js = "";
for (const [lang, u] of Object.entries(home)) {
  const h = await get(u);
  const x = holes(cutGfh(h));
  for (const k of ["{{LANG_PANEL}}", "{{LANG_MOB}}", "{{WA}}"]) if (!x.includes(k)) throw new Error(`${lang}: thiếu ${k}`);
  writeFileSync(new URL(`${lang}.html`, OUT), x + "\n");
  if (lang === "en") {
    const c = h.match(/<style id="gfh-css">([\s\S]*?)<\/style>/)[1];
    css = c.slice(0, c.indexOf("html.gfh-lock,html.gfh-lock body{overflow:hidden}")).trim(); // bỏ phần riêng cho Elementor/WordPress
    const s = h.match(/<script[^>]*id="gfh-js"[^>]*>([\s\S]*?)<\/script>/);
    const src = s[0].match(/src="data:text\/javascript;base64,([^"]+)"/);
    js = src ? Buffer.from(src[1], "base64").toString("utf8") : s[1];
  }
  console.log(lang, x.length, "ký tự");
}
writeFileSync(new URL("gfh.css", OUT), css + "\n");
writeFileSync(new URL("gfh.js", OUT), js.trim() + "\n");

// ---- VI: menu của nhakhoagreenfield.com, dựng trong khung #gfh ----
const NK = "https://www.nhakhoagreenfield.com";
const nk = await get(`${NK}/vi`);
const hdr = nk.slice(nk.indexOf("<header"), nk.indexOf("</header>"));
const dec = (s) => s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').trim();
// Luồng thẻ trong header: button = mục thả, p = nhóm, a = link. Dừng ở link "Liên hệ" (mục cấp 1 cuối).
const menu = []; let top = null, grp = null, contact = null;
for (const m of hdr.matchAll(/<(button|p|a)\b([^>]*)>([^<]{2,80})</g)) {
  const [, tag, attrs, raw] = m; const t = dec(raw); const href = (attrs.match(/href="([^"]*)"/) || [])[1];
  if (tag === "button") { top = { t, groups: [], links: [] }; grp = null; menu.push(top); continue; }
  if (tag === "p" && top) { grp = { t, links: [] }; top.groups.push(grp); continue; }
  if (tag === "a" && href === "/vi/lien-he") { contact = { t, href: NK + href }; break; }
  if (tag === "a" && top && href?.startsWith("/vi/")) (grp ? grp.links : top.links).push({ t, href: NK + href });
}
if (menu.length !== 3 || !contact) throw new Error(`VI: đọc menu lỗi (${menu.length} mục, liên hệ ${!!contact})`);
const reviews = dec((hdr.match(/>([^<]*đánh giá Google)</) || [, "264 đánh giá Google"])[1]);
const cta = dec((hdr.match(/href="\/vi\/dat-lich"[^>]*>([^<]+)</) || [, "Đặt lịch tư vấn"])[1]);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const CARET = '<svg class="gfh-caret" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
const ZALO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M6 3h12a3 3 0 013 3v9a3 3 0 01-3 3h-6.5L7 21.5V18H6a3 3 0 01-3-3V6a3 3 0 013-3z"/><text x="12" y="13.4" text-anchor="middle" font-size="6.4" font-weight="700" font-family="Arial, Helvetica, sans-serif" fill="currentColor">Zalo</text></svg>';
const PHONE = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"/></svg>';
const en = (await import("node:fs")).readFileSync(new URL("en.html", OUT), "utf8");
const WA_SVG = en.match(/<a class="gfh-icon gfh-wa"[^>]*>(<svg[\s\S]*?<\/svg>)/)[1];
const BURGER = en.match(/<button class="gfh-icon gfh-burger"[\s\S]*?<\/button>/)[0].replace('aria-label="Menu"', 'aria-label="Mở menu"');
const L = (l) => `<a href="${l.href}">${esc(l.t)}</a>`;
const panel = (it, i) => it.groups.length
  ? `<div class="gfh-panel gfh-mega" id="gfh-p${i + 1}">${it.groups.map((g) => `<div><div class="gfh-grp">${esc(g.t)}</div>${g.links.map(L).join("")}</div>`).join("")}</div>`
  : `<div class="gfh-panel" id="gfh-p${i + 1}">${it.links.map(L).join("")}</div>`;
const vi = `<div id="gfh"><div class="gfh-in"><a class="gfh-logo" href="${NK}/vi">${LOGO}</a><nav class="gfh-nav" aria-label="Menu chính"><ul class="gfh-menu">`
  + menu.map((it, i) => `<li class="gfh-dd"><button class="gfh-top" type="button" aria-expanded="false" aria-controls="gfh-p${i + 1}">${esc(it.t)}${CARET}</button>${panel(it, i)}</li>`).join("")
  + `<li><a class="gfh-top" href="${contact.href}">${esc(contact.t)}</a></li></ul></nav>`
  + `<div class="gfh-right"><a class="gfh-rating" href="https://g.co/kgs/FmAkkx3" target="_blank" rel="noopener"><span class="gfh-star" aria-hidden="true">★</span><span><b>5.0</b><small>${esc(reviews)}</small></span></a>`
  + `<a class="gfh-zalo" href="https://zalo.me/0906621988" target="_blank" rel="noopener" aria-label="Nhắn Zalo">${ZALO}</a>`
  + `<div class="gfh-lang"><button type="button" aria-expanded="false" aria-controls="gfh-lp" aria-label="Ngôn ngữ"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>VI${CARET}</button><div class="gfh-panel" id="gfh-lp">{{LANG_PANEL}}</div></div>`
  + `<a class="gfh-cta" href="${NK}/vi/dat-lich">${esc(cta)}</a>`
  + `<a class="gfh-icon gfh-wa" href="{{WA}}" target="_blank" rel="noopener" aria-label="WhatsApp">${WA_SVG}</a>${BURGER}</div></div>`
  + `<div class="gfh-mob" id="gfh-mob">`
  + menu.map((it) => `<details><summary>${esc(it.t)}${CARET}</summary>${it.groups.length ? it.groups.map((g) => `<div class="gfh-grp">${esc(g.t)}</div>${g.links.map(L).join("")}`).join("") : it.links.map(L).join("")}</details>`).join("")
  + `<a class="gfh-mlink" href="${contact.href}">${esc(contact.t)}</a>`
  + `<div class="gfh-mob-foot"><a class="gfh-cta" href="${NK}/vi/dat-lich">Đặt lịch tư vấn miễn phí</a>`
  + `<div class="gfh-mob-2"><a href="tel:+84906621988">${PHONE}<span>0906 621 988</span></a><a href="https://zalo.me/0906621988" target="_blank" rel="noopener">${ZALO}<span>Nhắn Zalo</span></a></div>`
  + `<a class="gfh-rating gfh-rating-1" href="https://g.co/kgs/FmAkkx3" target="_blank" rel="noopener"><span class="gfh-star" aria-hidden="true">★</span><span><b>5.0</b><small>${esc(reviews)}</small></span></a>`
  + `<div class="gfh-mob-langs" aria-label="Ngôn ngữ">{{LANG_MOB}}</div></div></div></div>`;
writeFileSync(new URL("vi.html", OUT), vi + "\n");
console.log("vi", vi.length, "ký tự ·", menu.map((m) => `${m.t} (${m.groups.reduce((n, g) => n + g.links.length, 0) + m.links.length})`).join(", "));
