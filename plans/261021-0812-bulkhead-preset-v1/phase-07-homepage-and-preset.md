---
phase: 7
title: "Phase 7: Thư viện section tái sử dụng, homepage và preset Bulkhead"
status: pending
priority: P1
effort: "2.5w"
dependencies: [0, 2, 3, 4, 5, 6]
---

<!-- Updated: Red Team 2026-10-21 -->
<!-- Scope revision 2026-10-23: effort 1w → 2.5w; dependencies [3, 4, 5, 6] → [0, 2, 3, 4, 5, 6]; đổi tên và goal thành thư viện section tái sử dụng + homepage/preset; thêm G2 (rehearsal theme editor thật). Nguồn thiết kế: [section-inventory](./section-inventory.md) và [phase 0](./phase-00-design-and-section-inventory.md). Phase vẫn pending; chưa có bằng chứng editor nào. -->

# Phase 7: Thư viện section tái sử dụng, homepage và preset Bulkhead

## Goal

Hoàn thiện thư viện section tái sử dụng mà phase này sở hữu (S01–S03, S05–S12, trừ S04), ghép chúng với các section của phase 2, 3, 5 và 6 thành homepage, hai recipe trang (`page.trade-landing.json`, `page.about.json`) và trang trade account, rồi đóng gói cấu hình preset Bulkhead để cài lên store mới giống demo store. Kết quả phải đủ để merchant tự dựng ba recipe R01–R03 bằng theme editor, không sửa code, không dùng Custom Liquid hay app (AC11); G2 là lần chạy thật trên editor, chưa thực hiện khi plan này được viết.

## Context Links

- [Contract](../reports/brainstorm-261021-1421-bulkhead-preset-contract.md), Design, AC11 và AC12.
- [Section inventory](./section-inventory.md): S01–S19, D01–D05, R01–R03, G2/G3, optional O01/O02.
- [Phase 0](./phase-00-design-and-section-inventory.md) và `reports/design-approval.md` (đầu ra tương lai của G0): cấu hình thiết kế được duyệt; phase 7 triển khai, không khám phá lại art direction.
- Mục 6.3 (homepage) và 6.5 (design) của file nghiên cứu thị trường. Khi khác inventory, thứ tự home và scope theo inventory.
- [Research Skeleton](../reports/researcher-261021-1503-skeleton-theme-store-tooling.md), mục 1 (thư mục preset, `--listing`).
- [Research dữ liệu demo](../reports/researcher-261021-1503-demo-data-image-pipeline.md), mục 5 (JSON không chứa custom metafield).
- Phase owner khác: [phase 2](./phase-02-theme-foundation.md) (card, search form, newsletter form, section style, empty state, S19), [phase 3](./phase-03-required-features.md) (`main-page`, `main-contact`), [phase 5](./phase-05-product-page.md) (S13–S18, gồm FAQ), [phase 6](./phase-06-quick-order-and-cart.md) (S04).

## Key Insights

- `shopify theme dev --listing=bulkhead` và `theme push --listing` áp file preset từ `listings/bulkhead/`.
- File JSON trong gói theme không được chứa tài nguyên riêng của demo store (custom metafield, ID product). Setting chọn collection, product, menu để trống và section phải có trạng thái trống đẹp.
- Section phải có nội dung và ảnh thật khi đo Lighthouse.
- Nhiều section không tự làm merchant tự xây được trang: mỗi section phải có mục đích, nơi dùng, layout, blocks/settings, empty/long-content behavior và owner trong inventory. Số section không phải mục tiêu.
- Một implementation cho mỗi nhu cầu: `hero-banner` gộp Search first/Image led/Compact banner; `call-to-action` gộp Trade account/Services; FAQ duy nhất là `collapsible-content` của phase 5. Không `hero-search`, `trade-cta` hay FAQ riêng cho từng trang, và không alias/shim.
- Section preset (cấu hình khởi đầu trong editor) khác theme preset. Chỉ có một theme preset Bulkhead; không thêm Foolscap/Furrow.
- Mockup HTML (G0) chứng minh thiết kế, không chứng minh editor hay Shopify integration; chỉ G2 chạy trên editor thật mới là bằng chứng AC11.
- Phase 7 nhận phase 8 hoàn tất qua dependencies bắc cầu 4/5/6. Milestone IMPORT và FINAL IMAGES được ghi riêng trong phase 8, nhưng baseline chờ cả phase 8 trước 4/5/6; không có import-only handoff làm lỏng dependency số. G2 dùng resource và ảnh cuối thật, G3 lặp trên bản cài sạch.

## Requirements

### Section phase 7 sở hữu (core, không có quota)

| ID | File | Layout / settings chính | Trạng thái thiếu/dài và responsive |
|---|---|---|---|
| S01 | `sections/hero-banner.liquid` | `layout`: Search first (home default) / Image led / Compact banner (landing); eyebrow, H1, mô tả, tối đa 2 CTA, ảnh + focal point; khi Search first: `snippets/search-form.liquid` của phase 2 và chip "Popular searches" | Thiếu ảnh → layout text; heading 80 ký tự wrap; mobile ảnh xếp dưới hoặc ẩn bằng setting rõ ràng, không che search/CTA; control scope không chung hàng với input ở 375px |
| S02 | `sections/stat-bar.liquid` | Blocks label + description + icon; không có metric mặc định bịa | Block rỗng bị bỏ; desktop 4 cột, mobile 2 cột/stack theo số block |
| S03 | `sections/collection-list.liquid` | Dense / Visual; collection picker, ảnh, số sản phẩm thật, sub-link từ menu merchant chọn | Chưa chọn collection → empty state editor, storefront không giả số; title không đè sub-link ở 375px |
| S05 | `sections/featured-collection.liquid` | Collection picker, số product, card profile Browsing/Technical, dùng `snippets/product-card.liquid` của phase 2 | Không collection → empty state; tên dài, thiếu ảnh, sold-out theo contract card |
| S06 | `sections/call-to-action.liquid` | Inline band / Split text; heading, body, tối đa 2 link; section presets Trade account và Services (cùng schema) | Không link → không nút trống; mobile stack theo DOM order |
| S07 | `sections/logo-list.liquid` | Blocks ảnh, alt, link; logo có quyền hoặc mark tự tạo cho vendor demo hư cấu đã duyệt | Không placeholder hoặc claim đối tác thật; block rỗng ẩn; ảnh không méo |
| S08 | `sections/blog-posts.liquid` | Blog picker, số bài, ảnh bật/tắt | Không blog/bài → empty state; title dài wrap; mobile 1 cột |
| S09 | `sections/newsletter.liquid` | Heading, text; form qua `snippets/newsletter-form.liquid` của phase 2 (cùng markup với footer); không hardcode tần suất | Label thật, inline error/success; mobile input/CTA không bị ép hẹp |
| S10 | `sections/rich-text.liquid` | Heading/text/link blocks, content width và alignment hữu hạn | Measure đọc được; bỏ block trống, không khoảng trắng cố định |
| S11 | `sections/image-with-text.liquid` (mới, bắt buộc) | Image left / right; image + focal point; heading/text/CTA blocks | Thiếu ảnh → text-only; mobile đúng thứ tự đọc bằng DOM/focus order, không chỉ đảo bằng CSS |
| S12 | `sections/multicolumn.liquid` (mới, bắt buộc) | Blocks icon hoặc image + title + text + link; 2–4 cột desktop; dùng cho dịch vụ, quy trình, hướng dẫn mua hàng | Mobile stack; số block không đều không tạo hàng rỗng |

Mỗi section nhận `@theme` blocks khi hợp lý, dùng `snippets/section-style.liquid` và `snippets/editor-empty-state.liquid` của phase 2, có `presets`; `enabled_on` theo cột "Dùng ở đâu" của inventory (home, landing, About, page). Setting resource (collection, product, blog, menu, page, link) mặc định trống.

### Section dùng từ phase khác (không implement lại ở phase 7)

| ID | Owner | Cách dùng ở phase 7 |
|---|---|---|
| S04 `sections/quick-order.liquid` | phase 6 | Compact pad trong home (đứng trước collection list); phase 7 chỉ cấu hình trong template/preset |
| S13 `featured-product`, S18 `collapsible-content` + `blocks/collapsible-row.liquid` | phase 5 | S18 dùng trong R02 và R03 cùng schema với PDP; S13 có sẵn trong editor, không bắt buộc trên home |
| S14–S17 | phase 5 | Chỉ trên product template, kiểm tra add/remove/reorder ở template đó trong G2 |
| S19 `custom-liquid` | phase 2 | Có sẵn trong editor; không dùng trong recipe |
| `main-page`, `main-contact` | phase 3 | System section của `page.about.json`, `page.trade-landing.json` và `page.trade-account.json` |
| `snippets/search-form.liquid`, `newsletter-form.liquid` | phase 2 | Hero Search first và S09 dùng lại, không tạo logic form thứ hai |

### Template và composition

- **Home default** (`templates/index.json`, thứ tự DOM = thứ tự đọc cả desktop và mobile): hero-banner (Search first) → stat-bar → quick-order (Compact pad) → collection-list (Dense) → featured-collection (card Technical) → call-to-action (Trade account) → logo-list → blog-posts → newsletter. Rich text và các core section khác có trong editor nhưng không bắt buộc hiện ở home. Không đổi thứ tự bằng CSS.
- **`templates/page.trade-landing.json`** (R02): `main-page` (tiêu đề có thể tắt) + hero-banner Compact + collection-list + featured-collection + multicolumn + collapsible-content (S18) + call-to-action. Không section riêng cho ngành cụ thể.
- **`templates/page.about.json`** (R03): `main-page` + image-with-text + rich-text + multicolumn + collapsible-content + call-to-action.
- **`templates/page.trade-account.json`** (đã có trong baseline, khác R02): `main-contact` của phase 3 với company và phone bật, tax ID tắt mặc định, block thông báo xử lý dữ liệu do merchant chỉnh. Trước khi làm, kiểm tra Shopify có luồng native cho yêu cầu mở tài khoản company không; nếu có thì CTA (S06 preset Trade account) dẫn tới luồng đó và template chỉ giữ phần giải thích/link, không tạo form thứ hai. Không có form trade riêng, không nhân đôi xử lý contact.
- Chốt view mặc định của collection trong preset (Grid hoặc Table) và ghi lý do, theo D03 đã duyệt ở G0.
- Preset Bulkhead: color scheme, font, density, card profile, homepage và template theo design trong G0; không thêm Foolscap/Furrow; Comfortable/Compact, radius 2/4px giữ nguyên.

### Gate G2 và merchant tự xây trang (AC11), design profiles (AC12)

- G2 là lần chạy R01–R03 trên **theme editor thật** ở feature test store, do người đóng vai merchant không sửa Liquid/HTML/CSS/JS, không dùng Custom Liquid, app/page builder hay developer tools. Bắt đầu từ trạng thái sạch (chỉ section hệ thống cần thiết: gỡ section khác khỏi `index`, hoặc tạo alternate template mới từ `page` trong editor cho R02/R03).
- Lưu cấu hình trước rehearsal; sau khi ghi evidence phải khôi phục composition default đã duyệt, không để bài thêm/bỏ section làm lệch demo hoặc mẫu dùng đo Lighthouse/parity.
- Kết quả R01–R03 theo [inventory](./section-inventory.md#recipes-merchant-tự-xây-trang-ac11): R01 thêm/bỏ/reorder một section, đổi hero layout rồi trả về default, đổi card profile và density, save/reload; R02 chọn collection, sửa 2 FAQ, đổi CTA link, reorder blocks; R03 đổi ảnh trái/phải, thêm/bỏ service block, sửa nội dung và CTA, save/reload, FAQ/CTA cùng schema với R02/PDP.
- Mỗi core section S01–S19 được thử change setting, add/remove/reorder ở template hỗ trợ, trạng thái chưa chọn resource, editor reload; S14–S17 trên product template, S19 chỉ kiểm empty state.
- Stress content (AC12, D01–D05) ở 375/768/1440px: heading 80 ký tự, title product 120 ký tự, SKU/MPN 40 ký tự, thiếu ảnh/spec/download, collection rỗng, 1/2/4 blocks, sold-out/low-stock, guest không có B2B. Không chữ/control đè nhau, không document overflow; vùng table/matrix cuộn có nhãn và keyboard access.
- Evidence ghi vào `reports/editor-rehearsal-g2.md` (file tương lai): section ID, setting đã chọn, bước thực hiện, ảnh trước/sau save/reload, cảnh báo dữ liệu cá nhân đã che. G3 (phase 9) lặp lại R01–R03 trên bản cài preset sạch; phase này không tuyên bố G2 hay G3 đã đạt.
- Ảnh editorial (hero/about/logo), blog/collection resource lấy từ phase 8 đã hoàn tất qua dependencies bắc cầu. Không dùng ảnh tạm theo danh mục làm bằng chứng G2 hoặc pipeline ảnh cuối theo SKU.

### Optional extensions

- O01 standalone video và O02 collection tabs không được triển khai hoặc quảng bá: không file, setting, preset, copy trong demo/listing. Video/3D trong gallery PDP và Grid/List/Table collection vẫn là core của phase khác.

## Architecture

- Mỗi section mới nhận `@theme` blocks khi hợp lý và có `presets` để merchant thêm từ editor; section preset không phải theme preset.
- `listings/bulkhead/` chỉ chứa những file thật sự khác bản gốc trong `templates/` và `config/`. `config/settings_data.json` ở gốc dùng preset Bulkhead làm mặc định. Template recipe và `index.json` chỉ chứa setting section; mọi picker (collection, product, blog, menu, page) để trống trong gói; nội dung demo kết nối trong editor của demo store và khác biệt đó nằm trong danh sách phase 9, không đưa vào JSON.
- `scripts/check-package-json.mjs` quét mọi file JSON trong gói theme (gồm `templates/index.json`, `page.trade-landing.json`, `page.about.json`, `page.trade-account.json`, `listings/`), báo lỗi khi gặp ID tài nguyên, `metafields.custom` hay `config/markets.json`; chạy trong CI.
- Một hệ settings: dùng bộ setting nền và empty state của phase 2; hero-banner, CTA, image-with-text và multicolumn dùng cùng quy ước link, button và content width; không CSS tuỳ ý.
- Quy tắc output của phase 2 áp dụng: text/setting in qua `escape`; link từ setting dùng `url` setting; link từ metafield chỉ khi bắt đầu bằng `https://`.
- Chủ sở hữu file: phase 7 chỉ tạo/sửa file ở mục dưới. Nếu rehearsal phát hiện lỗi ở file owner khác (ví dụ S18, S04, `main-contact`), sửa tối thiểu tại file đó, ghi owner và lý do trong `reports/editor-rehearsal-g2.md`; không tạo bản sao.

## Related Code Files

- Create (sections, owner phase 7): `sections/hero-banner.liquid`, `sections/stat-bar.liquid`, `sections/collection-list.liquid`, `sections/featured-collection.liquid`, `sections/call-to-action.liquid`, `sections/logo-list.liquid`, `sections/blog-posts.liquid`, `sections/newsletter.liquid`, `sections/rich-text.liquid`, `sections/image-with-text.liquid`, `sections/multicolumn.liquid`.
- Create (templates/preset): `templates/page.trade-landing.json`, `templates/page.about.json`, `templates/page.trade-account.json`, `listings/bulkhead/` (chỉ các file khác bản gốc), `scripts/check-package-json.mjs`, `plans/261021-0812-bulkhead-preset-v1/reports/editor-rehearsal-g2.md`.
- Modify: `templates/index.json`, `config/settings_data.json`, `locales/en.default.json` và `locales/en.default.schema.json` (chỉ thêm key cho section phase 7), CI workflow (thêm bước check-package-json).
- Dùng, không sở hữu: `sections/quick-order.liquid` (6), `sections/collapsible-content.liquid` + `blocks/collapsible-row.liquid` (5), `sections/featured-product.liquid` (5), `sections/custom-liquid.liquid` (2), `sections/main-page.liquid`, `sections/main-contact.liquid` (3), `snippets/product-card.liquid`, `snippets/search-form.liquid`, `snippets/newsletter-form.liquid`, `snippets/section-style.liquid`, `snippets/editor-empty-state.liquid` (2).
- Không được tồn tại sau phase 7: `sections/hero-search.liquid`, `sections/trade-cta.liquid`, `sections/faq-*.liquid` và mọi alias/shim; file/setting cho O01/O02.

## Implementation Steps

1. Đọc `reports/design-approval.md` và `reports/prototype-results.md` (nếu có delta/reapproval, áp dụng phần bị ảnh hưởng) cùng inventory; xác nhận mỗi section trong bảng đang thuộc phase 7 và không trùng owner.
2. Viết S01 hero-banner với cả ba layout và search-form dùng chung; kiểm tra ở 375/768/1440px với heading 80 ký tự, không ảnh, 0/1/2 CTA.
3. Viết S02, S03, S05, S06, S07, S08, S09, S10, S11, S12 theo bảng; mỗi section kiểm tra: trạng thái chưa chọn resource, block trống, 1/2/4 blocks, text dài, thay setting chính, thêm/bỏ/reorder trong editor.
4. Trang trade account: kiểm tra luồng native cho yêu cầu mở tài khoản company; dùng `main-contact` nếu không có, hoặc CTA dẫn tới luồng native. Không tạo form riêng.
5. Ghép `templates/index.json` theo thứ tự home mới (quick-order trước collection-list); dựng `page.trade-landing.json` và `page.about.json` từ các section chung (S18 từ phase 5, S06 từ phase 7).
6. Cấu hình preset trong `listings/bulkhead/`: colour scheme, font, density, card profile, view mặc định collection (ghi lý do), không custom metafield, không ID tài nguyên.
7. Viết `check-package-json.mjs`, thêm vào CI, chạy trên toàn bộ gói theme.
8. Cài preset lên feature test store, xem trạng thái mặc định; thêm resource bằng editor.
9. Chạy G2: R01–R03 theo bước ở mục Gate; sau đó duyệt từng core section, rồi stress content ở 375/768/1440px; ghi `reports/editor-rehearsal-g2.md`. Sửa lỗi ở owner tương ứng và chạy lại phần bị ảnh hưởng.
10. Kiểm tra không còn file bị cấm hoặc quảng bá O01/O02, và FAQ/CTA chỉ có một implementation.

## Todo

- [ ] Đối chiếu design-approval/prototype-results và owner S01–S19
- [ ] S01 hero-banner (3 layout), S02, S03
- [ ] S05, S06 (Trade/Services), S07, S08, S09
- [ ] S10 rich text, S11 image-with-text, S12 multicolumn
- [ ] Trang trade account (native hoặc `main-contact`, không form riêng)
- [ ] `index.json` theo thứ tự mới, `page.trade-landing.json`, `page.about.json`
- [ ] Preset `listings/bulkhead/` không resource riêng
- [ ] `check-package-json.mjs` trong CI
- [ ] Cài thử preset lên feature test store
- [ ] G2: R01–R03 trên editor thật, duyệt từng core section và stress content
- [ ] Xác nhận không có `hero-search`, `trade-cta`, FAQ riêng, alias hoặc O01/O02

## Success Criteria

- Homepage đúng thứ tự section của preset (hero, trust, quick-order, category, featured, CTA, logos, blog, newsletter); mọi section có trạng thái trống không vỡ layout.
- `check-package-json.mjs` chạy sạch trên gói theme và chạy trong CI.
- Theme Check không có error mới.
- Mỗi core section S01–S19 có kết quả thử cho change setting, add/remove/reorder phù hợp, editor reload, chưa chọn resource; dữ liệu rỗng không sinh giá, tồn kho hay brand giả.
- G2 đạt: R01–R03 hoàn thành trên theme editor, không sửa code, không Custom Liquid/app; save/reload giữ thay đổi; evidence có section ID, setting, bước và ảnh trước/sau.
- FAQ/CTA dùng cùng schema ở R02, R03 và PDP (FAQ); chỉ một `hero-banner`, một `call-to-action`, một `collapsible-content`.
- AC12: D01–D05 đạt ở 375/768/1440px với stress content, không đè chữ/control, không document overflow; header search mobile không bị bóp.
- Trade account không có form xử lý riêng; tax ID tắt mặc định.
- Không có O01/O02 trong code, preset hoặc demo.

## Risk Assessment

- Demo store nối custom metafield trong editor, còn preset để trống; reviewer có thể coi đây là lệch preset parity (chưa kiểm chứng). Phase 9 định nghĩa phép thử parity, danh sách khác biệt được phép do anh duyệt, và hỏi Theme Support trước khi nộp. Các picker của recipe (collection/blog/product) trên demo thuộc cùng nhóm khác biệt cần anh duyệt.
- Section bloat: thêm section ngoài inventory hoặc O01/O02 cần anh duyệt scope và effort mới.
- Rehearsal không có store hoặc nội dung từ phase 8: không chạy G2 bằng fixture rồi coi là editor evidence; ghi rõ điều kiện.
- Lỗi ở section của phase 5/6 phát hiện lúc G2: sửa tại owner file, không làm phase 7 tạo bản thứ hai.

## Security Considerations

- Form trade account chỉ gửi qua `{% form 'contact' %}` (qua `main-contact` của phase 3), không gửi dữ liệu tới dịch vụ ngoài; tax ID tắt mặc định vì contact form gửi nội dung qua email dạng plaintext.
- Newsletter dùng form customer của Shopify; CTA/hero không xử lý dữ liệu riêng; không thu thập hoặc đưa thông tin cá nhân vào evidence G2.

## Next Steps

Phase 8 đã bàn giao cả import và ảnh cuối trước phase 4/5/6, nên G2 có resource thật. Phase 9 dùng preset này để kiểm tra preset parity và lặp lại R01–R03 (G3) trên bản cài sạch, ghi AC11/AC12 vào `reports/qa-evidence.md`.
