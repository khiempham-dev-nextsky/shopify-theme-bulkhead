---
title: Lập plan Bulkhead v1.0 với preset Bulkhead
date: 2026-10-21
summary: "Plan 9 phase cho theme Bulkhead, prototype rủi ro trước; hai phát hiện đổi constraint: Skeleton main là v2 và demo store phải khớp catalog size."
---

# Lập plan Bulkhead v1.0 với preset Bulkhead

## What happened
- Chốt preset Bulkhead (Hardware, Lots 500+) qua brainstorm; contract ở `plans/reports/brainstorm-261021-1421-bulkhead-preset-contract.md`.
- Hai researcher chạy song song. Phát hiện 1: từ 01/10/2026 nhánh `main` của Shopify Skeleton là bản v2 dùng `{% block %}`, không có `sections/` và JSON template, nên `shopify theme init` mặc định không dùng được cho Theme Store. Đã xác minh bằng `gh api` và ghim commit `a4f32d393b9eadf6c4403318ca39116832e5d1df`.
- Phát hiện 2: requirements ghi "Each demo store must match the primary industry and catalog size that the theme preset is tagged to". Demo 70–100 sản phẩm không khớp tag Lots, nên anh chọn giữ Lots và nâng demo lên ≥ 500 sản phẩm, bỏ nhãn "(demo)", dùng brand hư cấu.
- Plan tại `plans/261021-0812-bulkhead-preset-v1/`, 9 phase, khoảng 15 tuần.
- Red-team 4 reviewer: 40 finding, gộp còn 15. Nặng nhất: import bằng `productSet` không publish, không tạo metafield definition, không idempotent; thứ tự phase không khớp dữ liệu cần dùng; tìm theo MPN và breadcrumbs bị bỏ sót; P-b dùng test order nên `last_order` chắc chắn rỗng; Lighthouse có thể đo nhầm trang password.

## Decision
- Hướng "hai lớp": lớp chung cho mọi khách, lớp B2B tự bật khi có dữ liệu (bậc giá và quantity rule chỉ có với khách B2B).
- Ba store: demo (client transfer, Plus), benchmark (Lighthouse), feature test.
- Cột spec trong Table view: thử metafield chuẩn `shopify.*` trước, lùi về setting `namespace.key` để trống trong preset.
- `addLines()` trong `cart-api.js` là nơi duy nhất kiểm tra trước; quick order không tự làm tròn số lượng.
- Câu hỏi parity gửi Theme Support ngay sau P-h; dùng repo hiện tại (chưa có remote); ảnh cuối commit vào git; phase 8 chạy song song phase 2 ở session riêng.

## Next steps
- Anh tạo Partner account, ba store, cấu hình B2B, app Lighthouse và GitHub secrets theo checklist phase 1.
- Chạy `/ak:cook plans/261021-0812-bulkhead-preset-v1/plan.md` bắt đầu từ phase 1.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
