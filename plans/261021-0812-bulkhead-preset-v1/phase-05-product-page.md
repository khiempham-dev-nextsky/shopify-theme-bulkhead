---
phase: 5
title: "Phase 5: Product page"
status: pending
priority: P1
effort: "2.5w"
dependencies: [0, 1, 2, 8]
---

<!-- Updated: Red Team 2026-10-21 -->
<!-- Updated: Scope revision 2026-10-23 - effort 2w -> 2.5w; thêm phase 0 (G0) vào dependencies; D04 PDP đơn giản/multi-size, FAQ S18 dùng chung do phase này sở hữu, stress content -->

# Phase 5: Product page

## Goal

Product page dựng hoàn toàn bằng block, có đủ tính năng bắt buộc cấp product, cùng các module chữ ký: bảng bậc giá B2B, quantity rule, bulk variant matrix, spec và downloads.

## Context Links

- [Contract](../reports/brainstorm-261021-1421-bulkhead-preset-contract.md), acceptance criteria số 4 và 6.
- Mục 6.3 (product page) của file nghiên cứu thị trường.
- [Research Skeleton](../reports/researcher-261021-1503-skeleton-theme-store-tooling.md), mục 4 (gift card recipient, unit price, pickup, recommendations, installments, selling plans).
- [Research dữ liệu demo](../reports/researcher-261021-1503-demo-data-image-pipeline.md), mục 5 (dynamic source cho spec và downloads).
- [Section inventory](./section-inventory.md), S13–S18 (featured product, matrix, specs, downloads, recommendations, FAQ), D04 (PDP), D02 (card dùng ở recommendations), mục stress content và gates.
- [Phase 0](./phase-00-design-and-section-inventory.md), G0 và `reports/design-approval.md` (đầu ra tương lai của phase 0, chưa phải bằng chứng đã có).

## Key Insights

- `quantity_price_breaks` và `quantity_rule` chỉ có giá trị với khách B2B; với khách thường, module bậc giá phải ẩn sạch và ô số lượng dùng mặc định `min=1, step=1`.
- Downloads dùng metafield kiểu `url`, vì `file_reference` chỉ nối được vào setting ảnh hoặc video.
- Preset trong gói theme không được chứa tham chiếu custom metafield; block spec, MPN, downloads phải tự ẩn khi trống.
- G0 duyệt D04 và hình dạng buy box trên mockup HTML, không chứng minh media/3D, dynamic source, matrix hoặc editor trên Shopify. P-a…P-j của phase 1 và gate Theme Support về spec/downloads (đã nêu ở phase 1) vẫn bắt buộc; G0 không miễn các gate đó. Nếu phase 1 làm đổi thiết kế D04, reconcile và được anh duyệt lại trước khi phase 5 vào implementation.
- Thứ tự theo `dependencies: [0, 1, 2, 8]` là bảo thủ: phase 8 hoàn tất toàn bộ (gồm import và ảnh cuối) trước khi phase 5 bắt đầu; không khởi động sớm dựa trên import một phần. Chồng lấp sớm hơn cần một revision DAG rõ ràng ở plan index.
- D04: dữ liệu option của product quyết định cách hiển thị (đơn giản hoặc multi-size); merchant không phải chọn engine. `main-product` và `featured-product` dùng chung module product form và buy-box blocks; matrix giữ form/controls riêng nhưng gọi chung `addLines()`, pricing và quantity rules, không lồng form hoặc tạo engine PDP thứ hai.
- S18 là FAQ duy nhất của theme và do phase này tạo; phase 7 chỉ cấu hình/tái dùng cho Home, About, landing.

## Requirements

- Breadcrumbs (snippet của phase 2) đầu trang.
- Block trong `main-product`: vendor, title, SKU và MPN (MPN qua dynamic source), price (unit price, installments), volume pricing, variant picker (pill và swatch), quantity, inventory, pickup availability, buy buttons (Add to cart có thành tiền, accelerated checkout, gift card recipient), selling plans, complementary products, Custom Liquid, `@app`, `@theme`.
- Media gallery: thumbnail dọc, zoom, video, 3D (`model_viewer_tag`), variant image.
- Bảng volume pricing tự tô sáng bậc theo số lượng đang chọn (nghe `bh:quantity-change`).
- Section riêng: bulk variant matrix (option1 × option2, mỗi ô có số lượng và tồn kho; product > 2 option hoặc 1 option thì hiện dạng danh sách), specifications (block con "Spec row": label tĩnh, value qua dynamic source), downloads (block con "Document": label, `url` qua dynamic source), related products, collapsible FAQ, featured product có `@app`.
- **D04 PDP đơn giản vs multi-size:** product không có option thực (chỉ variant mặc định) hoặc chỉ cần picker thì không bị ép matrix: dùng variant picker, quantity, buy buttons. Product đúng 2 option (ví dụ kích thước 5×6) có variant picker và matrix. Product 1 option hoặc >2 option giữ fallback dạng danh sách đã nêu ở trên (không bỏ). Matrix, danh sách fallback và buy box chuẩn cùng dùng `<bh-product-form>`/`addLines()`/`quantity_rule`; B2B vắng dữ liệu thì tự ẩn, không để khoảng trống.
- **Rich media bắt buộc:** media gallery gồm ảnh, video, 3D (`model_viewer_tag`), zoom và variant image; không thay bằng standalone video O01 (không thuộc baseline).
- **FAQ dùng chung S18:** `sections/collapsible-content.liquid` + `blocks/collapsible-row.liquid`, heading + block question/answer, chấp nhận `@theme` phù hợp, không phụ thuộc product context nên thêm được vào Product, Home, About và landing bằng editor (có `presets`, không giới hạn `enabled_on` vào product). Question hoặc answer rỗng thì không render hàng; toàn bộ rỗng thì ẩn. Keyboard, focus và `aria-expanded` đầy đủ. Không tạo `faq-home`, `faq-about` hoặc FAQ riêng cho trade/landing; phase 7 không tạo lại file này.
- Các section phase này sở hữu theo inventory (S13 featured product, S14 matrix, S15 specifications, S16 downloads, S17 recommendations) có `presets` để thêm bằng editor, empty state/ẩn khi thiếu dữ liệu: S13 chưa chọn product có empty state editor và không hiện giá giả; S15/S16 bỏ hàng trống và ẩn toàn bộ khi rỗng; S17 ẩn khi nguồn recommendation rỗng và dùng card profile chung (D02) thay vì card riêng.
- Stress content ở 375/768/1440px: title 120 ký tự, SKU/MPN 40 ký tự, thiếu ảnh/spec/download, sold-out/low-stock, guest không có B2B; chữ/control không đè nhau, document không overflow. Matrix lớn chỉ cuộn trong vùng của nó, giữ nhãn hàng/cột, có cue cuộn; lỗi theo ô không mất ngữ cảnh khi cuộn.

## Architecture

- `assets/product-form.js`: `<bh-product-form>` quản lý variant đang chọn, cập nhật giá, tồn kho, pickup (`variants/{id}/?section_id=pickup-availability`), URL và media; cập nhật input `name="id"` để installments chạy đúng.
- `assets/volume-pricing.js`: đọc bậc giá từ JSON nhúng, dùng `price-tiers.js` của phase 2 để tô sáng dòng đúng khi số lượng đổi.
- `assets/variant-matrix.js`: `<bh-variant-matrix>` gom mọi ô có số lượng > 0 thành danh sách dòng (kèm `quantity_rule`, tồn kho, `inventory_policy` từ JSON nhúng) và gọi `addLines()` của phase 2; đánh dấu lỗi tại ô và thông báo một lần qua `aria-live`.
- `assets/recommendations.js`: fetch `routes.product_recommendations_url` với `intent=related` hoặc `complementary`.
- Quyết định D04 nằm duy nhất trong `sections/bulk-variant-matrix.liquid`: đọc option/variant để chọn không render matrix (không có option thực), matrix cho 2 option, list cho 1 hoặc >2 option. `main-product`/`featured-product` vẫn có picker/buy box chuẩn; không tạo thêm resolver service hoặc lặp logic matrix ở từng section.
- `featured-product` (S13) tái dùng block buy box và `<bh-product-form>` của `main-product`; không có bản form thứ hai.

## Related Code Files

- Create: `sections/main-product.liquid`, `sections/bulk-variant-matrix.liquid`, `sections/specifications.liquid`, `sections/downloads.liquid`, `sections/product-recommendations.liquid`, `sections/collapsible-content.liquid` (S18, FAQ duy nhất, phase 7 chỉ tái dùng), `sections/featured-product.liquid`, `sections/pickup-availability.liquid`, `blocks/spec-row.liquid`, `blocks/document-link.liquid`, `blocks/collapsible-row.liquid`, `snippets/media-gallery.liquid`, `snippets/volume-pricing.liquid`, `snippets/gift-card-recipient.liquid`, `assets/product-form.js`, `assets/volume-pricing.js`, `assets/variant-matrix.js`, `assets/media-gallery.js`, `assets/recommendations.js`.
- Modify: `templates/product.json`.

## Implementation Steps

1. Khung `main-product` với block và `@app`; media gallery.
2. `<bh-product-form>`: đổi variant, giá, unit price, tồn kho thật, pickup, installments, selling plans, gift card recipient.
3. Volume pricing và quantity rule: render bảng từ `variant.quantity_price_breaks`, ô số lượng từ `variant.quantity_rule`, label "Your price" khi `customer.b2b?`.
4. Bulk variant matrix với kiểm tra trước và gửi một request; resolver D04 (đơn giản/2 option/fallback danh sách); mobile giữ nhãn hàng/cột và cue cuộn.
5. Specifications và downloads bằng dynamic source; tự ẩn khi trống.
6. Recommendations (related, complementary, dùng card profile chung), FAQ S18 dùng chung (thử thêm vào `product.json` và một template khác như page/index trên feature store để chứng minh dùng được ngoài PDP; buổi rehearsal editor chính thức thuộc G2 phase 7), featured product.
7. Test với tài khoản B2B và khách thường trên demo store (dữ liệu của phase 8: product 1 option, 2 option kích thước 5×6, 3 option, gift card, hết hàng, product đơn giản không option). Test video, 3D và selling plans trên feature test store (CSV review của Shopify, file 3D mẫu, app subscription). Chạy stress content (fixture `fixture-*` của phase 8 trên feature test store: title 120 ký tự, SKU/MPN 40 ký tự, thiếu ảnh/spec/download, sold-out/low-stock) ở 375/768/1440px.

## Todo

- [ ] `main-product` và media gallery (ảnh, video, 3D, zoom, variant image)
- [ ] Product form, pickup, installments, selling plans, gift card recipient
- [ ] Volume pricing và quantity rule
- [ ] Bulk variant matrix và resolver D04 (đơn giản, 2 option, fallback 1/>2 option)
- [ ] Specifications và downloads
- [ ] Recommendations (card profile chung), FAQ S18 dùng chung, featured product S13 không nhân đôi form
- [ ] Stress content 375/768/1440px
- [ ] Test B2B và khách thường

## Success Criteria

- Product 2 option dạng 5×6: nhập số lượng ở nhiều ô rồi thêm tất cả vào cart trong một request (acceptance criterion số 4).
- Tài khoản B2B: bảng bậc giá hiện và tô sáng đúng bậc; ô số lượng tuân theo min, step, max. Khách thường: không có khoảng trống hay lỗi.
- Block spec, MPN, downloads ẩn khi metafield trống.
- Theme Check không có error mới.
- D04: product đơn giản không hiện matrix và không có khoảng trống; product 2 option hiện picker + matrix; product 1 hoặc >2 option hiện danh sách; cả ba cùng một product form và quantity rule.
- Rich media: video, 3D, zoom và variant image hoạt động trên feature test store.
- `collapsible-content` + `collapsible-row` dùng được trên product và ít nhất một template không phải product (Home/page) từ cùng file, không có FAQ file thứ hai; hàng rỗng không render; keyboard/focus đạt.
- S13/S15/S16/S17 hiển thị empty state hoặc tự ẩn đúng khi thiếu resource; không có giá, stock hoặc tài liệu giả.
- Stress content ở 375/768/1440px: không đè chữ/control, không document overflow; matrix cuộn có nhãn và dùng được bằng bàn phím.

## Risk Assessment

- Product có > 250 variant hoặc ma trận rất lớn: giới hạn số ô render (setting) và hiện thông báo dẫn về variant picker.
- Selling plans cần app subscription để test; demo store và benchmark store không được cài app, nên test trên feature test store.
- Nếu dùng chung FAQ làm schema quá rộng khiến PDP khó dùng, giữ một schema nhỏ (heading + rows) thay vì nhân bản section; merchant dùng nhiều instance.
- Thiết kế D04 đã duyệt ở G0 có thể mâu thuẫn kết quả phase 1 (media, dynamic source, matrix): dừng và reconcile, không dùng mockup làm lý do bỏ ràng buộc platform.

## Security Considerations

- Theo quy tắc output của phase 2: giá trị metafield in ra qua `escape`; link downloads chỉ render khi URL bắt đầu bằng `https://` và mở bằng `rel="noopener"`.
- Nội dung FAQ chỉ dùng setting `text`/`richtext` của Shopify (đã escape/lọc); không dùng `innerHTML` để dựng hàng accordion.

## Next Steps

Phase 6 dùng `<bh-quantity>`, `price-tiers.js` và `addLines()` của phase 2 cho quick order. Phase 7 tái dùng `collapsible-content`/`collapsible-row`, `featured-product` và card profile; không tạo bản sao.
