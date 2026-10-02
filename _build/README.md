# Bản nháp thiết kế lại trang bác sĩ — BS Nguyễn Đức Hiếu (Dr. Henry)

Bản nháp 02–03/10/2026, CHƯA đăng, CHƯA commit. Trang đang chạy (`../dr-nguyen-duc-hieu/`) không bị đụng tới.

## Chạy thử

```bash
npm i                      # sharp
npm run images             # ảnh gốc ../dr-nguyen-duc-hieu/img → henry/img + shared/img (AVIF + WebP 480/800/1200)
node build-page.mjs henry  # doctors/henry.json + mẫu → index.html
python3 -m http.server 8765  # mở http://localhost:8765/  (_harness.html = xem 390 / 768 / 360 cạnh nhau)
```

## Khác gì so với trang đang chạy

**Khung giống greenfield.clinic**
- Header nền rêu `#16261E`, logo trắng, menu Services / Results / About / Contact (trỏ về greenfield.clinic), huy hiệu ★ 5.0 / số đánh giá Google lấy sống từ `lead.greenfield.clinic/api/public/google-rating` (lỗi thì hiện 5.0 / 264), nút vàng "Free consultation".
- Thanh mục trong trang dính dưới header: About · Expertise · Cases · Reviews · Your trip · FAQs.
- Footer 4 cột y như web chính + dòng pháp lý (công ty, mã số thuế, Privacy Policy, Terms, Cookie settings). Nút WhatsApp nổi trên điện thoại.
- Hệ chữ chung: Cormorant Garamond (H1/H2, dòng nhấn nghiêng) + Be Vietnam Pro, đúng 8 bậc cỡ 12·14·16·18·20·30·40·56; tự host font (latin + vietnamese, woff2, preload 2 file).

**Nội dung**
- Giờ: 8:00 – 18:00 mỗi ngày, lịch cuối 17:30 (trang cũ ghi 08:30).
- Bỏ 6 lời khen chép từ trang BS Chuyên. Mục đánh giá chỉ còn điểm Google chung + ô chờ đánh giá thật.
- FAQ All-on-4: nói rõ 2 chuyến (chuyến 1 ~5–7 ngày: trụ + răng tạm cố định; chuyến 2 sau ~3–6 tháng: răng sứ hoàn chỉnh). Bỏ "tiết kiệm 50–70%" và "giá cố định, không phát sinh"; thay bằng báo giá bằng văn bản sau khám, ghép xương / an thần báo theo khoảng.
- Hành trình 7 bước và khối cam kết viết riêng cho implant (trang cũ còn câu "Orthodontic…").
- Ảnh All-on-4 trước đây gắn alt "Clear aligner held in hand" → sửa đúng nội dung. Bỏ 2 ảnh nền gradient trang trí và 1 ảnh không dùng. Khối chứng chỉ không còn chạy vòng lặp (trước đọc 2 lần).
- Màn đầu trên điện thoại có ảnh bác sĩ + tên.

**Tối ưu**
- HTML tĩnh, không React (trang cũ tải ~210 KB JS chỉ để dựng lại nội dung). JS còn lại: thanh trượt trước/sau, menu điện thoại, số đánh giá, consent, mã click WhatsApp.
- Ảnh AVIF + WebP 3 cỡ, `srcset`/`sizes`, `width`/`height`, lazy dưới màn đầu; ảnh hero `<img fetchpriority="high">` + preload. Ảnh ca 2000px ~230 KB → ~30 KB (800px AVIF).
- `<html lang="en">`, title / description / og / Twitter card trong `<head>` tĩnh, ảnh chia sẻ 1200×630 riêng (`henry/img/henry-og-1200x630.jpg`), favicon, canonical, JSON-LD (Person + Dentist + ProfilePage).
- Consent: cùng luật `gf_consent_v1` của greenfield.clinic (EU/UK/CH mặc định từ chối + banner; ngoài EU mặc định cho phép) + lưu thêm cookie `.greenfield.clinic` để hai site đọc chung.
- GTM-ND5D4BL3 tải sau thao tác đầu tiên / 3 s sau load, y như web chính. Mọi click WhatsApp/gọi/email đẩy `gf_doctor_contact` có `doctor: "henry"`; đầu trang đẩy `{page_type: "doctor_profile", doctor: "henry"}`.
- Mã click WhatsApp như web chính: đọc gclid/gbraid/wbraid/utm vào `gf_attr_v1`, sinh mã 6 ký tự, câu WhatsApp thành `(via doctors.greenfield.clinic #MÃ)`, `sendBeacon` về `lead.greenfield.clinic/api/public/wa-attr` (kèm `doctor`).

**Số đo (Lighthouse 12 mobile, máy local)**

| | Trang đang chạy | Bản nháp |
|---|---|---|
| Hiệu năng | 68 | 97 |
| Truy cập | 89 | 96 |
| Best practices | 71 | 100 |
| SEO | 100 | 66 (do bản nháp đặt `noindex`; bỏ đi là 100) |
| LCP | 7,6 s | 2,3 s |
| Tổng tải | 1,41 MB | 225 KB |

Local chạy `python -m http.server` nên Lighthouse còn báo thiếu nén và cache — Vercel tự nén; cache 1 năm cần thêm vào `vercel.json` (dưới).

## Còn chờ xác nhận (ô viền vàng trên trang)

1. **Ca điều trị**: 8 ca đang trùng hệt trang BS Chuyên — BS xác nhận ca nào do BS Hiếu làm. Số ngày ghi ở mỗi ca là chuyến 1 hay toàn bộ.
2. **Đánh giá**: chưa có đánh giá Google nào nhắc BS Hiếu trong 264 đánh giá đã đồng bộ (`marketing.mention`). Cần owner chọn đánh giá thật (Google / thư khách) có nhắc tên BS.
3. **Số liệu**: 3,000+ bệnh nhân và 2,000+ ca tiểu phẫu — BS xác nhận. (6+ năm và 1,000+ ca implant khớp thẻ trên greenfield.clinic.)
4. **Bảo hành implant**: thời hạn cụ thể để ghi vào khối cam kết.

## Trước khi đăng thật

- Thêm `https://doctors.greenfield.clinic` vào `WA_ATTR_ORIGINS` (Quotation) — không có thì beacon mã click bị từ chối.
- GTM: thêm biến Data Layer `doctor` + gắn vào sự kiện GA4 (`click_whatsapp`…) và đăng ký custom dimension `doctor` trong GA4 554219567.
- Bỏ `<meta name="robots" content="noindex">` và dải "BẢN NHÁP"; xoá các ô ghi chú.
- `vercel.json`: `Cache-Control: public, max-age=31536000, immutable` cho `/shared/(.*)` và `/*/img/(.*)`.
- Đường dẫn: bản nháp dùng đường dẫn tương đối (`henry/img`, `shared/…`). Khi đăng: ảnh vào `/<slug>/img/`, dùng chung vào `/shared/`.

## Áp cho cả 5 bác sĩ

1. Giữ `build-page.mjs` làm mẫu chung; mỗi bác sĩ một file `doctors/<key>.json` (tên, chức danh, số liệu, chuyên môn, chứng chỉ, ca, FAQ, hành trình, cam kết, câu WhatsApp).
2. `build-images.mjs` đổi thành nhận danh sách ảnh theo từng bác sĩ (JOBS trong JSON); ảnh gốc chuyển sang Thư viện media OS / S3, repo chỉ giữ bản web.
3. `node build-page.mjs <key>` cho 5 bác sĩ → `/<slug>/index.html`; header/footer/consent/WA/GTM chỉ sửa một chỗ.
4. Thêm bước kiểm tra trước khi đẩy: giờ phải "8:00 – 18:00", không câu đánh giá nào trùng giữa 2 bác sĩ, không "cosmetic", ảnh ≤ 300 KB, Lighthouse mobile ≥ 85.

## Bản chạy thật (03/10/2026) — `dist/`

```bash
npm i
node build-images.mjs                     # ảnh 5 bác sĩ → dist/<slug>/img, dist/shared/img, manifest.json
node build-page.mjs                       # dist/<slug>/index.html cho 5 bác sĩ (doctors/*.json)
LASTMOD=2026-10-03 node build-dist-extras.mjs   # sitemap, robots, favicon.ico, vercel.json, khoá IndexNow
mkdir -p dist/shared/fonts && cp shared/fonts/*.woff2 dist/shared/fonts/
```

Triển khai: thay nội dung repo bằng `dist/` (giữ nguyên URL `/dr-*`). Không còn support.js, vendor/, ảnh cũ.
Số liệu chỉ lấy từ thẻ bác sĩ trên greenfield.clinic/our-doctors (03/10). Đánh giá: chỉ điểm Google chung của phòng khám.
Ca trước/sau ghi "Cases from Greenfield's implant / orthodontic / restorative team".
Nhớ thêm https://doctors.greenfield.clinic vào WA_ATTR_ORIGINS (Quotation) để mã click WhatsApp được nhận.
