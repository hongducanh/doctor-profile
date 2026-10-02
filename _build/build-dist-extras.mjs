// Tệp gốc của dist/: sitemap, robots, favicon.ico, vercel.json, khoá IndexNow (03/10/2026).
import { readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const P = (rel) => fileURLToPath(new URL(rel, import.meta.url));
const SITE = "https://doctors.greenfield.clinic";
const SLUGS = ["dr-ta-hong-nhung", "dr-do-nhu-chuyen", "dr-nguyen-duc-hieu", "dr-tran-thi-giang", "dr-pham-thi-thu-hien"];
const today = process.env.LASTMOD || new Date().toISOString().slice(0, 10);
writeFileSync(P("./dist/sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${SLUGS.map((s) => `  <url>\n    <loc>${SITE}/${s}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`).join("\n")}\n</urlset>\n`);
writeFileSync(P("./dist/robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
// favicon.ico = khung ICO bọc PNG 32×32
const png = readFileSync(P("./dist/favicon.png"));
const head = Buffer.alloc(22);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4);
head.writeUInt8(32, 6); head.writeUInt8(32, 7); head.writeUInt8(0, 8); head.writeUInt8(0, 9);
head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12); head.writeUInt32LE(png.length, 14); head.writeUInt32LE(22, 18);
writeFileSync(P("./dist/favicon.ico"), Buffer.concat([head, png]));
writeFileSync(P("./dist/vercel.json"), JSON.stringify({
  cleanUrls: true,
  trailingSlash: false,
  redirects: [{ source: "/", destination: "https://greenfield.clinic/our-doctors/", permanent: false }],
  headers: [
    { source: "/shared/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    { source: "/(.*)/img/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
  ],
}, null, 2) + "\n");
copyFileSync(P("../a52a27ba9b14ef05a43703d429ba6879.txt"), P("./dist/a52a27ba9b14ef05a43703d429ba6879.txt"));
console.log("dist extras ok", today);
