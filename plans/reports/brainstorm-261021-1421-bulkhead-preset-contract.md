# Brainstorm contract: theme Bulkhead, preset Bulkhead (Hardware, Lots 500+)

Ngày: 21/10/2026. Nguồn đầu vào: `/Volumes/Projects/Downloads/shopify-theme-store-research.md` (gọi tắt là "file nghiên cứu"). Repo `shopify-theme-bulkhead` hiện trống, chưa có commit.

## Quyết định đã chốt

- Theme tên **Bulkhead**, bản v1.0 ra mắt với **đúng 1 preset là Bulkhead**. Industry: Hardware. Catalog size: Lots (500+).
- Lý do bắt buộc: Theme Store yêu cầu một preset mang đúng tên theme, và tên không đổi được sau khi upload (file nghiên cứu, mục 1.4 và 1.5).
- Foolscap và Furrow sẽ thêm sau, qua các bản update.

## Outcome

Có một theme Bulkhead v1.0 chạy được trên dev store, với preset Bulkhead hoàn chỉnh. Theme phải đạt mọi yêu cầu kỹ thuật và tính năng bắt buộc của Theme Store, và sẵn sàng để anh nộp qua Partner Dashboard.

Merchant mục tiêu là cửa hàng bán ngũ kim, dụng cụ và vật tư cho contractor, có catalog từ 500 sản phẩm trở lên, phục vụ cả khách lẻ (D2C) lẫn khách trade (B2B). Khách vào store phải:

- tìm được hàng theo SKU hoặc MPN;
- đặt nhanh nhiều mã cùng lúc;
- xem được tồn kho thật và thông số kỹ thuật;
- nếu là khách B2B: thấy giá theo bậc, quy tắc số lượng và địa chỉ giao hàng của công ty mình.

## Constraints

**Luật Theme Store** (chi tiết ở mục 1.4 của file nghiên cứu, không chép lại ở đây):
- Codebase bắt đầu từ Shopify Skeleton Theme **tại commit `a4f32d393b9eadf6c4403318ca39116832e5d1df` (26/02/2026)**, lấy bằng `git clone` rồi checkout commit này. Không dùng `shopify theme init`: từ 01/10/2026 nhánh `main` của Skeleton đã là bản v2 dựng trang bằng `{% block %}`, không có `sections/` và JSON template, nên không hợp Theme Store. Giữ `LICENSE.md` của Shopify. Không fork và không chép code từ Dawn hay Horizon.
- Lighthouse: performance trung bình ≥ 60, accessibility trung bình ≥ 90. Đo trên trang home, product và collection, cả desktop lẫn mobile.
- Contrast 4,5:1 cho chữ thường và 3:1 cho chữ lớn hoặc thành phần không phải chữ. Vùng chạm tối thiểu 24×24px.
- Đủ toàn bộ tính năng bắt buộc, kể cả `<shopify-account>` trong header, Follow on Shop, gift card recipient, unit price và predictive search.
- Có đủ các JSON template bắt buộc. Header và footer là section group. Product page dựng hoàn toàn bằng blocks. Có `@app` block, có section và block Custom Liquid.
- Kiến trúc theme blocks: section nội dung nhận `@theme` blocks, có `_blocks.liquid` riêng để tương thích Sidekick AI blocks.
- Không có tính năng kiểu app (wishlist, Instagram feed, đặt lịch…), không có urgency giả, không dùng Sass, không minify CSS/JS của mình.
- Font chọn bằng `font_picker` từ Shopify font library, biến thể nạp bằng `font_modify`. Settings viết bằng American English, sentence case.
- Cột spec trong Table view không nối được dynamic source (Liquid lặp qua product). Anh chọn ngày 21/10/2026: thử metafield danh mục chuẩn `shopify.*` trước; nếu không đủ thì dùng setting `namespace.key` để trống trong preset và hỏi Theme Support về parity.
- MPN phải tìm được qua search, nên ngoài custom metafield còn được ghi vào một trường tìm kiếm được (kênh chốt bằng prototype).
- Metaobject settings chỉ dùng standard definitions. Metafield của product và variant đọc qua dynamic sources. Shopify không có standard definition cho spec hay tài liệu, nên spec và downloads dùng custom metafield do merchant tự nối trong editor; preset trong gói theme không chứa tham chiếu custom metafield, và block phải tự ẩn khi trống. Downloads dùng metafield kiểu `url` (kiểu `file_reference` chỉ nối được vào setting ảnh hoặc video).

**Kỹ thuật, đã kiểm chứng trên shopify.dev ngày 21/10/2026:**
- **Predictive search** (`/search/suggest?section_id=…`): kết quả product luôn tìm trên mọi trường của product, gồm cả `variants.sku` và `variants.barcode`. Mỗi lần gọi trả tối đa 10 kết quả cho mỗi loại. Vì vậy quick order có làm được với predictive search, nhưng khi dán nhiều dòng thì phải gọi một request cho mỗi dòng. Ngoài ra, API trả về product chứ không trả về variant, nên theme phải tự so `variant.sku` để chọn đúng variant.
- **`variant.quantity_price_breaks`** và **`variant.quantity_rule`** phụ thuộc vào ngữ cảnh khách hàng. Trên thực tế, bậc giá theo số lượng và quy tắc số lượng được cấu hình trong B2B catalog. Khách lẻ chưa đăng nhập sẽ không thấy bậc giá nào, và `quantity_rule` trả giá trị mặc định là `min=1, increment=1`.
- **`customer.b2b?`, `current_company`, `current_location`, `company_available_locations`** đều có trong Liquid.
- **`customer.orders` và `last_order`** có trong Liquid, nhưng tài liệu không nói chúng có dữ liệu khi store dùng new customer accounts hay không. ⚠️ Cần prototype.

**Demo store và môi trường test** (anh đã chốt ngày 21/10/2026):
- Anh chưa có Partner account và chưa có store nào. Việc tạo là bước chuẩn bị anh tự làm, mình chỉ hướng dẫn. Cần ba store: (1) một **client transfer store bật Plus**, vừa là demo store vừa là nơi test B2B; (2) một **benchmark dev store** chỉ để đo Lighthouse, không cài app; (3) một **feature test dev store** để test tính năng cần app hoặc dữ liệu đặc biệt và để kiểm tra preset parity (bổ sung sau red-team ngày 21/10/2026). Store thứ nhất phải bật B2B, có một company mẫu, một catalog cấu hình bậc giá và quantity rule, và một tài khoản khách B2B để test.
- Dữ liệu demo **tự sinh bằng script**, **ít nhất 500 sản phẩm** (dự kiến khoảng 520), sinh từ khoảng 100 dòng hàng. Lý do: Theme Store yêu cầu "Each demo store must match the primary industry and catalog size that the theme preset is tagged to", và anh chốt giữ tag Lots (500+) ngày 21/10/2026. Các sản phẩm cùng dòng hàng (ví dụ một loại vít nhiều chiều dài) dùng chung ảnh.
- Nội dung demo phải "authentic": **không gắn nhãn "(demo)"**, dùng tên brand hư cấu không trùng brand thật nào. Mỗi sản phẩm có SKU, MPN, variant, spec metafield và link tài liệu tải về.
- **Ảnh sản phẩm tạo bằng Codex CLI** (`codex exec` với skill `imagegen` built-in, tính vào hạn mức gói ChatGPT, đã cài bản 0.162.1), khoảng 100 ảnh, mỗi dòng hàng một ảnh. Nếu pilot 10 ảnh đầu không đồng bộ được, việc chuyển sang OpenAI API key **phải hỏi anh trước**. Mọi ảnh phải đồng bộ một phong cách: packshot chụp thẳng, nền xám trơn `#ECEAE4`, có bóng đổ, cùng góc máy và cùng ánh sáng, theo mục 6.5 của file nghiên cứu.
- Trang Quick order cho dán **tối đa 50 dòng** mỗi lần.

**Design** (file nghiên cứu, mục 6.5):
- Bảng màu, font (Archivo, IBM Plex Sans, IBM Plex Mono), thang spacing, radius 2/4px.
- Setting "Density" có hai mức: Comfortable và Compact.

## Phương án (cách xử lý tính năng B2B khi khách không phải B2B)

Đây là quyết định thiết kế quan trọng nhất, vì kiểm chứng ở trên cho thấy bảng giá theo bậc và quantity rule **chỉ hiện với khách B2B**. Trong khi đó, reviewer của Shopify và phần lớn người xem demo store là khách chưa đăng nhập.

| | A. Chỉ hiện khi là B2B | **B. Hai lớp (đề xuất)** | C. Bậc giá nhập tay bằng metafield |
|---|---|---|---|
| Cách làm | Các module chữ ký chỉ render khi `customer.b2b?` | Lớp chung chạy cho mọi khách: quick order, bulk variant matrix, collection dạng Table, spec, downloads, tồn kho thật. Lớp B2B tự bật khi có dữ liệu: bảng giá theo bậc, quantity rule, ship-to, "giá của bạn" | Merchant nhập bảng bậc giá vào metafield để hiện cho mọi khách |
| Giả định chính | Reviewer và merchant sẽ đăng nhập bằng tài khoản B2B để xem | Lớp chung đã đủ khác biệt để vượt vòng review "fundamentally different" | Merchant tự cấu hình discount khớp với bảng đã nhập |
| Hỏng đầu tiên khi | Demo store và các bước review không thấy gì đặc biệt; theme trông như một catalog thường | Lớp chung làm chưa đủ tốt, khiến theme chỉ còn là "Trade làm lại" | Giá hiển thị khác giá tính ở checkout, gây hiểu lầm cho khách, có thể bị từ chối khi review và gây khiếu nại |
| Kết luận | Bỏ | **Chọn** | Bỏ |

### Trade-offs
- **B** tốn công hơn A, vì mỗi module B2B phải có trạng thái D2C rõ ràng: ẩn hẳn, hoặc hiện CTA "Mở tài khoản trade". Đổi lại, demo store, ảnh chụp và review đều thấy được giá trị của theme mà không cần đăng nhập.
- Lớp B2B vẫn phải được demo bằng tài khoản B2B mẫu trên dev store, cùng ảnh chụp và video trên listing. Mọi khẳng định trên listing phải khớp với những gì merchant nhận được khi cài preset.

### Better approaches
File nghiên cứu ngầm định bảng volume pricing là tính năng chữ ký hiện trên mọi PDP. Kiểm chứng cho thấy nó phụ thuộc vào ngữ cảnh B2B, nên phương án B là cách tốt hơn: các tính năng **không** phụ thuộc B2B mới là trục định vị chính. Chi phí đổi hướng thấp, vì repo chưa có code.

## Non-goals (không làm trong đợt này)

- Preset Foolscap và Furrow, cùng các preset thứ 4 và 5.
- Tra fitment theo xe, wishlist, Instagram feed, đồng hồ đếm ngược, "X người đang xem".
- Dùng Liquid `{% block %}` và `{% partial %}`, vì vẫn đang là developer preview.
- Template tài khoản khách hàng kiểu legacy.
- Các thao tác thuộc về anh: nộp theme, tạo tài khoản, viết listing và chạy quảng cáo.
- Bán theme ở bất kỳ marketplace nào khác.

## Phạm vi sản phẩm (cụ thể hoá mục 6.3 và 6.4 của file nghiên cứu)

- **Homepage**, theo thứ tự section ở mục 6.3: announcement bar, header có ô search hỗ trợ SKU/MPN, hero search-first, trust bar, shop by category, **quick order pad**, featured collection, trade account CTA, logo list, blog, newsletter, footer.
- **Product page**: breadcrumbs, gallery có rich media, buy box dựng bằng block (SKU, MPN, unit price, **bảng bậc giá B2B**, **quantity rule**, tồn kho thật, pickup, accelerated checkout), **bulk variant matrix**, **bảng spec** và **downloads** lấy từ metafield kiểu `url`, complementary và related products, FAQ.
- **Collection page**: chuyển đổi **Grid / List / Table**, faceted filter (drawer trên mobile), bộ lọc "In stock only", pagination.
- **Trang Quick order** (`page.quick-order`): dán nhiều dòng `SKU, số lượng`, kiểm tra tồn kho và quantity rule **trước** khi thêm vào cart.
- **Cart**: tôn trọng `quantity_rule` và hiện bậc giá đang áp dụng.
- **Reorder:** nếu prototype xác nhận `customer.orders` có dữ liệu với new customer accounts thì làm nút "Order again" bằng Liquid. Nếu không thì chỉ link sang trang orders của customer account.

## Acceptance criteria

1. **Theme Check** không còn error. **Lighthouse** đo trên một **benchmark dev store** riêng đã import CSV performance của Shopify (2.000 product), với home, product và collection, cả desktop lẫn mobile, mỗi URL ít nhất 3 lần lấy median. Trung bình ba trang của từng thiết bị đạt performance ≥ 60 và accessibility ≥ 90. GitHub Action `Shopify/lighthouse-ci-action` chỉ đo mobile, nên có thêm bước đo desktop riêng. Mục tiêu nội bộ là performance ≥ 70, để còn khoảng dự phòng.
2. Theme có đủ mọi tính năng bắt buộc ở mục 1.4 của file nghiên cứu. Mỗi tính năng được đánh dấu "đã kiểm tra" trong một checklist, kèm bằng chứng (ảnh chụp hoặc bước tái hiện).
3. **Quick order:** nhập một SKU có trong store thì trả về đúng variant cùng tồn kho. Dán quá 50 dòng thì trang báo giới hạn rõ ràng, không âm thầm cắt bớt. Dán 20 dòng `SKU, qty` thì các dòng đã qua kiểm tra trước ở client (variant tồn tại, còn hàng, đúng quantity rule) được gửi trong một lần `cart/add.js`. Nếu request đó trả 422, trang chuyển sang gửi từng dòng và đánh dấu lỗi theo dòng. Dòng sai SKU, hết hàng hoặc vi phạm quantity rule bị đánh dấu ngay tại dòng đó và không làm hỏng các dòng còn lại.
4. **Bulk variant matrix:** với product có 2 option, ví dụ 5×6 ô, khách nhập số lượng ở nhiều ô và thêm tất cả vào cart trong một request.
5. **Collection Table view:** với collection "All" của demo store (≥ 500 sản phẩm, tức ít nhất 11 trang), mỗi trang hiện tối đa 48 dòng, có SKU, 2–3 spec, tồn kho, ô số lượng và nút Add. Dùng được hoàn toàn bằng bàn phím.
6. **Lớp B2B:** dùng tài khoản B2B mẫu có catalog cấu hình bậc giá và quantity rule để kiểm tra:
   - PDP hiện bảng bậc giá và tự tô sáng bậc đúng với số lượng đang chọn;
   - ô số lượng tuân theo min, step và max ở card, PDP và cart;
   - header hiện chip "Ship to" theo company location.
   Với khách thường, các module này ẩn đi mà không để lại khoảng trống hay lỗi.
7. **Preset parity:** cài preset Bulkhead lên một store mới thì giao diện trùng khớp với demo store. Demo store không cài app nào, ngoài app review và app dịch miễn phí.
8. **Accessibility thủ công:** đi được toàn bộ quick order, matrix, table view, filter drawer và cart chỉ bằng bàn phím. Focus luôn nhìn thấy được. Các thay đổi trong giỏ và lỗi theo dòng được thông báo qua `aria-live`. Chạy được trong in-app webview của Instagram, Facebook và Pinterest.
9. **Dữ liệu demo:** script sinh lại được toàn bộ ≥ 500 sản phẩm, gồm variant, SKU, metafield và ảnh. Kết quả import được vào dev store. Đặt toàn bộ ảnh cạnh nhau trên một contact sheet thì thấy cùng nền, cùng góc máy, cùng ánh sáng và bóng đổ; ảnh lệch phong cách phải tạo lại.
10. **Kết quả audit:** skill `shopify-theme-submission-audit` kết luận theme không giống Dawn hay Horizon. Hai skill `shopify-theme-a11y-review` và `shopify-theme-settings-review` không còn lỗi mức blocker.

## Rủi ro còn mở

- Predictive search có thể khớp SKU theo token chứ không khớp chính xác, ví dụ SKU có dấu gạch. Cần prototype sớm với dữ liệu thật.
- Gọi predictive search cho nhiều dòng cùng lúc có thể bị rate limit. Cần giới hạn số request chạy song song, và đo thử với 20 rồi 50 dòng.
- Khó đạt Lighthouse mobile trên trang collection khi có Table view và catalog lớn. Phải đo Table view ở mức 48 sản phẩm mỗi trang thì mới phản ánh đúng store thật.
- Partner account và dev store bật B2B là việc anh tự làm, và là điều kiện để kiểm tra tiêu chí số 6 và số 7. Nếu chậm thì phần lớp B2B sẽ bị chặn.
- `shopify store auth` có chạy được trên client transfer store (nơi không cài được custom app) hay không vẫn chưa kiểm chứng. Nếu không, phải dùng product CSV với ảnh host công khai.
- Hành vi của `/cart/add.js` khi một item lỗi, và ngưỡng rate limit của predictive search, chưa được Shopify công bố.
- Codex CLI tạo ảnh có thể lệch phong cách giữa các lần gọi. Cần một prompt mẫu cố định và có thể kèm ảnh tham chiếu (`codex -i`). Built-in mode không cố định được kích thước (thường khoảng 1254px), nên cần bước hậu kỳ chuẩn hoá bằng ImageMagick.

## Câu hỏi đã trả lời (21/10/2026)

1. Partner account và dev store: **chưa có**. Plan sẽ có bước chuẩn bị do anh làm.
2. Dữ liệu demo: **tự sinh**. Ban đầu anh chọn 70–100 sản phẩm, sau đó đổi thành **≥ 500 sản phẩm** để khớp tag Lots. Ảnh tạo bằng **Codex CLI**, phải đồng bộ phong cách; chuyển sang API key thì phải hỏi anh trước. Bỏ nhãn "(demo)", dùng brand hư cấu.
3. Quick order: **tối đa 50 dòng** mỗi lần dán.

Không còn câu hỏi mở nào chặn bước plan.
