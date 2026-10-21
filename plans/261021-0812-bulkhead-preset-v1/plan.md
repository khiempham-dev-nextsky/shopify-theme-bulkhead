---
title: "Bulkhead v1.0 với preset Bulkhead (Hardware, Lots 500+)"
description: "Dựng theme Bulkhead từ Skeleton, preset Bulkhead cho cửa hàng vật tư trade, demo store ≥ 500 sản phẩm, sẵn sàng nộp Theme Store."
status: pending
priority: P1
effort: 15w
branch: master
tags: [feature, frontend, shopify-theme, b2b]
blockedBy: []
blocks: []
created: 2026-10-21
---

# Bulkhead v1.0 với preset Bulkhead

## Overview

Plan này dựng theme Bulkhead với đúng một preset Bulkhead (Hardware, Lots 500+), theo contract đã chốt. Phase đầu tiên chuẩn bị ba store (demo, benchmark, feature test) và prototype 10 điểm chưa kiểm chứng (tra SKU và MPN, `customer.orders` với new customer accounts, `cart/add.js` nhiều dòng, chuỗi import đầy đủ, dữ liệu B2B, metafield spec chuẩn, filter không cần app, cơ chế `?view=`). Kết quả prototype quyết định cách làm của các phase sau.

Hướng thiết kế là "hai lớp": lớp chung chạy cho mọi khách (quick order, bulk variant matrix, Table view, spec, downloads, tồn kho thật) và lớp B2B tự bật khi có dữ liệu (bậc giá, quantity rule, ship-to).

- Contract: [brainstorm contract](../reports/brainstorm-261021-1421-bulkhead-preset-contract.md)
- Research: [Skeleton và tooling Theme Store](../reports/researcher-261021-1503-skeleton-theme-store-tooling.md), [dữ liệu demo và ảnh](../reports/researcher-261021-1503-demo-data-image-pipeline.md)
- Nghiên cứu thị trường gốc: `/Volumes/Projects/Downloads/shopify-theme-store-research.md` (nằm ngoài repo)

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | Theme đạt mọi yêu cầu kỹ thuật và tính năng bắt buộc của Theme Store | P1 |
| 2 | Lớp chung cho trade catalog chạy được với mọi khách | P1 |
| 3 | Lớp B2B tự bật đúng với khách B2B và ẩn sạch với khách thường | P1 |
| 4 | Demo store ≥ 500 sản phẩm, ảnh đồng bộ, nội dung authentic, preset parity | P1 |

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Môi trường và prototype rủi ro](./phase-01-start.md) | Pending |
| 2 | [Nền móng theme](./phase-02-theme-foundation.md) | Pending |
| 3 | [Template bắt buộc và tính năng toàn store](./phase-03-required-features.md) | Pending |
| 4 | [Collection và search](./phase-04-collection-and-search.md) | Pending |
| 5 | [Product page](./phase-05-product-page.md) | Pending |
| 6 | [Quick order và cart](./phase-06-quick-order-and-cart.md) | Pending |
| 7 | [Homepage và preset Bulkhead](./phase-07-homepage-and-preset.md) | Pending |
| 8 | [Dữ liệu demo và ảnh](./phase-08-demo-data-and-images.md) | Pending |
| 9 | [QA và sẵn sàng nộp](./phase-09-qa-and-submission-readiness.md) | Pending |

## Dependencies

- Phase 1 bị chặn bởi việc anh tạo Partner account và ba store, cấu hình B2B, app Lighthouse và GitHub secrets (checklist ở phase 1).
- Thứ tự: 1 → {2, 8} song song → {3, 4, 5} → 6 → 7 → 9. Phần import của phase 8 phải xong trước khi phase 4 và 5 đóng; ảnh cuối của phase 8 phải xong trước phase 9.
- Thực thi: sau khi phase 1 đóng, phase 8 chạy ở session và worktree riêng, song song với phase 2.
- Phase 6 dùng `<bh-quantity>`, `price-tiers.js`, `addLines()` và product card từ phase 2, cùng kết quả prototype của phase 1.
- Effort 15 tuần gồm khoảng 2 tuần dự phòng cho thời gian chờ (anh tạo store, duyệt ảnh mẫu, hạn mức Codex, vòng sửa Lighthouse).

## Success Criteria

- [ ] Đạt 10 acceptance criteria trong contract, mỗi tiêu chí có bằng chứng ghi trong phase 9.
- [ ] Theme Check không còn error; Lighthouse trung bình ba trang đạt performance ≥ 60 và accessibility ≥ 90 trên cả desktop lẫn mobile.
- [ ] Demo store ≥ 500 sản phẩm hiển thị trên storefront, không cài app; preset cài lên feature test store khớp demo, trừ danh sách khác biệt anh đã duyệt.

## Red Team Review

### Session — 2026-10-21
**Findings:** 15 sau khi gộp từ 40 (14 accepted, 0 rejected, 1 chuyển cho anh quyết và đã quyết)
**Severity breakdown:** 5 Critical, 10 High

| # | Finding | Severity | Disposition | Applied To |
|---|---------|----------|-------------|------------|
| 1 | Import không publish, không tạo metafield definition, thiếu scope, không poll file | Critical | Accept | Phase 1, 8 |
| 2 | Import không idempotent, token có thể hết hạn giữa chừng, không thu hồi token | Critical | Accept | Phase 1, 8 |
| 3 | Thứ tự phase không khớp dữ liệu cần dùng (benchmark CSV, catalog 500, B2B) | Critical | Accept | plan.md, Phase 1, 4, 5, 6, 8, 9 |
| 4 | Lệch phạm vi contract: thiếu tìm theo MPN và breadcrumbs; thêm search List/Table, link Reorder trên header, tax ID bắt buộc | Critical | Accept | Phase 1, 2, 4, 5, 6, 7, 8 |
| 5 | Cột spec Table view đọc `namespace.key`, trái constraint dynamic source | Critical | Anh chọn: thử metafield chuẩn `shopify.*` trước (P-h), lùi về setting để trống | Phase 1, 4, 8 |
| 6 | Preset parity chưa có phép thử; `theme push` ghi đè kết nối metafield trên demo store | High | Accept | Phase 7, 8, 9 |
| 7 | P-b dùng test order nên `last_order` chắc chắn rỗng | High | Accept | Phase 1, 6 |
| 8 | Dữ liệu prototype ở lại demo store; P-f thiếu cấu hình bậc giá; thiếu store test tính năng và checklist trong repo | High | Accept | Phase 1, 3, 5, 9 |
| 9 | Lighthouse có thể đo trang password, thiếu app và secret, không tính trung bình desktop, không đo Table view | High | Accept | Phase 1, 4, 9 |
| 10 | Hợp đồng `addLines()` mâu thuẫn, làm tròn số lượng trái AC3, không cộng hàng đã có trong cart, thông báo lặp; `image.liquid` tạo muộn | High | Accept | Phase 2, 3, 5, 6 |
| 11 | P-a thử trên 12 product, không lộ lỗi top 10 khi SKU dùng chung tiền tố | High | Accept | Phase 1, 6, 9 |
| 12 | Chính sách output rời rạc (JSON nhúng, `q` in lại, link không kiểm tra scheme); bằng chứng chứa dữ liệu cá nhân | High | Accept | Phase 1, 2, 4, 5, 6, 9 |
| 13 | CI dùng tag trôi, `npx` không ghim, thiếu `permissions`, chưa xác minh SHA Skeleton | High | Accept | Phase 1, 2, 9 |
| 14 | Pipeline ảnh Codex có thể gán nhầm ảnh, ghi vào repo, không lưu provenance, hậu kỳ phóng to và tạo viền | High | Accept | Phase 8 |
| 15 | Search & Discovery có thể vi phạm luật "không app" của demo store | High | Accept (prototype P-i, hỏi anh nếu xấu) | Phase 1, 4 |

### Whole-Plan Consistency Sweep

- Decision delta: ba store thay vì hai; import gồm definition, publish, `identifier` và trạng thái chạy lại; `addLines()` và `price-tiers.js` chuyển về phase 2; quick order không tự làm tròn; phase 4, 5, 6 phụ thuộc phase 8; bỏ template search List/Table và link Reorder trên header; cột spec theo P-h.
- Đã tìm các thuật ngữ cũ (`brands.json`, `search.list`, `search.table`, `12 product`, `store trống`, `benchmark dev store` cho selling plans, `70–100`, `1 test order`, `13w`) trên mọi phase và contract; các chỗ còn lại đã sửa, các kết quả còn lại chỉ nằm trong bảng Red Team Review.
- Contract đã cập nhật: ba store, quyết định cột spec, kênh tìm MPN.
- Không còn mâu thuẫn chưa giải quyết.

## Validation Log

### Session 1 — 2026-10-21
**Trigger:** Cổng validation của `/ak:plan` chế độ hard, sau Red Team Review.
**Questions asked:** 4
**Verification:** bỏ qua bước verification vì Red Team Review đã có bằng chứng `file:line`; repo chưa có code nên không có claim nào về file hiện có cần kiểm.

#### Questions & Answers

1. **[Risks]** Preset parity với custom metafield (preset để trống, demo store nối trong editor) chưa được Shopify xác nhận. Khi nào gửi câu hỏi cho Theme Support?
   - Options: Ngay sau P-h ở phase 1 (Recommended) | Ở phase 9 như plan hiện tại
   - **Answer:** Ngay sau P-h ở phase 1
   - **Rationale:** Nếu bị từ chối, thiết kế spec/downloads đổi trước khi code phase 4–5.
2. **[Assumptions]** Repo chưa có GitHub remote, trong khi CI Theme Check và Lighthouse action chạy trên GitHub. Dùng repo nào?
   - Options: Tạo repo private (Recommended) | Chỉ chạy local | Repo đã có sẵn
   - **Answer:** Other
   - **Custom input:** "ở repo hiện tại đang làm nhé"
   - **Rationale:** Dùng repo hiện tại. Repo chưa có remote, nên workflow nằm sẵn trong repo và chạy khi anh nối remote; trước đó Theme Check và Lighthouse (cả mobile lẫn desktop) chạy bằng script local.
3. **[Tradeoffs]** Ảnh sản phẩm cuối đã duyệt (~100 JPEG, khoảng 30 MB) lưu ở đâu để upload lại được?
   - Options: Commit thẳng vào git (Recommended) | Git LFS | Ngoài repo
   - **Answer:** Commit thẳng vào git
   - **Rationale:** Đáp ứng AC9 (upload lại được) mà không thêm công cụ.
4. **[Scope]** Sau phase 1, phase 2 và phase 8 độc lập với nhau. Chạy thế nào?
   - Options: Song song 2 session (Recommended) | Tuần tự một session
   - **Answer:** Song song 2 session
   - **Rationale:** Phase 8 chỉ đụng `demo-data/` và `scripts/demo-data/`, `scripts/images/`; chạy ở session và worktree riêng rút ngắn khoảng 1,5–2 tuần.

#### Confirmed Decisions
- Câu hỏi parity gửi Theme Support ngay sau P-h; anh là người gửi.
- Dùng repo hiện tại; CI chạy khi có remote, trước đó dùng script local.
- Ảnh cuối commit thẳng vào git.
- Phase 8 chạy song song phase 2 ở session riêng sau khi phase 1 đóng.

#### Action Items
- [ ] Anh nối GitHub remote cho repo hiện tại khi muốn bật CI (không chặn phase nào).

#### Impact on Phases
- Phase 1: thêm bước soạn câu hỏi parity cho Theme Support sau P-h.
- Phase 2: workflow Theme Check chạy khi có remote, trước đó chạy local.
- Phase 9: `run.mjs` đo cả mobile và desktop khi chưa có remote; bước parity đối chiếu với trả lời của Theme Support.

### Whole-Plan Consistency Sweep (Validation)
- Đã kiểm tra các chỗ nhắc Theme Support, GitHub Actions và lưu ảnh trên mọi phase; phase 1, 2, 9 đã cập nhật, phase 8 vốn đã commit ảnh `final/`.
- Không còn mâu thuẫn chưa giải quyết.

<!-- slug: bulkhead-preset-v1 -->
