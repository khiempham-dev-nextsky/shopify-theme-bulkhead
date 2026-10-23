---
phase: 2
title: "Phase 2: Nền móng theme"
status: pending
priority: P1
effort: "2w"
dependencies: [0, 1]
---

<!-- Updated: Red Team 2026-10-21 -->
<!-- Scope revision 2026-10-23: effort 1.5w → 2w; dependencies [1] → [0, 1]. Nhận G0 + đối chiếu platform từ phase 1; thêm hợp đồng card profile, search header mobile, editor settings. Xem [section-inventory](./section-inventory.md) và [phase 0](./phase-00-design-and-section-inventory.md). Phase vẫn pending. -->

# Phase 2: Nền móng theme

## Goal

Dựng kiến trúc riêng của Bulkhead trên nền Skeleton: design token, settings, layout, header và footer group, quy tắc output an toàn, cùng các component và hợp đồng dùng chung mà phase 3–7 sẽ dùng lại.

Phase này bắt đầu khi cả phase 0 (G0, thiết kế được duyệt) và phase 1 (G1, kết quả prototype) đã có kết quả; hai phase đó chạy độc lập. Bước đầu tiên là đối chiếu thiết kế đã duyệt với phát hiện platform, rồi mới triển khai. Phase 2 cũng đặt các hợp đồng dùng chung cho thư viện section của phase 7: profile product card, ô search ở header (cả mobile), snippet newsletter, và kiến trúc settings trong theme editor.

## Context Links

- [Contract](../reports/brainstorm-261021-1421-bulkhead-preset-contract.md), mục Design và Constraints.
- Design system: mục 6.5 của file nghiên cứu thị trường (bảng màu, font, spacing, radius, nút).
- [Research Skeleton](../reports/researcher-261021-1503-skeleton-theme-store-tooling.md), mục 1 (`_blocks.liquid`), 4 (`<shopify-account>`, localization) và 5 (Cart API).
- `reports/prototype-results.md` (P-c quyết định đường lui của `addLines()`).
- [Section inventory](./section-inventory.md): S19 (owner phase 2), D01/D02 (search header, card profile), quy ước editor settings và reuse bắt buộc.
- [Phase 0](./phase-00-design-and-section-inventory.md) và `reports/design-approval.md` (đầu ra tương lai của G0, chưa tồn tại khi plan được sửa).
- [Mockup](../../mockup/README.md): chỉ là reference thiết kế với fixture, không phải nguồn code và không chứng minh editor hay Shopify integration.

## Key Insights

- Theme Store đòi "fundamentally different" ở mức kiến trúc, nên tên component, cấu trúc CSS và JS phải là của Bulkhead, không lặp Dawn hay Horizon.
- `_blocks.liquid` tự viết phải khai báo cả `@theme` lẫn `@app`, có `presets`, không có `templates`.
- Không dùng Sass, không minify code của mình. Font chỉ qua `font_picker` và `font_modify`.
- Liquid không tự escape; một quy tắc output chung tránh việc mỗi phase tự xử lý một kiểu.
- G0 duyệt thiết kế bằng mockup HTML; G1 kiểm chứng platform. Hai gate độc lập nên phase 2 phải đối chiếu chúng trước khi viết code; phần thiết kế mà prototype bác bỏ chỉ được triển khai sau khi anh duyệt lại.
- Product card, search header và newsletter được dùng ở nhiều section (phase 4, 5, 6, 7). Đặt hợp đồng ở đây để các phase sau cấu hình lại thay vì tạo biến thể thứ hai.
- Settings trong editor là một phần của sản phẩm: merchant tự xây trang (AC11) chỉ làm được khi mọi section dùng chung một cách đặt tên, nhóm và trạng thái trống.

## Requirements

- Ít nhất 4 color scheme (default, inverse, accent band, surface), mỗi màu nền có màu chữ đi kèm, đạt contrast trong contract.
- Ba font setting: heading (Archivo), body (IBM Plex Sans), data (IBM Plex Mono). Biến thể đậm và nghiêng nạp bằng `font_modify`.
- Setting "Density" (Comfortable/Compact) điều khiển chiều cao hàng ở Table view và quick order.
- Header group: announcement bar; header có logo, ô search (phase 4 gắn predictive search), link Quick order, `<shopify-account>` hiện trên desktop và mobile, cart; mega menu nhiều cấp; chip "Ship to" chỉ khi `customer.b2b?`.
- Footer group: menu, newsletter, Follow on Shop, localization (country/language), payment icons. Localization có fallback khi tắt JS.
- Section và block Custom Liquid; mọi section nội dung nhận `@theme` blocks.
- Product card có hai profile theo D02: **Browsing** (ảnh dẫn dắt) và **Technical** (SKU, size/spec, pack, stock, qty dẫn dắt). Cùng một `snippets/product-card.liquid`, cùng giá/stock/quantity rule; nhận tham số `profile`, theme setting đặt profile mặc định (nhóm "Product cards"), section như featured collection, recommendations ghi đè được. Thiếu spec thì ẩn hàng spec; variant chưa xác định thì nút dẫn tới Choose options, không Add nhầm variant đầu tiên. Grid, list và table row dùng lại contract này, không nhân đôi logic cart.
- Search ở header (D01): luôn tìm SKU/MPN. Trên mobile (375px), scope selector không nằm chung hàng với input; đặt thành control riêng hoặc bỏ nếu thiết kế G0 giản lược hàng search. Input không bị bóp, không gây document overflow. Form nằm ở `snippets/search-form.liquid` để hero Search first (phase 7, S01) dùng lại; phase 4 gắn predictive search.
- Newsletter: một `snippets/newsletter-form.liquid` (`{% form 'customer' %}`, label thật, inline error/success, không hardcode lời hứa tần suất). Footer (phase này), `main-password` (phase 3) và section newsletter S09 (phase 7) cùng dùng snippet này.
- Mỗi instance search/newsletter nhận `id_prefix` riêng từ caller/section ID cho form, input, label, results và error IDs; header + hero và footer + S09 có thể cùng tồn tại mà không trùng ID hoặc chia sẻ focus/ARIA state. `section-style.liquid` chỉ render style/token contract, không sinh hoặc include JSON schema bằng Liquid.
- Kiến trúc settings trong editor: theme settings nhóm theo tác vụ merchant (Colors, Typography, Layout, Density, Product cards, Header search, Social); section nội dung core dùng bộ setting nền nhất quán (color scheme, padding trên/dưới và content width hữu hạn, không CSS tuỳ ý) qua `snippets/section-style.liquid`, có `presets` và (khi hợp lý) `@theme` blocks. Section hệ thống không vì quy ước này mà được nhân đôi hoặc thêm tự do. Setting resource (collection, product, blog, menu, page, link) mặc định trống; label/info bằng American English, sentence case. Section preset chỉ là cấu hình khởi đầu trong editor, không phải theme preset.
- Trạng thái chưa có nội dung: `snippets/editor-empty-state.liquid` chỉ hiện hướng dẫn khi `request.design_mode`; storefront không hiện giá, tồn kho, brand hay nút giả. Section phase 7 và phase 5 dùng lại snippet này.
- S19 Custom Liquid (owner phase này) giữ yêu cầu extensibility, có empty state, và không nằm trong các recipe merchant tự xây trang.

## Architecture

- **Quy tắc output (áp cho mọi phase):**
  - Dữ liệu product, customer, company, metafield, setting văn bản và từ khoá search in vào text hoặc thuộc tính HTML luôn qua `escape`.
  - Dữ liệu cho JS chỉ đi qua `<script type="application/json">{{ data | json }}</script>` và được đọc bằng `JSON.parse(el.textContent)`.
  - Section trả về qua `section_id` không bao giờ in lại tham số `q` dưới dạng HTML.
  - Link lấy từ metafield chỉ render khi URL bắt đầu bằng `https://`.
  - JS chỉ chèn chuỗi người dùng nhập bằng `textContent`; HTML từ Section Rendering chỉ đến từ chính theme.
- **CSS:** `assets/base.css` chứa reset, token (CSS custom properties sinh từ settings trong `snippets/theme-tokens.liquid`), typography, layout, nút, form. CSS riêng của section viết trong `{% stylesheet %}` như Skeleton.
- **JS:** ES module không bundler, không minify, mỗi component một file trong `assets/`, nạp `type="module"` khi section cần. Hợp đồng dùng chung:
  - `quantity-input.js`: `<bh-quantity>` đọc `min`, `step`, `max` từ thuộc tính (render từ `variant.quantity_rule`). Chỉ làm tròn theo step khi khách thao tác trực tiếp trên ô (nút +/−, rời ô); phát sự kiện `bh:quantity-change`.
  - `price-tiers.js`: một hàm duy nhất chọn bậc giá theo số lượng từ dữ liệu `quantity_price_breaks` đã nhúng JSON. Volume pricing (phase 5), quick order và cart (phase 6) cùng dùng.
  - `cart-api.js`: `addLines(lines)` với `lines = [{ id, quantity, rule: { min, step, max }, available, inventory, policy }]`, trả về `[{ id, ok, error }]`. Hàm này là nơi duy nhất kiểm tra trước: đọc `/cart.js` để cộng số lượng đã có trong cart, gộp dòng trùng variant, kiểm tra quantity rule và tồn kho (bỏ qua giới hạn tồn kho khi `inventory_policy` là `continue`), gửi một `cart/add.js` cho các dòng hợp lệ. Khi gặp 422 hoặc timeout, hàm đọc lại `/cart.js` rồi chỉ gửi phần chênh lệch theo từng dòng, có trần số lần gọi; chỉ retry 429 theo `Retry-After`, không retry 422. Hàm không tự thông báo; người gọi đọc kết quả và thông báo một lần qua `aria-live`.
  - `section-renderer.js`: fetch với `section_id` và thay DOM.
- **Snippet dùng chung:** `image.liquid` (`image_url` + `image_tag` có `sizes`, `widths`, `loading`, focal point làm `object-position`), `price.liquid` (giá, compare-at, unit price), `stock-status.liquid` (tồn kho thật theo ngưỡng setting, ba trạng thái màu), `product-card.liquid` (biến thể grid, list, table row; có ô số lượng và nút Add), `price-break-hint.liquid` (chỉ render khi `quantity_price_breaks_configured?`), `breadcrumbs.liquid` (product và collection).
- Prefix `bh-` cho custom element và class component để tách khỏi mọi theme khác.

## Related Code Files

- Modify: `layout/theme.liquid`, `layout/password.liquid`, `config/settings_schema.json`, `config/settings_data.json`, `locales/en.default.json`, `locales/en.default.schema.json`, `sections/header.liquid`, `sections/footer.liquid`, `sections/header-group.json`, `sections/footer-group.json`, `.theme-check.yml`, workflow Theme Check có sẵn của Skeleton trong `.github/workflows/`.
- Create: `assets/base.css`, `assets/quantity-input.js`, `assets/price-tiers.js`, `assets/cart-api.js`, `assets/section-renderer.js`, `assets/header.js`, `snippets/theme-tokens.liquid`, `snippets/image.liquid`, `snippets/price.liquid`, `snippets/stock-status.liquid`, `snippets/product-card.liquid`, `snippets/price-break-hint.liquid`, `snippets/breadcrumbs.liquid`, `snippets/icon.liquid`, `sections/announcement-bar.liquid`, `sections/custom-liquid.liquid`, `blocks/custom-liquid.liquid`, `blocks/_blocks.liquid`.
- Bổ sung 2026-10-23: Create `snippets/search-form.liquid`, `snippets/newsletter-form.liquid`, `snippets/section-style.liquid`, `snippets/editor-empty-state.liquid`. Modify `reports/design-approval.md` chỉ ở mục Reconciliation (delta/reapproval từ phase 1). `snippets/product-card.liquid` (đã nằm trong danh sách Create) được tạo ở đây với profile `Browsing`/`Technical`; phase 4 chỉ thêm biến thể table row/quick add.
- Không copy code từ `mockup/` (hash routing, hardcoded price rules, `innerHTML` page renderer); chỉ dùng làm tham chiếu thiết kế.
- Delete: `sections/hello-world.liquid` và các file mẫu khác của Skeleton không dùng tới.

## Implementation Steps

0. Đọc `reports/design-approval.md` (G0) và `reports/prototype-results.md` (P-a…P-j). Lập bảng đối chiếu trong mục Reconciliation của approval: điểm thiết kế bị prototype ảnh hưởng (search SKU/MPN, dynamic source spec/downloads, `addLines()`, `<shopify-account>`, filter), quyết định đi tiếp, và phần cần anh duyệt lại. Không bắt đầu code các phần bị ảnh hưởng khi chưa duyệt lại. Nếu hai report chưa tồn tại, phase này chưa bắt đầu; không suy diễn từ mockup.
1. Viết `settings_schema.json`: `theme_info` (name Bulkhead, version 1.0.0, link doc và support), color scheme group, font, density, layout (container 1360px), favicon, social image. Settings viết bằng American English, sentence case.
2. Viết `theme-tokens.liquid` sinh CSS custom properties cho scheme, font, spacing scale 4px, radius 2/4px; `base.css` dùng các token này.
3. Viết lại `layout/theme.liquid`: preload font, `content_for_header`, skip link, header group, `main`, footer group, nạp `base.css`.
4. Header: logo, nav mega menu bằng `<details>` lồng nhau có điều hướng bàn phím, ô search (form `/search`), link Quick order (setting), `<shopify-account menu="…">` trong `{% if shop.customer_accounts_enabled %}`, cart count; chip "Ship to" in `customer.current_location.name | escape` khi `customer.b2b?`.
5. Footer: menu, newsletter (`{% form 'customer' %}`), Follow on Shop (`shop | login_button: action: 'follow'`), localization form, payment icons.
6. Component, hợp đồng và snippet dùng chung như mục Architecture; `<bh-quantity>` chạy được không JS (input number với `min`, `step`, `max`). Viết test thủ công cho `addLines()` theo đúng 5 ca P-c.
7. `_blocks.liquid`, section và block Custom Liquid.
8. CI: sửa workflow Theme Check có sẵn của Skeleton (workflow nằm trong repo hiện tại và chạy khi anh nối GitHub remote; trước đó chạy `shopify theme check` local), ghim action theo full commit SHA, chỉ chạy trên `push` và `pull_request`, đặt `permissions: contents: read`; config `theme-check:recommended`.
9. Product card profile `Browsing`/`Technical`, `search-form.liquid` với control scope mobile, `newsletter-form.liquid`, `section-style.liquid`, `editor-empty-state.liquid`; đặt settings và locale schema theo kiến trúc editor ở trên.
10. Kiểm tra ở 375/768/1440px: header search không tràn, card Technical với SKU 40 ký tự và title 120 ký tự, thiếu spec, sold-out, guest không có B2B; ghi vào mục kết quả của phase, không coi là bằng chứng editor thật (G2 thuộc phase 7).

## Todo

- [ ] Settings schema và token
- [ ] Layout và CSS nền
- [ ] Header group (announcement, header, mega menu, account, ship-to)
- [ ] Footer group (menu, newsletter, Follow on Shop, localization, payment)
- [ ] `<bh-quantity>`, `price-tiers.js`, `cart-api.js` với `addLines()`, `section-renderer.js`
- [ ] Snippet image, price, stock-status, product-card, price-break-hint, breadcrumbs
- [ ] `_blocks.liquid`, Custom Liquid section và block
- [ ] Workflow Theme Check đã ghim SHA
- [ ] Đối chiếu G0 với P-a…P-j, ghi delta/reapproval
- [ ] Product card profile Browsing/Technical, tham số `profile` và setting mặc định
- [ ] Search header (mobile control scope tách khỏi input), `search-form.liquid`
- [ ] `newsletter-form.liquid` dùng chung footer/password/S09
- [ ] Kiến trúc settings editor (`section-style`, `editor-empty-state`, locale schema, presets)

## Success Criteria

- `shopify theme check` không còn error; CI Theme Check xanh.
- Đổi scheme, font, density trong editor thì storefront đổi đúng, không có giá trị hardcode.
- `<shopify-account>` thấy được ở 390px và 1440px; mega menu đi được hoàn toàn bằng bàn phím.
- Chip "Ship to" hiện với tài khoản B2B test và không hiện với khách thường.
- `addLines()` cho kết quả đúng ở cả 5 ca P-c, kể cả khi cart đã có sẵn hàng.
- Reconciliation có ghi nhận; không phần nào của thiết kế bị prototype bác bỏ mà vẫn được triển khai khi chưa duyệt lại.
- Card profile đổi được ở theme setting; Technical giữ SKU/pack/stock đọc được với title 120 ký tự và SKU 40 ký tự; không có Add nhầm variant.
- Header search ở 375px: input không bị bóp, scope control tách riêng, gõ SKU/MPN vẫn đến đúng `/search`; không document overflow ở 375/768/1440px.
- Footer, password và S09 dùng cùng `newsletter-form.liquid`, không có logic form thứ hai.
- Header + hero search và footer + S09 newsletter hoạt động độc lập trên cùng trang: IDs/labels/ARIA trỏ đúng instance, keyboard/focus và error feedback không nhảy sang form còn lại.
- Không file nào trong theme sao chép code từ `mockup/`.

## Risk Assessment

- Mega menu nhiều cấp dễ trượt accessibility. Kiểm tra bằng bàn phím và trình đọc màn hình ngay trong phase này.
- Script của `<shopify-account>` được giả định là inject qua `content_for_header` (chưa kiểm chứng). Nếu không thấy component render, đọc lại guide của component.
- Thiết kế đã duyệt ở G0 có thể xung đột với platform (G1): nếu bỏ qua bước reconcile, phase 3–7 xây trên giả định sai. Ghi delta trước khi viết code.

## Security Considerations

- Quy tắc output ở mục Architecture là bắt buộc cho mọi file Liquid và JS từ phase này trở đi.
- Workflow CI chỉ có quyền đọc và không dùng secret.
- `request.design_mode` chỉ để hiện hướng dẫn editor; không dùng để mở dữ liệu cho khách.

## Next Steps

Phase 3, 4, 5 dùng các component và hợp đồng này; phase 7 dùng `section-style`, `editor-empty-state`, `search-form`, `newsletter-form` và profile card để dựng thư viện section.
