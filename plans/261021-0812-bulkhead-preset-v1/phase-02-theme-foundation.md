---
phase: 2
title: "Phase 2: Nền móng theme"
status: pending
priority: P1
effort: "1.5w"
dependencies: [1]
---

<!-- Updated: Red Team 2026-10-21 -->

# Phase 2: Nền móng theme

## Goal

Dựng kiến trúc riêng của Bulkhead trên nền Skeleton: design token, settings, layout, header và footer group, quy tắc output an toàn, cùng các component và hợp đồng dùng chung mà phase 3–7 sẽ dùng lại.

## Context Links

- [Contract](../reports/brainstorm-261021-1421-bulkhead-preset-contract.md), mục Design và Constraints.
- Design system: mục 6.5 của file nghiên cứu thị trường (bảng màu, font, spacing, radius, nút).
- [Research Skeleton](../reports/researcher-261021-1503-skeleton-theme-store-tooling.md), mục 1 (`_blocks.liquid`), 4 (`<shopify-account>`, localization) và 5 (Cart API).
- `reports/prototype-results.md` (P-c quyết định đường lui của `addLines()`).

## Key Insights

- Theme Store đòi "fundamentally different" ở mức kiến trúc, nên tên component, cấu trúc CSS và JS phải là của Bulkhead, không lặp Dawn hay Horizon.
- `_blocks.liquid` tự viết phải khai báo cả `@theme` lẫn `@app`, có `presets`, không có `templates`.
- Không dùng Sass, không minify code của mình. Font chỉ qua `font_picker` và `font_modify`.
- Liquid không tự escape; một quy tắc output chung tránh việc mỗi phase tự xử lý một kiểu.

## Requirements

- Ít nhất 4 color scheme (default, inverse, accent band, surface), mỗi màu nền có màu chữ đi kèm, đạt contrast trong contract.
- Ba font setting: heading (Archivo), body (IBM Plex Sans), data (IBM Plex Mono). Biến thể đậm và nghiêng nạp bằng `font_modify`.
- Setting "Density" (Comfortable/Compact) điều khiển chiều cao hàng ở Table view và quick order.
- Header group: announcement bar; header có logo, ô search (phase 4 gắn predictive search), link Quick order, `<shopify-account>` hiện trên desktop và mobile, cart; mega menu nhiều cấp; chip "Ship to" chỉ khi `customer.b2b?`.
- Footer group: menu, newsletter, Follow on Shop, localization (country/language), payment icons. Localization có fallback khi tắt JS.
- Section và block Custom Liquid; mọi section nội dung nhận `@theme` blocks.

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
- Delete: `sections/hello-world.liquid` và các file mẫu khác của Skeleton không dùng tới.

## Implementation Steps

1. Viết `settings_schema.json`: `theme_info` (name Bulkhead, version 1.0.0, link doc và support), color scheme group, font, density, layout (container 1360px), favicon, social image. Settings viết bằng American English, sentence case.
2. Viết `theme-tokens.liquid` sinh CSS custom properties cho scheme, font, spacing scale 4px, radius 2/4px; `base.css` dùng các token này.
3. Viết lại `layout/theme.liquid`: preload font, `content_for_header`, skip link, header group, `main`, footer group, nạp `base.css`.
4. Header: logo, nav mega menu bằng `<details>` lồng nhau có điều hướng bàn phím, ô search (form `/search`), link Quick order (setting), `<shopify-account menu="…">` trong `{% if shop.customer_accounts_enabled %}`, cart count; chip "Ship to" in `customer.current_location.name | escape` khi `customer.b2b?`.
5. Footer: menu, newsletter (`{% form 'customer' %}`), Follow on Shop (`shop | login_button: action: 'follow'`), localization form, payment icons.
6. Component, hợp đồng và snippet dùng chung như mục Architecture; `<bh-quantity>` chạy được không JS (input number với `min`, `step`, `max`). Viết test thủ công cho `addLines()` theo đúng 5 ca P-c.
7. `_blocks.liquid`, section và block Custom Liquid.
8. CI: sửa workflow Theme Check có sẵn của Skeleton (workflow nằm trong repo hiện tại và chạy khi anh nối GitHub remote; trước đó chạy `shopify theme check` local), ghim action theo full commit SHA, chỉ chạy trên `push` và `pull_request`, đặt `permissions: contents: read`; config `theme-check:recommended`.

## Todo

- [ ] Settings schema và token
- [ ] Layout và CSS nền
- [ ] Header group (announcement, header, mega menu, account, ship-to)
- [ ] Footer group (menu, newsletter, Follow on Shop, localization, payment)
- [ ] `<bh-quantity>`, `price-tiers.js`, `cart-api.js` với `addLines()`, `section-renderer.js`
- [ ] Snippet image, price, stock-status, product-card, price-break-hint, breadcrumbs
- [ ] `_blocks.liquid`, Custom Liquid section và block
- [ ] Workflow Theme Check đã ghim SHA

## Success Criteria

- `shopify theme check` không còn error; CI Theme Check xanh.
- Đổi scheme, font, density trong editor thì storefront đổi đúng, không có giá trị hardcode.
- `<shopify-account>` thấy được ở 390px và 1440px; mega menu đi được hoàn toàn bằng bàn phím.
- Chip "Ship to" hiện với tài khoản B2B test và không hiện với khách thường.
- `addLines()` cho kết quả đúng ở cả 5 ca P-c, kể cả khi cart đã có sẵn hàng.

## Risk Assessment

- Mega menu nhiều cấp dễ trượt accessibility. Kiểm tra bằng bàn phím và trình đọc màn hình ngay trong phase này.
- Script của `<shopify-account>` được giả định là inject qua `content_for_header` (chưa kiểm chứng). Nếu không thấy component render, đọc lại guide của component.

## Security Considerations

- Quy tắc output ở mục Architecture là bắt buộc cho mọi file Liquid và JS từ phase này trở đi.
- Workflow CI chỉ có quyền đọc và không dùng secret.

## Next Steps

Phase 3, 4, 5 dùng các component và hợp đồng này.
