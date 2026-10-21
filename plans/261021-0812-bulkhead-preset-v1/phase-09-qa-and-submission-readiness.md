---
phase: 9
title: "Phase 9: QA và sẵn sàng nộp"
status: pending
priority: P1
effort: "2w"
dependencies: [3, 4, 5, 6, 7, 8]
---

<!-- Updated: Red Team 2026-10-21 -->

# Phase 9: QA và sẵn sàng nộp

## Goal

Hoàn thiện demo store, rồi chứng minh bằng số đo và bằng chứng rằng theme đạt 10 acceptance criteria của contract và các yêu cầu Theme Store; đóng gói và kiểm tra gói nộp, chuẩn bị tài liệu merchant để anh nộp.

## Context Links

- [Contract](../reports/brainstorm-261021-1421-bulkhead-preset-contract.md), toàn bộ mục Acceptance criteria.
- [Research Skeleton](../reports/researcher-261021-1503-skeleton-theme-store-tooling.md), mục 3 (Lighthouse CI, cách Shopify chấm điểm).
- `reports/required-features-checklist.md` (tạo ở phase 3).

## Key Insights

- Theme Store chấm trung bình cộng ba trang (home, product, collection) trên cả desktop lẫn mobile, mỗi URL ít nhất 3 lần lấy median, trên benchmark store có CSV performance 2.000 product.
- `Shopify/lighthouse-ci-action` chỉ đo mobile và assert theo từng URL (mỗi trang ≥ 0,6 thì trung bình cũng đạt); desktop cần script riêng.
- Dev store có storefront password; phép đo phải chứng minh nó không đo nhầm trang `/password`.
- `shopify theme push` ghi đè template trên demo store, nên các kết nối dynamic source làm trong editor phải được lưu và áp lại.

## Requirements

- **Demo store hoàn thiện:** nối metafield MPN, spec, downloads vào block bằng dynamic source; lưu các template riêng của demo store ở `demo-data/theme-overrides/` (ngoài gói theme). Mọi lần push lên demo store dùng `shopify theme push -e demo` với `--ignore` cho `templates/*.json`, `config/settings_data.json`, `sections/*-group.json`, rồi áp lại overrides.
<!-- Updated: 2026-10-21 - app Lighthouse chỉ tạo khi nối GitHub remote; lệnh theme dùng environment -->
- **Lighthouse mobile khi đã có GitHub remote:** GitHub Action (`client_id`, `client_secret`, `password`, handle product và collection truyền tường minh, `pull_theme` trỏ tới một theme trên benchmark store đã cấu hình nội dung thật), action ghim theo full commit SHA, chỉ chạy `workflow_dispatch` và `push` lên `master`, `permissions: contents: read`.
- **Khi repo chưa có GitHub remote:** workflow vẫn nằm trong repo nhưng chưa chạy; `run.mjs` nhận `--form-factor mobile|desktop` và là cổng duy nhất cho cả hai thiết bị cho tới khi remote được nối. Khi đã có remote, cổng mobile là action.
- **Lighthouse desktop:** `scripts/lighthouse/run.mjs` dùng `lighthouse` trong `devDependencies` (có lockfile); lấy cookie qua form `/password` rồi truyền bằng `--extra-headers`; báo lỗi nếu `finalUrl` hoặc `<title>` là trang password; chạy 5 lần mỗi URL, lấy median, tính trung bình ba trang; ghi `finalUrl` từng lần vào bằng chứng. Đo thêm `/collections/{handle}?view=table` ở 48 sản phẩm mỗi trang, ghi riêng.
- Theme Check strict không có error; `check-package-json.mjs` sạch.
- Accessibility thủ công: bàn phím, focus, `aria-live`, contrast, vùng chạm, trên quick order, matrix, Table view, filter drawer, cart.
- Trình duyệt: Chrome, Safari, Firefox, Edge mới nhất; in-app webview của Instagram, Facebook, Pinterest.
- **Preset parity:** cài preset lên feature test store; chụp cặp ảnh so sánh với demo store cho home, collection (3 view), PDP, cart, quick order; danh sách khác biệt được phép **do anh duyệt**; hỏi Theme Support về việc preset để trống custom metafield (và setting `namespace.key` nếu P-h không đạt) trước khi nộp.
- **AC3 trên catalog thật:** chạy lại kịch bản quick order của phase 6 trên demo store.
- **Gói nộp:** `shopify theme package`, giải nén và kiểm tra danh sách file: có `listings/bulkhead/`, có `LICENSE.md`, không có `config/markets.json`, `scripts/`, `demo-data/`, `plans/`, `docs/`, thư mục dependency của Node, `package.json`.
- Ba skill audit: `shopify-theme-submission-audit` (so với Skeleton, Dawn, Horizon), `shopify-theme-a11y-review`, `shopify-theme-settings-review`.
- Tài liệu merchant trong `docs/`: cài đặt, nối metafield MPN/spec/downloads, cấu hình B2B (catalog, quantity rule, bậc giá), quick order, Table view.
- Release notes v1.0.0.

## Architecture

- `.github/workflows/lighthouse.yml` và `scripts/lighthouse/run.mjs` như mục Requirements. App Dev Dashboard và GitHub secrets chỉ tạo khi anh nối remote (xem phase 1); trước đó cổng duy nhất là `run.mjs` chạy local với `-e benchmark`.
- Lệnh theme chọn store bằng environment trong `shopify.theme.toml`: `-e demo` (demo store), `-e benchmark` (đo Lighthouse), `-e feature` (parity và tính năng cần app).
- `plans/261021-0812-bulkhead-preset-v1/reports/qa-evidence.md` ghi bằng chứng cho từng acceptance criterion; mọi bằng chứng đã che email, địa chỉ, số order, tên miền store và token.

## Related Code Files

- Create: `.github/workflows/lighthouse.yml`, `scripts/lighthouse/run.mjs`, `package.json`, `package-lock.json`, `demo-data/theme-overrides/`, `docs/merchant-guide.md`, `docs/release-notes.md`, `plans/261021-0812-bulkhead-preset-v1/reports/qa-evidence.md`.
- Modify: `plans/261021-0812-bulkhead-preset-v1/reports/required-features-checklist.md` (điền bằng chứng), mọi file theme cần sửa theo kết quả QA.

## Implementation Steps

1. Hoàn thiện demo store: nối metafield, lưu overrides, thiết lập lệnh push có `--ignore`.
2. Cấu hình theme đo trên benchmark store; chạy Lighthouse mobile (action) và desktop (script); sửa cho tới khi đạt. Dự trù tối đa 3 vòng sửa; nếu vẫn trượt thì dừng và báo anh kèm số đo.
3. `shopify theme check --fail-level error`; `check-package-json.mjs`; push lên demo store theo lệnh ở bước 1.
4. Kiểm tra accessibility thủ công và chạy `shopify-theme-a11y-review`.
5. Chạy `shopify-theme-settings-review` và `shopify-theme-submission-audit`; sửa lỗi mức blocker.
6. Kiểm tra trình duyệt và webview; chạy lại AC3 trên demo store.
<!-- Updated: Validation Session 1 - câu hỏi Theme Support đã gửi từ phase 1; CI chạy local khi chưa có remote -->
7. Preset parity trên feature test store; anh duyệt danh sách khác biệt; đối chiếu với trả lời của Theme Support (câu hỏi đã gửi ở phase 1).
8. Đi lại toàn bộ review checklist và `required-features-checklist.md`.
9. `shopify theme package` và kiểm tra gói.
10. Viết `docs/merchant-guide.md`, `docs/release-notes.md`, `qa-evidence.md`; chạy `rg -n '@|myshopify\.com|"token"' plans/ docs/` trước khi commit.

## Todo

- [ ] Demo store hoàn thiện, overrides và lệnh push an toàn
- [ ] Lighthouse mobile và desktop đạt, không đo nhầm trang password
- [ ] Theme Check strict và `check-package-json.mjs`
- [ ] Accessibility thủ công và skill a11y review
- [ ] Skill settings review và submission audit
- [ ] Trình duyệt, webview, AC3 trên catalog thật
- [ ] Preset parity, danh sách khác biệt được anh duyệt, câu hỏi Theme Support
- [ ] Review checklist và required-features checklist
- [ ] Gói nộp đã kiểm tra
- [ ] Tài liệu merchant, release notes, bằng chứng QA

## Success Criteria

- `qa-evidence.md` có bằng chứng cho đủ 10 acceptance criteria; `required-features-checklist.md` có bằng chứng cho mọi dòng.
- Trung bình ba trang: performance ≥ 60 (mục tiêu nội bộ ≥ 70) và accessibility ≥ 90, trên cả desktop lẫn mobile; mọi lần đo có `finalUrl` không phải `/password`.
- Ba skill audit không còn lỗi mức blocker; submission audit kết luận theme không giống Dawn hay Horizon.
- Gói nộp đúng danh sách file.

## Risk Assessment

- Collection mobile là trang dễ trượt nhất; nếu không đạt thì giảm mặc định số sản phẩm mỗi trang của view mặc định hoặc trì hoãn nạp JS filter, nhưng vẫn ghi số đo Table view ở 48.
- Requirements có thể đổi trong lúc làm (ví dụ Liquid-first); đọc lại changelog Theme Store trước khi nộp.

## Security Considerations

- Khi có remote: secrets chỉ nằm trong GitHub Secrets; app Lighthouse chỉ có `read_products,write_themes` và chỉ cài trên benchmark store. Khi chạy local: script đọc mật khẩu storefront từ biến môi trường, không ghi ra file; `shopify.theme.toml` không được commit.
- Bằng chứng QA đã che dữ liệu cá nhân và token trước khi commit.

## Next Steps

Anh nộp theme qua Partner Dashboard (ngoài phạm vi plan). Foolscap và Furrow là các plan sau.
