---
phase: 9
title: "Phase 9: QA và sẵn sàng nộp"
status: pending
priority: P1
effort: "2.5w"
dependencies: [0, 2, 3, 4, 5, 6, 7, 8]
---

<!-- Updated: Red Team 2026-10-21 -->
<!-- Updated: Scope revision 2026-10-23 - effort 2w -> 2.5w; dependencies thêm phase 0 và 2; 12 acceptance criteria (AC1–10 không đổi, thêm AC11 merchant tự xây trang và AC12 design profile/content resilience); G3 lặp R01–R03 trên bản cài sạch; audit có checklist thủ công thay thế khi skill không có trong catalog -->

# Phase 9: QA và sẵn sàng nộp

## Goal

Hoàn thiện demo store, rồi chứng minh bằng số đo và bằng chứng rằng theme đạt 12 acceptance criteria của contract (AC1–10 như cũ, cộng AC11 merchant tự xây trang bằng editor và AC12 design profile/content resilience) và các yêu cầu Theme Store; đóng gói và kiểm tra gói nộp, chuẩn bị tài liệu merchant để anh nộp.

## Context Links

- [Contract](../reports/brainstorm-261021-1421-bulkhead-preset-contract.md), toàn bộ mục Acceptance criteria.
- [Research Skeleton](../reports/researcher-261021-1503-skeleton-theme-store-tooling.md), mục 3 (Lighthouse CI, cách Shopify chấm điểm).
- `reports/required-features-checklist.md` (tạo ở phase 3).
- [Section inventory](./section-inventory.md), S01–S19, D01–D05, R01–R03 và mục Gates/AC12 (G3, stress content, kiểm tra từng core section).
- [Phase 0](./phase-00-design-and-section-inventory.md), G0 và `reports/design-approval.md` (đầu ra tương lai, chưa phải bằng chứng đã có); [phase 7](./phase-07-homepage-and-preset.md), G2 và nguồn bằng chứng rehearsal editor.

## Key Insights

- Theme Store chấm trung bình cộng ba trang (home, product, collection) trên cả desktop lẫn mobile, mỗi URL ít nhất 3 lần lấy median, trên benchmark store có CSV performance 2.000 product.
- `Shopify/lighthouse-ci-action` chỉ đo mobile và assert theo từng URL (mỗi trang ≥ 0,6 thì trung bình cũng đạt); desktop cần script riêng.
- Dev store có storefront password; phép đo phải chứng minh nó không đo nhầm trang `/password`.
- `shopify theme push` ghi đè template trên demo store, nên các kết nối dynamic source làm trong editor phải được lưu và áp lại.
- AC11/AC12 chỉ đạt khi chạy trên theme editor thật và trên bản cài preset sạch; mockup HTML của phase 0 và G2 của phase 7 là đầu vào, không thay thế G3. Gate thiết kế (G0/G2/G3) không miễn gate platform: P-a…P-j của phase 1, câu hỏi Theme Support về preset để trống custom metafield (spec/downloads) và danh sách khác biệt parity do anh duyệt vẫn phải đóng riêng.
- Các report `reports/design-approval.md`, `reports/prototype-results.md`, `reports/qa-evidence.md` là đầu ra tương lai; chưa tồn tại hoặc chưa là bằng chứng cho tới khi phase tương ứng được thực thi.
- Ba skill audit tên `shopify-theme-submission-audit`, `shopify-theme-a11y-review`, `shopify-theme-settings-review` của plan cũ không có trong catalog skill runtime đã cài khi cập nhật plan (2026-10-23). Không giả định công cụ này chạy được: kết quả audit phải đạt bằng checklist thủ công có bằng chứng; chạy skill cùng tên chỉ là bước bổ sung tuỳ chọn nếu sau này có trong catalog cài đặt.

## Requirements

- **Demo store hoàn thiện:** nối metafield MPN, spec, downloads vào block bằng dynamic source; lưu các template riêng của demo store ở `demo-data/theme-overrides/` (ngoài gói theme). Mọi lần push lên demo store dùng `shopify theme push -e demo` với `--ignore` cho `templates/*.json`, `config/settings_data.json`, `sections/*-group.json`, rồi áp lại overrides.
<!-- Updated: 2026-10-21 - app Lighthouse chỉ tạo khi nối GitHub remote; lệnh theme dùng environment -->
- **Lighthouse mobile khi đã có GitHub remote:** GitHub Action (`client_id`, `client_secret`, `password`, handle product và collection truyền tường minh, `pull_theme` trỏ tới một theme trên benchmark store đã cấu hình nội dung thật), action ghim theo full commit SHA, chỉ chạy `workflow_dispatch` và `push` lên `master`, `permissions: contents: read`.
- **Khi repo chưa có GitHub remote:** workflow vẫn nằm trong repo nhưng chưa chạy; `run.mjs` nhận `--form-factor mobile|desktop` và là cổng duy nhất cho cả hai thiết bị cho tới khi remote được nối. Khi đã có remote, cổng mobile là action.
- **Lighthouse desktop:** `scripts/lighthouse/run.mjs` dùng `lighthouse` trong `devDependencies` (có lockfile); lấy cookie qua form `/password` rồi truyền bằng `--extra-headers`; báo lỗi nếu `finalUrl` hoặc `<title>` là trang password; chạy 5 lần mỗi URL, lấy median, tính trung bình ba trang; ghi `finalUrl` từng lần vào bằng chứng. Đo thêm `/collections/{handle}?view=table` ở 48 sản phẩm mỗi trang, ghi riêng.
- Theme Check strict không có error; `check-package-json.mjs` sạch.
- Accessibility thủ công: bàn phím, focus, `aria-live`, contrast, vùng chạm, trên quick order (Compact pad và Full page), matrix, Table view, filter drawer, cart, và các section thư viện: hero/banner (kể cả search scope control), CTA, image with text, multicolumn, FAQ/collapsible, newsletter, product gallery video/3D. Focus không bị che bởi cột sticky hoặc header; thứ tự DOM/focus trùng thứ tự đọc trên mobile.
- Trình duyệt: Chrome, Safari, Firefox, Edge mới nhất; in-app webview của Instagram, Facebook, Pinterest.
- **Preset parity:** cài preset lên feature test store; so cặp demo/install cho home R01, landing R02, About R03, collection 3 view + default Grid/Table, PDP simple/multi-size, cart và quick order. Dùng resource đại diện từ cùng nguồn phase 8; tách khác biệt dữ liệu (số product, resource picker/dynamic source chưa nối, do anh duyệt) khỏi thiếu tính năng. Không bỏ S07 hoặc core section khác khỏi kiểm chứng vì thiếu ảnh/logo được duyệt. Câu hỏi Theme Support về custom metafield và `namespace.key` vẫn theo gate trước khi nộp.
- **AC3 trên catalog thật:** chạy lại kịch bản quick order của phase 6 trên demo store.
- **Gói nộp:** `shopify theme package`, giải nén và kiểm tra danh sách file: có `listings/bulkhead/`, có `LICENSE.md`, không có `config/markets.json`, `scripts/`, `demo-data/`, `plans/`, `docs/`, `mockup/`, thư mục dependency của Node, `package.json`. Không có file mockup, ảnh mockup, preview control hay logo giả/placeholder nào trong gói; `.shopifyignore` loại `mockup/` (phase 1 sở hữu quy tắc, phase 9 kiểm tra trên gói thật và sửa nếu sai). Không có file `hero-search.liquid`, `trade-cta.liquid` hoặc FAQ section thứ hai; `sections/hero-banner.liquid`, `sections/call-to-action.liquid`, `sections/collapsible-content.liquid` là bản duy nhất.
- **Audit có bằng chứng, không phụ thuộc tên skill:** kết quả ba audit (submission, accessibility, settings) được chứng minh bằng checklist thủ công trong `qa-evidence.md` (mục Manual audit): (a) submission: so cấu trúc file, tên section/block/schema ID, class/CSS, copy và bố cục với Skeleton, Dawn, Horizon; kết luận có dẫn chứng rằng theme không giống Dawn/Horizon; (b) accessibility: kết quả mục thủ công ở trên cộng kiểm tra tự động công khai (Theme Check, Lighthouse accessibility); (c) settings: nhãn rõ, American English, nhóm theo tác vụ merchant, default hợp lý, mọi `info`/`default` đúng, preset không chứa tham chiếu resource hoặc custom metafield, field resource/dynamic source trống trong gói cài, section có empty state. Nếu skill cùng tên có trong catalog đã cài khi thực thi thì chạy thêm và đính kèm đầu ra; nếu không có thì ghi rõ "không khả dụng" và không coi là blocker. Blocker thật là phát hiện chưa xử lý ở các checklist, không phải việc thiếu tên công cụ.
- Submission audit xét khác biệt tổng thể của trải nghiệm core templates, product cards, navigation và page structure; đổi tên class/file hoặc khác màu/font không phải bằng chứng đủ cho uniqueness. Giữ checklist và ảnh/luồng thao tác để chứng minh structural/functional differentiation, không chỉ dùng kiểm tra chuỗi source.
- Tài liệu merchant trong `docs/merchant-guide.md` (một file, chủ sở hữu tài liệu hiện có, không tạo bộ docs mới): cài đặt, nối metafield MPN/spec/downloads, cấu hình B2B (catalog, quantity rule, bậc giá), quick order (Compact pad và Full page), Table view và default collection view, card profile Browsing/Technical; **danh mục section** S01–S19 (mục đích, nơi dùng, setting chính, hành vi khi thiếu/dài nội dung, owner thư viện); **recipes R01–R03** từng bước bằng editor (không code, không Custom Liquid, không app); lưu ý section preset không phải theme preset, O01/O02 chưa có trong v1.
- Release notes v1.0.0.
- **AC11 G3:** trên feature test store với bản cài preset sạch, người đóng vai merchant lặp lại R01 (homepage), R02 (landing ngành nghề) và R03 (About/dịch vụ) chỉ bằng theme editor; không sửa code, không dùng Custom Liquid, app hay page builder, dùng nội dung và resource từ phase 8. Ghi từng bước, section ID, setting đã chọn, ảnh trước/sau save và reload, cả guest và B2B nơi liên quan. R01: thêm/bỏ/reorder một section, đổi hero layout rồi trở về default, đổi card profile và density. R02: chọn department/collection, sửa 2 FAQ, đổi CTA link, reorder blocks. R03: đổi ảnh trái/phải, thêm/bỏ service block, sửa nội dung/CTA. FAQ và CTA dùng đúng cùng schema ở R02, R03 và PDP.
- **AC12 profile và content resilience:** ma trận D01 (hero Search first/Image led/Compact banner), D02 (card Browsing/Technical), D03 (collection default Grid/Table, List luôn có), D04 (PDP simple/multi-size, fallback 1/>2 option), D05 (image-with-text trái/phải, multicolumn 2–4 cột, CTA inline/split) × 375/768/1440px × guest/B2B (nơi liên quan). Stress content từ fixture phase 8 trên feature test store: title 120 ký tự, SKU/MPN 40 ký tự, heading 80 ký tự, thiếu ảnh/spec/download, collection không có hàng, 1/2/4 content block, sold-out/low-stock, guest không có dữ liệu B2B. Tiêu chí: không đè chữ/control, không document overflow (kiểm bằng `scrollWidth` document), vùng cuộn Table/matrix có nhãn và keyboard access, không ẩn lỗi để làm đẹp layout.
- **Per-core-section coverage:** mỗi section S01–S19 có một dòng trong `qa-evidence.md` ghi: thêm/bỏ/reorder tại template hỗ trợ, đổi setting chính, editor reload, trạng thái chưa chọn resource/empty state, dữ liệu rỗng không sinh giá/tồn kho/brand giả. Section không xuất hiện trong R01–R03 vẫn phải được thêm thử trên template hỗ trợ.
- **Core ordering vẫn chạy:** exact SKU/MPN, 20 dòng hỗn hợp và 51 dòng quick order, matrix 5×6, Table 48 dòng và pagination trên ≥ 500 product, min/step/max/tier thật; không hạ tiêu chí cũ để đổi lấy nhiều section.
- **Truy vết acceptance:** `qa-evidence.md` có bảng AC1–AC12 → bằng chứng (lệnh, ảnh, số đo đã che dữ liệu) → phase sở hữu → trạng thái; AC11/AC12 liên kết G2 (phase 7) và G3 (phase 9). Bảng thêm dòng riêng cho từng section S01–S19, D01–D05 và R01–R03. Không đánh dấu pass nếu thiếu bằng chứng.
- Benchmark và Lighthouse (AC1) giữ nguyên yêu cầu: homepage đo dùng preset đầy đủ theo thứ tự mặc định (hero, trust, quick order, category, featured, CTA, logos, blog, newsletter), collection mặc định và Table, product; mục tiêu nội bộ ≥ 70. Thêm section thư viện không được làm giảm số đo so với ngưỡng.

## Architecture

- `.github/workflows/lighthouse.yml` và `scripts/lighthouse/run.mjs` như mục Requirements. App Dev Dashboard và GitHub secrets chỉ tạo khi anh nối remote (xem phase 1); trước đó cổng duy nhất là `run.mjs` chạy local với `-e benchmark`.
- Lệnh theme chọn store bằng environment trong `shopify.theme.toml`: `-e demo` (demo store), `-e benchmark` (đo Lighthouse), `-e feature` (parity và tính năng cần app).
- `plans/261021-0812-bulkhead-preset-v1/reports/qa-evidence.md` ghi bằng chứng cho từng acceptance criterion; mọi bằng chứng đã che email, địa chỉ, số order, tên miền store và token.
- `qa-evidence.md` gồm: bảng truy vết AC1–AC12; phần G3 (R01–R03, bước, ảnh trước/sau); ma trận D01–D05 × viewport × guest/B2B; bảng per-section S01–S19; mục Manual audit (submission, accessibility, settings checklist, trạng thái skill tuỳ chọn). Thư mục ảnh/log phụ nằm cạnh file, đã che dữ liệu.

## Related Code Files

- Create: `.github/workflows/lighthouse.yml`, `scripts/lighthouse/run.mjs`, `package.json`, `package-lock.json`, `demo-data/theme-overrides/`, `docs/merchant-guide.md`, `docs/release-notes.md`, `plans/261021-0812-bulkhead-preset-v1/reports/qa-evidence.md`.
- Modify: `plans/261021-0812-bulkhead-preset-v1/reports/required-features-checklist.md` (điền bằng chứng), `.shopifyignore` và `.gitignore` chỉ khi kiểm tra gói phát hiện sai lệch so với quy tắc phase 1 (phase 8 đã báo nếu có), mọi file theme cần sửa theo kết quả QA.

## Implementation Steps

1. Hoàn thiện demo store: nối metafield, lưu overrides, thiết lập lệnh push có `--ignore`.
2. Cấu hình theme đo trên benchmark store; chạy Lighthouse mobile (action) và desktop (script); sửa cho tới khi đạt. Dự trù tối đa 3 vòng sửa; nếu vẫn trượt thì dừng và báo anh kèm số đo.
3. `shopify theme check --fail-level error`; `check-package-json.mjs`; push lên demo store theo lệnh ở bước 1.
4. Kiểm tra accessibility thủ công (kể cả các section thư viện) và điền checklist a11y; chạy skill `shopify-theme-a11y-review` chỉ nếu có trong catalog.
5. Điền checklist settings và submission audit thủ công; chạy `shopify-theme-settings-review` và `shopify-theme-submission-audit` chỉ nếu có trong catalog; sửa phát hiện mức blocker.
6. Kiểm tra trình duyệt và webview; chạy lại AC3 trên demo store.
<!-- Updated: Validation Session 1 - câu hỏi Theme Support đã gửi từ phase 1; CI chạy local khi chưa có remote -->
7. Preset parity trên feature test store (home, landing, About, collection, PDP, cart, quick order); anh duyệt danh sách khác biệt; đối chiếu với trả lời của Theme Support (câu hỏi đã gửi ở phase 1).
7a. G3: lặp R01–R03 trên bản cài sạch bằng editor (không code/Custom Liquid/app), guest và B2B; ghi AC11.
7b. AC12: chạy ma trận D01–D05 × 375/768/1440px × guest/B2B với fixture; đối chiếu bảng per-section S01–S19; sửa lỗi layout/overflow phát hiện được, rồi đo lại Lighthouse nếu đã sửa theme.
8. Đi lại toàn bộ review checklist và `required-features-checklist.md`.
9. `shopify theme package` và kiểm tra gói.
10. Viết `docs/merchant-guide.md` (gồm danh mục section, settings D01–D05 và recipes R01–R03), `docs/release-notes.md`, `qa-evidence.md` (bảng truy vết AC1–12); chạy `rg -n '@|myshopify\.com|"token"' plans/ docs/` trước khi commit.

## Todo

- [ ] Demo store hoàn thiện, overrides và lệnh push an toàn
- [ ] Lighthouse mobile và desktop đạt, không đo nhầm trang password
- [ ] Theme Check strict và `check-package-json.mjs`
- [ ] Accessibility thủ công (cả section thư viện) và checklist a11y; skill chỉ nếu có
- [ ] Checklist settings và submission audit thủ công; skill chỉ nếu có
- [ ] Trình duyệt, webview, AC3 trên catalog thật
- [ ] Preset parity (home, landing, About, collection, PDP, cart, quick order), danh sách khác biệt được anh duyệt, câu hỏi Theme Support
- [ ] AC11: G3 lặp R01–R03 trên bản cài sạch, guest/B2B, không code/Custom Liquid/app
- [ ] AC12: ma trận D01–D05 × 375/768/1440px × guest/B2B và stress content, không document overflow
- [ ] Bảng per-section S01–S19 đầy đủ
- [ ] Review checklist và required-features checklist
- [ ] Gói nộp đã kiểm tra (không có mockup, preview control, logo giả)
- [ ] Tài liệu merchant (section, settings, recipes), release notes, bằng chứng QA có bảng truy vết AC1–12

## Success Criteria

- `qa-evidence.md` có bằng chứng cho đủ 12 acceptance criteria (AC1–10 như cũ, AC11 merchant tự xây trang, AC12 design profile/content resilience); `required-features-checklist.md` có bằng chứng cho mọi dòng.
- Trung bình ba trang: performance ≥ 60 (mục tiêu nội bộ ≥ 70) và accessibility ≥ 90, trên cả desktop lẫn mobile; mọi lần đo có `finalUrl` không phải `/password`.
- Audit submission, accessibility và settings không còn phát hiện mức blocker theo checklist thủ công có bằng chứng; kết luận theme không giống Dawn hay Horizon có dẫn chứng. Skill cùng tên chỉ được báo là đã chạy khi thật sự có trong catalog và có đầu ra; nếu không thì ghi "không khả dụng".
- G3: R01–R03 hoàn tất trên bản cài sạch bằng editor, có bước và ảnh trước/sau save/reload; không dùng code, Custom Liquid hoặc app.
- AC12: mọi ô trong ma trận D01–D05 × viewport × guest/B2B đạt, không document overflow; mọi section S01–S19 có bằng chứng thêm/bỏ/reorder, setting chính, reload, empty state.
- Gói nộp đúng danh sách file.

## Risk Assessment

- Collection mobile là trang dễ trượt nhất; nếu không đạt thì giảm mặc định số sản phẩm mỗi trang của view mặc định hoặc trì hoãn nạp JS filter, nhưng vẫn ghi số đo Table view ở 48.
- Requirements có thể đổi trong lúc làm (ví dụ Liquid-first); đọc lại changelog Theme Store trước khi nộp.
- Thêm section thư viện, default homepage đầy đủ và Technical card/Table mobile có thể làm giảm Lighthouse; đo cả homepage preset đầy đủ và dùng bước giảm tải đã nêu cho collection thay vì cắt section core. Không dùng đo trên template trống làm bằng chứng.
- G3 có thể lộ khác biệt giữa demo và bản cài sạch (resource trống, dynamic source chưa nối): phân loại thành khác biệt dữ liệu được phép (anh duyệt) hoặc lỗi tính năng cần sửa.
- Không có skill audit trong catalog đã cài: dùng checklist thủ công; ghi trạng thái từng skill (có/không khả dụng) để không có claim sai.

## Security Considerations

- Khi có remote: secrets chỉ nằm trong GitHub Secrets; app Lighthouse chỉ có `read_products,write_themes` và chỉ cài trên benchmark store. Khi chạy local: script đọc mật khẩu storefront từ biến môi trường, không ghi ra file; `shopify.theme.toml` không được commit.
- Bằng chứng QA đã che dữ liệu cá nhân và token trước khi commit.
- Ảnh trước/sau của G3 và AC12 che email, địa chỉ, số order, tên miền store, token; fixture không chứa dữ liệu cá nhân.

## Next Steps

Anh nộp theme qua Partner Dashboard (ngoài phạm vi plan). Foolscap và Furrow là các plan sau. Nếu đạt 12 AC nhưng còn khác biệt parity chưa được anh duyệt hoặc câu hỏi Theme Support chưa có trả lời, nêu rõ là chưa sẵn sàng nộp thay vì coi G0/G2/G3 đã đóng các gate đó.
