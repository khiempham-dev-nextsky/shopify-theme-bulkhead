---
phase: 5
title: "Phase 5: Product page"
status: pending
priority: P1
effort: "2w"
dependencies: [1, 2, 8]
---

<!-- Updated: Red Team 2026-10-21 -->

# Phase 5: Product page

## Goal

Product page dựng hoàn toàn bằng block, có đủ tính năng bắt buộc cấp product, cùng các module chữ ký: bảng bậc giá B2B, quantity rule, bulk variant matrix, spec và downloads.

## Context Links

- [Contract](../reports/brainstorm-261021-1421-bulkhead-preset-contract.md), acceptance criteria số 4 và 6.
- Mục 6.3 (product page) của file nghiên cứu thị trường.
- [Research Skeleton](../reports/researcher-261021-1503-skeleton-theme-store-tooling.md), mục 4 (gift card recipient, unit price, pickup, recommendations, installments, selling plans).
- [Research dữ liệu demo](../reports/researcher-261021-1503-demo-data-image-pipeline.md), mục 5 (dynamic source cho spec và downloads).

## Key Insights

- `quantity_price_breaks` và `quantity_rule` chỉ có giá trị với khách B2B; với khách thường, module bậc giá phải ẩn sạch và ô số lượng dùng mặc định `min=1, step=1`.
- Downloads dùng metafield kiểu `url`, vì `file_reference` chỉ nối được vào setting ảnh hoặc video.
- Preset trong gói theme không được chứa tham chiếu custom metafield; block spec, MPN, downloads phải tự ẩn khi trống.

## Requirements

- Breadcrumbs (snippet của phase 2) đầu trang.
- Block trong `main-product`: vendor, title, SKU và MPN (MPN qua dynamic source), price (unit price, installments), volume pricing, variant picker (pill và swatch), quantity, inventory, pickup availability, buy buttons (Add to cart có thành tiền, accelerated checkout, gift card recipient), selling plans, complementary products, Custom Liquid, `@app`, `@theme`.
- Media gallery: thumbnail dọc, zoom, video, 3D (`model_viewer_tag`), variant image.
- Bảng volume pricing tự tô sáng bậc theo số lượng đang chọn (nghe `bh:quantity-change`).
- Section riêng: bulk variant matrix (option1 × option2, mỗi ô có số lượng và tồn kho; product > 2 option hoặc 1 option thì hiện dạng danh sách), specifications (block con "Spec row": label tĩnh, value qua dynamic source), downloads (block con "Document": label, `url` qua dynamic source), related products, collapsible FAQ, featured product có `@app`.

## Architecture

- `assets/product-form.js`: `<bh-product-form>` quản lý variant đang chọn, cập nhật giá, tồn kho, pickup (`variants/{id}/?section_id=pickup-availability`), URL và media; cập nhật input `name="id"` để installments chạy đúng.
- `assets/volume-pricing.js`: đọc bậc giá từ JSON nhúng, dùng `price-tiers.js` của phase 2 để tô sáng dòng đúng khi số lượng đổi.
- `assets/variant-matrix.js`: `<bh-variant-matrix>` gom mọi ô có số lượng > 0 thành danh sách dòng (kèm `quantity_rule`, tồn kho, `inventory_policy` từ JSON nhúng) và gọi `addLines()` của phase 2; đánh dấu lỗi tại ô và thông báo một lần qua `aria-live`.
- `assets/recommendations.js`: fetch `routes.product_recommendations_url` với `intent=related` hoặc `complementary`.

## Related Code Files

- Create: `sections/main-product.liquid`, `sections/bulk-variant-matrix.liquid`, `sections/specifications.liquid`, `sections/downloads.liquid`, `sections/product-recommendations.liquid`, `sections/collapsible-content.liquid`, `sections/featured-product.liquid`, `sections/pickup-availability.liquid`, `blocks/spec-row.liquid`, `blocks/document-link.liquid`, `blocks/collapsible-row.liquid`, `snippets/media-gallery.liquid`, `snippets/volume-pricing.liquid`, `snippets/gift-card-recipient.liquid`, `assets/product-form.js`, `assets/volume-pricing.js`, `assets/variant-matrix.js`, `assets/media-gallery.js`, `assets/recommendations.js`.
- Modify: `templates/product.json`.

## Implementation Steps

1. Khung `main-product` với block và `@app`; media gallery.
2. `<bh-product-form>`: đổi variant, giá, unit price, tồn kho thật, pickup, installments, selling plans, gift card recipient.
3. Volume pricing và quantity rule: render bảng từ `variant.quantity_price_breaks`, ô số lượng từ `variant.quantity_rule`, label "Your price" khi `customer.b2b?`.
4. Bulk variant matrix với kiểm tra trước và gửi một request.
5. Specifications và downloads bằng dynamic source; tự ẩn khi trống.
6. Recommendations (related, complementary), FAQ, featured product.
7. Test với tài khoản B2B và khách thường trên demo store (dữ liệu của phase 8: product 1 option, 2 option kích thước 5×6, 3 option, gift card, hết hàng). Test video, 3D và selling plans trên feature test store (CSV review của Shopify, file 3D mẫu, app subscription).

## Todo

- [ ] `main-product` và media gallery
- [ ] Product form, pickup, installments, selling plans, gift card recipient
- [ ] Volume pricing và quantity rule
- [ ] Bulk variant matrix
- [ ] Specifications và downloads
- [ ] Recommendations, FAQ, featured product
- [ ] Test B2B và khách thường

## Success Criteria

- Product 2 option dạng 5×6: nhập số lượng ở nhiều ô rồi thêm tất cả vào cart trong một request (acceptance criterion số 4).
- Tài khoản B2B: bảng bậc giá hiện và tô sáng đúng bậc; ô số lượng tuân theo min, step, max. Khách thường: không có khoảng trống hay lỗi.
- Block spec, MPN, downloads ẩn khi metafield trống.
- Theme Check không có error mới.

## Risk Assessment

- Product có > 250 variant hoặc ma trận rất lớn: giới hạn số ô render (setting) và hiện thông báo dẫn về variant picker.
- Selling plans cần app subscription để test; demo store và benchmark store không được cài app, nên test trên feature test store.

## Security Considerations

- Theo quy tắc output của phase 2: giá trị metafield in ra qua `escape`; link downloads chỉ render khi URL bắt đầu bằng `https://` và mở bằng `rel="noopener"`.

## Next Steps

Phase 6 dùng `<bh-quantity>`, `price-tiers.js` và `addLines()` của phase 2 cho quick order.
