---
phase: 4
title: "Phase 4: Collection và search"
status: pending
priority: P1
effort: "2w"
dependencies: [0, 1, 2, 8]
---

<!-- Updated: Red Team 2026-10-21 -->
<!-- Updated: Scope revision 2026-10-23 - effort 1.5w -> 2w; thêm phase 0 (G0) vào dependencies; D02 card profile và D03 default view theo section-inventory -->

# Phase 4: Collection và search

## Goal

Trang collection phục vụ catalog lớn với ba chế độ xem Grid/List/Table, faceted filter, "In stock only" và breadcrumbs; predictive search trong header tìm được cả SKU lẫn MPN.

## Context Links

- [Contract](../reports/brainstorm-261021-1421-bulkhead-preset-contract.md), mục Outcome, Phạm vi sản phẩm và acceptance criterion số 5.
- Mục 6.3 (collection page) của file nghiên cứu thị trường.
- [Research Skeleton](../reports/researcher-261021-1503-skeleton-theme-store-tooling.md), mục 4 (predictive search).
- `reports/prototype-results.md` của plan này (P-a, P-g, P-h, P-i, P-j).
- [Section inventory](./section-inventory.md), D02 (product card), D03 (collection view), S05 dùng chung card, mục stress content và gates.
- [Phase 0](./phase-00-design-and-section-inventory.md), G0 và `reports/design-approval.md` (đầu ra tương lai của phase 0, chưa phải bằng chứng đã có).

## Key Insights

- Lighthouse mobile trên trang collection là chỗ dễ trượt nhất; Table view phải render phía server, không dựng bảng bằng JS.
- Liquid không đọc được query string, nên chế độ xem dự kiến dùng alternate template `?view=grid`, `?view=list` và `?view=table`; cơ chế này chỉ được chốt sau khi P-j (phase 1, hiện còn pending) kiểm chứng. Mockup hiện có không kiểm chứng alternate template.
- Trong vòng lặp product của collection không nối được dynamic source, nên cột spec dùng metafield danh mục chuẩn `shopify.*` nếu P-h đạt; nếu không thì dùng setting `namespace.key` để trống trong preset.
- Predictive search không tìm trên metafield; MPN được tìm qua kênh đã chốt ở P-g.
- G0 duyệt D02/D03 trên mockup HTML; mockup không chứng minh `?view=`, Section Rendering, filter hay predictive search trên Shopify. P-h/P-i/P-j của phase 1 vẫn quyết định cơ chế; nếu kết quả phase 1 làm đổi thiết kế D02/D03, reconcile và được anh duyệt lại trước khi phase 4 vào implementation. G0 không miễn gate platform hoặc gate Theme Support về spec/downloads.
- D02 và D03 là lựa chọn cấu hình trên cùng một implementation: một card contract (Browsing/Technical), một section `main-collection` (default view Grid hoặc Table). Không tạo engine giá, stock, quantity hoặc cart thứ hai cho List/Table/Technical.
- Thứ tự theo `dependencies: [0, 1, 2, 8]` là bảo thủ: phase 8 hoàn tất toàn bộ (gồm import và ảnh cuối) trước khi phase 4 bắt đầu; không có khởi động sớm ngầm dựa trên import một phần. Chồng lấp sớm hơn chỉ hợp lệ sau một revision DAG rõ ràng trong plan index.

## Requirements

- Toolbar: chuyển Grid/List/Table, sort, số sản phẩm, toggle "In stock only" (filter availability; nguồn filter theo P-i).
- Giữ view: input ẩn `view` trong form facets, `view` trong URL pagination và trong URL Section Rendering.
- Sidebar filter trên desktop, drawer trên mobile; list filter, price range, boolean; xoá từng filter và xoá tất cả; cập nhật bằng Section Rendering và `history.pushState`, vẫn chạy khi tắt JS (form submit).
- Breadcrumbs và chip subcollection lấy từ menu do merchant chọn.
- Table row: ảnh nhỏ, tên, SKU (mono), 2–3 cột spec (theo P-h), tồn kho thật, gợi ý bậc giá B2B, `<bh-quantity>`, nút Add. Mỗi trang tối đa 48 sản phẩm.
- Predictive search trong header: product (hiện SKU khớp), collection, page, query; tìm được MPN; điều hướng bằng phím mũi tên, `aria-activedescendant`, đóng bằng Esc.
- Trang search dùng grid mặc định và filter.
- **D03 default view:** theme setting `collection_default_view` (Grid | Table) quyết định view khi URL không có `view`; preset mặc định do phase 7 chốt (Browsing = Grid, Order first = Table). Switcher luôn có Grid, List, Table với `?view=grid|list|table` tường minh, nên Grid vẫn chọn được khi default là Table; List luôn có sẵn. Chuyển view không làm mất filter, sort hoặc pagination; cơ chế giữ `view` ở trên không đổi, chỉ có thêm giá trị `grid`.
- **D02 card profile:** theme setting `card_profile` (Browsing | Technical) cho card của collection và search; featured collection (phase 7) và recommendations (phase 5) gọi cùng snippet qua tham số `profile`. Browsing: ảnh dẫn dắt. Technical: SKU, size/spec, pack, tồn kho và qty dẫn dắt, giữ dễ đọc ở 375px. Mọi giá trị lấy từ dữ liệu thật; row spec hoặc pack trống thì ẩn, không đoán và không in giá trị giả.
- Product có nhiều variant mà chưa xác định variant thì card, List row và Table row hiện "Choose options" dẫn tới PDP, không Add variant đầu tiên. Chỉ product đơn variant hoặc đã xác định variant mới có `<bh-quantity>` và Add trong card/row.
- **Table trên mobile:** vùng bảng là vùng cuộn ngang tự thân (`role="region"` có label, `tabindex="0"`); document không được cuộn ngang ở 375/768/1440px. Cột đầu (ảnh nhỏ, tên, SKU) cố định (sticky) để Qty và Add luôn nằm cạnh ngữ cảnh sản phẩm; focus vào ô Qty hoặc Add ngoài khung nhìn tự cuộn vào, không bị cột sticky che (`scroll-padding`). Input Qty có label và nút Add có accessible name chứa tên sản phẩm và SKU của đúng hàng; lỗi hoặc thông báo thêm vào cart hiện tại hàng đó. Vẫn render phía server, không dựng bảng bằng JS.
- Collection không có tabs: Grid/List/Table là cơ chế duy nhất; tabbed collections (O02) không nằm trong baseline và không thêm code, setting hay demo ở phase này.
- Nội dung stress (title product 120 ký tự, SKU/MPN 40 ký tự, thiếu ảnh/spec, sold-out/low-stock, collection không có hàng, guest không có dữ liệu B2B) wrap hoặc ẩn đúng, không chữ/control đè nhau ở 375/768/1440px; lỗi và trạng thái stock không bị ẩn để làm gọn layout.
- Header search giữ SKU/MPN ở mọi viewport. Predictive search không dành chỗ cố định cho scope selector trên hàng input mobile; nếu có control scope (hero S01 ở phase 7) thì là control riêng, dùng lại cùng `<bh-predictive-search>` và logic SKU/MPN, không nhân đôi.
- Search snippet do phase 2 tạo nhận `id_prefix` riêng cho header/hero; mỗi `<bh-predictive-search>` giữ results, ARIA active option và focus trong instance của mình. Kiểm tra hai search cùng trang khi hero tồn tại, không gắn listener bằng một ID global.

## Architecture

- `sections/main-collection.liquid` nhận `view_mode` (grid, list, table). `templates/collection.json` (không suffix) lấy view theo theme setting `collection_default_view`; `collection.grid.json`, `collection.list.json`, `collection.table.json` dùng cùng section với `view_mode` cố định, truy cập bằng `?view=`. Setting dùng chung giữa các template (số sản phẩm mỗi trang, cột spec, default view, card profile) đặt ở theme settings để các template không lệch nhau. `template.suffix` rỗng nghĩa là default view. [INFERENCE] Alternate `grid` bổ sung cần được P-j xác nhận cùng cơ chế `?view=`; nếu P-j thất bại, thiết kế lại trước khi làm phase này.
- `snippets/facets.liquid` dùng chung cho collection và search; `assets/facets.js` lo drawer và Section Rendering.
- `sections/predictive-search.liquid` được gọi qua `/search/suggest?section_id=predictive-search`; `assets/predictive-search.js` là `<bh-predictive-search>` có debounce và huỷ request cũ.
- Card và table row dùng `snippets/product-card.liquid` (tham số `profile`: browsing | technical, mặc định từ `card_profile`); nút Add gọi `addLines()` của `cart-api.js`. Không có JS riêng cho từng hàng.

## Related Code Files

- Create: `sections/main-collection.liquid`, `sections/main-search.liquid`, `sections/predictive-search.liquid`, `templates/collection.grid.json`, `templates/collection.list.json`, `templates/collection.table.json`, `snippets/facets.liquid`, `snippets/view-switcher.liquid`, `snippets/pagination.liquid`, `assets/facets.js`, `assets/predictive-search.js`, `assets/quick-add.js`.
- Modify: `templates/collection.json`, `templates/search.json`, `sections/header.liquid`, `snippets/product-card.liquid` (thêm table-row/quick-add theo contract profile đã tạo ở phase 2), `config/settings_schema.json` (thêm `collection_default_view`, cột spec, số sản phẩm mỗi trang; dùng lại `card_profile` do phase 2 định nghĩa, không khai báo trùng), `locales/en.default.json`/`en.default.schema.json` cho chuỗi mới.

## Implementation Steps

1. `main-collection` với ba view và default view theo D03, breadcrumbs, pagination 24/36/48 (setting), banner gọn (tiêu đề, mô tả, số sản phẩm).
2. Facets: form GET có input `view`, drawer mobile có focus trap, Section Rendering khi đổi filter.
3. Table row với cột spec theo P-h và nút Add dùng `addLines()`.
3a. Card profile D02 (Browsing/Technical) và "Choose options" cho product chưa xác định variant; dùng chung cho card, List và Table row.
3b. Table trên mobile: vùng cuộn có label, cột đầu cố định, label Qty/Add chứa SKU, kiểm tra focus không bị che.
4. Predictive search trong header, hiện SKU của variant khớp với từ khoá (so `variant.sku` trong Liquid) và tìm được MPN.
5. Trang search dùng lại grid và filter.
6. Đo Lighthouse mobile trên benchmark store (đã có CSV performance từ phase 1) cho cả `/collections/{handle}` và `/collections/{handle}?view=table` ở 48 sản phẩm mỗi trang. Chạy stress content (fixture `fixture-*` của phase 8 trên feature test store; demo store giữ catalog authentic) ở 375/768/1440px và kiểm tra document không overflow cho cả hai default view (Grid, Table) và cả hai card profile.

## Todo

- [ ] `main-collection` với Grid/List/Table, default view theo D03 và breadcrumbs
- [ ] Facets, drawer và giữ view (kể cả `view=grid`)
- [ ] Table row, cột spec và quick add; mobile Table giữ SKU context, cuộn trong vùng bảng, bàn phím dùng được
- [ ] Card profile D02 Browsing/Technical, "Choose options" cho variant chưa xác định
- [ ] Predictive search có SKU và MPN; hàng input mobile không bị scope selector bóp
- [ ] Trang search
- [ ] Stress content 375/768/1440px, guest và B2B, không document overflow
- [ ] Đo Lighthouse collection (mặc định và Table view) trên benchmark store

## Success Criteria

- Collection "All" của demo store (≥ 500 sản phẩm, đã import ở phase 8): mỗi view hiện đúng, tối đa 48 sản phẩm một trang; chuyển trang, bật filter và Section Rendering đều giữ view.
- Table view dùng được hoàn toàn bằng bàn phím: Tab qua ô số lượng và nút Add theo thứ tự hàng.
- Gõ một SKU có thật và một MPN có thật vào ô search thì gợi ý trả đúng product.
- Lighthouse mobile trên benchmark store: trang collection mặc định đạt performance ≥ 60; số đo của Table view được ghi lại để theo dõi.
- D03: đổi `collection_default_view` giữa Grid và Table đổi view mặc định mà không đổi URL các view khác; `?view=grid|list|table` đều chạy, chuyển view/filter/sort/pagination không làm mất trạng thái còn lại.
- D02: card Browsing và Technical hiện từ cùng markup/dữ liệu; Technical hiện SKU, pack, stock, qty dễ đọc ở 375px; row trống ẩn; product nhiều variant chưa chọn hiện "Choose options", không Add variant đầu tiên.
- Table 375px: document không cuộn ngang; chỉ vùng bảng cuộn; hàng nào cũng thấy hoặc đọc được tên/SKU khi thao tác Qty/Add; label Qty/Add chứa SKU; Tab theo thứ tự hàng, focus không bị che.
- Stress content ở 375/768/1440px không đè chữ/control; không có tabs hoặc setting O02.

## Risk Assessment

- Table view 48 hàng có nhiều form control có thể làm nặng DOM. Giữ markup tối thiểu, ảnh 64px lazy, không nạp JS cho từng hàng.
- Nếu P-h không đạt, cột spec phụ thuộc setting `namespace.key`; preset để trống, demo store điền, và phase 9 phải hỏi Theme Support về parity.
- Mobile Table cần cân bằng giữa cột sticky và độ rộng vùng nhìn: nếu cột đầu chiếm quá nửa viewport 375px thì rút gọn (thu nhỏ ảnh, wrap tên) thay vì ẩn SKU.
- Nếu thiết kế D02/D03 đã duyệt (G0) mâu thuẫn kết quả P-h/P-i/P-j, dừng và reconcile; không giữ mockup làm lý do bỏ ràng buộc platform.

## Security Considerations

- Theo quy tắc output của phase 2: từ khoá search và giá trị metafield in ra luôn qua `escape`; section predictive search không in lại `q` thô.

## Next Steps

Phase 6 dùng lại cách tra SKU đã chốt ở P-a cho quick order.
