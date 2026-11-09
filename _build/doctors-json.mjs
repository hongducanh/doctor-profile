// Sinh data/doctors.json (hợp đồng v = 1, spec greenfield-os/docs/doctor-list-spec.md §3.1) từ dữ liệu có sẵn:
//   doctors/<key>.json (EN) + i18n/<lang>/<key>.json (role, name VI) + public-doctors.json (thuộc tính công khai) + manifest.json (ảnh).
// Kiểm hợp đồng NGAY TRONG build: sai ⇒ ném lỗi, KHÔNG ghi file.
//   node doctors-json.mjs           → ghi dist/data/doctors.json (giữ generatedAt cũ nếu phần còn lại không đổi)
//   node doctors-json.mjs --check   → so ../data/doctors.json (đã commit) với bản build ra; lệch ⇒ thoát mã 1
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const P = (rel) => fileURLToPath(new URL(rel, import.meta.url));
const read = (rel) => JSON.parse(readFileSync(P(rel), "utf8"));
export const SITE = "https://doctors.greenfield.clinic";
export const LINES = ["implant", "all_on_x", "veneer", "crown", "orthodontics", "whitening", "general", "filler_botox", "other"];
export const FOCUS = ["tmj", "pediatric", "endo", "perio", "surgery", "sedation", "full_arch", "invisalign", "braces"];
const ROLE_LANGS = ["vi", "en", "es", "ko", "zh", "ja"];
const KEYS = ["kate", "chris", "henry", "giang", "hailey"]; // = ORDER của build-page.mjs
const COMMITTED = "../data/doctors.json";

/** Thuần: kiểm hợp đồng v1. Trả mảng lỗi (rỗng = hợp lệ). */
export function validateDoctorsFile(f) {
  const e = [];
  const isObj = (x) => x && typeof x === "object" && !Array.isArray(x);
  const str = (x) => typeof x === "string" && x.trim() !== "";
  const abs = (x) => str(x) && /^https:\/\/[^\s/]+\/\S*$/.test(x);
  const arrOf = (x, allowed) => Array.isArray(x) && x.every((v) => allowed.includes(v)) && new Set(x).size === x.length;
  if (!isObj(f)) return ["file không phải object"];
  if (f.v !== 1) e.push("v phải là 1");
  if (!str(f.generatedAt) || Number.isNaN(Date.parse(f.generatedAt))) e.push("generatedAt không phải ISO");
  if (!Array.isArray(f.doctors) || f.doctors.length === 0) e.push("doctors rỗng / không phải mảng");
  if (!Array.isArray(f.retired)) e.push("retired không phải mảng");
  if (e.length) return e;
  const seen = { slug: new Set(), factId: new Set(), order: new Set(), web: new Set(), profileKey: new Set() };
  const uniq = (kind, v, who) => { if (seen[kind].has(v)) e.push(`${who}: ${kind} trùng "${v}"`); seen[kind].add(v); };
  const slugOk = (s) => str(s) && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s);
  const aliasesOk = (a, who, withFact) => {
    if (!isObj(a)) return e.push(`${who}: aliases không phải object`);
    if (!Array.isArray(a.web) || !a.web.every(str)) e.push(`${who}: aliases.web phải là mảng chuỗi`);
    else a.web.forEach((w) => uniq("web", w, who));
    if (!str(a.profileKey)) e.push(`${who}: thiếu aliases.profileKey`); else uniq("profileKey", a.profileKey, who);
    if (withFact && !/^[a-z0-9-]+$/.test(a.factId || "")) e.push(`${who}: aliases.factId sai định dạng`);
    if (withFact && str(a.factId)) uniq("factId", a.factId, who);
  };
  f.doctors.forEach((d, i) => {
    const who = `doctors[${i}]${d && d.slug ? ` (${d.slug})` : ""}`;
    if (!isObj(d)) return e.push(`${who}: không phải object`);
    if (!slugOk(d.slug)) e.push(`${who}: slug sai định dạng`); else uniq("slug", d.slug, who);
    aliasesOk(d.aliases, who, true);
    if (typeof d.order !== "number" || !Number.isFinite(d.order)) e.push(`${who}: order phải là số`); else uniq("order", d.order, who);
    if (!isObj(d.name) || !str(d.name.vi) || !str(d.name.en)) e.push(`${who}: name cần vi + en`);
    if (!str(d.nick)) e.push(`${who}: thiếu nick`);
    if (!isObj(d.role) || !ROLE_LANGS.every((l) => str(d.role[l]))) e.push(`${who}: role cần đủ ${ROLE_LANGS.join("/")}`);
    if (!arrOf(d.services, LINES)) e.push(`${who}: services phải ⊂ Line (9 khoá), không trùng`);
    if (!arrOf(d.focus, FOCUS)) e.push(`${who}: focus phải ⊂ Focus (danh sách đóng), không trùng`);
    if (!isObj(d.photo) || !abs(d.photo.portrait) || !abs(d.photo.thumb)) e.push(`${who}: photo.portrait/thumb phải là URL tuyệt đối https`);
    if (!abs(d.profileUrl)) e.push(`${who}: profileUrl phải là URL tuyệt đối https`);
  });
  f.retired.forEach((r, i) => {
    const who = `retired[${i}]`;
    if (!isObj(r)) return e.push(`${who}: không phải object`);
    if (!slugOk(r.slug)) e.push(`${who}: slug sai định dạng`); else uniq("slug", r.slug, who);
    aliasesOk(r.aliases, who, false);
    if (!isObj(r.name) || !str(r.name.vi) || !str(r.name.en)) e.push(`${who}: name cần vi + en`);
    if (!abs(r.redirectTo)) e.push(`${who}: redirectTo phải là URL tuyệt đối https`);
  });
  return e;
}

/** Dữ liệu (không có generatedAt) dựng từ nguồn sẵn có. */
export function buildBody() {
  const pub = read("./public-doctors.json");
  const manifest = read("./manifest.json");
  const doctors = KEYS.map((key) => {
    const en = read(`./doctors/${key}.json`);
    const p = pub[key];
    if (!p) throw new Error(`public-doctors.json thiếu khoá ${key}`);
    const tr = (l) => read(`./i18n/${l}/${key}.json`);
    const vi = tr("vi");
    const role = { vi: vi.role, en: en.role };
    for (const l of ["es", "ko", "zh", "ja"]) role[l] = tr(l).role;
    const m = manifest[`${en.slug}/${en.portrait}`];
    if (!m) throw new Error(`manifest thiếu ${en.slug}/${en.portrait}`);
    const img = (w) => `${SITE}/${en.slug}/img/${en.portrait}-${w}.webp`;
    for (const w of [Math.max(...m.widths), Math.min(...m.widths)]) {
      if (!existsSync(P(`../${en.slug}/img/${en.portrait}-${w}.webp`))) throw new Error(`thiếu file ảnh ${en.slug}/img/${en.portrait}-${w}.webp`);
    }
    return {
      slug: en.slug,
      aliases: { web: p.web, profileKey: key, factId: p.factId },
      order: p.order,
      name: { vi: vi.name, en: en.name },
      nick: en.nick,
      role,
      services: p.services,
      focus: p.focus,
      photo: { portrait: img(Math.max(...m.widths)), thumb: img(Math.min(...m.widths)) },
      profileUrl: `${SITE}/${en.slug}`,
    };
  }).sort((a, b) => a.order - b.order);
  const retired = pub.retired ?? [];
  return { v: 1, doctors, retired };
}

/** generatedAt: giữ giá trị của bản đã commit khi phần còn lại GIỐNG HỆT (để "commit = build" ổn định). */
export function buildFile(prev, now = new Date().toISOString()) {
  const body = buildBody();
  const same = prev && prev.generatedAt && JSON.stringify({ v: prev.v, doctors: prev.doctors, retired: prev.retired }) === JSON.stringify(body);
  const file = { v: body.v, generatedAt: same ? prev.generatedAt : now, doctors: body.doctors, retired: body.retired };
  const errs = validateDoctorsFile(file);
  if (errs.length) throw new Error("doctors.json vi phạm hợp đồng v1:\n - " + errs.join("\n - "));
  return file;
}
const text = (f) => JSON.stringify(f, null, 2) + "\n";
const readPrev = () => (existsSync(P(COMMITTED)) ? JSON.parse(readFileSync(P(COMMITTED), "utf8")) : null);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.includes("--check")) {
      const prev = readPrev();
      if (!prev) throw new Error("chưa có data/doctors.json — chạy `npm run doctors` rồi chép _build/dist/data/doctors.json ra data/");
      const built = text(buildFile(prev));
      if (built !== text(prev)) throw new Error("data/doctors.json đã commit KHÁC bản build ra — chạy `npm run doctors`, chép _build/dist/data/doctors.json sang data/doctors.json rồi commit");
      console.log("doctors.json: file commit = file build ra, hợp đồng v1 hợp lệ");
    } else {
      const f = buildFile(readPrev());
      mkdirSync(P("./dist/data/"), { recursive: true });
      writeFileSync(P("./dist/data/doctors.json"), text(f));
      console.log("doctors.json ok:", f.doctors.map((d) => d.slug).join(", "), "· generatedAt", f.generatedAt);
    }
  } catch (err) {
    console.error(String(err.message || err));
    process.exit(1);
  }
}
