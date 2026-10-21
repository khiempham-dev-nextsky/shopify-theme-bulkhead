---
phase: 1
title: "Phase 1: Môi trường và prototype rủi ro"
status: pending
priority: P1
effort: "1.5w"
dependencies: []
---

<!-- Updated: Red Team 2026-10-21 -->

# Phase 1: Môi trường và prototype rủi ro

## Goal

Dựng repo từ Skeleton, chuẩn bị đủ ba store, và trả lời bằng dữ liệu thật mọi điểm chưa kiểm chứng trước khi viết tính năng.

## Context Links

- [Contract](../reports/brainstorm-261021-1421-bulkhead-preset-contract.md), mục Constraints và Rủi ro còn mở.
- [Research Skeleton và tooling](../reports/researcher-261021-1503-skeleton-theme-store-tooling.md), mục 1, 3, 5 và 6.
- [Research dữ liệu demo](../reports/researcher-261021-1503-demo-data-image-pipeline.md), mục 3, 4 và 5.

## Key Insights

- `shopify theme init` hiện lấy Skeleton v2 (`{% block %}`, không có `sections/`), nên phải clone theo commit `a4f32d393b9eadf6c4403318ca39116832e5d1df`.
- Predictive search luôn tìm trên `variants.sku`, trả tối đa 10 product mỗi loại, và không tìm trên metafield, nên MPN cần một kênh tìm kiếm riêng.
- `customer.last_order` không tính test order; store chỉ bật Bogus Gateway nên test P-b phải dùng order không phải test.
- `productSet` không publish lên kênh bán và không tạo metafield definition; hai việc này phải có trong chuỗi import.
- Client transfer store không cài được custom app, nên import phải thử bằng `shopify store auth` + `store execute`.

## Requirements

**Việc anh tự làm trước (chặn phase này).** Không gửi mật khẩu, token hay email vào chat; chỉ báo tên miền `.myshopify.com`.
1. Tạo Partner account và vào Dev Dashboard.
2. **Demo store:** tạo client transfer store, bật Plus khi tạo. Bật Bogus Gateway hoặc Shopify Payments test mode, tắt các phương thức checkout khác. Settings → Customer accounts: dùng customer accounts mới.
3. Trên demo store: tạo company "Northgate Builders" (tên hư cấu), một location có địa chỉ giao hàng, một contact dùng email anh nhận được thư. Tạo catalog gán cho location. Sau khi phase 1 seed product (bước 4 bên dưới), đặt quantity rule (min, max, increment) và 2–3 bậc giá cho 3 variant do mình chỉ định, rồi ghi lại các giá trị đó vào một file ngoài repo để P-f so sánh.
4. **Benchmark store:** tạo dev store, import CSV performance của Shopify (https://shopify.dev/csv/theme-performance-shop-product-data.csv). Tạo một app trong Dev Dashboard chỉ với scope `read_products,write_themes`, cài lên benchmark store. Tạo GitHub secrets `SHOP_STORE`, `SHOP_CLIENT_ID`, `SHOP_CLIENT_SECRET`, `SHOP_PASSWORD` (mật khẩu storefront).
5. **Feature test store:** tạo một dev store thứ ba để test các tính năng cần app hoặc dữ liệu đặc biệt (selling plans với app subscription, CSV review của Shopify, file 3D mẫu) và để cài preset kiểm tra parity. Không cài app nào lên benchmark store.

**Prototype phải trả lời:**
- P-a: Predictive search có khớp chính xác SKU dạng `BH-4410-075`, `M8x1.25-50`, `00731`, `HX.200/12` không? Với khoảng 30 product dùng chung tiền tố (`BH-4410-*`), product đúng có luôn nằm trong top 10 không? Phương án `/search?q=sku1 OR sku2&type=product&section_id=` có tra nhiều SKU trong một request được không?
- P-b: `customer.orders`, `orders_count`, `last_order` có dữ liệu trên trang storefront khi khách B2B đăng nhập bằng new customer accounts không? Dùng ít nhất 2 order không phải test (tạo bằng draft order rồi "Mark as paid", hoặc payment terms của company).
- P-c: `cart/add.js` với `items[]`: (1) 10 dòng hợp lệ, (2) 9 hợp lệ + 1 hết hàng, (3) 50 dòng, (4) cart đã có sẵn số lượng làm vượt `max`, (5) vượt tồn kho một phần. Một dòng lỗi có làm hỏng cả batch không? Shopify có thêm một phần không?
- P-d: Gọi tra SKU cho 20 rồi 50 dòng với 4 request song song có bị 429 không? `Retry-After` là bao nhiêu?
- P-e: Chuỗi import đầy đủ trên client transfer store: `metafieldDefinitionCreate` → staged upload + `fileCreate` (poll đến READY) → `productSet` với `identifier: {handle}` → publish lên Online Store → đọc lại trên storefront. Thêm một mutation thử cho mỗi nhóm: `collectionCreate`, `pageCreate`, `blogCreate`/`articleCreate`, `menuCreate`, quantity rule và bậc giá của catalog. Chạy lại cùng input lần hai để chứng minh không nhân đôi. Ghi app đứng sau `store auth`, nơi lưu token và thời hạn token.
- P-f: Với khách B2B, `variant.quantity_price_breaks` và `variant.quantity_rule` có đúng giá trị anh đã cấu hình ở bước 3 không? Với khách chưa đăng nhập thì rỗng và mặc định như dự đoán không?
- P-g: MPN tìm được qua kênh nào: tag dạng `mpn:XYZ`, đoạn trong `body`, hay `shopify--discovery--product_search_boost.queries`? Thử cả predictive search và `/search`.
- P-h: Metafield danh mục chuẩn của Shopify (`shopify.*`, theo Standard Product Taxonomy) cho các danh mục ngũ kim có đủ thuộc tính để làm 2–3 cột spec trong Table view không? Đọc được trong vòng lặp product của collection không?
- P-i: Không cài app Search & Discovery thì `collection.filters` có filter availability và price không? App này có cài sẵn trên client transfer store không? Complementary products có dữ liệu khi không cấu hình app không?
- P-j: Alternate template `?view=table` có giữ được view khi chuyển trang, khi submit form filter và khi gọi Section Rendering (`section_id`) không?

## Architecture

- Theme code đặt ở gốc repo theo cấu trúc Skeleton: `assets/`, `blocks/`, `config/`, `layout/`, `locales/`, `sections/`, `snippets/`, `templates/`.
- Code prototype là code tạm: section `proto-*` gắn vào alternate template `page.proto-*.json`, bị xoá trước khi phase 1 đóng.
- Dữ liệu seed: khoảng 30 product, handle bắt đầu bằng `proto-` và có tag `proto`, gồm SKU khó và một nhóm dùng chung tiền tố `BH-4410-*`. Tạo bằng chính đường import ở P-e (nếu P-e thất bại thì tạo tay).
- Bằng chứng (ảnh chụp, log) phải che email, địa chỉ, số order, tên miền store và trường `token` của cart trước khi lưu vào repo.

## Related Code Files

- Create (giữ lại): toàn bộ file Skeleton tại commit đã chọn, `LICENSE.md`, `.gitignore`, `.shopifyignore` (loại `plans/`, `docs/`, `scripts/`, `demo-data/`, `package.json`, `package-lock.json`).
- Delete: `.github/workflows/cla.yml`; rà mọi file khác trong `.github/` của Skeleton và chỉ giữ workflow Theme Check.
- Create (tạm, xoá cuối phase): `sections/proto-sku-lookup.liquid`, `sections/proto-orders.liquid`, `sections/proto-collection-view.liquid`, `templates/page.proto-sku.json`, `templates/page.proto-orders.json`, `templates/collection.proto-table.json`, `assets/proto-harness.js`, `scripts/prototype/*.graphql`, `scripts/prototype/vars/*.json`.
- Create (giữ lại): `plans/261021-0812-bulkhead-preset-v1/reports/prototype-results.md`.

## Implementation Steps

1. Clone Skeleton vào thư mục tạm ngoài repo, chạy `git merge-base --is-ancestor a4f32d393b9eadf6c4403318ca39116832e5d1df origin/main` để chắc commit thuộc repo gốc, checkout bằng SHA đầy đủ, copy file (bỏ `.git`) vào repo. Commit đầu tiên ghi rõ SHA gốc. Chạy `shopify theme check` để có baseline.
2. Chạy `shopify theme dev --store <demo-store>` để xác nhận theme lên được.
3. P-e: `shopify store auth` một lần với đủ scope cho phase 8: `write_products,write_files,write_inventory,read_locations,write_publications,write_content,write_online_store_navigation,write_metaobject_definitions` và scope cho company và catalog B2B (chốt tên scope chính xác bằng tài liệu khi chạy). Chạy chuỗi import cho 1 product, chạy lại lần hai, rồi seed nốt khoảng 30 product.
4. Anh cấu hình quantity rule và bậc giá cho 3 variant đã chỉ định (checklist bước 3).
5. P-a, P-d, P-g: dựng `proto-sku-lookup` có ô nhập và nút chạy loạt test; harness ghi thời gian, vị trí của product đúng trong kết quả, mọi mã 429 và `Retry-After`.
6. P-c: trong cùng harness, chạy 5 ca và ghi status, body và `/cart.js` sau mỗi ca (đã lọc `token`).
7. P-b, P-f: dựng `proto-orders` in riêng `orders_count`, `orders.size`, `last_order`, `customer.b2b?`, `current_location`, `quantity_price_breaks` và `quantity_rule` của 3 variant; xem ở trạng thái đăng nhập B2B và chưa đăng nhập.
8. P-h, P-i, P-j: dựng `proto-collection-view` và template `collection.proto-table.json`; gán category cho vài product seed và thử đọc metafield `shopify.*`; kiểm tra filter và view qua phân trang, form, Section Rendering.
<!-- Updated: Validation Session 1 - gửi câu hỏi parity cho Theme Support ngay sau P-h -->
9. Ngay sau P-h: soạn câu hỏi cho Theme Support về preset parity khi preset để trống custom metafield (và setting `namespace.key` nếu P-h không đạt). Mình soạn nội dung, **anh gửi** từ Partner account. Phase 4 và 5 không chốt thiết kế spec/downloads khi chưa có trả lời hoặc chưa được anh quyết định đi tiếp.
10. Ghi `reports/prototype-results.md`: mỗi câu P-a…P-j có kết quả, bằng chứng đã che dữ liệu, và quyết định cho phase sau.
11. Dọn: xoá mọi file `proto-*` trong repo; trên demo store xoá product có tag `proto`, các page `proto-*`, order và customer thử nghiệm (trừ contact B2B); đếm lại số product và page để làm bằng chứng. Chạy `rg -n '@|myshopify\.com|"token"' plans/` trước khi commit.

## Todo

- [ ] Anh hoàn tất checklist ba store, B2B, app Lighthouse và GitHub secrets
- [ ] Import Skeleton tại commit đã xác minh, dọn `.github/`, thêm `.shopifyignore`
- [ ] P-e: chuỗi import đầy đủ, idempotent, ghi thông tin token
- [ ] Seed khoảng 30 product `proto-`
- [ ] P-a, P-d, P-g: tra SKU, rate limit, MPN
- [ ] P-c: `cart/add.js` 5 ca
- [ ] P-b, P-f: order không phải test và dữ liệu B2B
- [ ] P-h, P-i, P-j: spec chuẩn, filter không app, `?view=`
- [ ] Soạn câu hỏi parity cho Theme Support, anh gửi
- [ ] Viết `prototype-results.md` với quyết định
- [ ] Dọn code và dữ liệu prototype trên repo và demo store

## Success Criteria

`prototype-results.md` có đủ 10 kết quả và các quyết định sau được chốt:

| Câu | Nếu kết quả tốt | Nếu kết quả xấu |
|---|---|---|
| P-a | Quick order tra SKU bằng predictive search | Dùng `/search` với `section_id`, gộp nhiều SKU bằng `OR` nếu được; trạng thái "không chắc chắn" đẩy sang `/search` |
| P-b | Nút "Order again" dựa trên `customer.orders \| first` | Chỉ link sang trang orders của customer account |
| P-c | Gửi một batch | Kiểm tra trước, gửi batch, khi 422 đọc lại `/cart.js` rồi chỉ gửi phần chênh lệch |
| P-d | Chốt số request song song | Giảm song song, tôn trọng `Retry-After` |
| P-e | Phase 8 import bằng `store execute` | Phase 8 dùng product CSV, ảnh host công khai, definition và publish làm tay |
| P-f | Giữ hướng hai lớp như contract | Dừng lại và hỏi anh |
| P-g | Ghi MPN vào kênh tìm được đã chốt | Hỏi anh nếu kênh duy nhất buộc merchant nhập trùng dữ liệu |
| P-h | Cột spec dùng metafield chuẩn `shopify.*` | Setting `namespace.key` để trống trong preset; hỏi Theme Support về parity trước khi nộp |
| P-i | Filter chuẩn chạy không cần app | Hỏi anh: những AC nào bị ảnh hưởng và có dùng Search & Discovery không |
| P-j | Giữ view bằng alternate template | Thiết kế lại cơ chế view trước khi làm phase 4 |

## Risk Assessment

- Market B2B trên store Plus tạo từ Dev Dashboard có thể thiếu giao diện (forum 01/2026). Cách vượt: tạo market rồi sửa phần "includes" để chọn company location.
- Kết quả rate limit thay đổi theo thời điểm; đo hai lần ở hai thời điểm khác nhau.

## Security Considerations

- Token của `store auth` không ghi vào repo hay log; P-e ghi lại nơi CLI lưu token để thu hồi ở cuối phase 8.
- Không commit `.env`, mật khẩu, email, địa chỉ, số order hay cart token; bằng chứng phải được che trước khi lưu.

## Next Steps

Phase 2 và phase 8 bắt đầu sau khi bảng quyết định được chốt; hai phase này chạy song song.
