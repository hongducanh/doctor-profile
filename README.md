# doctor-profile

Hồ sơ bác sĩ Greenfield Dental — https://doctors.greenfield.clinic (5 trang `dr-*`).

- Trang đang chạy là **bản build tĩnh** ở thư mục gốc (`dr-*/index.html`, `shared/`, `sitemap.xml`, `vercel.json`). Đẩy `main` là Vercel tự deploy.
- Mã nguồn ở `_build/` (không deploy): `build-page.mjs` (template chung, header/footer theo greenfield.clinic), `doctors/<key>.json` (dữ liệu từng bác sĩ), `build-images.mjs` (AVIF/WebP 480/800/1200 từ `_build/originals/`), `build-dist-extras.mjs` (sitemap, robots, favicon, vercel.json).
- Sửa nội dung: sửa `_build/doctors/<key>.json` → `cd _build && npm i && node build-images.mjs && node build-page.mjs && node build-dist-extras.mjs` → chép `_build/dist/.` ra thư mục gốc → commit.
- Chi tiết, việc còn mở: `_build/README.md`.
