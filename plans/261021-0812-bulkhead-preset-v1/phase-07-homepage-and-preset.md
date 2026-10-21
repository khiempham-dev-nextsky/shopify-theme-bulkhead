---
phase: 7
title: "Phase 7: Homepage và preset Bulkhead"
status: pending
priority: P1
effort: "1w"
dependencies: [3, 4, 5, 6]
---

<!-- Updated: Red Team 2026-10-21 -->

# Phase 7: Homepage và preset Bulkhead

## Goal

Các section homepage theo thứ tự của preset Bulkhead, và cấu hình preset (settings, template) đóng gói đúng cách để cài lên store mới giống demo store.

## Context Links

- Mục 6.3 (homepage) và 6.5 (design) của file nghiên cứu thị trường.
- [Research Skeleton](../reports/researcher-261021-1503-skeleton-theme-store-tooling.md), mục 1 (thư mục preset, `--listing`).
- [Research dữ liệu demo](../reports/researcher-261021-1503-demo-data-image-pipeline.md), mục 5 (JSON không chứa custom metafield).

## Key Insights

- `shopify theme dev --listing=bulkhead` và `theme push --listing` áp file preset từ `listings/bulkhead/`.
- File JSON trong gói theme không được chứa tài nguyên riêng của demo store (custom metafield, ID product). Setting chọn collection, product, menu để trống và section phải có trạng thái trống đẹp.
- Section phải có nội dung và ảnh thật khi đo Lighthouse.

## Requirements

- Section homepage: hero search-first (eyebrow, H1, mô tả, 2 CTA, chip "Popular searches", ảnh có focal point), trust/stat bar 4 cột, collection list dày đặc (số sản phẩm, sub-link), quick order pad (từ phase 6), featured collection (card có số lượng và Add), trade account CTA band, logo list, blog posts, newsletter, rich text.
- Trang "Open a trade account": alternate template `page.trade-account.json` dùng contact form có thêm trường company và số điện thoại; trường tax ID là tuỳ chọn, tắt mặc định trong preset; có block văn bản thông báo xử lý dữ liệu do merchant chỉnh. Trước khi làm, kiểm tra Shopify có luồng native cho yêu cầu mở tài khoản company không; nếu có thì CTA dẫn tới luồng đó.
- Chốt view mặc định của collection trong preset (Grid hoặc Table) và ghi lý do.
- Preset Bulkhead: color scheme, font, density, homepage và template theo đúng design trong mục 6.5.

## Architecture

- Mỗi section mới nhận `@theme` blocks khi hợp lý và có `presets` để merchant thêm từ editor.
- `listings/bulkhead/` chỉ chứa những file thật sự khác bản gốc trong `templates/` và `config/`. `config/settings_data.json` ở gốc dùng preset Bulkhead làm mặc định.
- `scripts/check-package-json.mjs` quét mọi file JSON trong gói theme, báo lỗi khi gặp ID tài nguyên, `metafields.custom` hay `config/markets.json`; chạy trong CI.

## Related Code Files

- Create: `sections/hero-search.liquid`, `sections/stat-bar.liquid`, `sections/collection-list.liquid`, `sections/featured-collection.liquid`, `sections/trade-cta.liquid`, `sections/logo-list.liquid`, `sections/blog-posts.liquid`, `sections/newsletter.liquid`, `sections/rich-text.liquid`, `templates/page.trade-account.json`, `listings/bulkhead/` (chỉ các file khác bản gốc), `scripts/check-package-json.mjs`.
- Modify: `templates/index.json`, `config/settings_data.json`.

## Implementation Steps

1. Viết từng section, kiểm tra trạng thái trống (chưa chọn collection, chưa có ảnh).
2. Trang trade account.
3. Ghép homepage theo thứ tự trong mục 6.3; cấu hình preset trong `listings/bulkhead/`.
4. Viết `check-package-json.mjs`, thêm vào CI, chạy trên toàn bộ gói theme.
5. Cài preset lên feature test store để xem trạng thái mặc định.

## Todo

- [ ] Các section homepage
- [ ] Trang trade account
- [ ] Ghép homepage và preset `listings/bulkhead/`
- [ ] `check-package-json.mjs` trong CI
- [ ] Cài thử preset lên feature test store

## Success Criteria

- Homepage đúng thứ tự section của preset; mọi section có trạng thái trống không vỡ layout.
- `check-package-json.mjs` chạy sạch trên gói theme và chạy trong CI.
- Theme Check không có error mới.

## Risk Assessment

- Demo store nối custom metafield trong editor, còn preset để trống; reviewer có thể coi đây là lệch preset parity (chưa kiểm chứng). Phase 9 định nghĩa phép thử parity, danh sách khác biệt được phép do anh duyệt, và hỏi Theme Support trước khi nộp.

## Security Considerations

- Form trade account chỉ gửi qua `{% form 'contact' %}`, không gửi dữ liệu tới dịch vụ ngoài; tax ID tắt mặc định vì contact form gửi nội dung qua email dạng plaintext.

## Next Steps

Phase 9 dùng preset này để kiểm tra preset parity.
