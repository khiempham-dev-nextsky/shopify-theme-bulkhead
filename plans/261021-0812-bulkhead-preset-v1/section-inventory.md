# Bulkhead v1: section inventory và design configurations

Cập nhật 2026-10-23 theo yêu cầu mở rộng khả năng xây trang của merchant. Tài liệu này là đặc tả phạm vi, không phải bằng chứng các section đã được code hoặc thiết kế đã được anh duyệt.

Authority: [contract](../reports/brainstorm-261021-1421-bulkhead-preset-contract.md), [plan index](./plan.md), [phase 0](./phase-00-design-and-section-inventory.md). Khi khác file nghiên cứu thị trường cũ, quyết định cập nhật trong contract và inventory này được ưu tiên.

## Phân loại và ranh giới

- **Core:** phải có trong v1; merchant có thể thêm/bỏ section tại template được hỗ trợ. Core không có nghĩa là phải hiện tất cả trên homepage.
- **Optional extension:** standalone video section và tabbed collections; chưa thuộc baseline v1, không đưa vào effort, acceptance hoặc demo/listing v1. Chỉ chuyển sang core sau khi anh chấp nhận thay đổi scope và effort. Video/3D trong gallery PDP và Grid/List/Table vẫn là core, không bị cắt bởi quyết định này.
- **System:** section chính của template, header/footer group, lookup endpoint và block host. Đây là nền vận hành, không cộng thành tính năng thư viện nội dung cho merchant.
- **Section preset** là cấu hình khởi đầu trong editor; không phải **theme preset** trên Theme Store. Chỉ có một theme preset Bulkhead.
- Không đặt quota số section để quảng bá. Các ID dưới đây dùng truy vết owner, file và acceptance, không phải mục tiêu tăng số lượng.

## Core inventory

Các đường dẫn là file dự kiến khi triển khai, không phải file hiện có. Mỗi row có đúng một phase tạo implementation; phase khác chỉ sử dụng hoặc cấu hình lại.

| ID | Section / file dự kiến | Dùng ở đâu | Layout và blocks/settings chính | Nội dung thiếu/dài và responsive | Owner |
|---|---|---|---|---|---|
| S01 | Hero / banner, `sections/hero-banner.liquid` | Home, landing, About | Một implementation, `layout`: Search first / Image led / Compact banner; heading, text, image + focal point, tối đa 2 CTA; search scope và popular search links khi chọn Search first | Thiếu ảnh chuyển về text layout có chủ đích; heading dài tự xuống dòng. Mobile ảnh xếp dưới hoặc ẩn bằng setting rõ ràng, không che search/CTA | 7 |
| S02 | Trust/stat bar, `sections/stat-bar.liquid` | Home, landing | Blocks label + description + icon; không có metric mặc định bịa | Bỏ block rỗng; desktop 4 cột, mobile 2 cột hoặc stack theo số block | 7 |
| S03 | Collection list, `sections/collection-list.liquid` | Home, landing, About | Dense / Visual; collection, ảnh, count thật, sub-links từ menu merchant chọn | Chưa chọn collection có empty state editor; storefront không giả số hàng. Mobile reflow, title không đè sub-links | 7 |
| S04 | Quick order, `sections/quick-order.liquid` | Home, landing, trang Quick order | Compact pad / Full page; cùng parser, lookup, row validation và cart API; Full page có paste tới 50 dòng | Dòng lỗi giữ nguyên input và chỉ ra nguyên nhân; mobile row stack nhưng giữ SKU, pack, stock, qty, subtotal cùng ngữ cảnh | 6 |
| S05 | Featured collection, `sections/featured-collection.liquid` | Home, landing | Chọn collection, số product, card profile Browsing / Technical; dùng chung product card | Không có collection: empty state editor, không có hàng giả. Tên dài, thiếu ảnh, sold-out theo contract card bên dưới | 7 |
| S06 | CTA, `sections/call-to-action.liquid` | Home, landing, About | Inline band / Split text; heading, body, tối đa 2 link; section preset Trade account và Services | Cùng schema và implementation cho trade/service; thiếu CTA thì không render nút trống; mobile stack theo DOM order | 7 |
| S07 | Logo list, `sections/logo-list.liquid` | Home, landing, About | Blocks image, alt, link; logo merchant có quyền sử dụng hoặc mark tự tạo cho vendor hư cấu trong bộ demo được duyệt | Không ship placeholder hoặc claim đối tác thật; block rỗng tự ẩn; ảnh không kéo méo | 7 |
| S08 | Blog posts, `sections/blog-posts.liquid` | Home, landing, About | Blog/resource picker, số bài, ảnh bật/tắt | Không có blog/bài: empty state editor; title dài wrap, mobile 1 cột | 7 |
| S09 | Newsletter, `sections/newsletter.liquid` | Home, landing, About | Heading, text, customer form; không hardcode lời hứa tần suất | Label thật, inline error/success; mobile input và CTA không ép hẹp; dùng cùng form markup khi footer cần | 7 |
| S10 | Rich text, `sections/rich-text.liquid` | Home, landing, About, page | Heading/text/link blocks, content width và alignment hữu hạn | Text dài giữ measure đọc được; bỏ blocks trống, không tạo khoảng trắng cố định | 7 |
| S11 | Image with text, `sections/image-with-text.liquid` | About, landing, Home | Image left / Image right; image, focal point, heading/text/CTA blocks | Thiếu ảnh chuyển text-only; mobile dùng thứ tự đọc hợp lý, không chỉ đảo visual bằng CSS | 7 |
| S12 | Multicolumn / icon with text, `sections/multicolumn.liquid` | About, landing, Home | Blocks icon hoặc image + title + text + link; giới hạn 2–4 cột desktop | Tái dùng cho dịch vụ, quy trình, hướng dẫn mua hàng; không xây riêng từng loại. Mobile stack; nội dung không đều không tạo hàng rỗng | 7 |
| S13 | Featured product, `sections/featured-product.liquid` | Home, landing | Product picker; buy-box blocks và `@app`; dùng product form/rules chung | Chưa chọn product có empty state editor; không có fake price; không dựng bản PDP/form thứ hai | 5 |
| S14 | Bulk variant matrix, `sections/bulk-variant-matrix.liquid` | Product | Product context, 2 option thành matrix; 1 hoặc >2 option dùng list theo phase 5 | Size không có hàng không mua được; matrix lớn có giới hạn và link picker; mobile giữ nhãn hàng/cột, cue cuộn, errors không mất ngữ cảnh | 5 |
| S15 | Specifications, `sections/specifications.liquid` | Product | Spec row blocks: label + dynamic source value | Bỏ row trống; toàn bộ rỗng tự ẩn; label/value dài wrap. Không thêm bảng spec nhập trùng cho từng page | 5 |
| S16 | Downloads, `sections/downloads.liquid` | Product | Document blocks: label + dynamic source URL | Không có URL thì ẩn; chỉ link scheme được phép. Không tạo PDF/SDS giả hoặc nút download không có tài liệu | 5 |
| S17 | Product recommendations, `sections/product-recommendations.liquid` | Product | Related products; complementary trong buy box dùng đúng nguồn platform, không ghi tay relationship | Nguồn recommendation rỗng tự ẩn; dùng card profile chung, không tạo card riêng | 5 |
| S18 | FAQ / collapsible content, `sections/collapsible-content.liquid` | Product, Home, landing, About | Một section và `blocks/collapsible-row.liquid`; heading + question/answer blocks, hỗ trợ `@theme` phù hợp | Cùng schema trên các template; question/answer rỗng không tạo accordion vô nghĩa; keyboard và focus đầy đủ | 5 |
| S19 | Custom Liquid, `sections/custom-liquid.liquid` | Các JSON template hỗ trợ section | Setting Liquid và block tương ứng, giữ yêu cầu extensibility có sẵn | Không dùng như lối tắt để đạt bài merchant tự xây trang; kiểm tra empty state | 2 |

**Reuse bắt buộc:** S01 bao gồm flexible banner; không thêm `hero-search.liquid` hoặc một hero ảnh song song. S06 thay file dự kiến `trade-cta.liquid`, không tạo alias/shim. S18 là FAQ duy nhất, không có `faq-home`, `faq-about` hoặc FAQ code riêng cho trade page. Newsletter trong footer dùng snippet/form chung với S09, không copy logic xử lý.

## Optional extensions, chưa triển khai trong baseline

| ID | Đề xuất | Khi nào mới đưa vào scope | Không được thay thế/cắt |
|---|---|---|---|
| O01 | Standalone video section cho hướng dẫn/ngành nghề | Anh duyệt nhu cầu merchant, controls/a11y, nguồn media và effort riêng | Gallery video/3D PDP core vẫn phải làm |
| O02 | Featured collections dạng tabs | Anh duyệt use case duyệt nhiều department trên landing, keyboard tabs, fallback và effort riêng | Collection Grid/List/Table core vẫn phải làm |

Không ship file rỗng, setting disabled hoặc demo quảng cáo cho O01/O02. Section core có thể không được merchant sử dụng ở một trang; đó là lựa chọn bố cục, không phải optional scope.

## System inventory, không tính như section nội dung

- Phase 2: announcement bar, header/footer section groups; `_blocks.liquid` là host extensibility, không phải một layout marketing mới. Các snippet `search-form.liquid`, `newsletter-form.liquid`, `section-style.liquid`, `editor-empty-state.liquid` cũng do phase 2 tạo; S01/S09 và các section khác dùng lại, không tính snippet thành section.
- Form snippet nhận `id_prefix` theo instance/section ID; header/hero search và footer/newsletter không được trùng form/input/label/result IDs hoặc chia sẻ ARIA/focus state. Runtime styling helper không thay JSON schema của từng section.
- Phase 3: `main-cart`, `main-blog`, `main-article`, `main-page`, `main-contact`, `main-404`, `main-list-collections`, `main-password`; gift card template.
- Phase 4: `main-collection`, `main-search`, predictive search section endpoint.
- Phase 5: `main-product`, pickup availability endpoint và buy-box blocks.
- Phase 6: quick-order lookup endpoint. S04 là nội dung, endpoint không phải một section merchant thêm vào page.
- Trade application dùng lại contact form section của phase 3 khi không có native company-request flow phù hợp; không tạo form xử lý dữ liệu riêng trong CTA.

## Các cấu hình thiết kế phải duyệt

| ID | Cấu hình | Default / alternative | Bất biến và nơi chứng minh |
|---|---|---|---|
| D01 | Hero và search | Home default Search first; Image led cho merchant ưu tiên thương hiệu; Compact banner cho landing | Header search luôn tìm SKU/MPN; bỏ scope selector khỏi hàng input trên mobile hoặc đưa sang control riêng để input không bị bóp. Không phụ thuộc ảnh để đọc heading/CTA. S01 dùng một implementation |
| D02 | Product card | Browsing: ảnh dẫn dắt; Technical: SKU, size/spec, pack, stock, qty dẫn dắt | Cùng markup/pricing/rules nguồn thật; thiếu spec ẩn row; variant chưa xác định dẫn Choose options, không Add nhầm variant đầu tiên. List/Table tái dùng contract card, không nhân đôi cart logic |
| D03 | Collection | Browsing default Grid; Order first dùng Table; List luôn có sẵn | Merchant chọn default; khách chuyển view không mất filter/sort/pagination. Setting chung theo phase 4. Mobile Table giữ nhãn sản phẩm/SKU khi thao tác Qty/Add và chỉ cuộn trong vùng bảng |
| D04 | PDP | Simple product không bị ép matrix; Multi-size có picker + matrix 5×6 | Dữ liệu option quyết định representation; product 1/>2 option có list fallback. Buy box dùng cùng blocks, không tạo hai engine PDP. B2B vắng dữ liệu tự ẩn |
| D05 | Nội dung trang | Image with text left/right; Multicolumn 2–4 cột; CTA inline/split | Ít lựa chọn có ý nghĩa, không arbitrary CSS editor. Mobile DOM/focus order trùng thứ tự đọc; thiếu media hoặc số block thay đổi vẫn có bố cục hợp lý |

Các lựa chọn này không tạo preset Foolscap/Furrow hoặc theme preset thứ hai. Palette, fonts, spacing, 2/4px radius và Comfortable/Compact giữ contract hiện tại. Settings rõ ràng, American English, group theo tác vụ merchant; các field resource/dynamic source trống trong gói cài đúng quy định.

## Recipes merchant tự xây trang, AC11

Dùng theme editor trên feature test store, từ template sạch chỉ có section hệ thống cần thiết. Người đóng vai merchant không sửa Liquid/HTML/CSS/JS, không dùng Custom Liquid, app/page builder hoặc developer tools. Nội dung và resource đã có sẵn từ phase 8; reviewer chọn bằng editor.

| Recipe | Template dự kiến, owner 7 | Thành phần tái dùng tối thiểu | Tác vụ và kết quả phải quan sát |
|---|---|---|---|
| R01 Homepage | `templates/index.json` | S01 Search first, S02, S04 Compact pad, S03, S05 Technical, S06 Trade, S08, S09 | Thêm/bỏ/reorder một section, đổi hero layout rồi trở về default, đổi card profile và density, save/reload giữ thay đổi |
| R02 Landing ngành nghề | `templates/page.trade-landing.json` | S01 Compact banner, S03, S05, S12, S18, S06 | Chọn department/collection, sửa 2 FAQ, đổi CTA link, reorder blocks; không có section riêng cho ngành cụ thể |
| R03 About / dịch vụ | `templates/page.about.json` | S11, S10, S12, S18, S06 | Đổi ảnh trái/phải, thêm/bỏ service block, sửa nội dung và CTA, save/reload; FAQ/CTA vẫn đúng schema dùng ở R02/PDP |

Thứ tự home mặc định sau revision: announcement/header → S01 → S02 → S04 → S03 → S05 → S06 → S07 → S08 → S09 → footer. Rich text và các core section khác có sẵn trong editor nhưng không bắt buộc bày hết. Quick order xuất hiện trước category trên cả desktop lẫn mobile; không đổi thứ tự bằng CSS gây lệch focus order.

Trade application template `page.trade-account.json` vẫn phục vụ contact/native flow theo phase 7, không nhầm với landing marketing R02. Recipe không áp company catalog/pricing bằng setting của theme.

## Gates và evidence, AC12

- **G0, phase 0:** anh duyệt D01–D05, core/optional inventory và ba recipe ở 375, 768, 1440px. Ghi lựa chọn, ảnh và trạng thái vào `reports/design-approval.md` khi thực thi phase 0. Không dùng điểm self-critique hoặc mock data làm bằng chứng Shopify integration.
- **G1, phase 1:** ghi P-a…P-j. Trước phase 2/8, đối chiếu G0 với kết quả prototype; thay đổi thiết kế bị ảnh hưởng phải được duyệt lại, không tự coi mockup là xác minh platform. Cột spec/downloads vẫn chịu gate Theme Support hoặc quyết định đi tiếp của anh.
- **G2, phase 7:** chạy R01–R03 trên theme editor thật; ghi section IDs, settings đã chọn, các bước và ảnh trước/sau save/reload vào `reports/editor-rehearsal-g2.md` khi thực thi. Lưu trạng thái preset trước rehearsal; tạo template sạch hoặc gỡ các content section bằng editor, rồi khôi phục composition default sau khi ghi bằng chứng để không làm lệch demo/parity. Các core section không xuất hiện trong ba recipe vẫn phải được thêm/bỏ thử ở template hỗ trợ, kiểm tra empty state và setting chính.
- **G3, phase 9:** lặp lại R01–R03 trên bản cài preset sạch; kiểm tra cặp demo/install, cả guest và B2B; phân biệt khác biệt dữ liệu với thiếu tính năng. Ghi AC11/12 vào `reports/qa-evidence.md` khi thực thi QA.
- Stress content ở 375/768/1440px: title product 120 ký tự, SKU/MPN 40 ký tự, heading section 80 ký tự, thiếu ảnh/spec/download, collection không có hàng, 1/2/4 content blocks, sold-out/low-stock và guest không có B2B data. Không đè chữ/control, không document overflow; table/matrix được phép cuộn có nhãn và keyboard access. Technical card phải giữ SKU/pack/stock dễ đọc; không ẩn lỗi để làm đẹp layout.
- Các bài ordering cốt lõi vẫn chạy: exact SKU/MPN, 20 dòng hỗn hợp và 51 dòng quick order, matrix 5×6, Table 48 dòng và pagination trên ≥500 product, min/step/max/tier thật. Không hạ tiêu chí cũ để đổi lấy nhiều section.
- Mỗi core section kiểm tra change setting, add/remove/reorder phù hợp, editor reload, trạng thái chưa chọn resource; dữ liệu rỗng không sinh giá/tồn kho/brand giả.

## Effort và quyền thay đổi

Scope core này được tính trong bảng effort của [plan](./plan.md). O01/O02 không có effort baseline; thêm chúng cần revision rõ ràng, không bật ngầm trong phase 7. Phase 0 chốt thiết kế trước foundation, phase 7 triển khai thư viện và bố cục đã duyệt, phase 9 kiểm chứng merchant workflow và parity. Không dồn quyết định thiết kế mới sang cuối phase 7.
