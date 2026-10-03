// Mẫu chung trang hồ sơ bác sĩ (chạy thật 03/10/2026) — khung giống greenfield.clinic, dữ liệu từ doctors/<key>.json.
//   node build-page.mjs                  → mọi bác sĩ × mọi ngôn ngữ (chạy build-images.mjs trước)
//   node build-page.mjs henry --lang=vi  → chỉ một bác sĩ / một ngôn ngữ
// Đa ngôn ngữ (03/10/2026): EN ở /dr-<slug>, VI/ES/KO/ZH ở /<lang>/dr-<slug>. Chuỗi giao diện: i18n/ui/<lang>.json;
// nội dung bác sĩ: i18n/<lang>/<key>.json (cùng cấu trúc i18n/src/<key>.json) ghép đè lên doctors/<key>.json.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { LINKS, keyOfUrl } from "./i18n/links.mjs";

const P = (rel) => fileURLToPath(new URL(rel, import.meta.url));
const ALL = Object.fromEntries(readdirSync(P("./doctors/")).filter((f) => f.endsWith(".json")).map((f) => { const d = JSON.parse(readFileSync(P(`./doctors/${f}`), "utf8")); return [d.key, d]; }));
const ORDER = ["kate", "chris", "henry", "giang", "hailey"];
export const LANGS = ["en", "vi", "es", "ko", "zh"];
const HL = { en: "en", vi: "vi", es: "es", ko: "ko", zh: "zh-Hans" };
const OGL = { en: "en_US", vi: "vi_VN", es: "es_ES", ko: "ko_KR", zh: "zh_CN" };
const CODE = { en: "EN", vi: "VI", es: "ES", ko: "KO", zh: "中文" };
const UI = {};
const ui = (l) => (UI[l] ||= JSON.parse(readFileSync(P(`./i18n/ui/${l}.json`), "utf8")));
const M = JSON.parse(readFileSync(P("./manifest.json"), "utf8"));
const FONTS_CSS = readFileSync(P("./shared/fonts.css"), "utf8").replace(/url\(fonts\//g, "url(/shared/fonts/");
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

function build(D, lang) {
const T = ui(lang);
const isVI = lang === "vi";
const L = (k) => LINKS[lang][k];
const SITE = "https://doctors.greenfield.clinic";
const URL_ = `${SITE}${pagePath(lang, D.slug)}`;
const WA_NUM = "84906621988";
const TOKEN = "(via doctors.greenfield.clinic)";
const waHref = `https://wa.me/${WA_NUM}?text=${encodeURIComponent(`${D.wa} ${TOKEN}`)}`;
const ZALO = "https://zalo.me/0906621988";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
/** Chuỗi giao diện có {short}/{name}/{n}: thoát HTML rồi mới thay biến; {n} = số đánh giá Google sống. */
const V = { short: D.short, name: D.name, nick: D.nick, jobTitle: D.jobTitle };
const t = (s) => esc(s).replace(/\{(\w+)\}/g, (m, k) => (k === "n" ? "<span data-count>264</span>" : V[k] !== undefined ? esc(V[k]) : m));
const tp = (s) => s.replace(/\{(\w+)\}/g, (m, k) => (V[k] !== undefined ? V[k] : m)); // bản thô cho thuộc tính meta (esc sau)
const js = (o) => JSON.stringify(o).replace(/</g, "\\u003c");
/** Link EN của dữ liệu bác sĩ → link cùng ngôn ngữ; null nếu web chính không có trang đó. */
const loc = (u) => (lang === "en" ? u : L(keyOfUrl(u)) || null);
// Liên hệ chính: VI = Zalo (khách trong nước), còn lại WhatsApp.
const primary = isVI ? ZALO : waHref;

const mk = (name, slug = D.slug) => (M[`${slug}/${name}`] ? `${slug}/${name}` : M[`shared/${name}`] ? `shared/${name}` : null);
function meta(name, slug) { const k = mk(name, slug); if (!k) throw new Error(`thiếu ảnh ${name} (${slug || D.slug})`); return { k, ...M[k] }; }
function dirOf(name, slug) { return "/" + meta(name, slug).k.replace(/\/[^/]+$/, "") + (meta(name, slug).k.startsWith("shared/") ? "/img" : "/img"); }
function srcset(name, fmt, slug) { const m = meta(name, slug); return m.widths.map((w) => `${dirOf(name, slug)}/${name}-${w}.${fmt} ${w}w`).join(", "); }
/** <picture> AVIF + WebP, width/height thật (theo bề rộng lớn nhất), lazy trừ ảnh đầu trang. */
function pic(name, alt, sizes, { eager = false, cls = "", id = "", slug } = {}) {
  const m = meta(name, slug); const w = Math.max(...m.widths); const h = Math.round(w * m.ratio);
  return `<picture${cls ? ` class="${cls}"` : ""}><source type="image/avif" srcset="${srcset(name, "avif", slug)}" sizes="${sizes}"><source type="image/webp" srcset="${srcset(name, "webp", slug)}" sizes="${sizes}"><img${id ? ` id="${id}"` : ""} src="${dirOf(name, slug)}/${name}-${w}.webp" alt="${esc(alt)}" width="${w}" height="${h}"${eager ? ` fetchpriority="high" decoding="async"` : ` loading="lazy" decoding="async"`}></picture>`;
}
const CICONS = ["<path d=\"M7 3h7l4 4v14H7z M14 3v4h4 M10 11h5 M10 15h5\"/>", "<path d=\"M5 4h14v16l-3-2-2 2-2-2-2 2-2-2-3 2z M9 9h6 M9 13h6\"/>", "<path d=\"M12 3 5 6v5c0 4.5 3 8.2 7 10 4-1.8 7-5.5 7-10V6z M9 12l2 2 4-4\"/>", "<path d=\"M4 8V5a1 1 0 0 1 1-1h3 M16 4h3a1 1 0 0 1 1 1v3 M20 16v3a1 1 0 0 1-1 1h-3 M8 20H5a1 1 0 0 1-1-1v-3 M8 12h8\"/>", "<path d=\"M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M3 12h18 M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z\"/>", "<path d=\"M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z\"/>"];
const cicon = (i) => `<span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${CICONS[i % CICONS.length]}</svg></span>`;
const ICON = {
  wa: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>`,
  star: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 2 3 6.9 7.5.6-5.7 4.9 1.8 7.3L12 17.8 5.4 21.7l1.8-7.3L1.5 9.5 9 8.9 12 2Z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m5 12.5 4.5 4.5L19 7.5"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6"/></svg>`,
  zalo: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5c-5 0-9 3.5-9 7.9 0 2.4 1.2 4.5 3.1 6l-.7 3.1 3.3-1.6c1 .3 2.1.4 3.3.4 5 0 9-3.5 9-7.9s-4-7.9-9-7.9Z"/><path d="M8.5 9h4.5l-4.5 5h4.5M15.8 9v5"/></svg>`,
};
const PI = isVI ? ICON.zalo : ICON.wa; // icon nút liên hệ chính

const items = (arr) => arr.filter(([, k]) => L(k)).map(([lb, k]) => `<a href="${L(k)}">${esc(lb)}</a>`).join("");
const menu = (label, arr) => `<details class="dd"><summary>${esc(label)}</summary><div class="dd-panel">${items(arr)}</div></details>`;
const MN = T.menus;
const langLinks = (cls) => LANGS.map((l) => `<a href="${pagePath(l, D.slug)}" hreflang="${HL[l]}" lang="${HL[l]}"${l === lang ? ` aria-current="page"` : ""}${cls ? ` class="${cls}"` : ""}>${CODE[l]}</a>`).join("");

const portraitM = meta(D.portrait);
const heroPreload = `<link rel="preload" as="image" type="image/avif" imagesrcset="${srcset(D.portrait, "avif")}" imagesizes="(min-width: 1024px) 440px, 200px" fetchpriority="high">`;

const jsonld = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Dentist", "@id": "https://greenfield.clinic/#clinic", name: "Greenfield Dental", url: "https://greenfield.clinic/", telephone: "+84906621988", email: "hello@nhakhoagreenfield.com",
      address: { "@type": "PostalAddress", streetAddress: "95 Trung Hoa", addressLocality: "Yen Hoa Ward, Hanoi", addressCountry: "VN" },
      openingHoursSpecification: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "08:00", closes: "18:00" } },
    { "@type": "Physician", "@id": `${URL_}#physician`, name: `${D.name} (${D.nick})`, url: URL_, image: `${SITE}${dirOf(D.portrait)}/${D.portrait}-800.webp`,
      medicalSpecialty: ALL[D.key].specialty, telephone: "+84906621988", parentOrganization: { "@id": "https://greenfield.clinic/#clinic" },
      address: { "@type": "PostalAddress", streetAddress: "95 Trung Hoa", addressLocality: "Yen Hoa Ward, Hanoi", addressCountry: "VN" } },
    { "@type": "Person", "@id": `${URL_}#person`, name: D.name, alternateName: D.nick, jobTitle: D.jobTitle, url: URL_,
      image: `${SITE}${dirOf(D.portrait)}/${D.portrait}-800.webp`,
      alumniOf: D.alumni.map((n) => ({ "@type": "CollegeOrUniversity", name: n })),
      worksFor: { "@id": "https://greenfield.clinic/#clinic" }, knowsAbout: D.specialty,
      sameAs: [L("doctors")] },
    { "@type": "ProfilePage", "@id": `${URL_}#page`, url: URL_, name: D.title, description: D.description, mainEntity: { "@id": `${URL_}#person` }, inLanguage: HL[lang] },
  ],
};

const casesData = D.cases.map((c, i) => ({ i, t: c.t, d: c.d, m: c.m,
  b: { a: srcset(`${c.img}-before`, "avif"), w: srcset(`${c.img}-before`, "webp"), s: `${dirOf(`${c.img}-before`)}/${c.img}-before-${Math.max(...meta(`${c.img}-before`).widths)}.webp` },
  f: { a: srcset(`${c.img}-after`, "avif"), w: srcset(`${c.img}-after`, "webp"), s: `${dirOf(`${c.img}-after`)}/${c.img}-after-${Math.max(...meta(`${c.img}-after`).widths)}.webp` } }));
const TEAM = T.cases.team[D.casesTeam];
const JM = D.journeyMeta; const G = JM.groups;
const counts = D.journey.reduce((o, s) => ((o[s.g] = (o[s.g] || 0) + 1), o), {});
let col = 1; const span = {}; for (const g of ["pre", "t1", "t2"]) { span[g] = `${col}/${col + (counts[g] || 0)}`; col += counts[g] || 0; }
const qm = meta(D.quote.img); const qWide = qm.ratio < 1.2;
const qW = qWide ? 420 : 310;
const others = ORDER.filter((k) => k !== D.key).map((k) => doc(k, lang));
const c0 = D.cases[0];
const CJK = { ko: "'Pretendard','Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR'", zh: "'PingFang SC','Hiragino Sans GB','Microsoft YaHei','Noto Sans SC'" }[lang];
const CJK_CSS = CJK ? `/* ${lang}: chữ CJK theo font hệ thống, phần Latin vẫn Be Vietnam Pro; tiêu đề KHÔNG dùng Cormorant (sans 600) */
:root{--sans:'Be Vietnam Pro',${CJK},system-ui,-apple-system,sans-serif;--serif:var(--sans)}
h1,h2{font-family:var(--sans);font-weight:600;line-height:1.3;letter-spacing:0}
h1 em,h2 em{font-style:normal;font-weight:600}
.eyebrow,.ftr .ft-h,.mnav .mh,.steps .tg,.trips span,.ba .tag{letter-spacing:.04em}
.quote .qt{line-height:1.45;max-width:16em}
.quote footer i,.steps .heal-cap,.steps li.heal::before{font-style:normal}${lang === "ko" ? "\nbody{word-break:keep-all;overflow-wrap:break-word}" : ""}` : "";

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
<meta name="theme-color" content="#16261E">
<link rel="icon" href="/shared/img/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="/shared/img/favicon-192.png">
<link rel="preload" href="/shared/fonts/BeVietnamPro-400-latin.woff2" as="font" type="font/woff2" crossorigin>
${lang === "ko" || lang === "zh" ? "" : `<link rel="preload" href="/shared/fonts/CormorantGaramond-600-latin.woff2" as="font" type="font/woff2" crossorigin>`}${isVI ? `\n<link rel="preload" href="/shared/fonts/BeVietnamPro-400-vietnamese.woff2" as="font" type="font/woff2" crossorigin>` : ""}
${heroPreload}
<style>
${FONTS_CSS}
:root{--moss:#16261E;--moss-2:#1F3329;--gold:#C9974A;--gold-h:#D8A85C;--gold-ink:#7E5A1E;--ivory:#F7F4EE;--paper:#FFFFFF;--ink:#16261E;--muted:#55605A;--line:#E3DED3;
--on-moss:rgba(255,255,255,.86);--on-moss-line:rgba(255,255,255,.12);--serif:'Cormorant Garamond','Cormorant',Georgia,serif;--sans:'Be Vietnam Pro',system-ui,-apple-system,'Segoe UI',sans-serif;--hdr:72px}
*,*::before,*::after{box-sizing:border-box}
html{scroll-padding-top:128px;-webkit-text-size-adjust:100%}
@media (prefers-reduced-motion:no-preference){html{scroll-behavior:smooth}}
body{margin:0;background:var(--ivory);color:var(--ink);font:400 16px/1.65 var(--sans);-webkit-font-smoothing:antialiased}
img{max-width:100%;height:auto;display:block}
a{color:inherit}
:focus-visible{outline:2px solid var(--gold);outline-offset:3px}
.wrap{max-width:1200px;margin:0 auto;padding-inline:20px}
h1,h2{font-family:var(--serif);font-weight:600;line-height:1.08;margin:0;text-wrap:balance;letter-spacing:-.005em}
h1{font-size:40px} h2{font-size:30px}
h1 em,h2 em{font-style:italic;font-weight:500;color:var(--gold-ink)}
.hero h1 em,.on-moss h2 em{color:var(--gold)}
h3{font:600 20px/1.3 var(--sans);margin:0}
p{margin:0}
.eyebrow{font:600 12px/1.2 var(--sans);letter-spacing:.13em;text-transform:uppercase;color:var(--gold-ink)}
.hero .eyebrow,.on-moss .eyebrow{color:var(--gold)}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.lead{font-size:18px;line-height:1.6}
.muted{color:var(--muted)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:48px;padding:12px 22px;border-radius:999px;font:600 16px/1.2 var(--sans);text-decoration:none;border:1px solid transparent;transition:background .2s,color .2s,border-color .2s}
.btn svg{width:20px;height:20px;flex:none}
.btn-gold{background:var(--gold);color:var(--moss)} .btn-gold:hover{background:var(--gold-h)}
.btn-ghost{border-color:currentColor;color:inherit} .btn-ghost:hover{background:rgba(201,151,74,.12)}

/* header — khung giống greenfield.clinic */
.hdr{position:sticky;top:0;z-index:50;background:var(--moss);color:var(--on-moss);border-bottom:1px solid var(--on-moss-line)}
.hdr .wrap{display:flex;align-items:center;gap:20px;min-height:var(--hdr)}
.logo{display:flex;align-items:center;min-height:48px} .logo img{width:66px;height:auto}
.nav{display:none;align-items:center;gap:4px;margin-left:12px}
.nav>a,.dd>summary{display:flex;align-items:center;min-height:44px;padding:0 12px;font:500 14px/1 var(--sans);color:#fff;text-decoration:none;cursor:pointer;list-style:none;border-radius:8px}
.dd>summary::-webkit-details-marker{display:none}
.dd>summary::after{content:"";width:6px;height:6px;margin-left:8px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:rotate(45deg) translateY(-2px)}
.nav>a:hover,.dd>summary:hover{color:var(--gold)}
.dd{position:relative}
.dd-panel{position:absolute;top:100%;left:0;min-width:240px;background:var(--moss);border:1px solid var(--on-moss-line);border-radius:12px;padding:8px;display:grid;box-shadow:0 18px 40px rgba(0,0,0,.25)}
.dd-panel a{display:flex;align-items:center;min-height:44px;padding:0 12px;border-radius:8px;color:var(--on-moss);text-decoration:none;font-size:14px}
.dd-panel a:hover{background:var(--moss-2);color:#fff}
.hdr-right{margin-left:auto;display:flex;align-items:center;gap:16px}
.rating{display:none;align-items:center;gap:8px;color:#fff;text-decoration:none;font-size:14px;line-height:1.2;min-height:44px}
.rating svg{width:16px;height:16px;color:var(--gold)} .rating b{font-weight:600} .rating small{display:block;font-size:14px;color:var(--on-moss)}
.hdr .btn{min-height:44px;padding:10px 18px;font-size:14px}
.burger{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border:1px solid var(--on-moss-line);border-radius:10px;background:transparent;color:#fff;cursor:pointer}
.burger span,.burger span::before,.burger span::after{display:block;width:18px;height:1.5px;background:currentColor;position:relative;content:""}
.burger span::before{position:absolute;top:-6px} .burger span::after{position:absolute;top:6px}
.mnav{display:none;background:var(--moss);border-top:1px solid var(--on-moss-line);padding:8px 20px 20px;max-height:calc(100dvh - var(--hdr));overflow:auto}
.mnav.open{display:block}
.mnav .mh{font:600 12px/1 var(--sans);letter-spacing:.13em;text-transform:uppercase;color:var(--gold);margin:18px 0 6px}
.mnav a{display:flex;align-items:center;min-height:44px;color:var(--on-moss);text-decoration:none;font-size:16px;border-bottom:1px solid var(--on-moss-line)}
.hdr .btn-cta-sm{display:none}

/* thanh mục trong trang */
.subnav{position:sticky;top:var(--hdr);z-index:40;background:rgba(247,244,238,.96);backdrop-filter:saturate(1.2) blur(6px);border-bottom:1px solid var(--line)}
.subnav .wrap{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none}
.subnav .wrap::-webkit-scrollbar{display:none}
.subnav a{flex:none;display:flex;align-items:center;min-height:48px;padding:0 14px;font:500 14px/1 var(--sans);text-decoration:none;color:var(--muted)}
.subnav a:hover{color:var(--ink)} .subnav b{font-weight:600;color:var(--ink)}

/* hero */
.hero{background:var(--moss);color:#fff;overflow:hidden}
.hero .wrap{display:grid;gap:8px;padding-block:16px 36px}
.hero-photo{position:relative;justify-self:center;width:100%;max-width:200px;aspect-ratio:${(1 / portraitM.ratio).toFixed(4)};border-radius:20px 20px 0 0;background:radial-gradient(120% 80% at 50% 100%,#2C4637 0%,var(--moss) 70%)}
.hero-photo img{width:100%;height:100%;object-fit:contain;object-position:bottom}
.hero-badge{position:absolute;left:-40px;bottom:14px;background:var(--paper);color:var(--ink);border-radius:12px;padding:8px 14px;display:flex;gap:10px;align-items:center;box-shadow:0 10px 30px rgba(0,0,0,.25)}
.hero-badge b{font:600 30px/1 var(--serif);color:var(--moss)} .hero-badge span{font-size:14px;line-height:1.25}
.hero-text{display:grid;gap:16px}
.hero h1{color:#fff} .hero h1 em{display:block}
.hero .lead{color:var(--on-moss)}
.chips{display:flex;flex-wrap:wrap;gap:8px;list-style:none;margin:0;padding:0}
.chips li{display:flex;align-items:center;gap:8px;border:1px solid var(--on-moss-line);border-radius:999px;padding:8px 14px;font-size:14px;color:var(--on-moss)}
.chips svg{width:16px;height:16px;color:var(--gold)}
.hero .ctas{display:flex;flex-wrap:wrap;gap:12px}
.hero .btn-ghost{color:#fff;border-color:rgba(255,255,255,.35)}

/* số liệu */
.stats{background:var(--paper);border-bottom:1px solid var(--line)}
.stats .wrap{display:grid;grid-template-columns:1fr 1fr;gap:0;padding-block:8px}
.stat{padding:20px 12px;border-bottom:1px solid var(--line)}
.stat b{display:block;font:600 40px/1 var(--serif);color:var(--moss)}
.stat span{display:block;margin-top:6px;font-size:14px;color:var(--muted)}

section.block{padding-block:48px}
.sec-head{display:grid;gap:10px;margin-bottom:28px;max-width:720px}
.grid-2{display:grid;gap:28px;align-items:center}
.about-img{border-radius:20px;overflow:hidden}
.about-img img{width:100%;aspect-ratio:4/3;object-fit:cover}
.creds{list-style:none;margin:20px 0 0;padding:0;display:grid;gap:12px}
.creds li{display:flex;gap:12px;align-items:flex-start;background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:14px 16px}
.creds svg{width:20px;height:20px;color:var(--gold);flex:none;margin-top:2px}
.creds b{display:block;font-weight:600} .creds span{font-size:14px;color:var(--muted)}
.prose{display:grid;gap:14px}

.cards{display:grid;gap:16px}
.card{position:relative;display:flex;flex-direction:column;justify-content:space-between;gap:16px;min-height:0;background:var(--paper);border:1px solid var(--line);border-radius:16px;padding:22px;text-decoration:none;overflow:hidden}
a.card:hover{border-color:var(--gold)}
.card p{font-size:14px;color:var(--muted)}
.card .go{display:inline-flex;align-items:center;gap:8px;font:600 14px/1 var(--sans);color:var(--moss)} .card .go svg{width:18px;height:18px}
.card.media{color:#fff;border:0;min-height:220px;background:var(--moss)}
.card.media picture{position:absolute;inset:0} .card.media img{width:100%;height:100%;object-fit:cover;opacity:.75}
.card.media::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(22,38,30,.7) 0%,rgba(22,38,30,.1) 45%,rgba(22,38,30,.85) 100%)}
.card.media>div,.card.media .go{position:relative;z-index:1} .card.media p{color:var(--on-moss)} .card.media .go{color:var(--gold-h)}
.card.advice{background:var(--moss);color:#fff;border:0} .card.advice p{color:var(--on-moss)}

.quote{position:relative;background:#E4E7E6;color:var(--ink);overflow:hidden}
.quote .wrap{display:grid;gap:16px;padding-block:24px 0}
.quote picture{order:1;justify-self:center;align-self:end;display:block;width:min(var(--qwm,260px),80vw)}
.quote picture img{width:100%;height:auto;object-fit:contain;object-position:bottom}
.quote .qbox{position:relative;padding:44px 8px 8px}
.quote .qm{position:absolute;width:56px;height:auto;color:#C3C8C6}
.quote .qm.o{left:-4px;top:0} .quote .qm.c{right:-4px;bottom:0}
.quote blockquote{margin:0;position:relative}
.quote .qt{font:400 30px/1.25 var(--sans);letter-spacing:-.01em;color:var(--ink);text-wrap:balance;max-width:20ch}
.quote footer{margin-top:20px} .quote footer b{display:block;font-size:18px;font-weight:600;color:var(--ink)} .quote footer i{display:block;margin-top:4px;font-size:16px;color:var(--muted)}

.certs{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(220px,72%);gap:16px;list-style:none;margin:0;padding:0 0 8px;overflow-x:auto;scroll-snap-type:x mandatory;overscroll-behavior-x:contain}
.certs li{scroll-snap-align:start;background:var(--paper);border:1px solid var(--line);border-radius:14px;overflow:hidden;display:flex;flex-direction:column}
.certs picture{display:block;height:120px;padding:16px;background:#fff;border-bottom:1px solid var(--line);flex:none}
.certs img{width:100%;height:100%;object-fit:contain}
.certs div{padding:16px;display:grid;gap:4px;align-content:start} .certs b{display:block;font-size:16px;font-weight:600;line-height:1.35} .certs span{display:block;font-size:14px;color:var(--muted);line-height:1.45}
/* 1–2 mục: thẻ ngang gọn (ảnh trái, chữ phải), không kéo giãn hết bề ngang (03/10/2026). */
.certs.few{grid-auto-flow:row;grid-auto-columns:auto;grid-template-columns:1fr;overflow:visible;padding:0;max-width:560px}
.certs.few li{flex-direction:row;align-items:center}
.certs.few picture{width:160px;height:104px;padding:0;border-bottom:0;border-right:1px solid var(--line)}
.certs.few img{object-fit:cover}
.certs.few div{padding:16px 20px}

.case{display:grid;gap:24px;align-items:center}
.ba{position:relative;border-radius:18px;overflow:hidden;background:#ddd;aspect-ratio:1/1;touch-action:pan-y}
.ba picture,.ba img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.ba .after{clip-path:inset(0 0 0 var(--pos,50%))}
.ba .line{position:absolute;top:0;bottom:0;left:var(--pos,50%);width:2px;margin-left:-1px;background:#fff;pointer-events:none}
.ba .knob{position:absolute;top:50%;left:var(--pos,50%);width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:#fff;box-shadow:0 4px 14px rgba(0,0,0,.25);display:grid;place-items:center;pointer-events:none;color:var(--moss);font:600 14px/1 var(--sans)}
.ba input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:ew-resize;margin:0}
.ba .tag{position:absolute;top:12px;font:600 12px/1 var(--sans);letter-spacing:.1em;text-transform:uppercase;background:rgba(22,38,30,.8);color:#fff;border-radius:999px;padding:7px 12px;pointer-events:none}
.ba .tag.b{left:12px} .ba .tag.a{right:12px;background:var(--gold);color:var(--moss)}
.case-info{display:grid;gap:12px}
.case-nav{display:flex;align-items:center;gap:12px;margin-top:8px}
.case-nav button{width:48px;height:48px;border-radius:50%;border:1px solid var(--line);background:var(--paper);color:var(--moss);cursor:pointer;display:grid;place-items:center}
.case-nav button svg{width:20px;height:20px} .case-nav .prev svg{transform:rotate(180deg)}
.case-nav span{font-size:14px;color:var(--muted);font-variant-numeric:tabular-nums}
.case-meta{font-size:14px;color:var(--muted)}

.reviews{background:var(--paper);border-block:1px solid var(--line)}
.rv-box{display:grid;gap:16px;align-items:center}
.rv-box>p{max-width:520px}
.rv-score{display:flex;align-items:center;gap:16px}
.rv-score b{font:600 56px/1 var(--serif);color:var(--moss)}
.rv-score .stars{display:flex;color:var(--gold)} .rv-score .stars svg{width:20px;height:20px}
.rv-score span{display:block;font-size:14px;color:var(--muted)} .rv-score span [data-count]{display:inline}
.rv-links{display:flex;flex-wrap:wrap;gap:12px}
.reviews .btn-ghost{color:var(--moss)}

/* Hành trình: dọc (< 1024px) — vạch trái, nhãn chuyến chèn trước bước đầu mỗi nhóm; đoạn 06→07 nét đứt (thời gian lành thương). */
.steps{list-style:none;margin:0;padding:0;display:grid;align-items:start}
.steps li{position:relative;display:grid;grid-template-columns:44px 1fr;column-gap:16px;padding-bottom:24px}
.steps li:last-child{padding-bottom:0}
.steps .dot{position:relative;z-index:1;grid-row:2;display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:var(--moss);color:var(--gold);font:600 14px/1 var(--sans)}
.steps li>div{grid-row:2;padding-top:10px}
.steps .tg{grid-column:2;grid-row:1;margin:8px 0 12px;font:600 12px/1.3 var(--sans);letter-spacing:.13em;text-transform:uppercase;color:var(--gold-ink)}
.steps li:first-child .tg{margin-top:0}
.steps li::after{content:"";position:absolute;left:21.5px;top:0;bottom:0;width:0;border-left:1px solid rgba(201,151,74,.6)}
.steps li:first-child::after{top:56px}
.steps li:last-child::after{bottom:auto;height:56px}
.steps li.heal::after,.steps li.heal+li::after{border-left-style:dashed}
.steps .heal-cap{display:block;margin-top:10px;font:500 14px/1.3 var(--sans);font-style:italic;color:var(--gold-ink)}
.steps b{display:block;font-size:16px;font-weight:600;line-height:1.35} .steps li>div>span{display:block;margin-top:4px;font-size:14px;line-height:1.55;color:var(--muted)}
.trips{display:none}

.faq{display:grid;gap:12px;max-width:860px}
.faq details{background:var(--paper);border:1px solid var(--line);border-radius:14px}
.faq summary{display:flex;justify-content:space-between;gap:16px;align-items:center;min-height:56px;padding:14px 20px;font-weight:600;cursor:pointer;list-style:none}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;border:1px solid var(--line);color:var(--moss);font-weight:400}
.faq details[open] summary::after{content:"−"}
.faq details p{padding:0 20px 18px;color:var(--muted)}

.commit{display:grid;gap:16px;list-style:none;margin:0;padding:0;width:100%}
.commit li{display:grid;grid-template-columns:44px 1fr;gap:16px;align-items:start;background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:20px}
.commit .ic{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;border:1px solid rgba(201,151,74,.45);color:var(--gold-ink)}
.commit .ic svg{width:22px;height:22px}
.commit b{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-weight:600;line-height:1.35} .commit p{margin-top:4px;font-size:14px;line-height:1.55;color:var(--muted)}

/* Bác sĩ khác: thẻ dọc như thẻ bác sĩ greenfield.clinic — khung ảnh chữ nhật nền sáng, ảnh tách nền hiện đầu→ngực
   (object-fit cover, bám trên), rồi tên / chức danh / "View profile". Không cắt tròn (03/10/2026, owner). */
.odocs{list-style:none;margin:0;padding:0;display:grid;gap:16px;align-items:stretch}
.odocs li{display:flex}
.odocs a{flex:1;display:flex;flex-direction:column;background:var(--paper);border:1px solid var(--line);border-radius:16px;overflow:hidden;text-decoration:none;color:inherit;transition:border-color .2s,transform .2s}
.odocs a:hover,.odocs a:focus-visible{border-color:var(--gold);transform:translateY(-2px)}
.odocs picture{display:block;height:240px;background:linear-gradient(180deg,#EEF1EF 0%,#E2E7E4 100%);overflow:hidden}
.odocs img{display:block;width:100%;height:100%;object-fit:cover;object-position:50% 0;padding-top:16px}
.odocs span{flex:1;display:flex;flex-direction:column;gap:4px;padding:16px 18px 18px}
.odocs b{font-size:18px;font-weight:600;line-height:1.3} .odocs small{font-size:14px;line-height:1.45;color:var(--muted)}
.odocs .go{margin-top:auto;padding-top:12px;display:inline-flex;align-items:center;gap:6px;font-size:14px;font-weight:600;font-style:normal;color:var(--gold-ink,#8A6A2F)}
.odocs .go svg{width:16px;height:16px}
@media (prefers-reduced-motion:reduce){.odocs a{transition:none}.odocs a:hover{transform:none}}
@media (max-width:639px){.odocs{grid-template-columns:1fr 1fr;gap:12px}.odocs picture{height:170px}.odocs span{padding:12px 12px 14px}.odocs b{font-size:16px}}
/* Khối đặt lịch cuối trang = THẺ bo góc trong nền kem (không tràn mép) → nền kem quanh thẻ có chủ đích, không còn dải kem lẻ trước footer (03/10/2026). */
.cta{position:relative;color:#fff;background:var(--moss);overflow:hidden;width:min(1200px,calc(100% - 32px));margin:0 auto 72px;border-radius:24px}
@media (max-width:639px){.cta{width:calc(100% - 24px);border-radius:18px;margin-bottom:48px}}
.cta picture{position:absolute;inset:0} .cta picture img{width:100%;height:100%;object-fit:cover;opacity:.28}
.cta .wrap{position:relative;display:grid;gap:18px;padding-block:72px}
.cta p{color:var(--on-moss);max-width:620px}
.cta .ctas{display:flex;flex-wrap:wrap;gap:12px}
.cta .hours{font-size:14px;color:var(--on-moss)}
.related{display:flex;flex-wrap:wrap;gap:10px;margin-top:6px}
.related a{display:inline-flex;align-items:center;min-height:44px;padding:0 16px;border:1px solid var(--on-moss-line);border-radius:999px;color:#fff;text-decoration:none;font-size:14px}
.related a:hover{border-color:var(--gold);color:var(--gold)}

/* footer — giống greenfield.clinic */
.ftr{background:var(--moss);color:var(--on-moss);border-top:1px solid var(--on-moss-line)}
.ftr .cols{display:grid;gap:32px;padding-block:56px 32px}
.ftr .brand img{width:76px;height:auto} .ftr .brand p{margin-top:16px;font-size:14px;max-width:280px}
.social{display:flex;gap:10px;margin-top:16px}
.social a{width:44px;height:44px;border-radius:50%;border:1px solid var(--on-moss-line);display:grid;place-items:center;color:#fff;text-decoration:none}
.social svg{width:20px;height:20px}
.social a:hover{border-color:var(--gold);color:var(--gold)}
.ftr .ft-h{font:600 12px/1 var(--sans);letter-spacing:.13em;text-transform:uppercase;color:var(--gold);margin:0 0 12px}
.ftr ul{list-style:none;margin:0;padding:0;display:grid}
.ftr li a{display:flex;align-items:center;min-height:44px;color:var(--on-moss);text-decoration:none;font-size:14px}
.ftr li a:hover{color:#fff}
.visit li{display:flex;gap:10px;align-items:center;min-height:44px;font-size:14px}
.visit a{color:var(--on-moss);text-decoration:none}
.ftr .btn{margin-top:12px}
.legal{border-top:1px solid var(--on-moss-line);padding-block:18px 96px;display:flex;flex-wrap:wrap;gap:8px 20px;align-items:center;font-size:14px}
.legal a{display:inline-flex;align-items:center;min-height:44px;color:var(--on-moss);text-decoration:none} .legal a:hover{color:#fff}
.legal .sp{flex:1 1 auto}

.wa-float{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:60;width:56px;height:56px;border-radius:50%;background:#25D366;color:#fff;display:grid;place-items:center;box-shadow:0 10px 24px rgba(0,0,0,.25)}
.wa-float svg{width:30px;height:30px}
.wa-float.zalo{background:#0068FF}
.wa-small{font-size:14px;color:var(--on-moss)} .wa-small a{color:var(--on-moss);text-underline-offset:3px}

/* Chọn ngôn ngữ: menu thả (< 1280px), hàng chữ EN · VI · ES · KO · 中文 (≥ 1280px) */
.lang-dd>summary{padding:0 10px;gap:6px}
.lang-dd>summary svg{width:18px;height:18px}
.lang-dd .dd-panel{left:auto;right:0;min-width:120px}
.lang-dd .dd-panel a[aria-current],.lang-row a[aria-current]{color:var(--gold)}
.lang-row{display:none;align-items:center}
.lang-row a{display:flex;align-items:center;min-height:44px;padding:0 6px;font:500 14px/1 var(--sans);color:var(--on-moss);text-decoration:none}
.lang-row a:hover{color:#fff}
.lang-row a+a::before{content:"·";margin-right:6px;color:var(--on-moss-line)}
.mnav .mlang{display:flex;flex-wrap:wrap;gap:4px 16px}
.mnav .mlang a{border-bottom:0}
.mnav .mlang a[aria-current]{color:var(--gold)}

@media (min-width:640px){
  .stats .wrap{grid-template-columns:repeat(var(--n,4),1fr)} .stat{border-bottom:0;border-right:1px solid var(--line);padding:24px 20px} .stat:last-child{border-right:0}
  .certs{grid-auto-columns:minmax(220px,34%)} .certs.few{grid-auto-columns:auto}
  .quote picture{width:var(--qwt,300px)}
  .quote .qbox{justify-self:center;width:100%;max-width:600px;padding:48px 12px 8px}
  .quote .qm{width:72px}
  .cards{grid-template-columns:1fr 1fr} .commit{grid-template-columns:1fr 1fr} .odocs{grid-template-columns:1fr 1fr} .ftr .cols{grid-template-columns:1fr 1fr}
}
@media (min-width:1024px){
  h1{font-size:56px} h2{font-size:40px}
  .nav{display:flex} .rating{display:flex} .burger{display:none} .hdr .btn-cta-sm{display:inline-flex}
  .hero .wrap{grid-template-columns:1.15fr .85fr;align-items:center;gap:40px;padding-block:32px 0}
  .hero-text{order:1;padding-bottom:40px}
  /* Ảnh vừa màn đầu (1440×784, 1280×720): cao tối đa 540px hoặc chiều cao màn trừ header + thanh mục */
  .hero-photo{order:2;align-self:end;max-width:none;width:auto;height:min(540px,calc(100vh - 210px));min-height:400px}
  .grid-2{grid-template-columns:1fr 1fr;gap:56px}
  section.block{padding-block:88px}
  .cards{grid-template-columns:repeat(3,1fr)} .card{min-height:200px} .card.media{min-height:260px}
  .quote .wrap{grid-template-columns:34% 1fr;align-items:center;gap:56px;min-height:500px;padding-block:40px 0}
  .quote picture{order:-1;width:var(--qw,310px);max-width:100%;justify-self:center}
  .quote .qbox{justify-self:start;padding:56px 24px 96px;max-width:720px}
  .quote .qm{width:96px}
  .quote .qt{max-width:28ch}
  .case{grid-template-columns:1.1fr .9fr;gap:56px}
  .rv-box{grid-template-columns:auto 1fr auto;gap:40px}
  .commit{grid-template-columns:repeat(3,1fr)} .odocs{grid-template-columns:repeat(4,1fr)}
  .certs{grid-auto-flow:row;grid-auto-columns:auto;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));overflow:visible;padding:0} .certs.few{grid-template-columns:repeat(2,minmax(0,1fr));max-width:1120px} .certs.few:has(li:only-child){grid-template-columns:1fr;max-width:560px}
  .ftr .cols{grid-template-columns:1.2fr 1fr 1fr 1.2fr}
  .legal{padding-bottom:24px}
  .wa-float{display:none}
}
.hdr .btn,.rating small{white-space:nowrap}
/* 1024–1279px: menu + chọn ngôn ngữ + nút đặt lịch đã kín chỗ → ẩn khối đánh giá Google (vẫn có ở mục Đánh giá) */
@media (min-width:1024px) and (max-width:1279px){.hdr .rating{display:none}}
@media (min-width:1280px){.lang-dd{display:none}.lang-row{display:flex}}
@media (min-width:1200px){
  /* Desktop: một hàng 7 bước, vạch nối liền 01→07, nhóm chuyến ở trên */
  .trips{display:grid;grid-template-columns:repeat(7,1fr);column-gap:20px;margin-bottom:14px;align-items:end}
  .trips span{font:600 12px/1.3 var(--sans);letter-spacing:.13em;text-transform:uppercase;color:var(--gold-ink);padding-bottom:8px;border-bottom:1px solid rgba(201,151,74,.6)}
  .steps{grid-template-columns:repeat(7,1fr);column-gap:20px}
  .steps li{grid-template-columns:1fr;row-gap:16px;padding-bottom:0}
  .steps .tg,.steps .heal-cap{display:none}
  .steps .dot,.steps li>div{grid-row:auto}
  .steps li>div{padding-top:0}
  .steps li::after{left:52px;right:-20px;top:21.5px;bottom:auto;width:auto;border-left:0;border-top:1px solid rgba(201,151,74,.6)}
  .steps li:first-child::after{top:21.5px} .steps li:last-child::after{display:none}
  .steps li.heal+li::after{border-top-style:solid} .steps li.heal::after{border-top-style:dashed}
  .steps li.heal::before{content:attr(data-gap);position:absolute;top:0;left:56px;right:-16px;text-align:center;font:italic 500 12px/1 var(--sans);color:var(--gold-ink)}
}
@media (min-width:1280px){.quote .qt{font-size:40px}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
${CJK_CSS}
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
<style>#gf-cc{position:fixed;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:100;max-width:420px;background:#14201a;color:#EDE8DE;border:1px solid rgba(201,151,74,.45);border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,.3);padding:14px 16px;font:14px/1.5 var(--sans)}
#gf-cc p{margin:0}#gf-cc a{color:var(--gold)}#gf-cc b.t{color:#fff;font-weight:600}
#gf-cc label{display:flex;gap:10px;align-items:center;min-height:44px;border-top:1px solid rgba(237,232,222,.12)}
#gf-cc .row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:10px}#gf-cc button{min-height:44px;border-radius:999px;border:1px solid var(--gold);background:transparent;color:#EDE8DE;font:600 14px/1 var(--sans);cursor:pointer;padding:0 16px}#gf-cc button.pri{background:var(--gold);color:var(--moss)}#gf-cc button.lk{border:0;padding:0 8px;text-decoration:underline;color:#EDE8DE}
@media (min-width:1024px){#gf-cc{right:auto}}</style>
<script>/* GTM tải sau thao tác đầu tiên / 3s sau load — y như greenfield.clinic (gf-gtm-deferred); kèm doctor trong sự kiện click. */
(function(){var done=false,ev=["keydown","mousedown","mousemove","touchstart","wheel","scroll"];function load(){if(done)return;done=true;ev.forEach(function(e){removeEventListener(e,load,{passive:true})});(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-ND5D4BL3');}
window.gfLoadGTM=load;ev.forEach(function(e){addEventListener(e,load,{passive:true})});
document.addEventListener("click",function(e){try{var a=e.target.closest&&e.target.closest("a[href]");if(!a)return;var u=a.href||"";if(!/wa\\.me|whatsapp\\.com|zalo\\.me|^tel:|^mailto:/i.test(u))return;
 var loc=a.closest(".hdr,.mnav")?"header":a.closest(".ftr")?"footer":a.closest(".wa-float")?"floating":a.closest(".hero")?"hero":a.closest(".cta")?"end_cta":"content";
 var t=String(a.innerText||a.getAttribute("aria-label")||"").replace(/\\s+/g," ").trim().slice(0,100);
 window.dataLayer.push({event:"gf_doctor_contact",doctor:"${D.key}",contact_method:/wa\\.me|whatsapp/i.test(u)?"whatsapp":/zalo\\.me/i.test(u)?"zalo":/^tel:/i.test(u)?"call":"email",cta_location:loc,page_lang:"${lang}"});
 var gtm=window.google_tag_manager;if(gtm){for(var k in gtm){if(k.indexOf("GTM-")===0)return;}}
 window.dataLayer.push({event:"gf_contact_click_pre",gf_link_url:u,gf_cta_location:loc,gf_cta_text:t||"unknown",doctor:"${D.key}",page_lang:"${lang}"});load();}catch(x){}},true);
if(document.readyState==="complete"){setTimeout(load,3000)}else{addEventListener("load",function(){setTimeout(load,3000)})}})();</script>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body>
<header class="hdr">
  <div class="wrap">
    <a class="logo" href="${L("home")}" aria-label="${esc(T.logoAria)}"><img src="/shared/img/greenfield-logo-white-160.webp" alt="Greenfield Dental" width="160" height="118"></a>
    <nav class="nav" aria-label="${esc(T.navAria)}">
      ${menu(T.nav.services, MN.services)}${menu(T.nav.results, MN.results)}${menu(T.nav.about, MN.about)}<a href="${L("contact")}">${esc(T.nav.contact)}</a>
    </nav>
    <div class="hdr-right">
      <details class="dd lang-dd"><summary aria-label="${esc(T.langAria)}: ${esc(T.langName)}"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z"/></svg>${CODE[lang]}</summary><div class="dd-panel">${langLinks()}</div></details>
      <nav class="lang-row" aria-label="${esc(T.langAria)}">${langLinks()}</nav>
      <a class="rating" href="https://g.co/kgs/FmAkkx3" rel="noopener">${ICON.star}<span><b data-rating>5.0</b><small>${t(T.ratingSmall)}</small></span></a>
      <a class="btn btn-gold btn-cta-sm" href="${L("contact")}">${esc(T.freeConsult)}</a>
      <button class="burger" type="button" aria-expanded="false" aria-controls="mnav" aria-label="${esc(T.openMenu)}"><span></span></button>
    </div>
  </div>
  <div class="mnav" id="mnav">
    <p class="mh">${esc(T.nav.services)}</p>${items(MN.services.slice(0, MN.mobileServices))}
    <p class="mh">${esc(T.nav.results)}</p>${items(MN.results)}
    <p class="mh">${esc(T.nav.about)}</p>${items(MN.about.slice(0, MN.mobileAbout))}<a href="${L("contact")}">${esc(T.nav.contact)}</a>
    <p class="mh">${esc(T.langAria)}</p><div class="mlang">${langLinks()}</div>
    <p style="margin-top:20px"><a class="btn btn-gold" style="border:0;justify-content:center" href="${primary}">${PI}${esc(T.freeConsult)}</a></p>
  </div>
</header>
<nav class="subnav" aria-label="${esc(T.subnavAria)}"><div class="wrap"><a href="#top"><b>${esc(D.short)}</b></a><a href="#about">${esc(T.subnav.about)}</a><a href="#expertise">${esc(T.subnav.expertise)}</a><a href="#cases">${esc(T.subnav.cases)}</a><a href="#reviews">${esc(T.subnav.reviews)}</a><a href="#journey">${esc(T.subnav.journey)}</a><a href="#faq">${esc(T.subnav.faq)}</a></div></nav>

<main id="top">
<section class="hero">
  <div class="wrap">
    <div class="hero-photo">${pic(D.portrait, D.portraitAlt, "(min-width: 1024px) 440px, 200px", { eager: true })}${D.badge ? `<div class="hero-badge"><b>${esc(D.badge.n)}</b><span>${D.badge.l}</span></div>` : ""}</div>
    <div class="hero-text">
      <p class="eyebrow">${esc(D.eyebrow)}</p>
      <h1>${esc(D.name)} <em>${esc(D.nick)}</em></h1>
      <p class="lead">${esc(D.lead)}</p>
      <ul class="chips">${D.chips.map((c) => `<li>${ICON.check}${esc(c)}</li>`).join("")}</ul>
      <div class="ctas"><a class="btn btn-gold" href="${primary}">${PI}${t(isVI ? T.vi.zaloCta : T.heroCta)}</a><a class="btn btn-ghost" href="#cases">${esc(T.viewCases)}</a></div>
    </div>
  </div>
</section>

<div class="stats"><div class="wrap" style="--n:${D.stats.length}">${D.stats.map((x) => `<div class="stat"><b>${esc(x.n)}</b><span>${esc(x.l)}</span></div>`).join("")}</div></div>

<section class="block" id="about">
  <div class="wrap grid-2">
    <div class="about-img">${pic(D.about.img, D.about.imgAlt, "(min-width: 1024px) 560px, 100vw")}</div>
    <div class="prose">
      <p class="eyebrow">${esc(D.about.eyebrow)}</p>
      <h2>${esc(D.about.h2)} <em>${esc(D.about.h2em)}</em></h2>
      ${D.about.p.map((p) => `<p>${esc(p)}</p>`).join("")}
      <ul class="creds">${D.about.creds.map((c) => `<li>${ICON.check}<div><b>${esc(c.t)}</b><span>${esc(c.s)}</span></div></li>`).join("")}</ul>
    </div>
  </div>
</section>

<section class="block" id="expertise" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head"><p class="eyebrow">${esc(T.expertise.eyebrow)}</p><h2>${t(T.expertise.h2)} <em>${t(T.expertise.h2em)}</em></h2></div>
    <div class="cards">
      ${D.expertise.map((x) => { const link = x.link && loc(x.link); const inner = `<div><h3>${esc(x.t)}</h3><p style="margin-top:8px">${esc(x.s)}</p></div>${link ? `<span class="go">${esc(T.expertise.learnMore)} ${ICON.arrow}</span>` : ""}`;
        const media = x.img ? pic(x.img, x.imgAlt, "(min-width: 1024px) 380px, 100vw") : "";
        return link ? `<a class="card${x.img ? " media" : ""}" href="${link}">${media}${inner}</a>` : `<div class="card${x.img ? " media" : ""}">${media}${inner}</div>`; }).join("\n      ")}
      <div class="card advice"><div><h3>${t(T.expertise.adviceH)}</h3><p style="margin-top:8px">${t(T.expertise.adviceP)}</p></div><a class="btn btn-gold" href="${primary}">${PI}${esc(T.expertise.adviceBtn)}</a></div>
    </div>
  </div>
</section>

<section class="quote" aria-label="${t(T.quoteAria)}" style="--qw:${qW}px;--qwt:${qWide ? 380 : 300}px;--qwm:${qWide ? 340 : 260}px">
  <div class="wrap">
    ${pic(D.quote.img, tp(T.quoteAlt), `(min-width: 640px) ${qW}px, ${qWide ? 340 : 260}px`)}
    <div class="qbox"><svg class="qm o" viewBox="0 0 64 52" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" d="M4 48V30C4 15 11 6 25 3l2 6c-8 3-12 8-12 15h10v24zM36 48V30c0-15 7-24 21-27l2 6c-8 3-12 8-12 15h10v24z"/></svg>
      <blockquote><p class="qt">${esc(D.quote.text)} ${esc(D.quote.em)}</p><footer><b>${esc(D.quote.by)}</b><i>${esc(D.quote.role)}</i></footer></blockquote><svg class="qm c" viewBox="0 0 64 52" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" d="M60 4v18c0 15-7 24-21 27l-2-6c8-3 12-8 12-15H39V4zM28 4v18c0 15-7 24-21 27l-2-6c8-3 12-8 12-15H7V4z"/></svg>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <div class="sec-head"><p class="eyebrow">${esc(T.certs.eyebrow)}</p><h2>${D.certs.length <= 2 ? esc(T.certs.edu) : `${esc(T.certs.h2)} <em>${esc(T.certs.h2em)}</em>`}</h2></div>
    <ul class="certs${D.certs.length <= 2 ? " few" : ""}">${D.certs.map((c) => `<li>${pic(c.img, c.t, "240px")}<div><b>${esc(c.t)}</b><span>${esc(c.s)}</span></div></li>`).join("")}</ul>
  </div>
</section>

<section class="block" id="cases" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head"><p class="eyebrow">${esc(T.cases.eyebrow)}</p><h2>${esc(T.cases.h2)} <em>${esc(TEAM)}</em></h2><p class="muted">${esc(T.cases.intro)}</p></div>
    <div class="case">
      <div class="ba" id="ba" style="--pos:50%">
        <picture id="ba-b"><source type="image/avif" srcset="${casesData[0].b.a}" sizes="(min-width: 1024px) 620px, 100vw"><source type="image/webp" srcset="${casesData[0].b.w}" sizes="(min-width: 1024px) 620px, 100vw"><img src="${casesData[0].b.s}" alt="${esc(T.cases.beforeAlt + c0.t)}" width="${Math.max(...meta(`${c0.img}-before`).widths)}" height="${Math.max(...meta(`${c0.img}-before`).widths)}" loading="lazy" decoding="async"></picture>
        <picture class="after" id="ba-a"><source type="image/avif" srcset="${casesData[0].f.a}" sizes="(min-width: 1024px) 620px, 100vw"><source type="image/webp" srcset="${casesData[0].f.w}" sizes="(min-width: 1024px) 620px, 100vw"><img src="${casesData[0].f.s}" alt="${esc(T.cases.afterAlt + c0.t)}" width="${Math.max(...meta(`${c0.img}-before`).widths)}" height="${Math.max(...meta(`${c0.img}-before`).widths)}" loading="lazy" decoding="async"></picture>
        <span class="tag b">${esc(T.cases.before)}</span><span class="tag a">${esc(T.cases.after)}</span><span class="line"></span><span class="knob" aria-hidden="true">⟷</span>
        <input type="range" min="0" max="100" value="50" aria-label="${esc(T.cases.compare)}">
      </div>
      <div class="case-info" aria-live="polite">
        <p class="eyebrow" id="case-n">${esc(T.cases.label)} 01 / ${String(D.cases.length).padStart(2, "0")}</p>
        <h3 id="case-t">${esc(c0.t)}</h3>
        <p id="case-d">${esc(c0.d)}</p>
        <p class="case-meta" id="case-m">${esc(c0.m)}</p>
        <div class="case-nav"><button class="prev" type="button" aria-label="${esc(T.cases.prev)}">${ICON.arrow}</button><button class="next" type="button" aria-label="${esc(T.cases.next)}">${ICON.arrow}</button></div>
      </div>
    </div>
  </div>
</section>

<section class="block reviews" id="reviews">
  <div class="wrap">
    <div class="sec-head"><p class="eyebrow">${esc(T.reviews.eyebrow)}</p><h2>${esc(T.reviews.h2)} <em>${esc(T.reviews.h2em)}</em></h2></div>
    <div class="rv-box">
      <div class="rv-score"><b data-rating>5.0</b><div><span class="stars">${ICON.star.repeat(5)}</span><span>${t(T.reviews.count)}</span></div></div>
      <p class="muted">${esc(T.reviews.p)}</p>
      <div class="rv-links"><a class="btn btn-ghost" href="https://g.co/kgs/FmAkkx3" rel="noopener">${esc(T.reviews.google)}</a><a class="btn btn-ghost" href="${L("reviews")}">${esc(T.reviews.stories)}</a></div>
    </div>
  </div>
</section>

<section class="block" id="journey">
  <div class="wrap">
    <div class="sec-head"><p class="eyebrow">${esc(JM.eyebrow)}</p><h2>${esc(JM.h2)} <em>${esc(JM.h2em)}</em></h2><p class="muted">${esc(JM.intro)}</p></div>
    <div class="trips" aria-hidden="true">${["pre", "t1", "t2"].filter((g) => counts[g]).map((g) => `<span style="grid-column:${span[g]}">${esc(G[g])}</span>`).join("")}</div>
    <ol class="steps">${D.journey.map((s, i, a) => { const first = i === 0 || a[i - 1].g !== s.g; const heal = a[i + 1] && a[i + 1].g === "t2" && s.g === "t1";
      return `<li class="${first ? "has-tg" : ""}${heal ? " heal" : ""}"${heal ? ` data-gap="${esc(JM.gap)}"` : ""}>${first ? `<p class="tg">${esc(G[s.g])}</p>` : ""}<span class="dot" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span><div><b>${esc(s.t)}</b><span>${esc(s.d)}</span>${heal ? `<span class="heal-cap">${esc(JM.gapLong)}</span>` : ""}</div></li>`; }).join("")}</ol>
  </div>
</section>

<section class="block" id="faq" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head"><p class="eyebrow">${esc(T.faq.eyebrow)}</p><h2>${esc(T.faq.h2)} <em>${esc(T.faq.h2em)}</em></h2></div>
    <div class="faq">${D.faqs.map((f, i) => `<details${i === 0 ? " open" : ""}><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div>
  </div>
</section>

<section class="block" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head"><p class="eyebrow">${esc(T.commit.eyebrow)}</p><h2>${esc(T.commit.h2)} <em>${esc(T.commit.h2em)}</em></h2></div>
    <ul class="commit">${D.commitments.map((c, i) => `<li>${cicon(i)}<div><b>${esc(c.t)}</b><p>${esc(c.d)}</p></div></li>`).join("")}</ul>
  </div>
</section>

<section class="block others" aria-labelledby="others-h" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head"><p class="eyebrow">${esc(T.others.eyebrow)}</p><h2 id="others-h">${esc(T.others.h2)} <em>${esc(T.others.h2em)}</em></h2></div>
    <ul class="odocs">${others.map((o) => `<li><a href="${pagePath(lang, o.slug)}">${pic(o.portrait, o.portraitAlt, "(min-width: 1024px) 280px, 50vw", { slug: o.slug })}<span><b>${esc(o.name)}</b><small>${esc(o.nick)} · ${esc(o.card)}</small><i class="go">${esc(T.others.view)} ${ICON.arrow}</i></span></a></li>`).join("")}</ul>
  </div>
</section>

<section class="cta on-moss" id="book">
  ${pic("greenfield-clinic-lounge", T.cta.loungeAlt, "100vw")}
  <div class="wrap">
    <p class="eyebrow">${esc(T.cta.eyebrow)}</p>
    <h2>${esc(D.cta.h2)} <em>${esc(D.cta.h2em)}</em></h2>
    <p class="lead">${esc(D.cta.p)}</p>
    <div class="ctas"><a class="btn btn-gold" href="${primary}">${PI}${esc(T.cta.wa)}</a><a class="btn btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.35)" href="${isVI ? "tel:+84906621988" : L("contact")}">${esc(T.cta.send)}</a></div>
    ${isVI ? `<p class="wa-small"><a href="${waHref}">${esc(T.vi.waLink)}</a></p>\n    ` : ""}<p class="hours">${esc(T.cta.hours)}</p>
    <div class="related">${D.related.filter((r) => loc(r.u)).map((r) => `<a href="${loc(r.u)}">${esc(r.t)}</a>`).join("")}<a href="${L("doctors")}">${esc(T.cta.allDoctors)}</a></div>
  </div>
</section>
</main>

<footer class="ftr">
  <div class="wrap cols">
    <div class="brand"><img src="/shared/img/greenfield-logo-white-160.webp" alt="Greenfield Dental" width="160" height="118" loading="lazy"><p>${esc(T.footer.blurb)}</p>
      <div class="social"><a href="https://www.facebook.com/nhakhoagreenfield" aria-label="Facebook" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.2H8v3h2.5V21z"/></svg></a><a href="https://www.instagram.com/greenfield_dental/" aria-label="Instagram" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor"/></svg></a><a href="https://www.youtube.com/@nhakhoagreenfield" aria-label="YouTube" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z"/></svg></a><a href="https://www.linkedin.com/company/greenfielddental/" aria-label="LinkedIn" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.9 8.6H3.8V20h3.1zM5.3 3.5a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6zM20.2 13.4c0-3-1.6-4.9-4.1-4.9a3.6 3.6 0 0 0-3.2 1.7V8.6H9.9V20h3.1v-6.2c0-1.6.8-2.6 2.1-2.6 1.3 0 1.9.9 1.9 2.6V20h3.2z"/></svg></a></div></div>
    <div><h2 class="ft-h">${esc(T.footer.treatments)}</h2><ul>${T.footer.treatmentLinks.filter(([, k]) => L(k)).map(([lb, k]) => `<li><a href="${L(k)}">${esc(lb)}</a></li>`).join("")}</ul></div>
    <div><h2 class="ft-h">${esc(T.footer.clinic)}</h2><ul>${T.footer.clinicLinks.filter(([, k]) => L(k)).map(([lb, k]) => `<li><a href="${L(k)}">${esc(lb)}</a></li>`).join("")}</ul></div>
    <div><h2 class="ft-h">${esc(T.footer.visit)}</h2><ul class="visit">
      <li><a href="https://maps.google.com/?q=Greenfield+Dental+95+Trung+Hoa+Hanoi" rel="noopener">${esc(T.footer.address)}</a></li>
      <li>${esc(T.footer.hours)}</li>
      <li><a href="tel:+84906621988">${esc(T.footer.phone)}</a></li>
      <li><a href="mailto:hello@nhakhoagreenfield.com">hello@nhakhoagreenfield.com</a></li></ul>
      <a class="btn btn-gold" href="${primary}">${PI}${esc(T.footer.chat)}</a></div>
  </div>
  <div class="wrap legal"><span>${esc(T.footer.legal)}</span><span class="sp"></span><a href="${L("privacy")}">${esc(T.footer.privacy)}</a><a href="#cookie-settings" data-gf-cookie-settings>${esc(T.footer.cookies)}</a><a href="${L("terms")}">${esc(T.footer.terms)}</a></div>
</footer>
<a class="wa-float${isVI ? " zalo" : ""}" href="${primary}" aria-label="${t(T.floatAria)}">${PI}</a>

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
<script>/* Menu điện thoại, số đánh giá Google sống, so sánh trước/sau. */
(function(){var b=document.querySelector(".burger"),m=document.getElementById("mnav");b.addEventListener("click",function(){var o=m.classList.toggle("open");b.setAttribute("aria-expanded",o);});
document.querySelectorAll(".dd").forEach(function(d){d.addEventListener("toggle",function(){if(d.open)document.querySelectorAll(".dd").forEach(function(o){if(o!==d)o.open=false;});});});
document.addEventListener("click",function(e){if(!e.target.closest(".dd"))document.querySelectorAll(".dd[open]").forEach(function(d){d.open=false;});});
try{fetch("https://lead.greenfield.clinic/api/public/google-rating").then(function(r){return r.ok?r.json():null}).then(function(j){if(!j||!j.count)return;document.querySelectorAll("[data-count]").forEach(function(e){e.textContent=j.count});document.querySelectorAll("[data-rating]").forEach(function(e){e.textContent=j.ratingText||"5.0"});}).catch(function(){});}catch(e){}
var C=${js(casesData)},TL=${js({ b: T.cases.beforeAlt, a: T.cases.afterAlt, n: T.cases.label })},i=0,ba=document.getElementById("ba"),rng=ba.querySelector("input");
rng.addEventListener("input",function(){ba.style.setProperty("--pos",rng.value+"%")});
function setPic(p,d,alt){var s=p.querySelectorAll("source");s[0].srcset=d.a;s[1].srcset=d.w;var im=p.querySelector("img");im.src=d.s;im.alt=alt;}
function show(n){i=(n+C.length)%C.length;var c=C[i];setPic(document.getElementById("ba-b"),c.b,TL.b+c.t);setPic(document.getElementById("ba-a"),c.f,TL.a+c.t);
 document.getElementById("case-n").textContent=TL.n+" "+String(i+1).padStart(2,"0")+" / "+String(C.length).padStart(2,"0");document.getElementById("case-t").textContent=c.t;document.getElementById("case-d").textContent=c.d;document.getElementById("case-m").textContent=c.m;rng.value=50;ba.style.setProperty("--pos","50%");}
document.querySelector(".case-nav .prev").addEventListener("click",function(){show(i-1)});document.querySelector(".case-nav .next").addEventListener("click",function(){show(i+1)});})();</script>
</body>
</html>
`;
const out = lang === "en" ? `./dist/${D.slug}/` : `./dist/${lang}/${D.slug}/`;
mkdirSync(P(out), { recursive: true });
// Tiếng Trung không có khoảng trắng giữa các vế: bỏ dấu cách giữa chữ Hán/dấu câu toàn khổ và phần nhấn mạnh.
const page = lang === "zh" ? html.replace(/([\u3000-\u9fff\uff00-\uffef]) (<em>|[\u3000-\u9fff])/g, "$1$2") : html;
writeFileSync(P(`${out}index.html`), page);
console.log(lang, D.slug, (page.length / 1024).toFixed(1) + " KB");
}
