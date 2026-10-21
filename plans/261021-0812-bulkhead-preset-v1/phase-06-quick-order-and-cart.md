---
phase: 6
title: "Phase 6: Quick order và cart"
status: pending
priority: P1
effort: "1.5w"
dependencies: [1, 2, 3, 4, 5, 8]
---

<!-- Updated: Red Team 2026-10-21 -->

# Phase 6: Quick order và cart

## Goal

Quick order pad (section và trang riêng) cho dán tới 50 dòng `SKU, qty`, kiểm tra tồn kho và quantity rule trước khi vào cart; cart tôn trọng quantity rule và bậc giá; Reorder theo kết quả prototype.

## Context Links

- [Contract](../reports/brainstorm-261021-1421-bulkhead-preset-contract.md), acceptance criterion số 3 và 6.
- `reports/prototype-results.md` của plan này (P-a, P-b, P-c, P-d).
- [Research Skeleton](../reports/researcher-261021-1503-skeleton-theme-store-tooling.md), mục 5 (Cart API, rate limit).

## Key Insights

- Không có rate limit công bố; giới hạn song song theo kết quả P-d và tôn trọng `Retry-After`.
- AC3 đòi đánh dấu dòng vi phạm quantity rule, nên quick order giữ nguyên số lượng khách nhập và chỉ gợi ý số hợp lệ; không tự làm tròn.
- Đây là chỗ theme free Trade bị chê nhiều nhất ("no way to display stock levels on the quick buy list"), nên tồn kho phải hiện ngay ở từng dòng.

## Requirements

- Nhập: một dòng (ô SKU + số lượng, có gợi ý), hoặc dán nhiều dòng; chấp nhận phân tách bằng dấu phẩy, tab hoặc khoảng trắng; SKU so khớp không phân biệt hoa thường; dòng trùng SKU được gộp và báo cho khách; dòng thiếu số lượng mặc định là `min` của quantity rule.
- Quá 50 dòng: báo giới hạn rõ ràng, không cắt bớt âm thầm.
- Mỗi dòng hiện: SKU, tên, variant, tồn kho thật, đơn giá (bậc giá với B2B qua `price-tiers.js`), số lượng khách nhập, thành tiền, trạng thái (hợp lệ, sai SKU, không chắc chắn, hết hàng, vi phạm quantity rule kèm gợi ý "đổi thành N").
- Thêm vào cart bằng `addLines()` của phase 2; lỗi đánh dấu tại dòng, các dòng khác không bị ảnh hưởng; tổng kết đọc một lần qua `aria-live`.
- Cart page: `<bh-quantity>` theo `line_item.variant.quantity_rule`, thông báo khi cart vượt rule, hiện bậc giá đang áp dụng.
- Reorder: theo quyết định P-b (nút "Order again" dựa trên `customer.orders | first`, hoặc link tới trang orders của customer account), đặt ở trang quick order.

## Architecture

- `sections/quick-order.liquid` dùng cho homepage (section) và `templates/page.quick-order.json` (trang đầy đủ, có thêm vùng dán).
- `assets/quick-order.js`: `<bh-quick-order>` gồm parser, hàng đợi tra SKU với số request song song cố định, xử lý 429 bằng `Retry-After`, và bảng kết quả dựng bằng `textContent`.
- Tra SKU bằng section `quick-order-lookup` render qua `section_id` (predictive search hoặc `/search` tuỳ P-a). Section trả dữ liệu variant trong `<script type="application/json">{{ data | json }}</script>` (variant id, sku, tên, tồn kho, `inventory_policy`, `quantity_rule`, bậc giá) và không in lại `q`. Khi có kết quả nhưng không variant nào khớp đúng SKU, trả trạng thái "không chắc chắn" để JS thử lại bằng `/search`.

## Related Code Files

- Create: `sections/quick-order.liquid`, `sections/quick-order-lookup.liquid`, `templates/page.quick-order.json`, `assets/quick-order.js`, `snippets/reorder.liquid`.
- Modify: `sections/main-cart.liquid`, `assets/cart-page.js`.

## Implementation Steps

1. Section tra SKU trả JSON theo đúng quyết định P-a, có trạng thái "không chắc chắn".
2. Parser, gộp dòng trùng, giới hạn 50 dòng; hàng đợi tra cứu có giới hạn song song và retry 429 theo `Retry-After`.
3. Bảng kết quả, gợi ý số lượng hợp lệ, thêm vào cart bằng `addLines()`, báo lỗi theo dòng.
4. Cart page: quantity rule và bậc giá.
5. Reorder theo P-b.
6. Test trên demo store có đủ catalog ≥ 500 sản phẩm: 1 dòng, 20 dòng hợp lệ, 20 dòng có lỗi trộn lẫn (sai SKU, hết hàng, sai step, vượt max khi cart đã có hàng, SKU trùng), 51 dòng, SKU dùng chung tiền tố, title có `"`, `<`, `&`; khách thường và khách B2B; bàn phím và trình đọc màn hình.

## Todo

- [ ] Section tra SKU có JSON an toàn và trạng thái "không chắc chắn"
- [ ] Parser, gộp dòng, giới hạn 50 dòng, hàng đợi tra cứu
- [ ] Bảng kết quả và thêm vào cart
- [ ] Cart page với quantity rule và bậc giá
- [ ] Reorder
- [ ] Test các kịch bản trên catalog đầy đủ

## Success Criteria

- Acceptance criterion số 3 của contract đạt đủ, có log hoặc ảnh chụp (đã che dữ liệu) cho từng kịch bản ở bước 6.
- Với khách B2B, số lượng ở quick order, card, PDP và cart đều theo cùng một quantity rule (cùng hàm `addLines()`).
- Không có lỗi console; không có request 422 nào bị retry; mọi 429 đều được retry theo `Retry-After`.

## Risk Assessment

- Rate limit thay đổi theo store. Số request song song là hằng số dễ chỉnh trong `quick-order.js`, có giá trị mặc định theo P-d.

## Security Considerations

- Nội dung dán vào chỉ được xử lý như văn bản và chèn bằng `textContent`; section tra cứu không in lại `q`.

## Next Steps

Phase 7 đặt quick order pad lên homepage của preset.
