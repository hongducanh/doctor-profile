# CLAUDE.md — doctor-profile

Hồ sơ bác sĩ tĩnh cho doctors.greenfield.clinic (mỗi bác sĩ một thư mục `dr-*`). Trang mới phải gắn GTM-ND5D4BL3 và theo hệ chữ dưới đây.

## Hệ chữ web công khai Greenfield (chuẩn chung, owner chốt 26/09/2026)

Áp dụng cho MỌI trang công khai: nhakhoagreenfield.com, greenfield.clinic (EN/ES/KO/ZH), doctors.greenfield.clinic, các landing page, trang công khai của Quotation (aff.greenfield.clinic, báo giá web). Bản so sánh + lý do: https://claude.ai/artifact/KLNDCCRRF1JPzSTEin1iLf

**Font — chỉ 2 font**
- Tiêu đề (H1/H2, số lớn, dòng nhấn): **Cormorant Garamond** 500–700; dòng nhấn trong tiêu đề dùng nghiêng (italic 500/600).
- Thân bài, nút, menu, form, H3: **Be Vietnam Pro** 400/500/600/700.
- Chữ Hàn: Pretendard. Chữ Trung (giản thể): font hệ thống PingFang SC / Microsoft YaHei. Chỉ cho ký tự CJK, phần Latin vẫn theo 2 font trên.
- Font mới phải có bộ dấu tiếng Việt (CSS của Google Fonts có khối `/* vietnamese */`). KHÔNG dùng: DM Sans, Instrument Serif, DM Serif Display, Bodoni Moda, Outfit, Sora, Urbanist, Figtree, Syne (thiếu dấu Việt); Inter, Playfair Display, Poppins, Fraunces, Source Sans 3, Heebo (đã thay).
- Cormorant có x-height thấp: không dùng cho chữ dưới 28px.
- Link Google Fonts chuẩn: `https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap`

**Cỡ chữ — đúng 8 bậc: 12 · 14 · 16 · 18 · 20 · 30 · 40 · 56 px**

| Vai trò | Font | Desktop | Mobile |
|---|---|---|---|
| H1 | Cormorant 600 | 56 | 40 |
| H2 | Cormorant 600 | 40 | 30 |
| H3, tiêu đề thẻ | Be Vietnam Pro 600 | 20 | 20 |
| Đoạn dẫn (lead) | Be Vietnam Pro 400 | 18 | 18 |
| Thân bài, nút | Be Vietnam Pro 400/600 | 16 | 16 |
| Chú thích, footer | Be Vietnam Pro 400 | 14 | 14 |
| Nhãn chữ hoa (eyebrow, tag) | Be Vietnam Pro 600, giãn .12–.14em | 12 | 12 |

- 12px CHỈ cho nhãn chữ hoa. Chữ thường tối thiểu 14px.
- Không cỡ lẻ (15.2px, 0.95rem…), không `clamp()`/`vw` co giãn liên tục: đổi bậc tại 1024px.

**Viết**
- Tiêu đề viết hoa đầu câu ("Đội ngũ bác sĩ", "Our doctors"); giữ hoa tên riêng (Greenfield Dental, Hà Nội, Invisalign, CT Cone Beam…).
- Giọng cao cấp, lâm sàng. Không định vị "nha khoa thẩm mỹ" / "cosmetic dentistry"; không liệt kê Filler/Botox là chuyên khoa (dòng chứng chỉ botulinum toxin & filler của BS. Nhung thì giữ).

**Màu header/footer chung**: rêu `#16261E`, vàng `#C9974A` (hover `#D8A85C`), chữ trên nền rêu `rgba(255,255,255,.86)`, đường kẻ `rgba(255,255,255,.12)`.

**Cách áp theo từng site**
- nhakhoagreenfield.com (`greenfield-platform/apps/website`): font tự host ở `src/fonts` (tách file latin + vietnamese), khai trong `src/app/[locale]/layout.tsx` + `globals.css`; Cormorant `size-adjust: 112%`. Thang cỡ ở `tailwind.config.ts` (`text-xs` thường = 14px, `.text-xs.uppercase` = 12px, `text-4xl` = 40, `text-5xl`+ = 56). Tiêu đề dùng lớp `font-display`. Không thêm cỡ tuỳ ý `text-[..]`.
- greenfield.clinic (WordPress): WPCode **5545** "Typography" viết lại HTML trước khi gửi: đổi tên font và link Google Fonts về 2 font chuẩn, gom `font-size` px/rem/em/clamp về 8 bậc. Header = WPCode **5454** `[gf_header]`, footer = template 42. Nội dung mới vẫn nên viết đúng thang ngay từ đầu.
- Landing page, doctors.greenfield.clinic, trang công khai Quotation: dùng link Google Fonts chuẩn ở trên. Các landing page hiện còn font cũ (Inter/Playfair/DM Sans/Heebo): chuyển sang chuẩn này ở lần sửa giao diện kế tiếp.
