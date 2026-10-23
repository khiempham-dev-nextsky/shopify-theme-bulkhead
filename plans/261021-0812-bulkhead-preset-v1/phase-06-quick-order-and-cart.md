---
phase: 6
title: "Phase 6: Quick order và cart"
status: pending
priority: P1
effort: "1.5w"
dependencies: [0, 1, 2, 3, 4, 5, 8]
---

<!-- Updated: Red Team 2026-10-21 -->
<!-- Updated: Scope revision 2026-10-23 - thêm phase 0 (G0) vào dependencies, effort giữ 1.5w; S04 có hai layout Compact pad/Full page dùng chung parser, lookup, validation và cart API; mobile stacked rows -->

# Phase 6: Quick order và cart

## Goal

Quick order pad (section và trang riêng) cho dán tới 50 dòng `SKU, qty`, kiểm tra tồn kho và quantity rule trước khi vào cart; cart tôn trọng quantity rule và bậc giá; Reorder theo kết quả prototype.

## Context Links

- [Contract](../reports/brainstorm-261021-1421-bulkhead-preset-contract.md), acceptance criterion số 3 và 6.
- `reports/prototype-results.md` của plan này (P-a, P-b, P-c, P-d).
- [Research Skeleton](../reports/researcher-261021-1503-skeleton-theme-store-tooling.md), mục 5 (Cart API, rate limit).
- [Section inventory](./section-inventory.md), S04 (quick order), D01 (search SKU/MPN), mục stress content, AC11/AC12 và gates.
- [Phase 0](./phase-00-design-and-section-inventory.md), G0 và `reports/design-approval.md` (đầu ra tương lai của phase 0, chưa phải bằng chứng đã có).

## Key Insights

- Không có rate limit công bố; giới hạn song song theo kết quả P-d và tôn trọng `Retry-After`.
- AC3 đòi đánh dấu dòng vi phạm quantity rule, nên quick order giữ nguyên số lượng khách nhập và chỉ gợi ý số hợp lệ; không tự làm tròn.
- Đây là chỗ theme free Trade bị chê nhiều nhất ("no way to display stock levels on the quick buy list"), nên tồn kho phải hiện ngay ở từng dòng.
- S04 là một section với `layout` Compact pad (homepage/landing) và Full page (trang Quick order). Hai layout dùng chung `<bh-quick-order>`, parser, lookup `quick-order-lookup`, validation theo dòng và `addLines()`; không có engine, giới hạn hoặc quy tắc số lượng riêng cho từng layout. G0 chỉ duyệt thiết kế trên mockup; lookup SKU, `cart/add.js`, rate limit và Reorder vẫn theo P-a…P-d (phase 1). G0 không miễn các gate platform hoặc Theme Support.
- Thứ tự theo `dependencies: [0, 1, 2, 3, 4, 5, 8]` là bảo thủ: phase 8 hoàn tất toàn bộ (gồm import và ảnh cuối) trước khi phase 6 bắt đầu, cùng với 3, 4, 5; không khởi động sớm dựa trên import một phần.

## Requirements

- Nhập: một dòng (ô SKU + số lượng, có gợi ý), hoặc dán nhiều dòng; chấp nhận phân tách bằng dấu phẩy, tab hoặc khoảng trắng; SKU so khớp không phân biệt hoa thường; dòng trùng SKU được gộp và báo cho khách; dòng thiếu số lượng mặc định là `min` của quantity rule.
- Quá 50 dòng: báo giới hạn rõ ràng, không cắt bớt âm thầm.
- Mỗi dòng hiện: SKU, tên, variant, tồn kho thật, đơn giá (bậc giá với B2B qua `price-tiers.js`), số lượng khách nhập, thành tiền, trạng thái (hợp lệ, sai SKU, không chắc chắn, hết hàng, vi phạm quantity rule kèm gợi ý "đổi thành N").
- Thêm vào cart bằng `addLines()` của phase 2; lỗi đánh dấu tại dòng, các dòng khác không bị ảnh hưởng; tổng kết đọc một lần qua `aria-live`.
- Cart page: `<bh-quantity>` theo `line_item.variant.quantity_rule`, thông báo khi cart vượt rule, hiện bậc giá đang áp dụng.
- Reorder: theo quyết định P-b (nút "Order again" dựa trên `customer.orders | first`, hoặc link tới trang orders của customer account), đặt ở trang quick order.
- **Layout S04:** Compact pad (homepage/landing/editor): nhập một dòng SKU + số lượng có gợi ý, hiện kết quả dòng và link tới trang Quick order để dán danh sách; Full page: thêm vùng dán tới 50 dòng và Reorder. Dán nhiều dòng ở bất kỳ layout nào đều đi qua cùng parser và giới hạn 50 dòng như trên, không có đường tắt riêng.
- **Mobile (375px):** mỗi dòng xếp chồng thành khối có nhãn: SKU, tên/variant, pack, tồn kho, đơn giá, số lượng khách nhập, thành tiền, trạng thái. Pack, stock và SKU luôn nằm cùng khối với dòng; thông báo lỗi và gợi ý "đổi thành N" hiện tại đúng dòng đó, không chỉ ở banner phía trên hoặc sau khi cuộn đi. Pack chỉ hiện khi có dữ liệu thật, không đoán. Document không overflow; giữ thứ tự DOM trùng thứ tự đọc.
- Dòng lỗi giữ nguyên input khách nhập, nêu nguyên nhân; không làm tròn âm thầm. Quy tắc cũ giữ nguyên: 50 dòng, gộp trùng, dòng thiếu số lượng mặc định `min`, một lần `cart/add.js` với dòng đã qua kiểm tra, 422 chuyển sang từng dòng, lỗi theo dòng không ảnh hưởng dòng khác, `aria-live` tổng kết một lần.
- Stress content: title 120 ký tự, SKU 40 ký tự, `"`, `<`, `&` trong title, 1/20/51 dòng, sold-out/low-stock, guest và B2B ở 375/768/1440px; không đè chữ/control, không document overflow.

## Architecture

- `sections/quick-order.liquid` (S04) có setting `layout` (Compact pad | Full page) và `presets` để merchant thêm vào homepage, landing hoặc trang riêng bằng editor; `templates/page.quick-order.json` dùng layout Full page. Cùng markup bảng kết quả cho hai layout, chỉ khác vùng nhập; ID DOM dùng `section.id` để nhiều instance trên một trang không đụng nhau.
- `assets/quick-order.js`: `<bh-quick-order>` gồm parser, hàng đợi tra SKU với số request song song cố định, xử lý 429 bằng `Retry-After`, và bảng kết quả dựng bằng `textContent`.
- Tra SKU bằng section `quick-order-lookup` render qua `section_id` (predictive search hoặc `/search` tuỳ P-a). Section trả dữ liệu variant trong `<script type="application/json">{{ data | json }}</script>` (variant id, sku, tên, tồn kho, `inventory_policy`, `quantity_rule`, bậc giá) và không in lại `q`. Khi có kết quả nhưng không variant nào khớp đúng SKU, trả trạng thái "không chắc chắn" để JS thử lại bằng `/search`.

## Related Code Files

- Create: `sections/quick-order.liquid`, `sections/quick-order-lookup.liquid`, `templates/page.quick-order.json`, `assets/quick-order.js`, `snippets/reorder.liquid`.
- Modify: `sections/main-cart.liquid`, `assets/cart-page.js`, `locales/en.default.json`/`en.default.schema.json` cho chuỗi và setting mới.

## Implementation Steps

1. Section tra SKU trả JSON theo đúng quyết định P-a, có trạng thái "không chắc chắn".
2. Parser, gộp dòng trùng, giới hạn 50 dòng; hàng đợi tra cứu có giới hạn song song và retry 429 theo `Retry-After`.
3. Bảng kết quả (stacked rows trên mobile, giữ SKU/pack/stock/lỗi cùng dòng), gợi ý số lượng hợp lệ, thêm vào cart bằng `addLines()`, báo lỗi theo dòng; hai layout Compact pad/Full page dùng chung.
4. Cart page: quantity rule và bậc giá.
5. Reorder theo P-b.
6. Test trên demo store có đủ catalog ≥ 500 sản phẩm: 1 dòng, 20 dòng hợp lệ, 20 dòng có lỗi trộn lẫn (sai SKU, hết hàng, sai step, vượt max khi cart đã có hàng, SKU trùng), 51 dòng, SKU dùng chung tiền tố, title có `"`, `<`, `&`; khách thường và khách B2B; bàn phím và trình đọc màn hình; cả Compact pad và Full page ở 375/768/1440px, kèm stress content (fixture `fixture-*` của phase 8 trên feature test store cho title 120 ký tự, SKU 40 ký tự) và kiểm tra document không overflow.

## Todo

- [ ] Section tra SKU có JSON an toàn và trạng thái "không chắc chắn"
- [ ] Parser, gộp dòng, giới hạn 50 dòng, hàng đợi tra cứu
- [ ] Bảng kết quả và thêm vào cart; Compact pad/Full page dùng chung; mobile stacked rows
- [ ] Cart page với quantity rule và bậc giá
- [ ] Reorder
- [ ] Test các kịch bản trên catalog đầy đủ, hai layout, guest và B2B, 375/768/1440px

## Success Criteria

- Acceptance criterion số 3 của contract đạt đủ, có log hoặc ảnh chụp (đã che dữ liệu) cho từng kịch bản ở bước 6.
- Với khách B2B, số lượng ở quick order, card, PDP và cart đều theo cùng một quantity rule (cùng hàm `addLines()`).
- Không có lỗi console; không có request 422 nào bị retry; mọi 429 đều được retry theo `Retry-After`.
- Compact pad và Full page cho cùng kết quả với cùng input (cùng parser, trạng thái, `addLines()`); không có file hoặc logic quick order thứ hai.
- 375px: mỗi dòng hiện SKU, pack (khi có), stock, qty, thành tiền và lỗi cùng một khối; lỗi nằm ở dòng gây ra; không làm tròn âm thầm; không document overflow; Tab theo thứ tự đọc.

## Risk Assessment

- Rate limit thay đổi theo store. Số request song song là hằng số dễ chỉnh trong `quick-order.js`, có giá trị mặc định theo P-d.
- Hai layout dùng một implementation nên regression ở một layout có thể lan sang layout kia: test cả hai trong mỗi lần chạy kịch bản bước 6.

## Security Considerations

- Nội dung dán vào chỉ được xử lý như văn bản và chèn bằng `textContent`; section tra cứu không in lại `q`.

## Next Steps

Phase 7 đặt S04 (Compact pad) lên homepage của preset, trước category theo thứ tự mặc định, và dùng lại cùng section cho landing; không tạo section quick order khác.
