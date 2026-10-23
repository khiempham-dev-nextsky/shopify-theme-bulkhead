---
title: "Bulkhead v1.0 với preset Bulkhead (Hardware, Lots 500+)"
description: "Theme Bulkhead từ Skeleton: chốt design và thư viện section tái sử dụng, preset hardware/trade, demo ≥ 500 sản phẩm và bằng chứng merchant tự xây trang."
status: pending
priority: P1
effort: 21.5w
branch: master
tags: [feature, frontend, shopify-theme, b2b]
blockedBy: []
blocks: []
created: 2026-10-21
---

# Bulkhead v1.0 với preset Bulkhead

## Overview

Plan này dựng theme Bulkhead với đúng một preset Bulkhead (Hardware, Lots 500+), theo contract đã cập nhật ngày 2026-10-23. Phase 0 chốt design configurations, section inventory và ba composition merchant trước foundation. Phase 1 chạy độc lập để chuẩn bị ba store và prototype 10 rủi ro platform; mockup HTML không thay thế kết quả prototype hoặc theme editor thật. Phase 2/8 chỉ bắt đầu sau cả hai gate và đối chiếu thiết kế với kết quả platform.

Hướng thiết kế là "hai lớp": lớp chung chạy cho mọi khách (quick order, bulk variant matrix, Table view, spec, downloads, tồn kho thật) và lớp B2B tự bật khi có dữ liệu (bậc giá, quantity rule, ship-to).

- Contract: [brainstorm contract](../reports/brainstorm-261021-1421-bulkhead-preset-contract.md)
- Research: [Skeleton và tooling Theme Store](../reports/researcher-261021-1503-skeleton-theme-store-tooling.md), [dữ liệu demo và ảnh](../reports/researcher-261021-1503-demo-data-image-pipeline.md)
- Authority thiết kế và reuse: [section inventory](./section-inventory.md); bước duyệt sớm: [phase 0](./phase-00-design-and-section-inventory.md).
- Scope lượt revision này: chỉ sửa tài liệu plan/contract; không sửa `mockup/`, không triển khai theme/store. Các phase thực thi vẫn pending.
- Nghiên cứu thị trường gốc: `/Volumes/Projects/Downloads/shopify-theme-store-research.md` (nằm ngoài repo)

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | Theme đạt mọi yêu cầu kỹ thuật và tính năng bắt buộc của Theme Store | P1 |
| 2 | Lớp chung cho trade catalog chạy được với mọi khách | P1 |
| 3 | Lớp B2B tự bật đúng với khách B2B và ẩn sạch với khách thường | P1 |
| 4 | Demo store ≥ 500 sản phẩm, ảnh đồng bộ, nội dung authentic, preset parity | P1 |
| 5 | Merchant tự dựng homepage, landing ngành nghề và About/dịch vụ bằng section chung, không sửa code | P1 |
| 6 | Duyệt các cấu hình hero/card/collection/PDP và content resilience trước khi triển khai diện rộng | P1 |

## Phases

| # | Phase | Effort (tuần công) | Dependencies | Status |
|---|-------|--------------------|--------------|--------|
| 0 | [Design scope và section inventory](./phase-00-design-and-section-inventory.md) | 1.5 | — | Pending |
| 1 | [Môi trường và prototype rủi ro](./phase-01-start.md) | 1.5 | — | Pending |
| 2 | [Nền móng theme](./phase-02-theme-foundation.md) | 2 | 0, 1 | Pending |
| 3 | [Template bắt buộc và tính năng toàn store](./phase-03-required-features.md) | 1.5 | 2 | Pending |
| 4 | [Collection và search](./phase-04-collection-and-search.md) | 2 | 0, 1, 2, 8 | Pending |
| 5 | [Product page](./phase-05-product-page.md) | 2.5 | 0, 1, 2, 8 | Pending |
| 6 | [Quick order và cart](./phase-06-quick-order-and-cart.md) | 1.5 | 0, 1, 2, 3, 4, 5, 8 | Pending |
| 7 | [Thư viện section, homepage và preset](./phase-07-homepage-and-preset.md) | 2.5 | 0, 2, 3, 4, 5, 6 | Pending |
| 8 | [Dữ liệu demo và ảnh](./phase-08-demo-data-and-images.md) | 2 | 0, 1 | Pending |
| 9 | [QA và sẵn sàng nộp](./phase-09-qa-and-submission-readiness.md) | 2.5 | 0, 2, 3, 4, 5, 6, 7, 8 | Pending |

## Dependencies

- Phase 1 bị chặn bởi việc anh tạo Partner account và ba store, cấu hình B2B (checklist ở phase 1). App Lighthouse và GitHub secrets chỉ tạo khi anh nối GitHub remote, không chặn phase nào.
- Mọi lệnh theme chọn store bằng environment trong `shopify.theme.toml` (gitignore): `demo`, `benchmark`, `feature`.
- Phase 0 và phase 1 độc lập: thiết kế không chờ store, prototype không chờ duyệt mockup. G0 là approval của anh cho D01–D05/R01–R03; G1 là kết quả P-a…P-j, không tự suy diễn từ fixture.
- Sau G0 + G1, reconcile phần thiết kế bị ảnh hưởng; phase 2 và phase 8 chạy ở hai session/worktree theo quyết định cũ. Phase 8 chỉ sở hữu `demo-data/`, `scripts/demo-data/`, `scripts/images/` và media pipeline; file theme do phase 2–7 sở hữu.
- Thứ tự baseline: {0, 1} → {2, 8}; 2 → 3; {2, 8} → {4, 5}; {3, 4, 5, 8} → 6; {2, 3, 4, 5, 6} → 7; {3, 4, 5, 6, 7, 8} → 9. Dependency ID trong frontmatter là gate hoàn thành cả phase, không phải phần trăm tiến độ.
- Phase 8 ghi milestone import và ảnh cuối nhưng baseline bảo thủ yêu cầu hoàn tất cả phase 8 trước phase 4/5/6, khớp dependency `[8]`. Không khởi động sớm theo import-only handoff; muốn chồng lấp sâu hơn cần revision dependency rõ ràng trước khi thực thi.
- G0 không gỡ gate Theme Support/spec/downloads: phase 4/5 vẫn cần câu trả lời hoặc quyết định đi tiếp của anh theo phase 1.
- Phase 6 dùng `<bh-quantity>`, `price-tiers.js`, `addLines()` và product card chung; phase 7 tái dùng Quick order từ 6, FAQ/featured product từ 5, contact form từ 3. Không tạo implementation riêng để dựng trang.

## Scope và effort sau revision

- **Core:** S01–S19 trong inventory. Image with text và Multicolumn là phần bổ sung bắt buộc; hero/banner một implementation, CTA và FAQ tái sử dụng. Section hệ thống không được cộng như thư viện nội dung.
- **Optional, ngoài baseline v1:** O01 standalone video và O02 collection tabs. Chưa tạo file/setting/demo; thêm cần anh chấp nhận scope/effort mới. Gallery video/3D PDP và collection Grid/List/Table vẫn bắt buộc.
- **Giữ nguyên:** một theme preset Bulkhead, hardware/trade, catalog ≥500, guest/B2B hai lớp, tất cả yêu cầu cũ; không wishlist/compare/countdown/app-like feature.
- Tổng effort các phase là **19.5 tuần công**; cộng **2 tuần công dự phòng** = **21.5w** planning envelope. Đây không phải cam kết số tuần lịch hoặc phép trừ thời gian vì dùng nhiều agent.
- Tổng frontmatter các phase cũ là 14.5w; revision tăng 5w: phase 0 +1.5, phase 2 +0.5, phase 4 +0.5, phase 5 +0.5, phase 7 +1.5, phase 9 +0.5. Con số index 15w cũ kèm mô tả “gồm 2 tuần dự phòng” không khớp phép cộng đó; bảng mới tách effort và reserve để tránh giữ một ETA không có cơ sở.
- Optional extensions không nằm trong 19.5w hoặc reserve. Chờ anh tạo store/duyệt ảnh, hạn mức tạo ảnh và vòng review Theme Support có thể vượt reserve; chỉ lập ETA lịch khi biết staffing và các gate thực tế.

## Success Criteria

- [ ] Đạt 12 acceptance criteria trong contract: giữ AC1–10 và bổ sung AC11 merchant self-build, AC12 design/content resilience; phase 9 ghi bằng chứng theo từng ID.
- [ ] Theme Check không còn error; Lighthouse trung bình ba trang đạt performance ≥ 60 và accessibility ≥ 90 trên cả desktop lẫn mobile.
- [ ] Demo store ≥ 500 sản phẩm hiển thị trên storefront, không cài app; preset cài lên feature test store khớp demo, trừ danh sách khác biệt anh đã duyệt.
- [ ] G0 đã được anh duyệt; G2/G3 chứng minh R01–R03 bằng editor thật trên demo/feature test, không code/Custom Liquid/app/page builder; tất cả core section được thử tại template hỗ trợ.

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

### Thay đổi sau validation — 2026-10-21
- Theo yêu cầu của anh: dời bước tạo app Dev Dashboard và GitHub secrets cho Lighthouse sang lúc nối GitHub remote, vì khi chạy local `theme dev`/`theme push` dùng phiên đăng nhập Shopify CLI và import dùng `shopify store auth`; Shopify Dev MCP không đăng nhập store nên không thay được app này.
- Thêm `shopify.theme.toml` (gitignore) với ba environment `demo`, `benchmark`, `feature`; mật khẩu storefront truyền bằng biến môi trường.
- Đã cập nhật phase 1, phase 9 và mục Dependencies.

### Revision design / section scope — 2026-10-23

- **Trigger:** anh yêu cầu cập nhật plan theo nhận xét về quy mô thiết kế, section và khả năng merchant tự xây trang; chưa sửa mockup/theme.
- **Mode:** bounded revision theo workflow fast, HOLD SCOPE trong yêu cầu đã giao. Không nghiên cứu lại platform, không chạy hard/red-team mới hoặc coi kết quả review 2026-10-21 là review scope mới.
- **Questions asked:** 0. Quyết định có thể lấy từ yêu cầu và contract; optional extensions đã tách rõ, không cần hỏi lại thông tin repo.
- **Decisions:** thêm phase 0; inventory S01–S19/D01–D05/R01–R03; Image with text + Multicolumn core; hero/banner dùng chung; FAQ/CTA một implementation; O01/O02 ngoài baseline; home đặt Quick order trước category.
- **Propagation:** contract AC11/12; phase 0 mới; foundation/settings 2, page composition 3, catalog/PDP 4/5, quick order 6, thư viện/recipes 7, content/images 8, QA/editor/parity 9; phase 1 nhận gate reconcile và loại `mockup/` khỏi gói theme.
- **Effort:** 19.5w phase labor + 2w reserve = 21.5w; optional không tính, không phải calendar ETA.
- **Evidence boundary:** inventory là tài liệu scope đã author; G0 approval, G1 prototypes, G2 editor và G3 QA chưa được thực thi. Giữ toàn bộ phase status pending. Log validation trước đây là lịch sử, không thay cho gate mới.
- **Execution handoff:** bước tiếp theo là thực thi phase 0 khi anh yêu cầu duyệt/cập nhật thiết kế; phase 1 cần checklist store của anh. Không tự khởi chạy implementation theme từ lượt sửa plan.

#### Whole-Plan Consistency Sweep — revision 2026-10-23

- Files checked: `plan.md`, `section-inventory.md`, đủ phase 00–09 và brainstorm contract (13 tài liệu). Đọc lại các phần bị ảnh hưởng và parse toàn bộ văn bản trong smoke check tài liệu.
- Decision deltas checked: G0 trước foundation; core/optional; D01–D05; R01–R03; hero/CTA/FAQ reuse; mobile ordering/search instance IDs; default view Grid/Table và P-j; full phase-8 gate; effort/reserve; AC11/12; shared ignore ownership; audit outcome/manual fallback; baseline khoảng 6 ảnh editorial; fixture target/state tách store.
- Smoke check thực thi: DAG 10 phase không cycle/thiếu dependency; bảng index khớp effort/dependencies frontmatter; 19.5w + 2w = 21.5w; 78 local links/anchors hợp lệ; 19 core IDs có owner/file được phase tương ứng khai báo; 5 design profiles, 3 recipes, 2 optional extensions; contract có đúng AC1–AC12.
- Mockup boundary: hash của 6 file nguồn/tài liệu mockup chính không đổi; không tạo implementation `layout/theme.liquid`, settings schema hoặc section hero/CTA. Không chạy Shopify/Theme Check/Lighthouse hoặc gọi điểm mockup là kết quả theme.
- Reconciled: milestone import-only trái dependency số; owner root ignores trước khi tách session; bỏ tăng ngầm lên 12 ảnh/2–3 landing; tránh form builder thừa; không tạo card setting/FAQ/CTA engine trùng. Các tên `hero-search`/`trade-cta` còn lại chỉ mô tả file không được tạo, không nằm trong Create lists.
- Unresolved contradictions: 0 trong phạm vi revision tài liệu. Các giả định platform vẫn pending ở phase 1; G0 cần anh duyệt, G2/G3 cần editor thật, không được đánh dấu đã đạt.
- Runtime task view theo dõi công việc revision tài liệu; các checklist thực thi phase giữ pending trong plan và được hydrate khi bắt đầu phase tương ứng. Không biến việc author plan thành completion của theme.

<!-- slug: bulkhead-preset-v1 -->
