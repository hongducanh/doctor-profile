// Bảng đối chiếu §4.3: trang dịch vụ × danh sách bác sĩ HÔM NAY (greenfield-platform, 09/11/2026) × danh sách tính bằng luật
// "lines ∩ services HOẶC focus ∩ focus, theo order, tối đa 3" trên data/doctors.json. `node doctors-match-table.mjs` in bảng markdown.
// Thuần: hàm pickDoctors là bản mẫu cho golden test ở platform (bước 3).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const FILE = JSON.parse(readFileSync(fileURLToPath(new URL("../data/doctors.json", import.meta.url)), "utf8"));
export const MAX = 3;
export function pickDoctors(file, match, max = MAX) {
  const L = match.lines ?? [], F = match.focus ?? [];
  return [...file.doctors].sort((a, b) => a.order - b.order)
    .filter((d) => L.some((l) => d.services.includes(l)) || F.some((f) => d.focus.includes(f)))
    .slice(0, max).map((d) => d.aliases.factId);
}
/** Trang × match đề xuất × danh sách hôm nay (thứ tự như trong code platform). */
export const PAGES = [
  ["/dich-vu/ke-hoach-dieu-tri-phoi-hop", { lines: ["orthodontics", "veneer"] }, ["nhung", "giang", "hien"]],
  ["/dich-vu/tong-quat", { lines: ["general"] }, ["giang", "hien"]],
  ["/dich-vu/nha-khoa-tre-em", { focus: ["pediatric"] }, ["giang"]],
  ["/dich-vu/tay-trang", { lines: ["whitening"] }, ["giang", "hien"]],
  ["/dich-vu/nghien-rang-khop-thai-duong-ham", { focus: ["tmj"] }, ["nhung"]],
  ["/dich-vu/nho-rang-khon", { focus: ["surgery"] }, ["chuyen", "hieu"]],
  ["/dich-vu/cao-voi-nha-chu", { focus: ["perio"] }, ["hien", "giang"]],
  ["/dich-vu/dieu-tri-tuy", { focus: ["endo"] }, ["hien", "giang"]],
  ["/dich-vu/rang-su/mao-su-hay-veneer", { lines: ["veneer"] }, ["hien", "giang"]],
  ["/dich-vu/rang-su", { lines: ["veneer", "crown"] }, ["giang"]],
  ["/dich-vu/implant", { lines: ["implant"] }, ["chuyen"]],
  ["/dich-vu/implant/toan-ham", { focus: ["full_arch"] }, ["chuyen", "nhung"]],
  ["/dich-vu/nieng-rang", { lines: ["orthodontics"] }, ["nhung", "giang"]],
  ["/dich-vu/nieng-rang/mac-cai", { lines: ["orthodontics"] }, ["nhung", "giang"]],
  ["/dich-vu/nieng-rang/invisalign", { lines: ["orthodontics"] }, ["nhung", "giang"]],
  ["/rang-lech", { lines: ["orthodontics"] }, ["nhung", "giang"]],
  ["/mat-rang", { lines: ["implant"] }, ["chuyen", "nhung"]],
  ["/dang-dau", { focus: ["endo", "surgery"] }, ["hien", "chuyen"]],
  ["/rang-o-vang", { lines: ["whitening", "veneer", "crown"] }, ["giang", "hien"]],
  ["/ve-nuoc-lam-rang", { lines: ["implant", "all_on_x"] }, ["chuyen", "nhung"]],
];
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const status = (a, b) => (a.join() === b.join() ? "khớp" : [...a].sort().join() === [...b].sort().join() ? "khác thứ tự" : "KHÁC, owner duyệt");
  console.log("| Trang | match đề xuất | Hôm nay | Tính theo luật §4.3 | Kết quả |\n|---|---|---|---|---|");
  for (const [path, match, today] of PAGES) {
    const got = pickDoctors(FILE, match);
    console.log(`| \`${path}\` | \`${JSON.stringify(match).replace(/"/g, "")}\` | ${today.join(", ")} | ${got.join(", ") || "(rỗng → khối Đội ngũ)"} | ${status(today, got)} |`);
  }
}
