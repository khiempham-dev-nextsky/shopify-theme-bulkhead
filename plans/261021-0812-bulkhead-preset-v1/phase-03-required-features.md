---
phase: 3
title: "Phase 3: Template bắt buộc và tính năng toàn store"
status: pending
priority: P1
effort: "1.5w"
dependencies: [2]
---

<!-- Updated: Red Team 2026-10-21 -->

# Phase 3: Template bắt buộc và tính năng toàn store

## Goal

Đủ mọi JSON template và tính năng bắt buộc của Theme Store không thuộc riêng product, collection hay quick order.

## Context Links

- Mục 1.4 của file nghiên cứu thị trường (danh sách template và tính năng bắt buộc).
- [Research Skeleton](../reports/researcher-261021-1503-skeleton-theme-store-tooling.md), mục 1 và 4.
- Review checklist: https://shopify.dev/docs/storefronts/themes/store/test-theme/checklist (đọc toàn văn ở bước 1).

## Key Insights

- Skeleton thiếu `page.contact.json`; template customer legacy không còn bắt buộc vì đã có `<shopify-account>`.
- Cart page phải có unit price, discount, accelerated checkout và Shop Pay Installments (`form | payment_terms` trong `{% form 'cart' %}`).

## Requirements

- Template: 404, article, blog, cart, collection, index, list-collections, page, page.contact, password, product, search (JSON), `gift_card.liquid`.
- Cart page: line item có ảnh, SKU, variant, unit price, discount allocation, xoá dòng, cập nhật số lượng; cart-level discount; note; accelerated checkout (`content_for_additional_checkout_buttons`); installments. Quantity rule ở cart làm ở phase 6.
- Blog và article: ảnh có focal point, tác giả, ngày, tag, comment form khi blog bật comment.
- Contact form; trang password có newsletter.
- Gift card template: mã, QR, Apple Wallet, in.
- Social image, focal point cho mọi ảnh có setting.

## Architecture

- Mỗi template JSON trỏ tới section `main-*` riêng: `main-cart`, `main-blog`, `main-article`, `main-page`, `main-contact`, `main-404`, `main-list-collections`, `main-password`.
- Cart page dùng `cart-api.js` và `<bh-quantity>` từ phase 2; cập nhật bằng Section Rendering (`sections=main-cart`).
- Ảnh dùng `snippets/image.liquid` của phase 2 (focal point, `sizes`, `loading`).

## Related Code Files

- Create: `templates/page.contact.json`, `sections/main-cart.liquid`, `sections/main-blog.liquid`, `sections/main-article.liquid`, `sections/main-page.liquid`, `sections/main-contact.liquid`, `sections/main-404.liquid`, `sections/main-list-collections.liquid`, `sections/main-password.liquid`, `assets/cart-page.js`, `plans/261021-0812-bulkhead-preset-v1/reports/required-features-checklist.md`.
- Modify: `templates/*.json` của Skeleton để trỏ tới các section trên, `templates/gift_card.liquid`.

## Implementation Steps

1. Đọc toàn văn review checklist. Tạo `reports/required-features-checklist.md` trong repo: chép danh sách tính năng bắt buộc (mục 1.4 của file nghiên cứu cộng các mục mới từ checklist), mỗi dòng có cột phase phụ trách và cột bằng chứng.
2. Cart page, blog, article, page, contact, 404, list-collections, password, gift card.
3. Đặt thử discount code và automatic discount trên demo store, kiểm tra hiển thị ở cart.

## Todo

- [ ] Đọc review checklist, tạo `required-features-checklist.md`
- [ ] Cart page đầy đủ
- [ ] Blog, article, page, contact, 404, list-collections, password
- [ ] Gift card template
- [ ] Kiểm tra discount ở cart

## Success Criteria

- Mọi template bắt buộc tồn tại và render không lỗi với dữ liệu seed.
- Cart hiện unit price, discount, accelerated checkout và installments đúng.
- Theme Check không có error mới.

## Risk Assessment

- Thiếu mục nhỏ trong review checklist là lý do bị từ chối phổ biến; vì vậy bước 1 đọc checklist trước khi code.

## Security Considerations

- Form contact và comment dùng `{% form %}` của Shopify để có CSRF và spam protection.

## Next Steps

Phase 6 bổ sung quantity rule và bậc giá vào cart page.
