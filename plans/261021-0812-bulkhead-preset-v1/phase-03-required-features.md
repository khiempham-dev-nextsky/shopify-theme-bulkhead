---
phase: 3
title: "Phase 3: Template bắt buộc và tính năng toàn store"
status: pending
priority: P1
effort: "1.5w"
dependencies: [2]
---

<!-- Updated: Red Team 2026-10-21 -->
<!-- Scope revision 2026-10-23: giữ effort 1.5w và dependencies [2]. `main-page` và `main-contact` phải cho phép ghép section và cấu hình lại cho trade account. Xem [section-inventory](./section-inventory.md). Phase vẫn pending. -->

# Phase 3: Template bắt buộc và tính năng toàn store

## Goal

Đủ mọi JSON template và tính năng bắt buộc của Theme Store không thuộc riêng product, collection hay quick order.

## Context Links

- Mục 1.4 của file nghiên cứu thị trường (danh sách template và tính năng bắt buộc).
- [Research Skeleton](../reports/researcher-261021-1503-skeleton-theme-store-tooling.md), mục 1 và 4.
- Review checklist: https://shopify.dev/docs/storefronts/themes/store/test-theme/checklist (đọc toàn văn ở bước 1).
- [Section inventory](./section-inventory.md): system inventory (phase 3), R02/R03 dùng `main-page`, trade application dùng lại contact form.
- [Phase 2](./phase-02-theme-foundation.md): `snippets/newsletter-form.liquid`, `section-style`, `editor-empty-state`; [phase 7](./phase-07-homepage-and-preset.md): consumer của `main-page` và `main-contact`.

## Key Insights

- Skeleton thiếu `page.contact.json`; template customer legacy không còn bắt buộc vì đã có `<shopify-account>`.
- Cart page phải có unit price, discount, accelerated checkout và Shop Pay Installments (`form | payment_terms` trong `{% form 'cart' %}`).
- `main-page` và `main-contact` là nền cho các trang merchant tự dựng (About, landing ngành nghề, trade account). Nếu chúng là template khép kín, merchant không thêm hero, FAQ hay CTA được; phải để chúng đứng cùng các section khác trong JSON template.
- Form liên hệ chỉ viết một lần: trade application dùng lại `main-contact` với field khác; không tạo form trade riêng trong phase 7.

## Requirements

- Template: 404, article, blog, cart, collection, index, list-collections, page, page.contact, password, product, search (JSON), `gift_card.liquid`.
- Cart page: line item có ảnh, SKU, variant, unit price, discount allocation, xoá dòng, cập nhật số lượng; cart-level discount; note; accelerated checkout (`content_for_additional_checkout_buttons`); installments. Quantity rule ở cart làm ở phase 6.
- Blog và article: ảnh có focal point, tác giả, ngày, tag, comment form khi blog bật comment.
- Contact form; trang password có newsletter.
- Gift card template: mã, QR, Apple Wallet, in.
- Social image, focal point cho mọi ảnh có setting.
- `main-page` (template `page.json`): hiển thị tiêu đề và nội dung trang, có setting bật/tắt tiêu đề (để hero/banner khác giữ H1) và content width hữu hạn; không in wrapper rỗng khi trang không có nội dung. Section không giới hạn `enabled_on`/`disabled_on` các section khác, nên merchant thêm, bỏ và đổi thứ tự các section trong thư viện (phase 7) trên template `page`.
- `main-contact` (template `page.contact.json`, và alternate template khi cần): cùng một form có name/email, message, toggle phone/company và tax ID (tax ID tùy chọn, tắt mặc định); title/description, rich-text notice xử lý dữ liệu do merchant chỉnh. Field labels và error/success dùng locale, không tạo một form builder với required/label setting riêng cho mọi field. Tất cả qua `{% form 'contact' %}`; field bổ sung gửi bằng tên field contact phù hợp Shopify. Phase 7 bật company/phone bằng cùng schema cho trade account khi không có luồng native, không tạo section form thứ hai.
- Trang password dùng `snippets/newsletter-form.liquid` từ phase 2.
- Template bắt buộc giữ nguyên: bổ sung composition không được làm mất template hay section `main-*` nào ở danh sách trên.

## Architecture

- Mỗi template JSON trỏ tới section `main-*` riêng: `main-cart`, `main-blog`, `main-article`, `main-page`, `main-contact`, `main-404`, `main-list-collections`, `main-password`.
- Cart page dùng `cart-api.js` và `<bh-quantity>` từ phase 2; cập nhật bằng Section Rendering (`sections=main-cart`).
- Ảnh dùng `snippets/image.liquid` của phase 2 (focal point, `sizes`, `loading`).
- Section system dùng `snippets/section-style.liquid` và `snippets/editor-empty-state.liquid` của phase 2 khi áp dụng; không thêm hệ setting riêng.

## Related Code Files

- Create: `templates/page.contact.json`, `sections/main-cart.liquid`, `sections/main-blog.liquid`, `sections/main-article.liquid`, `sections/main-page.liquid`, `sections/main-contact.liquid`, `sections/main-404.liquid`, `sections/main-list-collections.liquid`, `sections/main-password.liquid`, `assets/cart-page.js`, `plans/261021-0812-bulkhead-preset-v1/reports/required-features-checklist.md`.
- Bổ sung 2026-10-23: Modify `templates/page.json` và `templates/page.contact.json` thành JSON template chứa `main-page`/`main-contact` và cho phép thêm section khác; `sections/main-password.liquid` dùng `snippets/newsletter-form.liquid`. Không tạo `templates/page.trade-account.json`, `page.about.json` hay `page.trade-landing.json` ở phase này; phase 7 sở hữu chúng.
- Modify: `templates/*.json` của Skeleton để trỏ tới các section trên, `templates/gift_card.liquid`.

## Implementation Steps

1. Đọc toàn văn review checklist. Tạo `reports/required-features-checklist.md` trong repo: chép danh sách tính năng bắt buộc (mục 1.4 của file nghiên cứu cộng các mục mới từ checklist), mỗi dòng có cột phase phụ trách và cột bằng chứng.
2. Cart page, blog, article, page, contact, 404, list-collections, password, gift card.
3. Đặt thử discount code và automatic discount trên demo store, kiểm tra hiển thị ở cart.
4. `main-page`: thêm/bỏ/reorder các section đã có ở thời điểm này (ví dụ Custom Liquid, section từ phase 2) trên `page.json`, tắt tiêu đề page mà không mất nội dung, thử trang không nội dung. Việc ghép hero/CTA/FAQ thật được xác nhận ở phase 7 khi các section đó tồn tại.
5. `main-contact`: bật/tắt các field phone/company/tax ID, xác nhận tax ID tắt mặc định, name/email và message hoạt động đúng, thử gửi thật trên feature store và xác nhận email nhận được các field đã bật. Ghi schema setting làm hợp đồng cho phase 7; không đưa dữ liệu cá nhân vào evidence.

## Todo

- [ ] Đọc review checklist, tạo `required-features-checklist.md`
- [ ] Cart page đầy đủ
- [ ] Blog, article, page, contact, 404, list-collections, password
- [ ] Gift card template
- [ ] Kiểm tra discount ở cart
- [ ] `main-page` cho phép ghép section và tắt tiêu đề
- [ ] `main-contact` cấu hình được field/notice, dùng lại được cho trade account

## Success Criteria

- Mọi template bắt buộc tồn tại và render không lỗi với dữ liệu seed.
- Cart hiện unit price, discount, accelerated checkout và installments đúng.
- Theme Check không có error mới.
- `page.json` và `page.contact.json` thêm/bỏ/reorder section khác mà không làm mất `main-page`/`main-contact`; trang không nội dung không in khoảng trống cố định.
- `main-contact` bật/tắt phone, company và tax ID theo setting; tax ID tùy chọn và tắt mặc định. Name/email/message có locale labels, form gửi qua `{% form 'contact' %}`, có inline success/error; không có form trade trùng lặp ở phase 7.

## Risk Assessment

- Thiếu mục nhỏ trong review checklist là lý do bị từ chối phổ biến; vì vậy bước 1 đọc checklist trước khi code.
- Nếu `main-contact` thiếu setting mà phase 7 cần, sửa tại phase này (hoặc ghi thay đổi tối thiểu theo owner) thay vì viết form khác trong phase 7.

## Security Considerations

- Form contact và comment dùng `{% form %}` của Shopify để có CSRF và spam protection.
- Field tax ID chỉ hiện khi merchant bật; thông báo xử lý dữ liệu do merchant chỉnh vì contact form gửi qua email dạng plaintext. Giá trị field luôn qua `escape` khi in lại.

## Next Steps

Phase 6 bổ sung quantity rule và bậc giá vào cart page. Phase 7 dùng `main-page` cho `page.about.json`/`page.trade-landing.json` và `main-contact` cho `page.trade-account.json` nếu không có luồng native.
