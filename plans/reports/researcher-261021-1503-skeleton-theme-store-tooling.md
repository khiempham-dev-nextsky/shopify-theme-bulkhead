# Research: Skeleton Theme, tooling Theme Store và cách làm tính năng bắt buộc cho Bulkhead

Ngày 21/10/2026. Mọi nguồn được đọc trong ngày. Các mục chưa có nguồn chính thức xác nhận được đánh dấu "⚠️ chưa kiểm chứng".

## Kết luận chính (đọc trước)

1. **Không được dùng `shopify theme init` mặc định.** Từ 01/10/2026, nhánh `main` của Skeleton là bản v2 (commit "Port rc-v2.0.0 with updated block composition syntax"). Bản này dựng trang bằng `{% block %}` trong template `.liquid`, không có thư mục `sections/`, không có JSON template. Đây là developer preview "Liquid July '26", trái với yêu cầu Theme Store (JSON template, section group) và trái với non-goal của contract. Nguồn: [README main](https://github.com/Shopify/skeleton-theme), [developer preview](https://shopify.dev/docs/storefronts/themes/getting-started/developer-preview), [requirements](https://shopify.dev/docs/storefronts/themes/store/requirements).
2. **Điểm khởi đầu đề xuất: commit `a4f32d393b9eadf6c4403318ca39116832e5d1df` (26/02/2026).** Đây là commit cuối cùng còn kiến trúc section, nằm ngay trước v2 trên `main`, và đã có `<shopify-account>` trong header.
3. **Lighthouse CI action chỉ đo mobile và assert theo từng URL.** Nó không đo desktop và không tính trung bình, nên chưa đủ để chứng minh tiêu chí Theme Store. Cần thêm một bước đo desktop riêng (xem mục 3).
4. **Không có tài liệu nào nói `/cart/add.js` với `items[]` là all-or-nothing.** Forum báo rằng một dòng lỗi làm hỏng cả batch. Acceptance criterion số 3 của contract ("một lần `cart/add`, dòng lỗi không làm hỏng dòng khác") vì thế bắt buộc phải kiểm tra trước ở client và có đường lui khi gặp 422.
5. **`customer.orders` với new customer accounts vẫn chưa rõ.** Không nguồn chính thức nào xác nhận. Cần prototype như contract đã ghi.

## 1. Shopify Skeleton Theme

**Repo:** https://github.com/Shopify/skeleton-theme. Nhánh mặc định là `main`, có 829 sao, không bị archive. Tag và nhánh hiện có: `v1.0.0` (20/05/2025) và nhánh `rc-v2.0.0` (23/07/2026). Repo không có GitHub Release nào. Dữ liệu lấy qua `gh api`.

**Cách lấy code.** `shopify theme init` mặc định clone Skeleton, và không có flag chọn branch hay tag. Các flag có sẵn là `--clone-url`, `--latest` và `--path` ([theme init](https://shopify.dev/docs/api/shopify-cli/theme/theme-init)). Hành vi của `--latest` khi repo không có Release chưa rõ ⚠️ chưa kiểm chứng. Cách đúng là:
```
git clone https://github.com/Shopify/skeleton-theme.git tmp-skeleton
git -C tmp-skeleton checkout a4f32d393b9eadf6c4403318ca39116832e5d1df
# copy file (bỏ .git) vào repo bulkhead, ghi SHA gốc vào commit đầu tiên
```

**So sánh ba lựa chọn nền:**

| Nền | Kiến trúc | `<shopify-account>` | Hợp Theme Store | Xếp hạng |
|---|---|---|---|---|
| Commit `a4f32d3` (26/02/2026) | JSON template + section group + `@theme` blocks | Có sẵn | Có | **1** |
| Tag `v1.0.0` (20/05/2025) | Giống hệt trên | Không có, phải tự thêm | Có | 2 |
| `main` / `rc-v2.0.0` | `{% block %}` + `{% partial %}`, không sections, không JSON | Có, nằm trong block | Không: thiếu JSON template và section group; `partial` cần `agentic_editor_enabled?` | Loại |

**Những gì commit `a4f32d3` đã có:**
- `layout/theme.liquid` và `layout/password.liquid`.
- Template JSON: 404, article, blog, cart, collection, index, list-collections, page, password, product, search. Thêm `gift_card.liquid`.
- Section group `sections/header-group.json` và `footer-group.json`.
- Section `custom-section.liquid` nhận `@theme` blocks, có preset. Block `group` và `text`.
- `config/settings_schema.json` với `theme_info`, `font_picker`, màu và layout. Locale `en.default.json` và `en.default.schema.json`.
- `.theme-check.yml` với `extends: theme-check:recommended`, và CI chạy `shopify/theme-check-action@v2`.
- CSS nằm trong `{% stylesheet %}`, chưa minify.

**Những gì Bulkhead phải tự thêm** (đối chiếu [requirements](https://shopify.dev/docs/storefronts/themes/store/requirements)):
- Template `page.contact.json`.
- Section Custom Liquid (setting kiểu `liquid`, có trên mọi template) và block Custom Liquid.
- Main product section tách hết thành block, có `@app` block ở main product và featured product.
- Toàn bộ tính năng bắt buộc ở mục 4 bên dưới, faceted filtering, accelerated checkout và discounts.
- Ít nhất 4 bộ màu, mỗi màu nền có màu chữ đi kèm. Favicon. Xử lý font variant bằng `font_modify`.
- Thư mục preset (listing) cho preset "Bulkhead".
- Không được đưa `config/markets.json` vào bản nộp.
- Template customer account kiểu legacy không còn bắt buộc ([changelog](https://shopify.dev/changelog/the-shopify-account-component-for-customer-accounts-is-now-a-theme-store-requirement)).

**`_blocks.liquid` (Sidekick).** Nếu theme không có file này, Shopify tự sinh wrapper section. Nếu theme tự viết `_blocks.liquid` thì file phải khai báo cả `@theme` lẫn `@app`, phải có `presets`, phải render blocks, và không được có thuộc tính `templates`. Mỗi theme có tối đa 300 file trong `/blocks`, tính cả block do AI sinh ra ([ai-generated theme blocks](https://shopify.dev/docs/storefronts/themes/architecture/blocks/ai-generated-theme-blocks)). Section nội dung cần `"blocks": [{"type": "@theme"}]` thì mới nhận được block do Sidekick sinh.

**License** ([LICENSE.md](https://github.com/Shopify/skeleton-theme/blob/main/LICENSE.md)). Đây là license kiểu MIT nhưng có giới hạn: quyền sử dụng "may only be exercised to develop themes that integrate or interoperate with Shopify … and … via the Shopify Theme Store. All other uses … strictly prohibited." License bắt buộc giữ copyright notice, nên phải giữ `LICENSE.md` của Shopify trong repo. Giới hạn này khớp với luật exclusivity của Theme Store. Nên xoá `.github/workflows/cla.yml`, vì đây là workflow CLA nội bộ của repo Shopify. Đây là suy luận của mình, chưa có quy định nào yêu cầu.

## 2. Shopify CLI và Theme Check

- **Phiên bản:** `@shopify/cli` 4.9.4, cần Node ≥ 22.12.0 (theo `npm view` ngày 21/10/2026; máy đã cài 4.9.4). `@shopify/theme-check-node` mới nhất là 3.30.1. Cập nhật CLI bằng `shopify upgrade`, xem phiên bản bằng `shopify version` ([CLI for themes](https://shopify.dev/docs/storefronts/themes/tools/cli)).
- **`shopify theme dev`:**
  - `--store`, `--theme-editor-sync`, `--live-reload=hot-reload|full-page|off`, `--port`, `--store-password`, `--error-overlay`.
  - `--listing=<preset>` áp file preset từ `listings/[preset-name]`.
  - URL local là `http://127.0.0.1:9292`. Lấy từ `shopify theme dev --help` của CLI 4.9.4.
- **`shopify theme check`:** `-C/--config`, `-a/--auto-correct`, `-o/--output`, `--fail-level=crash|error|suggestion|style|warning|info` (mặc định `error`), `--init`, `--list`, `--print`.
- **`shopify theme push`:** `--unpublished`, `--development`, `--json`, `--strict`, `--listing`. `--strict` bắt Theme Check không còn error mới cho push.
- **Config Theme Check:** có ba config dựng sẵn: `theme-check:recommended`, `theme-check:all` và `theme-check:theme-app-extension` ([configuration](https://shopify.dev/docs/storefronts/themes/tools/theme-check/configuration)).
  - Theme dùng **`theme-check:recommended`**. Skeleton cũng dùng config này.
  - `theme-app-extension` dành cho app extension, không dùng cho theme.
  - Trang requirements không bắt buộc config cụ thể nào. Trang [test-theme](https://shopify.dev/docs/storefronts/themes/store/test-theme) chỉ nói "use Theme Check".
  - Đề xuất: dùng `recommended` cho local và CI, rồi thỉnh thoảng chạy thêm `theme-check:all` để bắt lỗi sớm.

## 3. Lighthouse CI và benchmark dataset

**Action** [Shopify/lighthouse-ci-action](https://github.com/Shopify/lighthouse-ci-action). Tag mới nhất `v1.4.0`, commit cuối ngày 13/04/2026, dùng bằng `@v1`. Action chạy trong Docker.

**Inputs** (theo `action.yml`):

| Input | Ghi chú |
|---|---|
| `store` (bắt buộc) | Dạng `xxx.myshopify.com`. |
| `client_id` + `client_secret` | Dùng Dev Dashboard app. Bắt buộc với app tạo sau tháng 1/2026. Cần scope `read_products` và `write_themes`. |
| `access_token` | Chỉ dùng cho custom app kiểu cũ. |
| `password` | Mật khẩu storefront, khi store đang bật password. |
| `product_handle`, `collection_handle` | Trang sẽ được đo. |
| `theme_root` | Mặc định `.`. |
| `pull_theme` | Lấy `templates/*.json` và `settings_data.json` từ một theme có sẵn. |
| `lhci_min_score_performance` / `_accessibility` | Mặc định 0.6 và 0.9. |
| `lhci_github_app_token` hoặc `lhci_github_token` | Dùng để báo status check lên PR. |

**Secrets cần tạo:** `SHOP_STORE`, `SHOP_CLIENT_ID`, `SHOP_CLIENT_SECRET`, và tuỳ chọn `LHCI_GITHUB_APP_TOKEN`. Nếu store có password thì thêm secret cho mật khẩu storefront.

**Action thực sự làm gì** (đọc từ `entrypoint.sh`):
- `shopify theme push --development`, sau đó đo 3 URL: home, `/products/{handle}` và `/collections/{handle}`, với tham số `preview_theme_id` và `pb=0`.
- Assert theo `median-run` **cho từng URL**, không lấy trung bình ba trang.
- Không đặt `preset: desktop`, nên chỉ đo với cấu hình mobile mặc định của Lighthouse. Đây là suy luận từ code ⚠️ chưa kiểm chứng bằng log chạy thật.
- Nếu không truyền handle, action gọi Admin API `2021-04`, lấy product đầu tiên và *custom* collection đầu tiên. Vì vậy luôn truyền handle tường minh.

**Benchmark dataset:**
- **Benchmark (performance):** https://shopify.dev/csv/theme-performance-shop-product-data.csv. Mình đã tải và đếm: 2.000 product handle, 20.000 dòng, cột Collection có `collection1`–`collection20`.
- **Review (tính năng):** https://shopify.dev/csv/theme-store-testing-shop-product-data.csv, gồm 11 product: bowtie rich media, socks 2 option, tshirt 3 option, pre-order, no-image và các product khác.
- Nguồn: [assets](https://shopify.dev/docs/storefronts/themes/store/test-theme/assets).
- CSV import không mang theo rich media, selling plan (phải có app subscription), pickup, unit price hay Shop Pay Installments. Những phần đó phải setup tay. Có thêm file 3D mẫu: https://help.shopify.com/zip/SampleModels.zip.

**Cách Shopify chấm điểm** ([testing for performance](https://shopify.dev/docs/storefronts/themes/best-practices/performance/testing-for-performance)):
- Dùng một benchmark shop riêng, không phải store của merchant, đã import CSV performance ở trên.
- Điểm Theme Store là trung bình **cộng thẳng** của home, product và collection, trên cả desktop lẫn mobile. Trọng số 17/40/43 chỉ áp cho "speed score", không phải ngưỡng duyệt.
- Mỗi URL chạy ít nhất 3 lần, lấy median.
- Trang requirements thêm một điều kiện: section phải có ảnh và nội dung thật.

**Hệ quả cho plan:**
- Cần **hai store**: benchmark dev store import CSV performance để đo Lighthouse, và demo store chứa dữ liệu Bulkhead.
- Demo store phải tạo dưới dạng *client transfer store* trong Dev Dashboard, vì dev store không chuyển nhượng được. Store bật Bogus Gateway hoặc Shopify Payments test mode, và không cài app ([requirements](https://shopify.dev/docs/storefronts/themes/store/requirements)).
- Ngoài action, cần thêm một job hoặc script `lhci` với `--preset=desktop`, chạy 3 lần mỗi URL rồi tự tính trung bình 3 trang cho từng thiết bị. Ngưỡng của action đặt riêng cho từng URL là chặt hơn mức cần nhưng an toàn; có thể đặt 0.6/0.9 cho từng trang.

## 4. Cách làm các tính năng bắt buộc

| Tính năng | Cách làm | Nguồn |
|---|---|---|
| `<shopify-account>` | `{% if shop.customer_accounts_enabled %}<shopify-account menu="{{ settings_menu }}">…</shopify-account>{% endif %}`. Thuộc tính: `menu` (khuyên dùng `customer-account-main-menu`, nên cho merchant chọn qua setting) và `sign-in-url`. Slot `signed-out-avatar`, CSS part `signed-out-avatar`, khoảng 30 biến `--shopify-account-*` (màu, font, radius, avatar-size). Phải thấy được trên cả desktop và mobile. Store dùng legacy accounts chỉ thấy avatar dẫn tới trang sign-in. Tài liệu không nói cần tự nạp script; Skeleton cũng không nạp ⚠️ chưa kiểm chứng (giả định script được inject qua `content_for_header`). | [component](https://shopify.dev/docs/api/storefront-web-components/components/shopify-account), [guide](https://shopify.dev/docs/storefronts/themes/customer-engagement/account-component) |
| Follow on Shop | `{{ shop \| login_button: action: 'follow' }}` trả về một button HTML. Merchant phải cấu hình thêm ở phía Shop. Không được đổi màu branded. | [login_button](https://shopify.dev/docs/api/liquid/filters/login_button) |
| Gift card recipient | Trong `{% form 'product' %}`, khi `product.gift_card?`: dùng các property `Recipient email`, `Recipient name` (≤255 ký tự), `Message` (≤200 ký tự), `Send on` (định dạng yyyy-mm-dd, tối đa 90 ngày), `__shopify_send_gift_card_to_recipient=true` và `__shopify_offset`. Requirements nhắc `form.email`, `form.name`, `form.message`, `gift_card.send_on`. Tài liệu chỉ tới snippet của Dawn làm mẫu; không được chép, phải viết lại. | [gift cards](https://shopify.dev/docs/storefronts/themes/product-merchandising/gift-cards) |
| Unit price | `{% if variant.unit_price_measurement %}{{ variant.unit_price \| unit_price_with_measurement: variant.unit_price_measurement }}{% endif %}`. Ở cart dùng `line_item.unit_price*`. Bắt buộc có trên collection, product và cart. | [unit pricing](https://shopify.dev/docs/storefronts/themes/pricing-payments/unit-pricing) |
| Pickup availability | Section `pickup-availability` lặp `product_variant.store_availabilities \| where: 'pick_up_enabled', true` và đọc `available`, `pick_up_time`, `location`. Khi đổi variant, gọi `fetch(Shopify.routes.root + 'variants/{id}/?section_id=pickup-availability')`. | [pickup](https://shopify.dev/docs/storefronts/themes/delivery-fulfillment/pickup-availability) |
| Recommendations | Gọi `{{ routes.product_recommendations_url }}?section_id=…&product_id=…&limit=…&intent=related\|complementary`. `limit` từ 1 đến 10, mặc định intent là `related`. Trong section kiểm tra `recommendations.performed?` và `recommendations.intent`. Lần render đầu object này rỗng, nên phải fetch bằng JS. Complementary cần merchant cấu hình trong app Search & Discovery. Giữ nguyên URL có tham số `pr_*` để Shopify theo dõi chuyển đổi. Endpoint trả 404 nếu product chưa publish. | [complementary](https://shopify.dev/docs/storefronts/themes/product-merchandising/recommendations/complementary-products), [API](https://shopify.dev/docs/api/ajax/reference/product-recommendations) |
| Predictive search | `GET /{locale}/search/suggest?q=…&resources[type]=product,query,collection,page&resources[limit]=1..10&resources[limit_scope]=each&resources[options][unavailable_products]=last&section_id=…`. Product luôn được tìm trên mọi trường, gồm `variants.sku` và `variants.barcode`. Cần có thêm template `search`. | [predictive search](https://shopify.dev/docs/api/ajax/reference/predictive-search) |
| Country/language | Trong `{% form 'localization' %}`: input ẩn `country_code` và `language_code`. Chỉ render selector khi `localization.available_countries.size > 1` (hoặc `available_languages.size > 1`). Option hiện `country.name (currency.iso_code currency.symbol)` và `language.endonym_name`. Phải có fallback khi JS bị tắt. | [markets](https://shopify.dev/docs/storefronts/themes/markets/multiple-currencies-languages), [UX](https://shopify.dev/docs/storefronts/themes/markets/country-language-ux) |
| Shop Pay Installments | Đặt `{{ form \| payment_terms }}` trong product form, ngay dưới giá. Form phải có input `name="id"` cập nhật theo variant đang chọn. Ở cart đặt trong `{% form 'cart' %}` và gắn `data-cart-subtotal`. Không chỉnh được giao diện banner. | [installments](https://shopify.dev/docs/storefronts/themes/pricing-payments/installments) |
| Selling plans | Lặp `product.selling_plan_groups`, có input ẩn `name="selling_plan"`. Dùng `product.requires_selling_plan` để ẩn lựa chọn mua một lần. Giá lấy từ `variant.selling_plan_allocations`. Cart hiện `line_item.selling_plan_allocation.selling_plan.name`. Cần app subscription trên store để test. | [add subscriptions](https://shopify.dev/docs/storefronts/themes/pricing-payments/subscriptions/add-subscriptions-to-your-theme) |

## 5. Cart API cho quick order

Nguồn: [Cart API](https://shopify.dev/docs/api/ajax/reference/cart), [Section Rendering](https://shopify.dev/docs/api/ajax/section-rendering), [predictive search](https://shopify.dev/docs/api/ajax/reference/predictive-search).

- **`/cart/add.js` với `items[]`:** tài liệu không nêu số item tối đa mỗi request. Muốn biết giới hạn thật thì phải thử với 50 dòng ⚠️ chưa kiểm chứng.
- **Khi một item lỗi:** tài liệu không nói. Forum báo cả batch thất bại ([community](https://community.shopify.com/t/multiple-products-are-not-added-to-cart-when-one-product-has-a-error/410814)) ⚠️ chưa kiểm chứng.
- **Mâu thuẫn khi vượt tồn kho:** tài liệu nói sẽ thêm số lượng tối đa còn hàng, nhưng forum báo trả 422 và không thêm gì.
- **Mã lỗi:** body 422 có `description` ("sold out", "Cannot find variant", "You can't add more…"). Thêm thất bại lặp lại nhiều lần trên cùng một cart sẽ bị **429**.
- **Đề xuất cho AC3:**
  1. Kiểm tra trước ở client: variant tồn tại, `available`, tồn kho và `quantity_rule`.
  2. Gửi đúng một `add.js` cho các dòng hợp lệ.
  3. Nếu bị 422, rơi về chế độ gửi từng dòng (tuần tự, có giới hạn) và đánh dấu lỗi theo dòng.
- **`/cart/update.js`:**
  - `updates` nhận key là line item key (nên dùng) hoặc variant_id, giá trị là số lượng. Nếu một variant_id khớp nhiều dòng thì chỉ dòng đầu được sửa. Đặt số lượng 0 để xoá dòng.
  - Update.js **không kiểm tra tồn kho** của item đã có trong cart.
  - `/cart/change.js` chỉ đổi được một dòng mỗi lần.
- **`sections`:** dùng được với add, change, update và clear. Tối đa **5 section** mỗi request, kèm `sections_url` (phải bắt đầu bằng `/`). Section nào lỗi trả `null`, nhưng status của request không đổi. Với GET, `section_id` render một section dạng HTML (404 nếu section không tồn tại); `sections` render tối đa 5 section dạng JSON.
- **Rate limit:**
  - Predictive search có throttle, trả **429 kèm header `Retry-After`**. Tài liệu không công bố con số.
  - Cart chỉ ghi chú 429 cho thêm thất bại lặp lại và cho `shipping_rates.json`.
  - Product recommendations và Section Rendering không ghi rate limit.
  - Kết luận: không có ngưỡng nào được công bố. Cần giới hạn số request song song (ví dụ 4), tôn trọng `Retry-After`, và đo thực tế với 20 rồi 50 dòng ⚠️ chưa kiểm chứng.

## 6. `customer.orders` và `last_order` với new customer accounts

**Đã xác nhận:**
- [Liquid customer](https://shopify.dev/docs/api/liquid/objects/customer) có `orders` (paginate tối đa 20), `orders_count` và `last_order` (không tính test order). Object `customer` là global khi khách đăng nhập.
- Trang này không nhắc gì tới new hay legacy accounts.
- Changelog [legacy deprecated](https://shopify.dev/changelog/legacy-customer-accounts-are-deprecated) (26/02/2026) không nhắc tới `customer.orders`. Ngày sunset sẽ được công bố trong năm 2026.
- Đã có lỗi `customer` bị null trên storefront khi dùng new customer accounts; Shopify sửa ngày 18/06/2025, session mới kéo dài 30 ngày ([thread](https://community.shopify.dev/t/logged-in-customer-details-not-available-in-online-store-theme-with-new-customer-accounts-through-the-customer-liquid-object/16897)). Thread này chỉ nói về email và name, không nói về orders.
- New customer accounts có sẵn chức năng reorder.

**Chưa biết:** `customer.orders` và `last_order` có dữ liệu trên trang storefront (không phải trang account) khi store dùng new accounts hay không ⚠️ chưa kiểm chứng. Giữ kế hoạch của contract: prototype trên dev store; nếu rỗng thì link sang `routes.account_url`.

## Tác động lên contract

- Phải sửa constraint "Codebase bắt đầu từ Shopify Skeleton Theme" thành **Skeleton tại commit `a4f32d3`**, kèm lý do. Nếu không, người thực thi sẽ chạy `shopify theme init` và nhận về bản v2 dùng `{% block %}`.
- AC1 cần nói rõ hai store: **benchmark store** (CSV performance 2.000 product) để đo Lighthouse, và **demo store** cho dữ liệu Bulkhead. Phép đo desktop cần một bước riêng ngoài action.
- AC3 nên đổi thành "một `add.js` cho các dòng đã kiểm tra trước, và rơi về gửi từng dòng khi gặp 422", vì tài liệu không đảm bảo hành vi theo từng item.

## Giới hạn của nghiên cứu

- Không chạy thử CLI hay action trên store thật, vì chưa có Partner account hay store. Các mục ⚠️ cần kiểm chứng bằng prototype.
- Không đọc toàn văn [review checklist](https://shopify.dev/docs/storefronts/themes/store/test-theme/checklist) và trang country-language UX. Cả hai nên đọc ở bước plan.
- Kết luận Skeleton v2 không hợp Theme Store dựa trên requirements hiện hành (vẫn yêu cầu JSON template và section group). Nếu Shopify cập nhật requirements cho Liquid-first, kết luận này phải xem lại.

## Câu hỏi còn mở

1. `shopify theme init --latest` lấy gì khi repo không có Release? Câu này không chặn plan, vì đã có cách clone theo commit.
2. Số item tối đa và hành vi khi một item lỗi của `add.js` với `items[]`: cần prototype.
3. Ngưỡng throttle thật của predictive search khi gọi 20 đến 50 request.
4. `customer.orders` với new customer accounts trên storefront.
5. Thay cho N request predictive search, có thể gọi một request `/search?q=sku1 OR sku2…&type=product&section_id=…` không? Search của storefront có hỗ trợ `OR` theo SKU và giới hạn kết quả mỗi trang ra sao ⚠️ chưa kiểm chứng. Nếu được thì sẽ giảm mạnh rủi ro rate limit.
