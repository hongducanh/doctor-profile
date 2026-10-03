// Mẫu chung trang hồ sơ bác sĩ — GIAO DIỆN MỚI (03/10/2026) theo thiết kế "Landing page các bác" (Drive, 5 file .dc.html).
//   node build-page.mjs                  → mọi bác sĩ × mọi ngôn ngữ (chạy build-images.mjs trước)
//   node build-page.mjs henry --lang=vi  → chỉ một bác sĩ / một ngôn ngữ
// Nội dung: EN lấy 100% chữ trong thiết kế (design/<key>.json). VI/ES/KO/ZH giữ nội dung đã dịch (i18n/<lang>/<key>.json ghép lên doctors/<key>.json),
// chỉ đổi sang giao diện mới; chuỗi giao diện mới ở i18n/ui/<lang>.json → "v2".
// Link về web chính (owner 03/10/2026): logo + "Website" ở footer → trang chủ greenfield.clinic cùng ngôn ngữ.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { LINKS } from "./i18n/links.mjs";

const P = (rel) => fileURLToPath(new URL(rel, import.meta.url));
const ALL = Object.fromEntries(readdirSync(P("./doctors/")).filter((f) => f.endsWith(".json")).map((f) => { const d = JSON.parse(readFileSync(P(`./doctors/${f}`), "utf8")); return [d.key, d]; }));
const ORDER = ["kate", "chris", "henry", "giang", "hailey"];
const DES = Object.fromEntries(ORDER.map((k) => [k, JSON.parse(readFileSync(P(`./design/${k}.json`), "utf8"))]));
export const LANGS = ["en", "vi", "es", "ko", "zh"];
const HL = { en: "en", vi: "vi", es: "es", ko: "ko", zh: "zh-Hans" };
const OGL = { en: "en_US", vi: "vi_VN", es: "es_ES", ko: "ko_KR", zh: "zh_CN" };
const CODE = { en: "EN", vi: "VI", es: "ES", ko: "KO", zh: "中文" };
const LNAME = { en: "English", vi: "Tiếng Việt", es: "Español", ko: "한국어", zh: "简体中文" };
const UI = {};
const ui = (l) => (UI[l] ||= JSON.parse(readFileSync(P(`./i18n/ui/${l}.json`), "utf8")));
const M = JSON.parse(readFileSync(P("./manifest.json"), "utf8"));
const FF = (fam, file, w, range) => `@font-face{font-family:'${fam}';font-style:normal;font-weight:${w};font-display:swap;src:url(/shared/fonts/${file}) format('woff2');unicode-range:${range}}`;
const R_LAT = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const R_EXT = "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";
const R_VI = "U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB";
const FONTS_CSS = [FF("Plus Jakarta Sans", "plus-jakarta-sans-vietnamese-wght-normal.woff2", "200 800", R_VI), FF("Plus Jakarta Sans", "plus-jakarta-sans-latin-ext-wght-normal.woff2", "200 800", R_EXT), FF("Plus Jakarta Sans", "plus-jakarta-sans-latin-wght-normal.woff2", "200 800", R_LAT),
  FF("Anton", "anton-vietnamese-400-normal.woff2", 400, R_VI), FF("Anton", "anton-latin-400-normal.woff2", 400, R_LAT)].join("\n");
/** Ghép bản dịch lên bản EN: object theo khoá, mảng theo vị trí (giữ img/link của EN). */
const merge = (a, b) => (b === undefined ? a : Array.isArray(a) && Array.isArray(b) ? a.map((x, i) => merge(x, b[i]))
  : a && b && typeof a === "object" && typeof b === "object" ? Object.fromEntries([...new Set([...Object.keys(a), ...Object.keys(b)])].map((k) => [k, merge(a[k], b[k])])) : b);
function doc(key, lang) {
  if (lang === "en") return ALL[key];
  const f = P(`./i18n/${lang}/${key}.json`);
  if (!existsSync(f)) throw new Error(`thiếu bản dịch ${lang}/${key}.json`);
  return merge(ALL[key], JSON.parse(readFileSync(f, "utf8")));
}
const pagePath = (lang, slug) => (lang === "en" ? `/${slug}` : `/${lang}/${slug}`);
const args = process.argv.slice(2);
const langArg = args.find((a) => a.startsWith("--lang="));
const keys = args.filter((a) => !a.startsWith("--"));
for (const lang of langArg ? langArg.slice(7).split(",") : LANGS) for (const key of keys.length ? keys : ORDER) build(doc(key, lang), lang);

/** Dữ liệu hiển thị cho giao diện mới: EN = chữ thiết kế; ngôn ngữ khác = nội dung đã dịch xếp vào đúng các khối của thiết kế. */
function view(D, lang) {
  const T = ui(lang), U = T.v2, E = DES[D.key], en = lang === "en";
  const sub = (s) => String(s).replace(/\{short\}/g, D.short).replace(/\{pron\}/g, D.pronounPoss || "her");
  const contain = (img) => !!(E.certs.find((c) => c.img === img) || {}).contain;
  const nm = String(D.name).split(" ");
  return {
    eyebrow: en ? E.eyebrow : D.eyebrow,
    h1: en ? E.h1 : [nm[0], nm.slice(1).join(" ")],
    checks: en ? E.checks : D.chips,
    lead: en ? E.lead : D.lead,
    badge: en ? E.badge : D.badge ? { n: D.badge.n, l: String(D.badge.l).replace(/<br>/g, " ") } : { n: D.stats[0].n, l: D.stats[0].l },
    trust: en ? E.trust : { h2: U.trust.map(sub), p: D.about.p[1] || "", stats: D.stats.map((s) => ({ k: "", n: s.n, l: s.l })) },
    about: en ? { ...E.about, img: D.about.img, pos: E.aboutPos }
      : { eyebrow: D.about.eyebrow, h2: `${D.about.h2}<br>${D.about.h2em}`, p: D.about.p[0], explore: sub(U.explore), chips: D.about.creds, img: D.about.img, pos: E.aboutPos },
    expH2: en ? E.expertiseH2 : U.expH2,
    exp: (en ? E.expertise : D.expertise).map((x) => ({ t: x.t, s: x.s, img: x.img })),
    advice: en ? E.advice : { h: U.advH, p: sub(T.expertise.adviceP).replace(/\{short\}/g, D.short), btn: T.expertise.adviceBtn },
    quote: { ...(en ? E.quote : { text: D.quote.text, em: D.quote.em, by: D.quote.by, role: D.quote.role }), img: D.quote.img },
    certsH2: U.certsH2,
    certs: (en ? E.certs : [...D.certs, ...E.certs.slice(D.certs.length).map((c, i) => { const x = ((E.certsI18n || {})[lang] || [])[i]; return x ? { ...c, t: x[0], s: x[1] } : c; })])
      .map((c) => ({ img: c.img, t: c.t, s: c.s, contain: en ? !!c.contain : contain(c.img) })),
    casesH2: U.casesH2, casesIntro: U.casesIntro,
    cases: en ? E.cases : D.cases,
    reviewsH2: U.reviewsH2, reviews: E.reviews || [],
    journeyH2: en ? E.journeyH2 : [D.journeyMeta.h2, D.journeyMeta.h2em], journeyIntro: en ? E.journeyIntro : D.journeyMeta.intro,
    steps: en ? E.steps : D.journey,
    faqH2: U.faqH2, faqs: en ? E.faqs : D.faqs,
    guarH2: U.guarH2, guarIntro: en ? E.guaranteeIntro : "",
    guar: en ? E.guarantees : D.commitments.map((c, i) => ({ t: c.t, d: c.d, icon: E.guarantees[i % E.guarantees.length].icon })),
    cta: en ? E.cta : { eyebrow: U.ctaEyebrow, h2: U.ctaH2, p: D.cta.p, btn: T.cta.wa },
    foot: en ? E.foot : { h2: `${D.cta.h2}<br>${D.cta.h2em}`, hours: U.hours, btn: U.bookS },
  };
}

function build(D, lang) {
const T = ui(lang);
const U = T.v2;
const V = view(D, lang);
const isVI = lang === "vi";
const L = (k) => LINKS[lang][k];
const SITE = "https://doctors.greenfield.clinic";
const URL_ = `${SITE}${pagePath(lang, D.slug)}`;
const WA_NUM = "84906621988";
const TOKEN = "(via doctors.greenfield.clinic)";
const waHref = `https://wa.me/${WA_NUM}?text=${encodeURIComponent(`${D.wa} ${TOKEN}`)}`;
const ZALO = "https://zalo.me/0906621988";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
/** Chữ có thể chứa <br> (ngắt dòng của thiết kế): thoát HTML rồi trả lại <br>. */
const h = (s) => esc(s).replace(/&lt;br\s*\/?&gt;/gi, "<br>").replace(/\s*<br>\s*/g, "<br>");
const flat = (s) => String(s).replace(/<br\s*\/?>/gi, " ").replace(/\s+/g, " ").trim();
const V2 = { short: D.short, name: D.name, nick: D.nick, jobTitle: D.jobTitle };
const t = (s) => esc(s).replace(/\{(\w+)\}/g, (m, k) => (k === "n" ? "<span data-count>264</span>" : V2[k] !== undefined ? esc(V2[k]) : m));
const tp = (s) => s.replace(/\{(\w+)\}/g, (m, k) => (V2[k] !== undefined ? V2[k] : m));
const js = (o) => JSON.stringify(o).replace(/</g, "\\u003c");
const primary = isVI ? ZALO : waHref;
const H2 = (a, cls = "h2", id = "") => `<h2 class="${cls}"${id ? ` id="${id}"` : ""}>${h(a[0])}${a[1] ? ` <em>${h(a[1])}</em>` : ""}</h2>`;

const mk = (name, slug = D.slug) => (M[`${slug}/${name}`] ? `${slug}/${name}` : M[`shared/${name}`] ? `shared/${name}` : null);
function meta(name, slug) { const k = mk(name, slug); if (!k) throw new Error(`thiếu ảnh ${name} (${slug || D.slug})`); return { k, ...M[k] }; }
function dirOf(name, slug) { return "/" + meta(name, slug).k.replace(/\/[^/]+$/, "") + "/img"; }
function srcset(name, fmt, slug) { const m = meta(name, slug); return m.widths.map((w) => `${dirOf(name, slug)}/${name}-${w}.${fmt} ${w}w`).join(", "); }
function pic(name, alt, sizes, { eager = false, cls = "", slug } = {}) {
  const m = meta(name, slug); const w = Math.max(...m.widths); const hh = Math.round(w * m.ratio);
  return `<picture${cls ? ` class="${cls}"` : ""}><source type="image/avif" srcset="${srcset(name, "avif", slug)}" sizes="${sizes}"><source type="image/webp" srcset="${srcset(name, "webp", slug)}" sizes="${sizes}"><img src="${dirOf(name, slug)}/${name}-${w}.webp" alt="${esc(alt)}" width="${w}" height="${hh}"${eager ? ` fetchpriority="high" decoding="async"` : ` loading="lazy" decoding="async"`}></picture>`;
}
const WA_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>`;
const ZALO_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5c-5 0-9 3.5-9 7.9 0 2.4 1.2 4.5 3.1 6l-.7 3.1 3.3-1.6c1 .3 2.1.4 3.3.4 5 0 9-3.5 9-7.9s-4-7.9-9-7.9Z"/><path d="M8.5 9h4.5l-4.5 5h4.5M15.8 9v5"/></svg>`;
const langLinks = () => LANGS.map((l) => `<a href="${pagePath(l, D.slug)}" hreflang="${HL[l]}" lang="${HL[l]}"${l === lang ? ` aria-current="page"` : ""}>${CODE[l]}<small>${LNAME[l]}</small></a>`).join("");
const portraitM = meta(D.portrait);
const heroPreload = `<link rel="preload" as="image" type="image/avif" imagesrcset="${srcset(D.portrait, "avif")}" imagesizes="(min-width: 980px) 420px, 320px" fetchpriority="high">`;

const jsonld = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Dentist", "@id": "https://greenfield.clinic/#clinic", name: "Greenfield Dental", telephone: "+84906621988", email: "hello@nhakhoagreenfield.com",
      address: { "@type": "PostalAddress", streetAddress: "95 Trung Hoa", addressLocality: "Cau Giay, Hanoi", addressCountry: "VN" },
      openingHoursSpecification: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "08:30", closes: "18:00" } },
    { "@type": "Physician", "@id": `${URL_}#physician`, name: `${D.name} (${D.nick})`, url: URL_, image: `${SITE}${dirOf(D.portrait)}/${D.portrait}-${Math.max(...portraitM.widths)}.webp`,
      medicalSpecialty: ALL[D.key].specialty, telephone: "+84906621988", parentOrganization: { "@id": "https://greenfield.clinic/#clinic" } },
    { "@type": "Person", "@id": `${URL_}#person`, name: D.name, alternateName: D.nick, jobTitle: D.jobTitle, url: URL_,
      image: `${SITE}${dirOf(D.portrait)}/${D.portrait}-${Math.max(...portraitM.widths)}.webp`,
      alumniOf: D.alumni.map((n) => ({ "@type": "CollegeOrUniversity", name: n })),
      worksFor: { "@id": "https://greenfield.clinic/#clinic" }, knowsAbout: D.specialty },
    { "@type": "ProfilePage", "@id": `${URL_}#page`, url: URL_, name: D.title, description: D.description, mainEntity: { "@id": `${URL_}#person` }, inLanguage: HL[lang] },
    { "@type": "FAQPage", "@id": `${URL_}#faq`, mainEntity: V.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ],
};

const caseImg = (c, side) => { const n = `${c.img}-${side}`; return { a: srcset(n, "avif"), w: srcset(n, "webp"), s: `${dirOf(n)}/${n}-${Math.max(...meta(n).widths)}.webp` }; };
const casesData = V.cases.map((c) => ({ t: c.t, d: c.d, m: c.m, b: caseImg(c, "before"), f: caseImg(c, "after") }));
const c0 = V.cases[0], cd0 = casesData[0];
const CC = { "United Kingdom": "gb", England: "gb", Australia: "au", Canada: "ca", Singapore: "sg", Japan: "jp", "South Korea": "kr", Vietnam: "vn", Spain: "es", "New Zealand": "nz", Germany: "de" };
const REV = V.reviews.map((r) => { const tx = String(r.text).replace(/[“”]/g, ""); return { n: r.name, c: r.country, f: CC[r.country] || "vn", s: "“" + (tx.length > 168 ? tx.slice(0, tx.lastIndexOf(" ", 168)) + "…" : tx) + "”" }; });
const SLOTS = ["left:0;top:18%;--d:7.5s;--o:0s", "left:-6%;top:60%;--d:9s;--o:.6s", "left:76%;top:2%;--d:8.2s;--o:.3s", "left:80.7%;top:36%;--d:7s;--o:1.1s", "left:34%;top:67%;--d:9.6s;--o:.9s", "right:2%;top:73%;--d:8s;--o:1.6s"];
const revCard = (r, i) => `<figure class="fc" style="${SLOTS[i]}"><div class="fci"><blockquote>${esc(r.s)}</blockquote><figcaption><img src="https://flagcdn.com/w80/${r.f}.png" alt="${esc(r.c)}" width="30" height="30" loading="lazy"><span><b>${esc(r.n)}</b><small>${esc(r.c)}</small></span></figcaption></div></figure>`;
const certLi = (c, hide) => `<li class="cert"${hide ? ` aria-hidden="true"` : ""}><div class="ph${c.contain ? " c" : ""}">${pic(c.img, hide ? "" : c.t, "250px")}</div><b>${esc(c.t)}</b><span>${esc(c.s)}</span></li>`;
const marquee = V.certs.length >= 4;
const CJK = { ko: "'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR'", zh: "'PingFang SC','Hiragino Sans GB','Microsoft YaHei','Noto Sans SC'" }[lang];
const DOCS = ["kate", "chris", "giang", "henry", "hailey"].map((k) => { const o = doc(k, lang); return { k, slug: o.slug, name: o.name }; });
const docLinks = () => DOCS.map((o) => `<a href="${pagePath(lang, o.slug)}"${o.k === D.key ? ` aria-current="page"` : ""}>${esc(o.name)}</a>`).join("");
const nav = [["about", 0], ["expertise", 1], ["journey", 2], ["cases", 3], ["reviews", 4], ["faq", 5]];
const arrow = `<span class="ar" aria-hidden="true">→</span>`, dbl = `<span class="ar" aria-hidden="true">»</span>`;

const html = `<!doctype html>
<html lang="${HL[lang]}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(D.title)}</title>
<meta name="description" content="${esc(D.description)}">
<link rel="canonical" href="${URL_}">
${LANGS.map((l) => `<link rel="alternate" hreflang="${HL[l]}" href="${SITE}${pagePath(l, D.slug)}">`).join("\n")}
<link rel="alternate" hreflang="x-default" href="${SITE}${pagePath("en", D.slug)}">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="Greenfield Dental">
<meta property="og:locale" content="${OGL[lang]}">
${LANGS.filter((l) => l !== lang).map((l) => `<meta property="og:locale:alternate" content="${OGL[l]}">`).join("")}
<meta property="og:title" content="${esc(tp(T.ogTitle))}">
<meta property="og:description" content="${esc(D.description)}">
<meta property="og:url" content="${URL_}">
<meta property="og:image" content="${SITE}/${D.slug}/img/${D.key}-og-1200x630.jpg">
<meta name="twitter:title" content="${esc(tp(T.twTitle))}">
<meta name="twitter:description" content="${esc(D.description)}">
<meta name="twitter:image" content="${SITE}/${D.slug}/img/${D.key}-og-1200x630.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#EFF1F2">
<link rel="icon" href="/shared/img/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="/shared/img/favicon-192.png">
<link rel="preload" href="/shared/fonts/plus-jakarta-sans-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>${isVI ? `\n<link rel="preload" href="/shared/fonts/plus-jakarta-sans-vietnamese-wght-normal.woff2" as="font" type="font/woff2" crossorigin>` : ""}
${heroPreload}
<style>
${FONTS_CSS}
:root{--bg:#EFF1F2;--ink:#333B3B;--g:#3F8F68;--g2:#2F7253;--mut:#5F6968;--mut2:#6E7877;--mint:#EAF4EE;--deep:#344A3C;--night:#0F2A1D;--sans:'Plus Jakarta Sans',${CJK ? CJK + "," : ""}system-ui,-apple-system,'Segoe UI',sans-serif;--sec:clamp(56px,8vw,110px);--cp:clamp(26px,3.4vw,52px)}
*,*::before,*::after{box-sizing:border-box}
html{scroll-padding-top:84px;-webkit-text-size-adjust:100%}
@media (prefers-reduced-motion:no-preference){html{scroll-behavior:smooth}}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);-webkit-font-smoothing:antialiased;overflow-x:hidden}${lang === "ko" ? "\nbody{word-break:keep-all;overflow-wrap:break-word}" : ""}
a{color:var(--g2);text-decoration:none}
img{max-width:100%;display:block}
p,figure,blockquote{margin:0}
h1,h2,h3{margin:0;font-weight:600}
:focus-visible{outline:2px solid var(--g);outline-offset:3px}
@keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.pad{max-width:1220px;margin:0 auto;padding-inline:24px}
.h2{font-size:clamp(30px,4.2vw,50px);line-height:1.1;letter-spacing:-.02em}
h1 em,h2 em{font-style:normal;color:var(--g)}
.sec{padding-top:var(--sec)}
.ar{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;flex:none}
.tick{width:22px;height:22px;border-radius:50%;background:var(--mint);color:var(--g);display:flex;align-items:center;justify-content:center;font-size:11px;flex:none}

/* header */
.hdr{position:sticky;top:0;z-index:60;background:rgba(239,241,242,.86);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(51,59,59,.06)}
.hdr .pad{padding-block:14px;display:flex;align-items:center;gap:24px}
.logo{display:flex;align-items:center;flex:none}
.logo img{height:30px;width:auto}
.nav{display:flex;gap:26px;margin-left:auto;align-items:center}
.nav a{font-size:13.5px;color:#5A6462;font-weight:500;transition:color .2s}
.nav a:hover{color:var(--g2)}
.lang{position:relative;flex:none}
.lang summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:6px;height:44px;padding:0 10px;border-radius:999px;font-size:13px;font-weight:600;color:#5A6462}
.lang summary::-webkit-details-marker{display:none}
.lang summary svg{width:17px;height:17px}
.lang summary::after{content:"";width:6px;height:6px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:rotate(45deg) translateY(-2px)}
.lang-p{position:absolute;right:0;top:calc(100% + 6px);background:#fff;border-radius:16px;padding:6px;box-shadow:0 22px 50px -24px rgba(51,59,59,.45);display:grid;min-width:170px}
.lang-p a,.mlang a{display:flex;align-items:center;gap:10px;min-height:42px;padding:0 12px;border-radius:10px;color:var(--ink);font-size:13.5px;font-weight:600}
.lang-p a small,.mlang a small{font-weight:400;color:var(--mut)}
.lang-p a:hover{background:var(--mint)}
.lang-p a[aria-current],.mlang a[aria-current]{color:var(--g2);background:var(--mint)}
.docs{position:relative}
.docs summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:6px;font-size:13.5px;color:#5A6462;font-weight:500;min-height:44px}
.docs summary::-webkit-details-marker{display:none}
.docs summary::after{content:"";width:6px;height:6px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:rotate(45deg) translateY(-2px)}
.docs summary:hover,.docs[open] summary{color:var(--g2)}
.docs-p{left:50%;right:auto;transform:translateX(-50%);min-width:230px}
.docs-p a{font-weight:500;white-space:nowrap}
.mh{margin:14px 6px 2px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--mut)}
.mdocs{display:grid}
.mdocs a{padding:12px 6px;font-size:15px;color:var(--ink);border-bottom:1px solid rgba(51,59,59,.06)}
.mdocs a[aria-current]{color:var(--g2);font-weight:600}
.btn-book{display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 20px;border-radius:999px;border:1px solid var(--g);color:var(--g2);font-size:13.5px;font-weight:600;background:transparent;transition:background .25s,color .25s;flex:none;white-space:nowrap}
.btn-book::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--g);transition:background .25s}
.btn-book:hover{background:var(--g);color:#fff}
.btn-book:hover::before{background:#fff}
.burger{display:none;width:44px;height:44px;border-radius:14px;border:1px solid rgba(51,59,59,.12);background:#fff;align-items:center;justify-content:center;flex-direction:column;gap:4px;cursor:pointer;flex:none;margin-left:auto}
.burger span{width:16px;height:1.6px;background:var(--ink);display:block}
.mnav{display:none;padding:8px 18px 22px;gap:2px;background:var(--bg);border-top:1px solid rgba(51,59,59,.06);max-height:calc(100dvh - 73px);overflow:auto}
.mnav.open{display:grid}
.mnav>a{padding:14px 6px;font-size:16px;color:var(--ink);font-weight:500;border-bottom:1px solid rgba(51,59,59,.06)}
.mlang{display:flex;flex-wrap:wrap;gap:6px;padding:14px 0 4px}
.mlang a{min-height:40px;border:1px solid rgba(51,59,59,.1);border-radius:999px}
.mbook{margin-top:14px;display:flex;align-items:center;justify-content:center;height:52px;border-radius:999px;background:var(--g);color:#fff!important;font-weight:600;font-size:15px}

/* màn đầu */
main{position:relative;z-index:1;padding-top:20px}
.hero{position:relative;background:#fff;border-radius:28px;display:grid;grid-template-columns:1.05fr .95fr;overflow:hidden;box-shadow:0 20px 60px -40px rgba(51,59,59,.35)}
.hero-bg{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.hero-bg picture{position:absolute;top:0;bottom:0;left:9px;right:0}
.hero-bg picture img{width:100%;height:100%;object-fit:cover}
.hero-bg .blob{position:absolute;top:-23%;left:-30px;width:100%;height:150%;border-radius:50%;filter:blur(30px);background:radial-gradient(closest-side,rgba(226,238,222,.95),rgba(199,220,199,.55) 58%,rgba(199,220,199,0))}
.hero-bg .fade{position:absolute;top:0;bottom:0;left:0;width:127%;background:linear-gradient(90deg,#fff 0%,rgba(255,255,255,.96) 22%,rgba(255,255,255,.55) 34%,rgba(255,255,255,0) 46%)}
.hero-txt{position:relative;z-index:1;padding:clamp(28px,4vw,56px);display:flex;flex-direction:column;justify-content:center;gap:22px}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11.5px;letter-spacing:.18em;font-weight:600;color:#6D957F;text-transform:uppercase}
.eyebrow::before{content:"";width:22px;height:1px;background:#6D957F;flex:none}
.hero h1{font-size:clamp(38px,4.6vw,58px);line-height:1.04;letter-spacing:-.02em;text-wrap:pretty}
.checks{display:flex;flex-wrap:wrap;gap:10px 22px;list-style:none;margin:0;padding:0}
.checks li{display:flex;align-items:center;gap:10px;font-size:14.5px;color:#4A5453}
.lead{font-size:14.5px;line-height:1.65;color:var(--mut);max-width:420px}
.ctas{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
.btn-p{display:inline-flex;align-items:center;gap:14px;height:54px;padding:0 8px 0 26px;border-radius:999px;background:var(--g);color:#fff;font-size:14.5px;font-weight:600;transition:background .25s,transform .25s}
.btn-p .ar{background:rgba(255,255,255,.18)}
.btn-p:hover{background:var(--g2);color:#fff;transform:translateY(-2px)}
.btn-o{display:inline-flex;align-items:center;height:54px;padding:0 24px;border-radius:999px;color:var(--ink);font-size:14.5px;font-weight:600;border:1px solid rgba(51,59,59,.14);transition:border-color .25s}
.btn-o:hover{border-color:var(--g);color:var(--ink)}
.hero-photo{position:relative;z-index:1;min-height:420px}
.hero-photo picture{position:absolute;left:50%;bottom:-38px;height:100%;max-height:560px;transform:translateX(-50%);display:flex;align-items:flex-end}
.hero-photo img{height:100%;width:auto;max-width:none;object-fit:contain;object-position:bottom}
.badge{position:absolute;z-index:2;left:16px;bottom:38px;background:rgba(255,255,255,.55);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.75);border-radius:20px;padding:16px 20px;display:flex;align-items:baseline;gap:10px;box-shadow:0 18px 40px -28px rgba(52,74,60,.4);animation:floaty 5.5s ease-in-out infinite}
.badge b{font-size:30px;font-weight:800;letter-spacing:-.03em;color:var(--g2);line-height:1}
.badge span{font-size:13.5px;font-weight:600;color:var(--ink);position:relative;top:-5px}

/* vì sao tin tưởng + số liệu */
.trust>p{margin-top:26px;font-size:15px;line-height:1.75;color:var(--mut2);max-width:900px}
.stats{margin-top:40px;display:grid;grid-template-columns:repeat(var(--n,4),1fr);gap:14px}
.stat{background:#fff;border-radius:22px;padding:24px;min-height:180px;display:flex;flex-direction:column;justify-content:space-between;gap:14px}
.stat .k{display:flex;align-items:center;justify-content:space-between;font-size:12px;color:var(--mut);min-height:12px}
.stat .k::after{content:"";width:8px;height:8px;border-radius:50%;background:var(--g)}
.stat b{font-size:clamp(34px,4.6vw,48px);font-weight:500;letter-spacing:-.03em;line-height:1;white-space:nowrap}
.stat .l{font-size:12px;color:var(--mut)}

/* giới thiệu (thẻ ảnh tối) */
.about{position:relative;border-radius:28px;overflow:hidden;min-height:clamp(520px,54vw,700px);display:flex;flex-direction:column;justify-content:center;padding:var(--cp);background:var(--deep)}
.about>picture{position:absolute;inset:0}
.about>picture img{width:100%;height:100%;object-fit:cover;object-position:var(--pos,center)}
.about .shade{position:absolute;inset:0;background:linear-gradient(100deg,rgba(15,42,29,.9) 0%,rgba(15,42,29,.72) 34%,rgba(15,42,29,.25) 62%,rgba(15,42,29,.08) 100%)}
.about .in{position:relative;max-width:560px;display:flex;flex-direction:column;gap:clamp(14px,1.8vw,22px)}
.pill{display:inline-flex;align-self:flex-start;align-items:center;gap:9px;padding:9px 16px;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.22);font-size:11px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--mint)}
.pill::before{content:"";width:7px;height:7px;border-radius:50%;background:#9FDCB8;flex:none}
.about h2{font-size:clamp(34px,4.6vw,60px);line-height:1.06;letter-spacing:-.02em;color:#fff;text-wrap:pretty}
.about .in>p{font-size:clamp(14.5px,1.2vw,17px);line-height:1.7;color:rgba(255,255,255,.82);max-width:470px}
.about .ctas{padding-top:4px}
.btn-w{display:inline-flex;align-items:center;gap:14px;height:52px;padding:0 8px 0 24px;border-radius:999px;background:#fff;color:var(--night);font-size:14.5px;font-weight:600;transition:transform .25s}
.btn-w .ar{width:36px;height:36px;background:var(--g);color:#fff;font-size:15px}
.btn-w:hover{transform:translateY(-2px);color:var(--night)}
.btn-gl{display:inline-flex;align-items:center;gap:12px;height:52px;padding:0 8px 0 24px;border-radius:999px;border:1px solid rgba(255,255,255,.35);color:#fff;font-size:14.5px;font-weight:600;transition:background .25s}
.btn-gl .ar{width:36px;height:36px;background:rgba(255,255,255,.16);font-size:14px}
.btn-gl:hover{background:rgba(255,255,255,.12);color:#fff}
.chips{position:absolute;left:var(--cp);right:var(--cp);bottom:var(--cp);display:flex;flex-wrap:wrap;gap:12px;list-style:none;margin:0;padding:0}
.chips li{display:flex;align-items:center;gap:12px;padding:13px 18px;border-radius:14px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.chips .tick{background:#9FDCB8;color:var(--night)}
.chips b{display:block;font-size:13px;font-weight:600;color:#fff}
.chips small{display:block;font-size:11.5px;color:rgba(255,255,255,.7)}

/* chuyên môn */
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:30px}
.card{background:#fff;border-radius:22px;padding:26px;min-height:250px;display:flex;flex-direction:column;justify-content:space-between;transition:transform .3s}
.card:hover{transform:translateY(-4px)}
.card h3,.mcard h3,.adv h3{font-size:19px;line-height:1.35}
.card .row{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-top:24px}
.card .row span{font-size:13px;color:var(--mut)}
.card .go{width:44px;height:44px;border-radius:50%;background:var(--g);color:#fff;display:flex;align-items:center;justify-content:center;font-size:17px;flex:none}
.mcard{position:relative;border-radius:22px;overflow:hidden;min-height:250px;background:#E6E9EA;color:#fff}
.mcard picture,.mcard img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.mcard::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(47,71,60,.58),rgba(47,71,60,0) 52%),linear-gradient(0deg,rgba(47,71,60,.78),rgba(47,71,60,0) 45%);pointer-events:none}
.mcard h3{position:absolute;top:24px;left:24px;right:24px;z-index:1;color:#fff}
.mcard span{position:absolute;bottom:24px;left:24px;right:24px;z-index:1;font-size:13px;color:#fff}
.adv{border-radius:22px;padding:26px;min-height:250px;display:flex;flex-direction:column;justify-content:space-between;background:var(--deep)}
.adv h3{color:#fff}
.adv p{margin:24px 0 18px;font-size:13px;line-height:1.6;color:rgba(255,255,255,.72)}
.adv a{display:inline-flex;align-items:center;gap:10px;height:44px;padding:0 20px;border-radius:999px;background:#fff;color:var(--g2);font-size:13.5px;font-weight:600;align-self:flex-start}

/* lời bác sĩ */
.quote{width:100vw;margin-left:calc(50% - 50vw);background:#E3E6E6;padding-top:clamp(20px,2vw,28px)}
.quote .grid{max-width:1222px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:minmax(0,.82fr) minmax(0,1.18fr);gap:clamp(20px,4vw,56px);align-items:center}
.quote .grid>picture{justify-self:center;align-self:end;margin-bottom:-1px}
.quote .grid>picture img{height:472px;width:auto;max-width:100%;object-fit:contain;object-position:bottom}
.qbox{position:relative;padding:clamp(18px,3vw,44px) clamp(28px,4vw,72px)}
.qm{position:absolute;width:clamp(58px,6vw,96px);line-height:0;opacity:.25}
.qm svg{width:100%;height:auto;display:block}
.qm.o{left:0;top:2%}
.qm.c{right:0;bottom:6%;transform:rotate(180deg)}
.qt{position:relative;font-size:clamp(20px,2.5vw,34px);line-height:1.42;font-weight:400;color:var(--ink);letter-spacing:-.01em;text-wrap:pretty;max-width:600px}
.qt strong{font-weight:600;color:var(--g2)}
.qby{margin-top:clamp(24px,3vw,40px);position:relative;font-size:clamp(15px,1.4vw,19px);font-weight:700}
.qrole{margin-top:4px;position:relative;font-size:clamp(13.5px,1.25vw,17px);font-style:italic;color:var(--mut)}

/* chứng chỉ */
.marq{position:relative;overflow:hidden;margin:30px -24px 0;padding:4px 24px}
.marq::before,.marq::after{content:"";position:absolute;top:0;bottom:0;width:60px;z-index:2;pointer-events:none}
.marq::before{left:0;background:linear-gradient(90deg,var(--bg),rgba(239,241,242,0))}
.marq::after{right:0;background:linear-gradient(270deg,var(--bg),rgba(239,241,242,0))}
.track{display:flex;width:max-content;list-style:none;margin:0;padding:0}
.marq.run .track{animation:marquee ${Math.max(40, V.certs.length * 9)}s linear infinite}
.marq.run:hover .track{animation-play-state:paused}
.marq.still::before,.marq.still::after{display:none}
.marq.still .track{width:auto;flex-wrap:wrap;row-gap:14px}
.cert{background:#fff;border-radius:22px;padding:16px;width:280px;flex:0 0 280px;margin-right:14px}
.cert .ph{border-radius:16px;overflow:hidden;background:#F6F7F7;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center}
.cert .ph picture{width:100%;height:100%}
.cert .ph img{width:100%;height:100%;object-fit:cover}
.cert .ph.c img{object-fit:contain;padding:10px}
.cert b{display:block;margin:16px 6px 4px;font-size:14.5px;font-weight:600;line-height:1.4;min-height:60px}
.cert span{display:block;margin:0 6px;font-size:12.5px;color:var(--mut)}

/* ca điều trị */
.case-h{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:30px}
.case-h p{font-size:13.5px;color:var(--mut);max-width:340px}
.case{background:#fff;border-radius:24px;padding:16px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:20px;align-items:center}
.ba{position:relative;border-radius:18px;overflow:hidden;background:var(--bg);aspect-ratio:1;touch-action:pan-y;--pos:50%}
.ba picture,.ba picture img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.ba .bf{clip-path:inset(0 calc(100% - var(--pos)) 0 0)}
.ba .line{position:absolute;top:0;bottom:0;left:var(--pos);width:2px;margin-left:-1px;background:#fff;box-shadow:0 0 12px rgba(51,59,59,.35);pointer-events:none}
.ba .knob{position:absolute;top:50%;left:var(--pos);transform:translate(-50%,-50%);width:46px;height:46px;border-radius:50%;background:#fff;color:var(--g2);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;box-shadow:0 8px 24px -10px rgba(51,59,59,.5);pointer-events:none}
.ba .tag{position:absolute;top:12px;z-index:2;font-size:11px;padding:5px 11px;border-radius:999px;color:#fff;pointer-events:none}
.ba .tag.b{left:12px;background:rgba(51,59,59,.75)}
.ba .tag.a{right:12px;background:var(--g)}
.ba input{position:absolute;inset:0;z-index:3;width:100%;height:100%;margin:0;opacity:0;cursor:ew-resize}
.case-i{padding:clamp(8px,2vw,28px);display:flex;flex-direction:column;gap:16px}
.case-i .n{font-size:12px;font-weight:600;letter-spacing:.14em;color:var(--g);text-transform:uppercase}
.case-i h3{font-size:clamp(20px,2.4vw,27px);line-height:1.25;letter-spacing:-.01em}
.case-i p{font-size:14.5px;line-height:1.75;color:#5A6462}
.case-i .meta{display:inline-flex;align-self:flex-start;font-size:12.5px;color:var(--g2);background:var(--mint);padding:8px 14px;border-radius:999px}
.cnav{display:flex;align-items:center;gap:10px;margin-top:6px}
.cnav button{width:48px;height:48px;border-radius:50%;font:17px var(--sans);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color .25s,background .25s}
.cnav .prev{background:#fff;border:1px solid rgba(51,59,59,.14);color:var(--ink)}
.cnav .prev:hover{border-color:var(--g);background:var(--mint)}
.cnav .next{background:var(--g);border:1px solid var(--g);color:#fff}
.cnav .next:hover{background:var(--g2)}
.cnav span{font-size:12.5px;color:var(--mut);margin-left:8px}

/* đánh giá */
.fw{position:relative;min-height:660px;display:flex;align-items:center;justify-content:center}
.fw h2{text-align:center;font-family:'Anton',Impact,var(--sans);font-weight:400;font-size:clamp(46px,10.6vw,146px);line-height:.9;letter-spacing:-.01em;color:var(--deep);text-transform:uppercase;position:relative;z-index:1}
.fc{position:absolute;z-index:2;width:clamp(238px,22vw,300px);background:#fff;border-radius:16px;padding:18px 18px 16px;box-shadow:0 22px 50px -34px rgba(51,59,59,.55);animation:floaty var(--d,8s) ease-in-out infinite var(--o,0s)}
.fci{transition:opacity .5s ease}
.fc.fade .fci{opacity:0}
.fc blockquote{margin:0 0 14px;font-size:13px;line-height:1.62;color:#4A5453;text-wrap:pretty}
.fc figcaption{display:flex;align-items:center;gap:10px}
.fc img{width:30px;height:30px;border-radius:50%;object-fit:cover;background:var(--bg);flex:none}
.fc b{display:block;font-size:12.5px;font-weight:600;color:var(--ink)}
.fc small{display:block;font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;color:#7D8786}

/* hành trình */
.steps{position:relative;overflow:hidden;display:grid;grid-template-columns:repeat(var(--n,7),1fr);gap:0 10px;list-style:none;margin:30px 0 0;padding:0}
.steps li{position:relative;z-index:1;display:flex;flex-direction:column;gap:12px;padding-right:6px}
.steps li::before{content:"";position:absolute;top:19px;left:19px;width:calc(100% + 10px);height:1.5px;background:rgba(63,143,104,.45);z-index:0}
.steps .n{position:relative;z-index:1;width:38px;height:38px;border-radius:50%;background:#fff;border:1.5px solid var(--g);color:var(--g2);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;flex:none}
.steps b{display:block;font-size:15px;font-weight:600;line-height:1.3}
.steps .d{display:block;font-size:12.5px;line-height:1.6;color:var(--mut)}
.sub{margin-top:12px;font-size:15px;line-height:1.7;color:var(--mut2);max-width:560px}

/* hỏi đáp */
.faq-h{text-align:center}
.faq{display:grid;gap:12px;max-width:880px;margin:clamp(28px,4vw,48px) auto 0}
.faq details{background:#fff;border:1px solid rgba(51,59,59,.07);border-radius:32px;overflow:hidden;transition:background .3s,border-color .3s,border-radius .3s}
.faq details:hover{background:var(--mint);border-color:rgba(63,143,104,.35)}
.faq details[open]{background:var(--mint);border-color:rgba(63,143,104,.4);border-radius:24px}
.faq summary{min-height:64px;padding:12px 12px 12px 22px;display:flex;align-items:center;gap:16px;cursor:pointer;list-style:none}
.faq summary::-webkit-details-marker{display:none}
.faq .i{font-size:12px;color:#98A3A1;flex:none;width:14px}
.faq .q{flex:1;font-size:15.5px;font-weight:600;color:var(--ink);line-height:1.45}
.faq .pl{width:40px;height:40px;border-radius:50%;background:var(--ink);color:#fff;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:500;flex:none;transition:background .3s,transform .3s}
.faq details[open] .pl{background:var(--g2);transform:rotate(45deg)}
.faq details p{padding:0 68px 24px 52px;font-size:14px;line-height:1.8;color:var(--mut)}

/* cam kết */
.guar{background:var(--mint);border-radius:28px;padding:clamp(28px,4vw,56px)}
.guar h2{font-size:clamp(28px,3.6vw,44px);line-height:1.12;letter-spacing:-.02em}
.guar>p{margin-top:10px;font-size:14.5px;color:#5F6E67;max-width:520px}
.guar .cards{margin-top:34px}
.gcard{background:#DBE9E0;border-radius:20px;padding:26px;display:flex;flex-direction:column;gap:14px;min-height:230px;color:#26402F;transition:background .3s,color .3s,transform .3s}
.gcard:hover{background:#1F4A33;color:#F2F8F4;transform:translateY(-3px)}
.gcard svg{width:30px;height:30px;flex:none;opacity:.9}
.gcard b{display:block;font-size:19px;font-weight:600;line-height:1.28;letter-spacing:-.01em;margin-top:4px}
.gcard span{display:block;font-size:13.5px;line-height:1.65;opacity:.78}

/* bước tiếp theo */
.endcta{position:relative;z-index:1;margin-top:var(--sec);overflow:hidden;min-height:clamp(420px,42vw,560px);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:var(--sec) 20px;background:var(--night)}
.endcta>picture{position:absolute;inset:0}
.endcta>picture img{width:100%;height:100%;object-fit:cover}
.endcta .shade{position:absolute;inset:0;background:rgba(11,31,21,.78)}
.endcta .in{position:relative;display:flex;flex-direction:column;align-items:center;gap:clamp(16px,2vw,24px);max-width:640px}
.endcta .pill{align-self:center}
.endcta h2{font-size:clamp(32px,4.4vw,56px);line-height:1.08;letter-spacing:-.02em;color:#fff;text-wrap:pretty}
.endcta .in>p{font-size:clamp(14px,1.15vw,16.5px);line-height:1.7;color:rgba(255,255,255,.75);max-width:527px}
.endcta .btn-w{margin-top:6px;height:54px;padding-left:26px;color:#0B1F15}
.endcta .alt{font-size:13.5px}
.endcta .alt a{color:rgba(255,255,255,.75);text-decoration:underline;text-underline-offset:3px}

/* footer */
.ftr{position:relative;z-index:1;overflow:hidden;background:var(--deep);color:#fff}
.ftr .pad{padding-top:clamp(48px,6vw,84px)}
.ftop{display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(24px,4vw,56px);align-items:center}
.ftop h2{font-size:clamp(26px,3.2vw,40px);line-height:1.15;letter-spacing:-.02em;color:#fff;text-wrap:pretty}
.fform{display:flex;align-items:center;gap:8px;background:rgba(11,31,21,.45);border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:7px 7px 7px 24px;justify-self:end;width:100%;max-width:440px}
.fform>span{flex:1;font-size:14px;color:rgba(255,255,255,.6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fform a{display:inline-flex;align-items:center;gap:10px;height:46px;padding:0 6px 0 20px;border-radius:999px;background:#fff;color:#0B1F15;font-size:13.5px;font-weight:600;flex:none;transition:transform .25s}
.fform a:hover{transform:translateY(-1px)}
.fform .ar{width:32px;height:32px;background:var(--mint);color:var(--g2);font-size:13px}
.fsep{display:flex;align-items:center;gap:18px;margin:clamp(34px,4vw,56px) 0}
.fsep span{flex:1;height:1px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.34) 0 6px,transparent 6px 12px)}
.fsep i{width:26px;height:26px;border-radius:50%;border:1px solid rgba(255,255,255,.4);flex:none}
.fcols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(26px,4vw,48px)}
.fcols>div{display:grid;gap:10px;align-content:start}
.fh{font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.62);margin:0 0 4px;font-weight:400}
.fcols a{font-size:14px;color:rgba(255,255,255,.78);padding:4px 0 4px 14px;border-left:1px solid rgba(255,255,255,.22);transition:color .25s}
.fcols a:hover{color:#fff}
.flegal{display:flex;flex-wrap:wrap;gap:6px 20px;align-items:center;padding:61px 0 34px;font-size:12.5px;color:rgba(255,255,255,.6)}
.flegal p{flex:1 1 360px}
.flegal a{color:rgba(255,255,255,.6)}
.flegal a:hover{color:#fff}
.wa-float{display:none;position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:59;width:56px;height:56px;border-radius:50%;background:#25D366;color:#fff;align-items:center;justify-content:center;box-shadow:0 10px 24px rgba(0,0,0,.25)}
.wa-float svg{width:30px;height:30px}
.wa-float.zalo{background:#0068FF}

/* hiện dần khi cuộn (chỉ khi có JS) */
.js [data-reveal]{opacity:0;transform:translateY(20px);transition:opacity .7s cubic-bezier(.4,0,.2,1),transform .7s cubic-bezier(.4,0,.2,1)}
.js [data-reveal].on{opacity:1;transform:none}

@media (max-width:1080px) and (min-width:761px){.steps{grid-template-columns:repeat(4,1fr);row-gap:34px}.steps li::before{display:none}}
@media (max-width:1023px){
  .quote .grid{grid-template-columns:1fr;text-align:center}
  .quote .grid>picture{order:2}
  .quote .grid>picture img{height:auto;max-height:380px}
  .qbox{padding:8px 0 0}
  .qt{margin:0 auto}
  .fw{display:block;min-height:0}
  .fw h2{margin-bottom:28px}
  .fc{position:static;width:100%;max-width:460px;margin:0 auto 12px;animation:none}
  .about{min-height:0;padding-top:clamp(220px,46vw,340px)}
  .about>picture img{object-position:right 30% top}
  .chips{position:static;margin-top:26px}
  .chips li{flex:1 1 100%}
  .fform{justify-self:stretch;flex-direction:column;align-items:stretch;border-radius:22px;padding:18px;gap:14px}
  .fform>span{text-align:center;white-space:normal}
  .fform a{justify-content:center}
  .fcols{grid-template-columns:1fr 1fr}
}
@media (max-width:1180px){.nav,.hdr .btn-book,.hdr .lang{display:none}.burger{display:flex}}
@media (min-width:1181px) and (max-width:1320px){.nav{gap:18px}.hdr .pad{gap:16px}}
@media (max-width:980px){
  .hero{grid-template-columns:1fr}
  .hero-bg .fade{width:100%;background:linear-gradient(180deg,#fff 0%,rgba(255,255,255,.97) 45%,rgba(255,255,255,.6) 58%,rgba(255,255,255,0) 72%)}
  .hero-bg .blob{top:10%}
  .hero-photo{min-height:400px}
  .case,.ftop{grid-template-columns:1fr}
  .hero .ctas a,.about .ctas a,.endcta .btn-w{width:100%;justify-content:center}
  .wa-float{display:flex}
}
@media (max-width:900px){.stats{grid-template-columns:1fr 1fr}}
@media (max-width:760px){
  .steps{grid-template-columns:1fr;row-gap:0}
  .steps li{display:grid;grid-template-columns:38px 1fr;column-gap:16px;row-gap:6px;padding-bottom:28px}
  .steps li::before{top:38px;left:18px;width:1.5px;height:calc(100% - 38px)}
  .steps li:last-child::before{display:none}
  .steps .n{grid-row:span 2}
  .steps b{align-self:center;font-size:16px}
  .faq details p{padding:0 22px 22px 52px}
}
@media (max-width:700px){
  .cards{grid-template-columns:1fr}
  .pad,.quote .grid{padding-inline:18px}
  .marq{margin-inline:-18px;padding-inline:18px}
  .hero-txt,.guar{padding:24px}
  .fcols{grid-template-columns:1fr}
  .hero-photo{min-height:360px}
}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}.marq.run{overflow-x:auto}.js [data-reveal]{opacity:1;transform:none}}
</style>
<script>window.dataLayer=window.dataLayer||[];window.dataLayer.push({page_type:"doctor_profile",doctor:"${D.key}",page_lang:"${lang}"});</script>
<script>/* Đồng ý cookie — CÙNG luật với greenfield.clinic (gf_consent_v1): EU/UK/CH mặc định từ chối + banner; ngoài EU mặc định cho phép.
   Thêm: lưu cả cookie .greenfield.clinic để web chính / trang bác sĩ đọc chung (web chính hiện chỉ dùng localStorage). */
(function(){var KEY="gf_consent_v1",TX=${js({ ...T.cookie, url: L("privacy") })};
var EU=["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","IS","LI","NO","GB","UK","CH"];
function isEU(){try{if(/^Europe\\//.test(Intl.DateTimeFormat().resolvedOptions().timeZone||""))return true;}catch(e){}try{var L=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||""];for(var i=0;i<L.length;i++){var m=String(L[i]).match(/[-_]([A-Za-z]{2})\\b/);if(m&&EU.indexOf(m[1].toUpperCase())>-1)return true;}}catch(e){}return false;}
function readCookie(){var m=document.cookie.match(/(?:^|; )gf_consent_v1=([^;]+)/);if(!m)return null;try{var c=JSON.parse(decodeURIComponent(m[1]));return c&&c.v===1?c:null;}catch(e){return null;}}
function read(){try{var c=JSON.parse(localStorage.getItem(KEY)||"null");if(c&&c.v===1)return c;}catch(e){}return readCookie();}
var eu=isEU(),choice=read();window.gfConsent={eu:eu,get:function(){return choice}};
var g=function(){window.dataLayer.push(arguments)};
function upd(c){var a=c.analytics?"granted":"denied",m=c.marketing?"granted":"denied";g("consent","update",{analytics_storage:a,ad_storage:m,ad_user_data:m,ad_personalization:m});window.dataLayer.push({event:"gf_consent_update",gf_consent_analytics:a,gf_consent_marketing:m});}
if(choice)upd(choice);else if(eu)g("consent","default",{analytics_storage:"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",wait_for_update:500});
function save(a,m){choice={v:1,analytics:!!a,marketing:!!m,ts:Date.now()};try{localStorage.setItem(KEY,JSON.stringify(choice))}catch(e){}
 try{var d=/greenfield\\.clinic$/.test(location.hostname)?";domain=.greenfield.clinic":"";document.cookie=KEY+"="+encodeURIComponent(JSON.stringify(choice))+";path=/;max-age=31536000;SameSite=Lax"+d+(location.protocol==="https:"?";Secure":"");}catch(e){}
 upd(choice);close();}
var box;function close(){if(box&&box.parentNode)box.parentNode.removeChild(box);box=null;}
function open(settings){close();var c=choice||{analytics:false,marketing:false};box=document.createElement("div");box.id="gf-cc";box.setAttribute("role","dialog");box.setAttribute("aria-label",TX.aria);
 box.innerHTML="<p><b class='t'>"+TX.title+"</b> "+TX.text+" <a href='"+TX.url+"'>"+TX.privacy+"</a></p>"+
 (settings?"<label><input type='checkbox' checked disabled> <span><b>"+TX.essential+"</b> — "+TX.essentialD+"</span></label><label><input type='checkbox' id='gf-cc-an'"+(c.analytics?" checked":"")+"> <span><b>"+TX.analytics+"</b> — "+TX.analyticsD+"</span></label><label><input type='checkbox' id='gf-cc-mk'"+(c.marketing?" checked":"")+"> <span><b>"+TX.marketing+"</b> — "+TX.marketingD+"</span></label><div class='row'><button data-a='save' class='pri'>"+TX.save+"</button><button data-a='rej'>"+TX.rejectNE+"</button></div>"
 :"<div class='row'><button data-a='acc' class='pri'>"+TX.accept+"</button><button data-a='rej'>"+TX.reject+"</button><button data-a='set' class='lk'>"+TX.settings+"</button></div>");
 box.addEventListener("click",function(e){var a=e.target.getAttribute&&e.target.getAttribute("data-a");if(a==="acc")save(1,1);else if(a==="rej")save(0,0);else if(a==="set")open(true);else if(a==="save")save(document.getElementById("gf-cc-an").checked,document.getElementById("gf-cc-mk").checked);});
 document.body.appendChild(box);}
window.gfCookieSettings=function(){open(true)};
document.addEventListener("click",function(e){var el=e.target.closest&&e.target.closest("[data-gf-cookie-settings]");if(el){e.preventDefault();open(true);}});
function boot(){if(eu&&!choice)open(false);}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();})();</script>
<style>#gf-cc{position:fixed;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:100;max-width:420px;background:#17261e;color:#EDE8DE;border:1px solid rgba(63,143,104,.45);border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,.3);padding:14px 16px;font:14px/1.5 var(--sans)}
#gf-cc p{margin:0}#gf-cc a{color:var(--g)}#gf-cc b.t{color:#fff;font-weight:600}
#gf-cc label{display:flex;gap:10px;align-items:center;min-height:44px;border-top:1px solid rgba(237,232,222,.12)}
#gf-cc .row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:10px}#gf-cc button{min-height:44px;border-radius:999px;border:1px solid var(--g);background:transparent;color:#EDE8DE;font:600 14px/1 var(--sans);cursor:pointer;padding:0 16px}#gf-cc button.pri{background:var(--g);border-color:var(--g);color:#fff}#gf-cc button.lk{border:0;padding:0 8px;text-decoration:underline;color:#EDE8DE}
@media (min-width:1024px){#gf-cc{right:auto}}</style>
<script>/* GTM tải sau thao tác đầu tiên / 3s sau load — y như greenfield.clinic (gf-gtm-deferred); kèm doctor trong sự kiện click. */
(function(){var done=false,ev=["keydown","mousedown","mousemove","touchstart","wheel","scroll"];function load(){if(done)return;done=true;ev.forEach(function(e){removeEventListener(e,load,{passive:true})});(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-ND5D4BL3');}
window.gfLoadGTM=load;ev.forEach(function(e){addEventListener(e,load,{passive:true})});
document.addEventListener("click",function(e){try{var a=e.target.closest&&e.target.closest("a[href]");if(!a)return;var u=a.href||"";if(!/wa\\.me|whatsapp\\.com|zalo\\.me|^tel:|^mailto:/i.test(u))return;
 var loc=a.closest(".hdr,.mnav")?"header":a.closest(".ftr")?"footer":a.closest(".wa-float")?"floating":a.closest(".hero")?"hero":a.closest(".endcta")?"end_cta":a.closest(".ftr .fform")?"footer":"content";
 var t=String(a.innerText||a.getAttribute("aria-label")||"").replace(/\\s+/g," ").trim().slice(0,100);
 window.dataLayer.push({event:"gf_doctor_contact",doctor:"${D.key}",contact_method:/wa\\.me|whatsapp/i.test(u)?"whatsapp":/zalo\\.me/i.test(u)?"zalo":/^tel:/i.test(u)?"call":"email",cta_location:loc,page_lang:"${lang}"});
 var gtm=window.google_tag_manager;if(gtm){for(var k in gtm){if(k.indexOf("GTM-")===0)return;}}
 window.dataLayer.push({event:"gf_contact_click_pre",gf_link_url:u,gf_cta_location:loc,gf_cta_text:t||"unknown",doctor:"${D.key}",page_lang:"${lang}"});load();}catch(x){}},true);
if(document.readyState==="complete"){setTimeout(load,3000)}else{addEventListener("load",function(){setTimeout(load,3000)})}})();</script>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>

</head>
<body>
<script>document.documentElement.classList.add("js")</script>
<header class="hdr">
  <div class="pad">
    <a class="logo" href="${L("home")}" aria-label="${esc(T.logoAria)}"><img src="/shared/img/greenfield-logo-green-60.webp" alt="Greenfield Dental" width="252" height="60"></a>
    <nav class="nav" aria-label="${esc(T.subnavAria)}">${nav.map(([id, i]) => `<a href="#${id}">${esc(U.nav[i])}</a>`).join("")}<details class="docs"><summary>${esc(U.doctors)}</summary><div class="lang-p docs-p">${docLinks()}</div></details></nav>
    <details class="lang"><summary aria-label="${esc(U.lang)}: ${esc(LNAME[lang])}"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z"/></svg>${CODE[lang]}</summary><div class="lang-p">${langLinks()}</div></details>
    <a class="btn-book" href="#book">${esc(U.book)}</a>
    <button class="burger" type="button" aria-expanded="false" aria-controls="mnav" aria-label="${esc(U.menu)}"><span></span><span></span><span></span></button>
  </div>
  <div class="mnav" id="mnav">
    ${nav.map(([id, i]) => `<a href="#${id}">${esc(U.navM[i])}</a>`).join("")}
    <p class="mh">${esc(U.doctors)}</p><div class="mdocs">${docLinks()}</div>
    <div class="mlang" aria-label="${esc(U.lang)}">${langLinks()}</div>
    <a class="mbook" href="#book">${esc(U.book)}</a>
  </div>
</header>

<main id="top" class="pad">
<section class="hero">
  <div class="hero-bg" aria-hidden="true">${pic("hero-bg", "", "(min-width: 1220px) 1200px, 100vw", { eager: false })}<div class="blob"></div><div class="fade"></div></div>
  <div class="hero-txt">
    <p class="eyebrow">${esc(V.eyebrow)}</p>
    <h1>${esc(V.h1[0])}&nbsp;<em>${esc(V.h1[1])}</em></h1>
    <ul class="checks">${V.checks.map((c) => `<li><span class="tick" aria-hidden="true">✓</span>${esc(c)}</li>`).join("")}</ul>
    <p class="lead">${esc(V.lead)}</p>
    <div class="ctas"><a class="btn-p" href="#book">${esc(U.book)}${arrow}</a><a class="btn-o" href="#cases">${esc(U.viewCases)}</a></div>
  </div>
  <div class="hero-photo">
    <div class="badge"><b>${esc(V.badge.n)}</b><span>${esc(V.badge.l)}</span></div>
    ${pic(D.portrait, D.portraitAlt, "(min-width: 980px) 420px, 320px", { eager: true })}
  </div>
</section>

<section class="sec trust" id="about" data-reveal>
  ${H2(V.trust.h2)}
  <p>${esc(V.trust.p)}</p>
  <div class="stats" style="--n:${V.trust.stats.length}">${V.trust.stats.map((s) => `<div class="stat"><span class="k">${esc(s.k)}</span><b>${esc(s.n)}</b><span class="l">${esc(s.l)}</span></div>`).join("")}</div>
</section>

<section class="sec" data-reveal>
  <div class="about" style="--pos:${V.about.pos}">
    ${pic(V.about.img, D.about.imgAlt || D.name, "(min-width: 1220px) 1172px, 100vw")}<div class="shade" aria-hidden="true"></div>
    <div class="in">
      <p class="pill">${esc(V.about.eyebrow)}</p>
      <h2>${h(V.about.h2)}</h2>
      <p>${esc(V.about.p)}</p>
      <div class="ctas"><a class="btn-w" href="#book">${esc(U.bookS)}${arrow}</a><a class="btn-gl" href="#expertise">${esc(V.about.explore)}${dbl}</a></div>
    </div>
    <ul class="chips">${V.about.chips.map((c) => `<li><span class="tick" aria-hidden="true">✓</span><span><b>${esc(c.t)}</b><small>${esc(c.s)}</small></span></li>`).join("")}</ul>
  </div>
</section>

<section class="sec" id="expertise" data-reveal>
  ${H2(V.expH2)}
  <div class="cards">
    ${V.exp.map((x) => x.img ? `<div class="mcard">${pic(x.img, flat(x.t), "(min-width: 980px) 380px, 100vw")}<h3>${h(x.t)}</h3><span>${esc(x.s)}</span></div>`
      : `<div class="card"><h3>${h(x.t)}</h3><div class="row"><span>${esc(x.s)}</span><span class="go" aria-hidden="true">→</span></div></div>`).join("\n    ")}
    <div class="adv"><h3>${h(V.advice.h)}</h3><div><p>${esc(V.advice.p)}</p><a href="#book">${esc(V.advice.btn)} <span aria-hidden="true">→</span></a></div></div>
  </div>
</section>

<section class="sec" data-reveal>
  <div class="quote">
    <div class="grid">
      ${pic(V.quote.img, D.name, "(min-width: 1024px) 480px, 300px")}
      <figure class="qbox">
        <span class="qm o" aria-hidden="true"><svg viewBox="0 0 124 96"><path d="M0 96V28A28 28 0 0 1 28 0H56V50A22 22 0 0 0 34 72V96Z" fill="none" stroke="#98A3A1" stroke-width="3"/><path d="M68 96V28A28 28 0 0 1 96 0H124V50A22 22 0 0 0 102 72V96Z" fill="none" stroke="#98A3A1" stroke-width="3"/></svg></span>
        <span class="qm c" aria-hidden="true"><svg viewBox="0 0 124 96"><path d="M0 96V28A28 28 0 0 1 28 0H56V50A22 22 0 0 0 34 72V96Z" fill="none" stroke="#98A3A1" stroke-width="3"/><path d="M68 96V28A28 28 0 0 1 96 0H124V50A22 22 0 0 0 102 72V96Z" fill="none" stroke="#98A3A1" stroke-width="3"/></svg></span>
        <blockquote class="qt">${h(V.quote.text)}${V.quote.em ? ` <strong>${h(V.quote.em)}</strong>` : ""}</blockquote>
        <figcaption><p class="qby">${esc(V.quote.by)}</p><p class="qrole">${esc(V.quote.role)}</p></figcaption>
      </figure>
    </div>
  </div>
</section>

<section class="sec" data-reveal>
  ${H2(V.certsH2)}
  <div class="marq ${marquee ? "run" : "still"}"><ul class="track">${V.certs.map((c) => certLi(c, false)).join("")}${marquee ? V.certs.map((c) => certLi(c, true)).join("") : ""}</ul></div>
</section>

<section class="sec" id="cases" data-reveal>
  <div class="case-h">${H2(V.casesH2)}<p>${esc(V.casesIntro)}</p></div>
  <div class="case">
    <div class="ba" id="ba">
      <picture class="af" id="ba-a"><source type="image/avif" srcset="${cd0.f.a}" sizes="(min-width: 980px) 570px, 100vw"><source type="image/webp" srcset="${cd0.f.w}" sizes="(min-width: 980px) 570px, 100vw"><img src="${cd0.f.s}" alt="${esc(T.cases.afterAlt + c0.t)}" width="800" height="800" loading="lazy" decoding="async"></picture>
      <picture class="bf" id="ba-b"><source type="image/avif" srcset="${cd0.b.a}" sizes="(min-width: 980px) 570px, 100vw"><source type="image/webp" srcset="${cd0.b.w}" sizes="(min-width: 980px) 570px, 100vw"><img src="${cd0.b.s}" alt="${esc(T.cases.beforeAlt + c0.t)}" width="800" height="800" loading="lazy" decoding="async"></picture>
      <span class="line" aria-hidden="true"></span><span class="knob" aria-hidden="true">‹ ›</span>
      <span class="tag b">${esc(U.before)}</span><span class="tag a">${esc(U.after)}</span>
      <input type="range" min="2" max="98" value="50" aria-label="${esc(T.cases.compare)}">
    </div>
    <div class="case-i" aria-live="polite">
      <span class="n" id="case-n">${esc(U.caseLabel)} 01 / ${String(V.cases.length).padStart(2, "0")}</span>
      <h3 id="case-t">${esc(c0.t)}</h3>
      <p id="case-d">${esc(c0.d)}</p>
      <span class="meta" id="case-m">${esc(c0.m)}</span>
      <div class="cnav"><button class="prev" type="button" aria-label="${esc(T.cases.prev)}">←</button><button class="next" type="button" aria-label="${esc(T.cases.next)}">→</button><span>${esc(U.drag)}</span></div>
    </div>
  </div>
</section>

<section class="sec" id="reviews" data-reveal>
  <div class="fw"><h2>${h(V.reviewsH2)}</h2>${REV.slice(0, 6).map(revCard).join("")}</div>
</section>

<section class="sec" id="journey" data-reveal>
  ${H2(V.journeyH2)}
  <p class="sub">${esc(V.journeyIntro)}</p>
  <ol class="steps" style="--n:${V.steps.length}">${V.steps.map((s, i) => `<li><span class="n" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span><b>${esc(s.t)}</b><span class="d">${esc(s.d)}</span></li>`).join("")}</ol>
</section>

<section class="sec" id="faq" data-reveal>
  <div class="faq-h">${H2(V.faqH2)}</div>
  <div class="faq">${V.faqs.map((f, i) => `<details${i === 0 ? " open" : ""}><summary><span class="i">${i + 1}</span><span class="q">${esc(f.q)}</span><span class="pl" aria-hidden="true">+</span></summary><p>${esc(f.a)}</p></details>`).join("")}</div>
</section>

<section class="sec" data-reveal>
  <div class="guar">
    ${H2(V.guarH2, "")}
    ${V.guarIntro ? `<p>${esc(V.guarIntro)}</p>` : ""}
    <div class="cards">${V.guar.map((g) => `<div class="gcard"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${esc(g.icon)}"/></svg><b>${esc(g.t)}</b><span>${esc(g.d)}</span></div>`).join("")}</div>
  </div>
</section>
</main>

<section class="endcta" id="book" data-reveal>
  ${pic("greenfield-clinic-lounge", T.cta.loungeAlt, "100vw")}<div class="shade" aria-hidden="true"></div>
  <div class="in">
    <p class="pill">${esc(V.cta.eyebrow)}</p>
    <h2>${h(V.cta.h2)}</h2>
    <p>${esc(V.cta.p)}</p>
    <a class="btn-w" href="${primary}" target="_blank" rel="noopener">${esc(V.cta.btn)}${dbl}</a>
    ${isVI ? `<p class="alt"><a href="${waHref}" target="_blank" rel="noopener">${esc(T.vi.waLink)}</a></p>` : ""}
  </div>
</section>

<footer class="ftr">
  <div class="pad">
    <div class="ftop">
      <h2>${h(V.foot.h2)}</h2>
      <div class="fform"><span>${esc(V.foot.hours)}</span><a href="${primary}" target="_blank" rel="noopener">${esc(V.foot.btn)}${dbl}</a></div>
    </div>
    <div class="fsep" aria-hidden="true"><span></span><i></i><span></span></div>
    <div class="fcols">
      <div><h2 class="fh">${esc(U.quick)}</h2>${["about", "expertise", "cases", "reviews", "faq"].map((id, i) => `<a href="#${id}">${esc(U.quickL[i])}</a>`).join("")}</div>
      <div><h2 class="fh">${esc(U.touch)}</h2><a href="mailto:hello@nhakhoagreenfield.com">hello@nhakhoagreenfield.com</a><a href="https://maps.google.com/?q=95+Trung+Hoa+Cau+Giay+Hanoi" target="_blank" rel="noopener">${esc(U.address)}</a><a href="tel:+84906621988">+84 906 621 988</a>${isVI ? `<a href="${ZALO}" target="_blank" rel="noopener">Zalo 0906 621 988</a>` : ""}</div>
      <div><h2 class="fh">${esc(U.social)}</h2><a href="https://www.youtube.com/@nhakhoagreenfield" target="_blank" rel="noopener">Youtube</a><a href="https://www.facebook.com/nhakhoagreenfield" target="_blank" rel="noopener">Facebook</a><a href="https://www.linkedin.com/company/greenfielddental/posts/?feedView=all" target="_blank" rel="noopener">LinkedIn</a><a href="https://www.instagram.com/greenfield_dental/" target="_blank" rel="noopener">Instagram</a><a href="${L("home")}">Website</a></div>
    </div>
    <div class="flegal"><p>${esc(U.copy)}</p>${L("privacy") ? `<a href="${L("privacy")}">${esc(T.footer.privacy)}</a>` : ""}<a href="#cookie-settings" data-gf-cookie-settings>${esc(U.cookies)}</a></div>
  </div>
</footer>
<a class="wa-float${isVI ? " zalo" : ""}" href="${primary}" target="_blank" rel="noopener" aria-label="${t(T.floatAria)}">${isVI ? ZALO_ICON : WA_ICON}</a>

<script>/* Mã click WhatsApp — CÙNG cơ chế greenfield.clinic (gf_attr_v1 + mã 6 ký tự + sendBeacon wa-attr). Token: (via doctors.greenfield.clinic #MÃ).
   ⚠ Cần thêm https://doctors.greenfield.clinic vào WA_ATTR_ORIGINS (Quotation) trước khi đăng. */
(function(){var TOKEN_HOST="doctors.greenfield.clinic",EP="https://lead.greenfield.clinic/api/public/wa-attr",AL="ABCDEFGHJKMNPQRSTVWXYZ23456789",MEM="",SENT={},A={};
var K=[["utmSource","utm_source"],["utmMedium","utm_medium"],["utmCampaign","utm_campaign"],["utmTerm","utm_term"],["utmContent","utm_content"],["gclid","gclid"],["gbraid","gbraid"],["wbraid","wbraid"],["fbclid","fbclid"]];
function adsConsent(){var c=window.gfConsent&&window.gfConsent.get();if(c)return c.marketing?"granted":"";return window.gfConsent&&window.gfConsent.eu?"":"implied";}
function readAttr(){try{var s=JSON.parse(localStorage.getItem("gf_attr_v1")||"null");return s&&s.ts&&Date.now()-s.ts<=7776e6?s:null;}catch(x){return null;}}
try{var q=new URLSearchParams(location.search),any=false,fu={};K.forEach(function(k){var v=(q.get(k[1])||"").slice(0,300);fu[k[0]]=v;if(v)any=true;});var st=readAttr();
 if(any){A=fu;try{var sv={ts:Date.now(),landing:location.pathname};for(var k in fu)sv[k]=fu[k];localStorage.setItem("gf_attr_v1",JSON.stringify(sv));}catch(x){}}else if(st){K.forEach(function(k){A[k[0]]=typeof st[k[0]]==="string"?st[k[0]]:"";});}}catch(x){}
function hasAds(){return !!(A.gclid||A.gbraid||A.wbraid||A.utmSource);}
function waCode(){if(!hasAds()||!adsConsent())return "";var st=readAttr();if(st&&/^[A-HJKMNP-TV-Z2-9]{6}$/.test(st.waCode||""))return st.waCode;if(MEM)return MEM;var r=[],c="",i;try{r=crypto.getRandomValues(new Uint8Array(6));}catch(x){for(i=0;i<6;i++)r[i]=Math.floor(Math.random()*256);}for(i=0;i<6;i++)c+=AL.charAt(r[i]%30);MEM=c;if(st){st.waCode=c;try{localStorage.setItem("gf_attr_v1",JSON.stringify(st));}catch(x){}}return c;}
function beacon(code){var cs=adsConsent();if(!code||!cs||SENT[code])return;SENT[code]=1;var st=readAttr();var b=JSON.stringify({v:1,code:code,gclid:A.gclid||"",gbraid:A.gbraid||"",wbraid:A.wbraid||"",utm_source:A.utmSource||"",utm_medium:A.utmMedium||"",utm_campaign:A.utmCampaign||"",utm_term:A.utmTerm||"",utm_content:A.utmContent||"",landing:(st&&st.landing)||location.pathname,consent:cs,doctor:"${D.key}"});
 try{if(navigator.sendBeacon&&navigator.sendBeacon(EP,new Blob([b],{type:"text/plain"})))return;}catch(x){}try{fetch(EP,{method:"POST",body:b,mode:"no-cors",keepalive:true,headers:{"Content-Type":"text/plain"}});}catch(x){}}
function fixWa(a){var u;try{u=new URL(a.href);}catch(x){return "";}if(u.hostname.replace(/^www\\./,"")!=="wa.me")return "";var t=(u.searchParams.get("text")||"").replace(/\\s*\\(via [^)]*\\)\\s*$/,"").trim();var code=waCode();t=t+" (via "+TOKEN_HOST+(code?" #"+code:"")+")";var n="https://wa.me/"+u.pathname.replace(/\\D/g,"")+"?text="+encodeURIComponent(t);if(a.href!==n)a.setAttribute("href",n);return code;}
function onWa(e){var a=e.target.closest&&e.target.closest('a[href*="wa.me"]');if(a)beacon(fixWa(a));}
document.addEventListener("click",onWa,true);document.addEventListener("auxclick",onWa,true);document.addEventListener("contextmenu",onWa,true);})();</script>

<script>/* Menu điện thoại, chọn ngôn ngữ, so sánh trước/sau, lời khen xoay vòng, hiện dần khi cuộn. */
(function(){var b=document.querySelector(".burger"),m=document.getElementById("mnav");
b.addEventListener("click",function(){var o=m.classList.toggle("open");b.setAttribute("aria-expanded",o);});
m.addEventListener("click",function(e){if(e.target.closest("a[href^='#']")){m.classList.remove("open");b.setAttribute("aria-expanded",false);}});
var dds=[].slice.call(document.querySelectorAll(".hdr details"));dds.forEach(function(d){d.addEventListener("toggle",function(){if(d.open)dds.forEach(function(o){if(o!==d)o.open=false})})});document.addEventListener("click",function(e){dds.forEach(function(d){if(d.open&&!d.contains(e.target))d.open=false})});
var C=${js(casesData)},TL=${js({ b: T.cases.beforeAlt, a: T.cases.afterAlt, n: U.caseLabel })},i=0,ba=document.getElementById("ba"),rng=ba.querySelector("input");
rng.addEventListener("input",function(){ba.style.setProperty("--pos",rng.value+"%")});
function setPic(p,d,alt){var s=p.querySelectorAll("source");s[0].srcset=d.a;s[1].srcset=d.w;var im=p.querySelector("img");im.src=d.s;im.alt=alt;}
function show(n){i=(n+C.length)%C.length;var c=C[i];setPic(document.getElementById("ba-b"),c.b,TL.b+c.t);setPic(document.getElementById("ba-a"),c.f,TL.a+c.t);
 document.getElementById("case-n").textContent=TL.n+" "+String(i+1).padStart(2,"0")+" / "+String(C.length).padStart(2,"0");document.getElementById("case-t").textContent=c.t;document.getElementById("case-d").textContent=c.d;document.getElementById("case-m").textContent=c.m;rng.value=50;ba.style.setProperty("--pos","50%");}
document.querySelector(".cnav .prev").addEventListener("click",function(){show(i-1)});document.querySelector(".cnav .next").addEventListener("click",function(){show(i+1)});
var R=${js(REV)},cards=[].slice.call(document.querySelectorAll(".fc"));
if(R.length>cards.length&&!matchMedia("(prefers-reduced-motion: reduce)").matches){var turn=0,cur=cards.length;setInterval(function(){var k=turn%cards.length,el=cards[k];turn++;el.classList.add("fade");
 setTimeout(function(){var r=R[cur%R.length];cur++;el.querySelector("blockquote").textContent=r.s;var im=el.querySelector("img");im.src="https://flagcdn.com/w80/"+r.f+".png";im.alt=r.c;el.querySelector("b").textContent=r.n;el.querySelector("small").textContent=r.c;el.classList.remove("fade");},520);},2900);}
var N=[].slice.call(document.querySelectorAll("[data-reveal]"));function on(n){n.classList.add("on")}
if(!("IntersectionObserver" in window)){N.forEach(on);}else{var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){on(e.target);io.unobserve(e.target);}})},{rootMargin:"0px 0px -12% 0px",threshold:.05});
 N.forEach(function(n){if(n.getBoundingClientRect().top<=innerHeight*.95)on(n);else io.observe(n);});addEventListener("beforeprint",function(){N.forEach(on)});
 addEventListener("hashchange",function(){N.forEach(on)});setTimeout(function(){if(location.hash)N.forEach(on)},50);}
})();</script>
</body>
</html>
`;
const out = lang === "en" ? `./dist/${D.slug}/` : `./dist/${lang}/${D.slug}/`;
mkdirSync(P(out), { recursive: true });
const page = lang === "zh" ? html.replace(/([　-鿿＀-￯]) (<em>|[　-鿿])/g, "$1$2") : html;
writeFileSync(P(`${out}index.html`), page);
console.log(lang, D.slug, (page.length / 1024).toFixed(1) + " KB");
}
