# doctor-profile

Hồ sơ bác sĩ Greenfield Dental — https://doctors.greenfield.clinic (5 trang `dr-*`).

- Trang đang chạy là **bản build tĩnh** ở thư mục gốc (`dr-*/index.html`, `shared/`, `sitemap.xml`, `vercel.json`). Đẩy `main` là Vercel tự deploy.
- Mã nguồn ở `_build/` (không deploy): `build-page.mjs` (template chung, header/footer theo greenfield.clinic), `doctors/<key>.json` (dữ liệu từng bác sĩ), `build-images.mjs` (AVIF/WebP 480/800/1200 từ `_build/originals/`), `build-dist-extras.mjs` (sitemap, robots, favicon, vercel.json).
- Sửa nội dung: sửa `_build/doctors/<key>.json` → `cd _build && npm i && node build-images.mjs && node build-page.mjs && node build-dist-extras.mjs` → chép `_build/dist/.` ra thư mục gốc → commit.
- Chi tiết, việc còn mở: `_build/README.md`.
- **`data/doctors.json`** (hợp đồng v = 1, spec `greenfield-os/docs/doctor-list-spec.md` §3.1) — danh sách bác sĩ công khai cho web/OS/Quotation/MCP, phục vụ ở `/data/doctors.json` (`Cache-Control: max-age=300`, CORS `*`). Nguồn: `_build/doctors/*.json` + `i18n/*` + `_build/public-doctors.json` (order, aliases.web, factId, services, focus). Sinh: `cd _build && npm run doctors` rồi chép `_build/dist/data/doctors.json` sang `data/doctors.json`. Kiểm hợp đồng chạy trong lúc build (sai ⇒ không ghi file); `npm run check` so file đã commit với bản build ra (CI `doctors-json-check`). `generatedAt` giữ nguyên khi nội dung không đổi. Bảng đối chiếu trang dịch vụ: `npm run match-table`.
- **Số năm / số ca** trên trang hồ sơ có `data-gf-fact="doctor.<factId>.years|implants"`: script cuối trang đọc `os.greenfield.clinic/api/public/facts`, lỗi thì giữ số tĩnh. Meta description / JSON-LD / ảnh OG giữ số tĩnh.
