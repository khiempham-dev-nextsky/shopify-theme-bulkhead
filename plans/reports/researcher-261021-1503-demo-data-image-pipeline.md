# Research: pipeline dữ liệu demo, ảnh packshot và môi trường test B2B cho Bulkhead

Ngày: 21/10/2026. Đầu vào: `plans/reports/brainstorm-261021-1421-bulkhead-preset-contract.md`. Đây là báo cáo research, không sinh ảnh hay dữ liệu.

## Kết luận chính

1. **Phát hiện chặn, cần anh quyết trước khi plan:** trang requirements của Theme Store ghi "Each demo store must match the primary industry and catalog size that the theme preset is tagged to". Bảng catalog size chỉ có `1 product`, `Few (2-10)`, `Some (11-100+)` và `Lots (500+)`. Demo store 70–100 sản phẩm khớp với **Some**, không khớp **Lots**. Như vậy, hoặc đổi tag preset sang Some, hoặc nâng demo lên ≥ 500 sản phẩm. Câu hỏi này cũng giải đáp rủi ro mở cuối cùng trong brainstorm.
2. **Ảnh:** dùng `codex exec` gọi skill hệ thống `imagegen`. Skill này mặc định dùng tool `image_gen` built-in, không cần `OPENAI_API_KEY` và tính vào hạn mức gói ChatGPT. Mỗi lần gọi đính kèm một ảnh "style anchor" bằng `-i`. Không có tham số seed, nên độ đồng bộ phải dựa vào prompt cố định, ảnh tham chiếu và bước hậu kỳ bằng ImageMagick (đã cài bản 7.1.2-13).
3. **Import:** cách được đề xuất là một script Node (không cần dependency) sinh input cho `productSet`, rồi gửi qua `shopify store execute --allow-mutations` của Shopify CLI 4.9.4 đã cài sẵn. Product CSV chỉ đứng thứ hai: không hỗ trợ variant metafield, không hỗ trợ `file_reference`, và ảnh phải là URL công khai.
4. **Store:** demo store bắt buộc phải là **client transfer store**. Trên loại store này **không cài được custom app và draft app**, nên đường "tạo custom app lấy token" gần như bị chặn. Đây là lý do nên chọn `shopify store auth` thay cho app. ⚠️ chưa kiểm chứng rằng `store auth` chạy được trên client transfer store, nên cần prototype trước tiên.
5. **B2B:** B2B có trên mọi gói. Bậc giá theo số lượng (tối đa 10 bậc cho mỗi product) và quantity rule cũng có trên mọi gói. Client transfer store mặc định có tính năng của gói Advanced, và nếu bật Plus lúc tạo thì có tính năng của Plus. Khách B2B bắt buộc dùng customer accounts mới và đăng nhập bằng mã một lần gửi qua email.
6. **Metafield:** không có standard definition nào cho "specifications" hay "downloads". Vì vậy spec và tài liệu tải về phải là custom metafield, nối vào theme qua dynamic source. Preset JSON không được chứa tham chiếu tới custom metafield, và setting `metaobject` chỉ được dùng standard type.

## 1. Codex CLI: tạo ảnh không tương tác

**Kiểm chứng tại máy (lệnh chỉ đọc, ngày 21/10/2026):**
- `codex --version` trả về `codex-cli 0.162.1`. `codex features list` cho thấy `image_generation  stable  true` và `view_image  stable  true`.
- `codex exec --help` có các cờ liên quan sau:
  - `-i, --image <FILE>...` để đính kèm ảnh vào prompt đầu tiên;
  - `-s, --sandbox read-only|workspace-write|danger-full-access` để chọn sandbox;
  - `-C <DIR>` để đặt thư mục làm việc, `--add-dir` để thêm thư mục được phép ghi;
  - `--ephemeral` để không lưu session, `--json` để in event dạng JSONL;
  - `-o, --output-last-message <FILE>` và `--output-schema <FILE>` để lấy kết quả có cấu trúc;
  - `-m` để chọn model, `-p` để chọn profile.
- Skill nằm tại `~/.codex/skills/.system/imagegen/SKILL.md`. Skill có hai mode:
  - **Built-in `image_gen`** là mode mặc định và không cần `OPENAI_API_KEY`. Skill ghi: "Codex saves generated images under `$CODEX_HOME/*` by default" và "Do not … rely on a destination-path argument". Agent phải tự copy file từ `$CODEX_HOME/generated_images/...` vào workspace.
  - **CLI fallback** là `scripts/image_gen.py` với các lệnh `generate`, `edit` và `generate-batch` (JSONL). Mode này cần `OPENAI_API_KEY` và tính tiền theo giá API. Model mặc định là `gpt-image-2`, size tự chọn được (ví dụ `2048x2048`), có `--quality`, `--out` và `--out-dir`. `edit` nhận tối đa 16 ảnh input (theo `references/image-api.md`).
- Ảnh cũ trên máy nằm ở `~/.codex/generated_images/<session-id>/ig_*.png`. Trong 200 file đã đo, ảnh vuông có kích thước **1254×1254** (101 file). Ngoài ra còn nhiều tỉ lệ khác như 941×1672 và 1122×1402. Nói cách khác, built-in mode **không cố định được kích thước**, nên bước hậu kỳ phải chuẩn hoá lại.
- Máy hiện chưa đặt `OPENAI_API_KEY`. Package `openai` của Python và `uv` đã có.

**Mẫu lệnh cho một ảnh** (dựng từ help, chưa chạy). Cách gọi skill bằng `$imagegen` trong prompt lấy từ nguồn bên thứ ba, ⚠️ chưa kiểm chứng trên docs chính thức:
```bash
codex exec -C "$REPO" -s workspace-write --ephemeral \
  -i demo-data/style/anchor.png -o demo-data/logs/$SKU.txt \
  "Use \$imagegen. Image 1 is a STYLE reference only. <prompt template, subject=…>. \
   Copy the final PNG to demo-data/images/raw/$SKU.png and print its path."
```

**Chi phí và hạn mức** (theo learn.chatgpt.com/docs/pricing):
- Tạo ảnh tính chung vào hạn mức của Codex. Mỗi lượt tạo ảnh tiêu hạn mức **nhanh hơn 3–5 lần** so với lượt chỉ có chữ.
- Khi hết hạn mức, Codex trừ vào credits. Gói Free không tạo ảnh được.
- Khi dùng API key, Codex tính theo giá API.
- Trang changelog và trang features còn ghi: "For larger batches … set `OPENAI_API_KEY` … so API pricing applies".
- ⚠️ chưa kiểm chứng: số ảnh cụ thể mỗi cửa sổ 5 giờ hoặc mỗi tuần của từng gói. Con số 250 ảnh/phút là của blog bên thứ ba.

**Xếp hạng cách chạy 100 ảnh:**

| | A. `codex exec` + built-in (đề xuất mặc định) | B. Script `image_gen.py edit/generate-batch` của skill |
|---|---|---|
| Khớp quyết định "ảnh tạo bằng Codex CLI" | Có | Gần khớp (vẫn là skill của Codex, nhưng gọi thẳng API) |
| Chi phí | Hạn mức gói ChatGPT, không tốn thêm tiền mặt | Giá API, cần key |
| Kiểm soát size và đường dẫn | Không có (khoảng 1254px, agent tự copy) | Có (`--size 2048x2048`, `--out`) |
| Độ tất định của pipeline | Thấp, vì agent có thể diễn giải lại prompt | Cao, vì prompt được gửi nguyên văn |

Khuyến nghị: chạy pilot 10 ảnh bằng **A**. Nếu contact sheet lệch phong cách quá 20%, hoặc hết hạn mức, thì chuyển sang **B**.

## 2. Giữ 100 packshot đồng bộ

Nguồn: OpenAI image generation guide, mục Limitations, ghi rằng model "may occasionally struggle to maintain visual consistency … across generations". `references/image-api.md` không có tham số `seed`. Trang guide cũng không nhắc tới seed. Vì vậy:

1. **Prompt template cố định**, theo schema của skill. Mỗi ảnh chỉ thay dòng `Subject:`. Các dòng còn lại để nguyên văn:
   - `Use case: product-mockup`;
   - `Scene/backdrop: seamless flat background #ECEAE4`;
   - `Composition: straight-on, eye-level, product centred, fills ~75% of the frame`;
   - `Lighting: soft key light from upper-left, soft contact shadow below`;
   - `Constraints: no text, no logos, no props, no watermark`.

   Skill khuyến nghị "repeat invariants every iteration to reduce drift".
2. **Style anchor:** tạo trước 1–3 ảnh mẫu (một cho đồ dài như cờ lê, một cho hộp vật tư, một cho dụng cụ điện) và anh duyệt. Sau đó mọi lần gọi đều đính kèm anchor bằng `-i`, ghi rõ trong prompt là "Image 1: style reference; do not copy the object". Skill và hướng dẫn prompting đều yêu cầu đánh số và ghi vai trò cho từng ảnh tham chiếu.
3. **Chia theo nhóm hình dáng**, mỗi nhóm có một anchor và một tỉ lệ khung. Cách này giữ được tỷ lệ chiếm khung đồng đều.
4. **Hậu kỳ bằng ImageMagick.** `which magick convert` trả về `/opt/homebrew/bin/magick`, và `magick -help` có đủ `-trim`, `-fuzz`, `-extent`, `-gravity`, `-background`, `-opaque`. Không cần thêm sharp. Lệnh mẫu:
   ```bash
   magick raw/$SKU.png -fuzz 4% -trim +repage -resize 1600x1600 \
     -background '#ECEAE4' -gravity center -extent 2048x2048 -strip final/$SKU.png
   ```
   Có hai lưu ý cho lệnh này:
   - `-trim` dựa vào màu ở góc ảnh. Nếu nền gốc lệch nhiều khỏi `#ECEAE4`, viền bóng mềm sẽ bị cắt gắt. Vì vậy nên **đo màu góc** (`-format '%[pixel:p{8,8}]' info:`), rồi **tạo lại** ảnh lệch nhiều thay vì tô màu đè bằng `-opaque` (cách đó dễ gây banding ở vùng bóng).
   - Shopify khuyến nghị ảnh vuông 2048×2048, dưới 20 MB, tối đa 5000×5000 px. Ảnh gốc khoảng 1254px phóng lên 2048 sẽ hơi mềm. Nếu cần 2048 thật thì dùng cách B.
5. **QA:** dựng contact sheet bằng `magick montage final/*.png -tile 10x -geometry 200x200+4+4 sheet.png` để kiểm tra theo tiêu chí số 9 của brainstorm.

## 3. Import khoảng 100 sản phẩm vào store

**Product CSV** (help.shopify.com, trang using-csv):
- Ảnh phải là URL công khai, dùng https và không đặt mật khẩu ("You can use only image URLs in CSV files"). Có cột `Variant image URL`.
- Cột `SKU` có sẵn. Cột `Barcodes` nhận tối đa 20 giá trị.
- Cột tồn kho chỉ dùng được với store có một location.
- Metafield có dạng `Name (product.metafields.ns.key)`. Danh sách type được hỗ trợ có `url`, `list.url`, `number_*`, `dimension`, `weight`, `multi_line_text_field`, `list.metaobject_reference`…, nhưng **không có `file_reference`**. Ngoài ra, "Variant metafields aren't supported for product CSV import/export".

**Admin GraphQL (2026-10):**
- `ProductSetInput` có `files` (bằng `originalSource`, mỗi file tốn 1,9 điểm cost), `metafields`, `variants`, `productOptions` (tối đa 3), `category` và `collections`. Mutation chạy được ở chế độ đồng bộ hoặc bất đồng bộ (`synchronous:false` trả về `ProductSetOperation`).
- `ProductVariantSetInput` có `sku`, `barcodes`, `inventoryQuantities` (theo location), `metafields` và `file`.
- Lưu ý: các list bị bỏ khỏi input (metafields, variants) **sẽ bị xoá**. Script phải luôn gửi đầy đủ list.
- `stagedUploadsCreate` cho phép upload file local, rồi dùng `resourceUrl` làm `originalSource` cho `fileCreate`. `fileCreate` nhận cả PDF (`contentType: FILE`), trả về GID `GenericFile` và xử lý bất đồng bộ (phải poll `fileStatus`).
- ⚠️ chưa kiểm chứng: docs không ghi rõ `productSet.files.originalSource` có nhận `resourceUrl` của staged upload hay không. Cần prototype với một sản phẩm.

**Shopify CLI 4.9.4** (`shopify store --help`): có `store auth -s <shop> --scopes …`, lệnh này lưu một *online access token*. Có `store execute --query-file --variable-file --allow-mutations`, cùng `store bulk execute`. Changelog ngày 19/02/2026 bổ sung thêm `shopify app execute` và `app bulk`.

| Tiêu chí | **CLI `store execute` + script Node (đề xuất)** | Script Node gọi API bằng token của app Dev Dashboard | Product CSV |
|---|---|---|---|
| Variant, SKU, barcode, tồn kho | Đủ | Đủ | Có, nhưng tồn kho chỉ cho store một location |
| Variant metafield, `file_reference` | Có | Có | Không |
| Ảnh local | Có (staged upload) | Có | Không; phải host công khai |
| Quản lý credential | `store auth` đăng nhập qua trình duyệt; không cần secret | Cần client id/secret; token sống 24 giờ, chỉ dùng được cho store trong cùng organization | Không cần |
| Chạy trên client transfer store | ⚠️ chưa kiểm chứng | Gần như bị chặn ("Custom and draft apps can't be installed") | Có |
| Độ phức tạp | Thấp | Trung bình | Thấp nhưng thiếu dữ liệu |

**Khuyến nghị:**
- Script Node sinh `products.json` làm nguồn duy nhất cho dữ liệu demo. Mỗi sản phẩm có một file biến `vars/$handle.json`. Sau đó gọi `shopify store execute --query-file productSet.graphql --variable-file vars/$handle.json --allow-mutations`.
- Scope cần cho `store auth`: `write_products`, `write_files`, `write_inventory`, `read_locations`, cộng thêm scope cho metaobject definitions nếu dùng.
- **Phương án dự phòng** nếu `store auth` không chạy được trên client transfer store: thiết kế metafield để CSV vẫn chở được dữ liệu. Nghĩa là spec và downloads đặt ở cấp product, downloads dùng `url` hoặc `list.url` thay cho `file_reference`, còn ảnh host tạm trên một URL https công khai.
- Phần nằm ngoài khả năng của CSV gồm metafield definition, file PDF và variant metafield. Phần này làm thủ công hoặc qua app GraphiQL miễn phí của Shopify. ⚠️ chưa kiểm chứng rằng app đó được xếp vào nhóm "free app" cài được trên client transfer store.

## 4. Dev store, client transfer store và B2B

**Quy định cho demo store** (shopify.dev, trang Theme Store requirements, mục 20):
- "To build your demo store, create a client transfer store in the Dev Dashboard". Dev store không transfer được.
- Bật Bogus Gateway hoặc test mode, tắt các phương thức checkout khác.
- "Don't use apps". Ngoại lệ được cân nhắc là app review miễn phí và app dịch miễn phí, nhưng nếu dùng app dịch thì phải dịch toàn bộ nội dung.
- Ảnh không được chứa chữ hay nút bấm, trừ chữ in trên chính sản phẩm vật lý. Phải có quyền sử dụng mọi asset.

**Client transfer store** (shopify.dev):
- Tạo theo đường Dev Dashboard → Stores → Create store → Client transfer store. Tên store không đổi được. Có thể bật Plus khi tạo.
- Store có "most features available on the Advanced plan", hoặc toàn bộ tính năng Plus nếu bật Plus.
- Chỉ cài được free app và partner-friendly app. Password page không gỡ được, nhưng link demo của Theme Store sẽ bỏ qua password.

**Dev store** (shopify.dev):
- Tạo trong Dev Dashboard, hoặc bằng `shopify store create dev --plan basic|grow|advanced|plus`. Đây là lệnh đã có sẵn ở máy.
- Dev store dùng để phát triển và test, không transfer được, nên không dùng làm demo store được.

**B2B** (help.shopify.com):
- "Shopify B2B is available on all plans". Bảng so sánh gói cho thấy quantity price breaks và quantity rules có trên mọi gói.
- Basic, Grow và Advanced có tối đa 3 catalog, gán vào **B2B market**, và yêu cầu Markets mới. Plus có số catalog không giới hạn và gán thẳng được cho company location.
- Khách B2B phải dùng customer accounts mới, legacy không được hỗ trợ, và đăng nhập bằng email cộng mã một lần.
- Forum community.shopify.dev ngày 19/01/2026 báo rằng trên dev store Plus tạo từ Dev Dashboard, giao diện không có loại market B2B. Cách vượt là tạo market rồi sửa phần "includes" để chọn company location. ⚠️ chưa kiểm chứng trạng thái tháng 10/2026.

**Các bước anh tự làm** (theo getting-started checklist và trang quantity-pricing):
1. Tạo Partner account, rồi vào Dev Dashboard tạo **một** client transfer store và bật Plus. Bật Plus để gán catalog thẳng cho company location và tránh giới hạn 3 catalog. Store này vừa là demo store vừa là nơi test B2B, nên không cần store thứ hai.
2. Bật test payment. Vào Settings → Customer accounts để dùng customer accounts mới.
3. Vào Customers → Companies → Add company, nhập tên, location có địa chỉ giao hàng và payment terms. Thêm contact là một customer, dùng email mà anh nhận được thư, ví dụ địa chỉ dạng `+b2b`.
4. Tạo catalog, gán cho company location (Plus) hoặc B2B market. Mở Products and pricing → Manage để đặt **quantity rules** (min, max, increment) và **volume pricing** (tối đa 10 bậc mỗi product). Số lượng ở mỗi bậc phải lớn hơn min và là bội số của increment.
5. Đăng nhập ở storefront bằng email của contact để kiểm tra theo tiêu chí số 6.

## 5. Standard definitions cho spec và downloads

- **Standard metafield** cho product và variant (shopify.dev, trang list-of-standard-definitions): chỉ có `descriptors.subtitle`, `descriptors.care_guide`, `facts.isbn/upc/ean`, `reviews.rating/rating_count`, `import_information.*`, `shopify.unavailable_reason`, `shopify--discovery--product_recommendation.*` và `shopify--discovery--product_search_boost.queries`. **Không có** definition nào cho MPN, specifications hay documents.
  - `product_search_boost.queries` có thể chứa MPN để tăng thứ hạng trong search. ⚠️ chưa kiểm chứng predictive search có dùng trường này hay không.
- **Standard metaobject:** trang danh sách chỉ ghi `product_review` (dành cho partner được duyệt), cộng với các definition của taxonomy `shopify--*` (ví dụ `shopify--material` trong docs input settings). **Không có** definition nào cho spec hay download. Theme Store quy định: "only standard definitions can be used as `metaobject_type`… Custom or app-owned definitions cannot be used".
- **Dynamic source** (shopify.dev, trang dynamic-sources):
  - Setting `text` nhận `single_line_text_field`, `list.single_line_text_field`, `number_*`, `dimension`, `weight`, `volume`, `money`.
  - Setting `richtext` nhận thêm `multi_line_text_field` và `rich_text_field`.
  - Setting `url` chỉ nhận `url`.
  - **`file_reference` chỉ nối được vào `image_picker` hoặc `video`**, không nối được vào `url`.
- **Hệ quả cho thiết kế:**
  - **Spec:** khối "Specifications" chứa các block con "Spec row". Mỗi row có label là chữ tĩnh và value lấy từ dynamic source có kiểu (ví dụ `custom.voltage` kiểu `number_decimal`). Một cách khác là một `richtext` nối vào `multi_line_text_field`.
  - **Downloads:** mỗi block con "Document" có label và một setting `url` nối vào metafield `url` trỏ tới URL CDN của file PDF. Không dùng `file_reference`.
  - **Custom product metafield qua dynamic source vẫn được phép**, nhưng chỉ khi merchant tự nối trong editor. Theme Store yêu cầu "Make sure your `.json` files don't include resources specific to your demo store admin (for example, custom metafields…)". Template trên demo store có thể nối custom metafield, còn preset trong gói theme thì để trống, và block phải tự ẩn khi không có giá trị.
  - ⚠️ chưa kiểm chứng: reviewer có coi khác biệt này là lệch preset parity hay không. Cũng chưa kiểm chứng việc hardcode `product.metafields.custom.*` trong Liquid có bị cấm hay không, vì requirements không nói thẳng. Contract hiện đã chọn hướng an toàn là dùng dynamic source.

## Rủi ro áp dụng

- **Codex CLI:** CLI ra bản mới rất dày (0.137 vào tháng 06/2026, 0.162 bây giờ). Docs chuyển từ `developers.openai.com` sang `learn.chatgpt.com`, và skill tự cập nhật. Cờ `-i` và `exec` ổn định. Hành vi của built-in `image_gen` thì do skill quyết định, nên có thể đổi giữa các bản. Nên ghi lại phiên bản Codex trong log sinh ảnh.
- **Shopify CLI `store *`:** bộ lệnh này mới (theo nguồn bên thứ ba là từ 3.93), và docs chưa nói rõ app nào được dùng để xác thực. Rủi ro trung bình, có phương án dự phòng là CSV.
- **Markets mới và B2B trên store Plus tạo từ Dev Dashboard:** theo forum thì vẫn ở dạng test drive vào tháng 01/2026, nên rủi ro trung bình.

## Giới hạn của research

- Không chạy lệnh sinh ảnh nào, không đăng nhập Shopify và không thử `store auth`. Mọi kết luận về runtime đều dựa trên help và docs.
- Không đọc phần cuối (khoảng 39k ký tự) của trang `productSet`, và không đọc enum `FileContentType` hay `StagedUploadTargetGenerateUploadResource`.
- Không kiểm tra rate limit GraphQL theo cost. Với khoảng 100 sản phẩm, lượng gọi này không đáng kể.
- Một số chặn truy cập cục bộ (hook) đã ngăn đọc source của Shopify CLI để xác định app mà `store auth` dùng.

## Câu hỏi chưa giải quyết

1. Catalog size: đổi tag preset sang **Some (11-100+)**, hay nâng demo store lên **≥ 500 sản phẩm**? Nếu chọn 500, có thể sinh nhiều sản phẩm dùng chung ảnh theo dòng hàng, nhưng phải giữ được cảm giác "authentic".
2. `shopify store auth` có chạy được trên client transfer store không, và cần quyền staff nào? Cần thử ngay sau khi anh tạo store.
3. Anh có chấp nhận dùng `OPENAI_API_KEY` (tính theo giá API) cho phương án B nếu pilot bằng built-in không đạt không?
4. Khi gắn tag Lots, có bắt buộc Collection Table view phải được đo Lighthouse trên catalog thật cỡ 500+ không? Câu này phụ thuộc câu 1.

## Nguồn

- Lệnh cục bộ: `codex --help`, `codex exec --help`, `codex features list`, `~/.codex/skills/.system/imagegen/{SKILL.md,references/cli.md,references/image-api.md}`, `identify ~/.codex/generated_images/*`, `which magick convert`, `magick -help`, `shopify help`, `shopify store {auth,execute,create dev} --help`.
- https://learn.chatgpt.com/docs/pricing · https://learn.chatgpt.com/docs/codex/cli.md · https://developers.openai.com/api/docs/guides/image-generation
- https://codex.danielvaughan.com/2026/04/27/codex-cli-image-generation-gpt-image-2-visual-development-workflows/ (bên thứ ba)
- https://shopify.dev/docs/storefronts/themes/store/requirements.md · https://shopify.dev/docs/storefronts/themes/store/review-process/listings.md
- https://shopify.dev/docs/apps/build/dev-dashboard/stores/client-transfer-stores.md · https://shopify.dev/docs/apps/build/stores/development-stores.md
- https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/client-credentials-grant
- https://shopify.dev/docs/api/admin-graphql/latest/mutations/productSet · …/input-objects/ProductSetInput · …/input-objects/ProductVariantSetInput · …/mutations/fileCreate · …/mutations/stagedUploadsCreate
- https://shopify.dev/docs/api/shopify-cli/store · https://shopify.dev/changelog/use-the-admin-api-and-bulk-operations-in-shopify-cli
- https://help.shopify.com/en/manual/products/import-export/using-csv · https://help.shopify.com/en/manual/products/product-media/product-media-types
- https://help.shopify.com/en/manual/b2b/setting-options · …/b2b/getting-started/plan-features · …/b2b/getting-started-checklist · …/b2b/catalogs/quantity-pricing · …/b2b/checkout
- https://community.shopify.dev/t/b2b-unable-to-create-a-b2b-catalog-in-a-dev-plus-store/28494 (forum, 01/2026)
- https://shopify.dev/docs/apps/build/custom-data/metafields/list-of-standard-definitions · …/metaobjects/list-of-standard-definitions · https://shopify.dev/docs/storefronts/themes/architecture/settings/dynamic-sources · …/settings/input-settings
