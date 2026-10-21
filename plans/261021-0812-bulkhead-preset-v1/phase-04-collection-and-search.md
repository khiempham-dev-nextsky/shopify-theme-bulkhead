---
phase: 4
title: "Phase 4: Collection và search"
status: pending
priority: P1
effort: "1.5w"
dependencies: [1, 2, 8]
---

<!-- Updated: Red Team 2026-10-21 -->

# Phase 4: Collection và search

## Goal

Trang collection phục vụ catalog lớn với ba chế độ xem Grid/List/Table, faceted filter, "In stock only" và breadcrumbs; predictive search trong header tìm được cả SKU lẫn MPN.

## Context Links

- [Contract](../reports/brainstorm-261021-1421-bulkhead-preset-contract.md), mục Outcome, Phạm vi sản phẩm và acceptance criterion số 5.
- Mục 6.3 (collection page) của file nghiên cứu thị trường.
- [Research Skeleton](../reports/researcher-261021-1503-skeleton-theme-store-tooling.md), mục 4 (predictive search).
- `reports/prototype-results.md` của plan này (P-a, P-g, P-h, P-i, P-j).

## Key Insights

- Lighthouse mobile trên trang collection là chỗ dễ trượt nhất; Table view phải render phía server, không dựng bảng bằng JS.
- Liquid không đọc được query string, nên chế độ xem dùng alternate template `?view=list` và `?view=table` (cơ chế đã kiểm chứng ở P-j).
- Trong vòng lặp product của collection không nối được dynamic source, nên cột spec dùng metafield danh mục chuẩn `shopify.*` nếu P-h đạt; nếu không thì dùng setting `namespace.key` để trống trong preset.
- Predictive search không tìm trên metafield; MPN được tìm qua kênh đã chốt ở P-g.

## Requirements

- Toolbar: chuyển Grid/List/Table, sort, số sản phẩm, toggle "In stock only" (filter availability; nguồn filter theo P-i).
- Giữ view: input ẩn `view` trong form facets, `view` trong URL pagination và trong URL Section Rendering.
- Sidebar filter trên desktop, drawer trên mobile; list filter, price range, boolean; xoá từng filter và xoá tất cả; cập nhật bằng Section Rendering và `history.pushState`, vẫn chạy khi tắt JS (form submit).
- Breadcrumbs và chip subcollection lấy từ menu do merchant chọn.
- Table row: ảnh nhỏ, tên, SKU (mono), 2–3 cột spec (theo P-h), tồn kho thật, gợi ý bậc giá B2B, `<bh-quantity>`, nút Add. Mỗi trang tối đa 48 sản phẩm.
- Predictive search trong header: product (hiện SKU khớp), collection, page, query; tìm được MPN; điều hướng bằng phím mũi tên, `aria-activedescendant`, đóng bằng Esc.
- Trang search dùng grid mặc định và filter.

## Architecture

- `sections/main-collection.liquid` nhận setting `view_mode` (grid, list, table). `templates/collection.json`, `collection.list.json`, `collection.table.json` dùng cùng section với `view_mode` khác nhau. Setting dùng chung giữa ba template (số sản phẩm mỗi trang, cột spec) đặt ở theme settings để ba template không lệch nhau.
- `snippets/facets.liquid` dùng chung cho collection và search; `assets/facets.js` lo drawer và Section Rendering.
- `sections/predictive-search.liquid` được gọi qua `/search/suggest?section_id=predictive-search`; `assets/predictive-search.js` là `<bh-predictive-search>` có debounce và huỷ request cũ.
- Card và table row dùng `snippets/product-card.liquid`; nút Add gọi `addLines()` của `cart-api.js`.

## Related Code Files

- Create: `sections/main-collection.liquid`, `sections/main-search.liquid`, `sections/predictive-search.liquid`, `templates/collection.list.json`, `templates/collection.table.json`, `snippets/facets.liquid`, `snippets/view-switcher.liquid`, `snippets/pagination.liquid`, `assets/facets.js`, `assets/predictive-search.js`, `assets/quick-add.js`.
- Modify: `templates/collection.json`, `templates/search.json`, `sections/header.liquid`, `snippets/product-card.liquid`, `config/settings_schema.json`.

## Implementation Steps

1. `main-collection` với ba view, breadcrumbs, pagination 24/36/48 (setting), banner gọn (tiêu đề, mô tả, số sản phẩm).
2. Facets: form GET có input `view`, drawer mobile có focus trap, Section Rendering khi đổi filter.
3. Table row với cột spec theo P-h và nút Add dùng `addLines()`.
4. Predictive search trong header, hiện SKU của variant khớp với từ khoá (so `variant.sku` trong Liquid) và tìm được MPN.
5. Trang search dùng lại grid và filter.
6. Đo Lighthouse mobile trên benchmark store (đã có CSV performance từ phase 1) cho cả `/collections/{handle}` và `/collections/{handle}?view=table` ở 48 sản phẩm mỗi trang.

## Todo

- [ ] `main-collection` với Grid/List/Table và breadcrumbs
- [ ] Facets, drawer và giữ view
- [ ] Table row, cột spec và quick add
- [ ] Predictive search có SKU và MPN
- [ ] Trang search
- [ ] Đo Lighthouse collection (mặc định và Table view) trên benchmark store

## Success Criteria

- Collection "All" của demo store (≥ 500 sản phẩm, đã import ở phase 8): mỗi view hiện đúng, tối đa 48 sản phẩm một trang; chuyển trang, bật filter và Section Rendering đều giữ view.
- Table view dùng được hoàn toàn bằng bàn phím: Tab qua ô số lượng và nút Add theo thứ tự hàng.
- Gõ một SKU có thật và một MPN có thật vào ô search thì gợi ý trả đúng product.
- Lighthouse mobile trên benchmark store: trang collection mặc định đạt performance ≥ 60; số đo của Table view được ghi lại để theo dõi.

## Risk Assessment

- Table view 48 hàng có nhiều form control có thể làm nặng DOM. Giữ markup tối thiểu, ảnh 64px lazy, không nạp JS cho từng hàng.
- Nếu P-h không đạt, cột spec phụ thuộc setting `namespace.key`; preset để trống, demo store điền, và phase 9 phải hỏi Theme Support về parity.

## Security Considerations

- Theo quy tắc output của phase 2: từ khoá search và giá trị metafield in ra luôn qua `escape`; section predictive search không in lại `q` thô.

## Next Steps

Phase 6 dùng lại cách tra SKU đã chốt ở P-a cho quick order.
