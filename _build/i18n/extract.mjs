// Tách phần chữ cần dịch của doctors/<key>.json → i18n/src/<key>.json (nguồn EN cho người dịch).
// Bản dịch i18n/<lang>/<key>.json giữ ĐÚNG cấu trúc này; build-page.mjs ghép đè theo từng phần tử mảng.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
const P = (r) => fileURLToPath(new URL(r, import.meta.url));
const pick = (o, ks) => Object.fromEntries(ks.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));
for (const f of readdirSync(P("../doctors/")).filter((f) => f.endsWith(".json"))) {
  const d = JSON.parse(readFileSync(P(`../doctors/${f}`), "utf8"));
  const out = {
    ...pick(d, ["name", "nick", "short", "first", "jobTitle", "role", "card", "eyebrow", "title", "description", "lead", "chips", "portraitAlt", "specialty", "wa", "ogLine"]),
    stats: d.stats.map((s) => ({ l: s.l })),
    badge: d.badge ? { l: d.badge.l } : undefined,
    about: { ...pick(d.about, ["eyebrow", "h2", "h2em", "imgAlt", "p"]), creds: d.about.creds.map((c) => pick(c, ["t", "s"])) },
    expertise: d.expertise.map((x) => pick(x, ["t", "s", "imgAlt"])),
    quote: pick(d.quote, ["text", "em", "by", "role"]),
    certs: d.certs.map((c) => pick(c, ["t", "s"])),
    cases: d.cases.map((c) => pick(c, ["t", "d", "m"])),
    journey: d.journey.map((s) => pick(s, ["t", "d"])),
    journeyMeta: d.journeyMeta,
    faqs: d.faqs,
    commitments: d.commitments,
    cta: d.cta,
    related: d.related.map((r) => ({ t: r.t })),
  };
  writeFileSync(P(`./src/${f}`), JSON.stringify(out, null, 2) + "\n");
}
