---
phase: 8
title: "Phase 8: Dữ liệu demo và ảnh"
status: pending
priority: P1
effort: "2w"
dependencies: [0, 1]
---

<!-- Updated: Red Team 2026-10-21 -->
<!-- Updated: Scope revision 2026-10-23 - thêm phase 0 (G0) vào dependencies, effort giữ 2w; thêm nội dung recipe R01–R03, fixture stress, kiểm tra subject ảnh theo SKU; làm rõ checkpoint nội bộ import/ảnh cuối; không có yêu cầu video tuỳ chọn -->
<!-- Updated: Dependency model 2026-10-23 - phase 4/5/6 chỉ bắt đầu sau khi toàn bộ phase 8 hoàn tất (import và ảnh cuối); không có khởi động sớm ngầm dựa trên import một phần -->

# Phase 8: Dữ liệu demo và ảnh

## Goal

Script sinh lại được demo store Bulkhead với ít nhất 500 sản phẩm authentic, hiển thị được trên storefront, cùng khoảng 100 ảnh packshot đồng bộ tạo bằng Codex CLI, nội dung trang và bài viết thật, và vật liệu nội dung cho ba recipe merchant tự xây trang R01–R03 (homepage, landing ngành nghề, About/dịch vụ). Phase này có hai checkpoint nội bộ (import dữ liệu với ảnh tạm, rồi ảnh cuối đã duyệt); `dependencies` của phase 4/5/6 giữ nguyên là phase 8 hoàn tất toàn bộ, nên checkpoint không phải mốc bàn giao cho phase khác.

## Context Links

- [Contract](../reports/brainstorm-261021-1421-bulkhead-preset-contract.md), mục Demo store và acceptance criterion số 9.
- [Research dữ liệu demo](../reports/researcher-261021-1503-demo-data-image-pipeline.md), mục 1–5.
- `reports/prototype-results.md` của plan này (P-e quyết định đường import, P-g kênh MPN, P-h metafield spec chuẩn).
- [Section inventory](./section-inventory.md), S01–S19 (nội dung/resource cần), D02–D05, recipes R01–R03, stress content và gates G2/G3.
- [Phase 0](./phase-00-design-and-section-inventory.md), G0 và `reports/design-approval.md` (đầu ra tương lai của phase 0, chưa phải bằng chứng đã có). Phase 8 bắt đầu sau G0 và phase 1; đối chiếu kết quả prototype với thiết kế đã duyệt trước khi chốt nội dung/ảnh bị ảnh hưởng. G0 không miễn gate platform hoặc Theme Support.

## Key Insights

- Demo store phải khớp tag Lots (500+), nên sinh khoảng 520 sản phẩm từ khoảng 100 dòng hàng; sản phẩm cùng dòng dùng chung ảnh.
- `productSet` không publish và không tạo metafield definition; xoá các list bị bỏ khỏi input; không có `identifier` thì mỗi lần chạy là một lần tạo mới.
- Built-in `image_gen` của Codex không có seed và không cố định kích thước (thường 1254px); không phóng to quá kích thước gốc.
- Nội dung phải "authentic": không Lorem Ipsum, không text onboarding, không dùng brand thật; ảnh không có logo, chữ hay màu nhận diện của brand thật.
- Dependency và checkpoint: phase 8 chạy song song phase 2 sau phase 0 + 1. Checkpoint **IMPORT** (bước 1–4: catalog, nội dung, B2B demo, ảnh tạm, chạy lại lần hai idempotent) và checkpoint **ẢNH CUỐI** (bước 5–9: ảnh mẫu, pilot, packshot, hậu kỳ, import lại ảnh) chỉ là điểm kiểm soát nội bộ để chia việc và ghi bằng chứng. Phase 4, 5, 6 và 9 đều phụ thuộc phase 8 hoàn tất; muốn chạy phase 4/5/6 sớm trên dữ liệu import một phần thì cần một revision DAG rõ ràng ở plan index, không phải giả định ngầm. Checkpoint IMPORT chỉ là mốc bàn giao dữ liệu nếu một revision như vậy được duyệt, và khi đó dữ liệu phải bất biến (handle, SKU, tên, cấu trúc option) vì ảnh cuối chỉ đổi file.
- Ảnh phải đúng subject theo từng SKU: packshot chỉ dùng chung cho product cùng dòng khi đúng loại/hình dạng sản phẩm; khác kích thước/độ dài có thể dùng chung, khác loại hoặc phụ kiện thì không. Dòng không đại diện đúng bằng một ảnh phải tách ảnh/dòng hoặc thay bằng dòng hàng phù hợp, vẫn bảo đảm ≥500 product và dữ liệu test bắt buộc.

## Requirements

- **Catalog:** khoảng 10–12 danh mục (fasteners, hand tools, power tools, electrical, plumbing, safety/PPE, adhesives, storage, abrasives, fixings…), khoảng 8 brand hư cấu, khoảng 100 dòng hàng, ≥ 500 product. Mỗi product có title, mô tả thật, vendor, product type, category theo Standard Product Taxonomy, tag, SKU theo mẫu (ví dụ `BH-4410-075`), giá, tồn kho (có hàng, sắp hết, hết hàng, một vài variant `continue`), MPN (ghi vào custom metafield và vào kênh tìm kiếm đã chốt ở P-g), spec (metafield chuẩn `shopify.*` nếu P-h đạt, kèm custom metafield cho PDP) và downloads (`url`). Không sinh barcode/GTIN.
- **Dữ liệu cho test tính năng:** ít nhất một product 2 option kích thước đúng 5×6, khoảng 20 product 2 option, ít nhất một product 3 option, một gift card, một vài product bán theo hộp có unit price.
- **Collections:** smart collection theo product type và tag, collection "All", collection "Contractor favourites".
- **Nội dung:** trang About, Shipping, Returns, Trade terms, Quick order, Open a trade account, Contact; blog "Guides & resources" 4–6 bài hướng dẫn thật; menu header/mega menu và footer. R02 cần một landing ngành nghề/nhóm công việc trong hardware/trade có heading, mô tả, CTA, collection tương ứng và ít nhất 2 FAQ; R03 có nội dung About/dịch vụ, 1–4 service/quy trình blocks, image-with-text và CTA. Không mở thêm ngành/preset, không yêu cầu 2–3 landing riêng. Nội dung authentic, không Lorem Ipsum, không metric bịa hoặc chính sách chưa có.
- **Tài liệu tải về:** spec sheet PDF sinh từ template HTML bằng Chrome headless (`--print-to-pdf`), upload qua `stagedUploadsCreate` + `fileCreate`, poll tới READY, ghi URL CDN vào metafield `url`.
- **B2B demo:** quantity rule và bậc giá cho khoảng 30 product trong catalog B2B (qua Admin API nếu P-e đạt, nếu không thì cấu hình tay cho khoảng 10 product).
- **Ảnh:** 3 ảnh mẫu theo nhóm hình dáng (đồ dài, hộp vật tư, dụng cụ điện) do anh duyệt; khoảng 100 packshot nền `#ECEAE4`, mỗi dòng hàng một subject đúng; giữ khoảng 6 ảnh hero/lifestyle/editorial trong baseline cũ, tái dùng crop/focal point cho hero, landing, About trái/phải và bìa blog. Không mặc định tăng thành 12 ảnh. Logo list dùng mark hình học tự tạo cho vendor hư cấu đã duyệt trong bộ demo, không placeholder hoặc giả brand/đối tác thật; logo thật chỉ dùng nếu có quyền. Logo/media ở `demo-data/`, không nhúng tài nguyên demo vào gói theme/preset.
- **Recipe content R01–R03:** `demo-data/content/recipes/` chứa nội dung và danh sách resource cho từng recipe: tên collection/menu/blog/page cần chọn, heading/text/CTA, FAQ, tên ảnh dùng cho từng section. Đây là nguồn nội dung cho người đóng vai merchant ở G2 (phase 7) và G3 (phase 9), nhập vào resource store, không phải template theme. Template (`index.json`, `page.trade-landing.json`, `page.about.json`) thuộc phase 7; phase 8 không tạo hay sửa file theme và không gán template suffix cho page cho đến khi phase 7 có template (gán lại rồi lưu vào overrides ở phase 9).
- **Fixture stress:** `demo-data/catalog/fixtures.json` mô tả product `fixture-*` (tag `fixture`): title 120 ký tự, SKU/MPN 40 ký tự, thiếu ảnh, thiếu spec, thiếu downloads, sold-out và low-stock, product 1 và nhiều variant, collection không có product, page/section có 1/2/4 content block. Import fixture chỉ vào feature test store (cùng script, tham số môi trường), không vào demo store để demo giữ authentic và `/collections/all` của demo đúng số lượng; không có chữ "(demo)". Ảnh méo tỷ lệ (rất ngang, rất dọc) cho kiểm thử focal point và không méo ảnh được cắt bằng ImageMagick từ ảnh lifestyle có sẵn trong `demo-data/fixtures/media/`, không tạo bằng Codex.
- **Không có video tuỳ chọn:** không có yêu cầu video standalone (O01) hoặc tabs (O02); video/3D cho gallery PDP vẫn kiểm bằng file mẫu của Shopify trên feature test store như phase 5, không sinh bằng pipeline ảnh.

## Architecture

- `demo-data/catalog/lines.json`: nguồn duy nhất mô tả dòng hàng và brand (danh mục, brand, mẫu tên, biến thể kích thước, spec, giá gốc, nhóm hình dáng, prompt subject). Mỗi dòng có `lineId`/`subject`; generator kiểm tra tham chiếu lineId/type mapping hợp lệ. Độ chính xác hình học và subject của ảnh do reviewer đối chiếu với product/spec trên contact sheet, không tuyên bố script hiểu/nghiệm thu nội dung ảnh.
- `scripts/demo-data/generate-catalog.mjs` (Node, không dependency, seed cố định để sinh lại giống hệt) ghi ra `demo-data/generated/products.json`.
- `scripts/demo-data/import.mjs` chạy theo thứ tự: metafield definitions → file (mỗi dòng hàng upload ảnh một lần, poll READY, dùng lại file GID cho mọi product cùng dòng) → `productSet` với `identifier: { handle }` → publish lên Online Store và đưa vào publication của catalog B2B → collection, page, blog, menu. Mỗi product ghi vào `demo-data/generated/import-state.json` (handle, product GID, hash của input, trạng thái); chạy lại thì bỏ qua handle có hash không đổi. Gặp lỗi 401 hoặc 403 thì dừng toàn bộ batch và báo cần auth lại.
- Import state phân vùng theo target alias `demo`/`feature` trong file state đã gitignore; không dùng hash/handle của store này để skip record ở store kia. Nhánh fixture chỉ được chạy cho target feature, từ chối target demo. Seed một tập product đại diện và resource R01–R03 từ cùng nguồn catalog vào feature test store trước stress fixtures; không bắt buộc nhân đôi toàn bộ 500+ product sang feature store. QA ghi rõ khác biệt số lượng dữ liệu được anh duyệt khi so parity.
- Nếu P-e thất bại: `scripts/demo-data/export-csv.mjs` sinh product CSV (metafield cấp product, ảnh host công khai); definition và publish làm tay.
- `scripts/images/generate.sh`: mỗi lần gọi `codex exec -C <thư-mục-tạm-riêng> -s workspace-write --ephemeral -i demo-data/images/anchors/<group>.png` với prompt template cố định, chỉ thay dòng `Subject:`. Chụp danh sách file trong `~/.codex/generated_images/` trước và sau lần gọi; chỉ nhận đúng một file mới, nếu không có hoặc có nhiều hơn một thì đánh dấu thất bại. Dừng batch khi log có dấu hiệu hết hạn mức hoặc bắt đầu trừ credits. Kiểm tra `git status` của repo sạch sau mỗi lô.
- `demo-data/images/manifest.json`: mỗi ảnh có dòng hàng, sha256, prompt, ảnh mẫu, phiên bản Codex, ngày tạo; báo lỗi khi hai dòng hàng có cùng sha256.
- `scripts/images/postprocess.sh`: đo màu góc, loại ảnh có ΔE so với `#ECEAE4` vượt ngưỡng (đặt trong script, mặc định 3) để tạo lại; thay nền bằng flood-fill từ góc với `-fuzz`; `-trim` có `-fuzz`; không phóng to quá kích thước gốc; `-extent` vuông; xuất JPEG chất lượng cao; dựng contact sheet và một ảnh cắt 100% cho mỗi lô.
- Git: commit `lines.json`, prompt template, ảnh mẫu, manifest, script, `products.json` và ảnh `final/` đã duyệt (JPEG, ước tính khoảng 30 MB). Ignore rules cho raw/vars/import-state do phase 1 thiết lập trước khi tách session; phase 8 kiểm tra nhưng không sửa shared root files.
- Kiểm tra subject theo SKU: mỗi product tham chiếu `lineId`; manifest ảnh lưu `lineId` + `subject`; bước kiểm tra liệt kê product → ảnh → subject để reviewer đối chiếu trên contact sheet. Ảnh không khớp subject bị loại và tạo lại, không chấp nhận ảnh category chung.

## Related Code Files

- Create: `demo-data/catalog/lines.json`, `demo-data/catalog/fixtures.json`, `demo-data/content/pages/*.md`, `demo-data/content/blog/*.md`, `demo-data/content/recipes/*.md`, `demo-data/graphql/metafield-definitions.graphql`, `demo-data/graphql/file-create.graphql`, `demo-data/graphql/product-set.graphql`, `demo-data/graphql/publish.graphql`, `demo-data/images/prompt-template.txt`, `demo-data/images/anchors/*.png`, `demo-data/images/manifest.json`, `demo-data/images/final/*.jpg`, `demo-data/images/logos/*` (mark tự tạo/logo có quyền đã duyệt, chỉ dữ liệu demo/feature test, không gói theme), `demo-data/fixtures/media/*`, `demo-data/pdf/spec-sheet.html`, `scripts/demo-data/generate-catalog.mjs`, `scripts/demo-data/import.mjs`, `scripts/demo-data/make-pdfs.mjs`, `scripts/images/generate.sh`, `scripts/images/postprocess.sh`; `scripts/demo-data/export-csv.mjs` chỉ khi P-e thất bại.
- Không sửa file gốc dùng chung: phase 8 chỉ ghi trong `demo-data/`, `scripts/demo-data/` và `scripts/images/`. `.gitignore` và `.shopifyignore` do phase 1 sở hữu (loại `mockup/`, `plans/`, `docs/`, `scripts/`, `demo-data/`, `package.json`, `package-lock.json` khỏi gói theme; gitignore `demo-data/images/raw/`, `demo-data/generated/vars/`, `import-state.json`). Phase 8 chỉ kiểm tra các quy tắc đó và báo sai lệch cho chủ sở hữu, không tự sửa trong lúc chạy song song với phase 2.

## Implementation Steps

1. Viết `lines.json` (gồm brand hư cấu và `subject` từng dòng; kiểm tra tên không trùng brand thật bằng web search).
2. `generate-catalog.mjs` sinh ≥500 product; kiểm tra SKU duy nhất, đủ trường/dữ liệu test và lineId/type mapping hợp lệ; sinh `fixtures.json` riêng. Reviewer kiểm subject/geometry ảnh ở bước duyệt contact sheet, không yêu cầu generator tự hiểu ảnh.
3. Viết nội dung trang, bài blog và nội dung recipe R01–R03 (landing ngành nghề, About/dịch vụ, FAQ, CTA); sinh PDF spec sheet.
4. Checkpoint IMPORT: import theo đường đã chốt ở P-e (dùng ảnh tạm của dòng hàng nếu ảnh cuối chưa xong, nhưng không dùng ảnh category cho product khác loại); chạy lại lần hai để chứng minh idempotent; cấu hình B2B demo; import fixture vào feature test store. Mốc này là điểm kiểm soát trong phase 8, không phải điều kiện cho phase 4/5/6 bắt đầu (các phase đó chờ toàn bộ phase 8).
5. Ảnh mẫu: tạo 3 ảnh mẫu bằng Codex, **anh duyệt**.
6. Pilot 10 ảnh, xác nhận bằng log cú pháp gọi skill, vị trí file và cách ghép ảnh theo dòng hàng; dựng contact sheet. Nếu lệch phong cách quá 20% hoặc hết hạn mức: chỉnh prompt và ảnh mẫu, chạy lại pilot. Chuyển sang OpenAI API key **chỉ khi anh đồng ý**.
7. Chạy nốt khoảng 90 packshot và khoảng 6 ảnh lifestyle/editorial theo baseline; tái dùng crop/focal point cho các recipe. Hậu kỳ và duyệt contact sheet theo ba tiêu chí: đồng bộ phong cách; không logo/chữ/màu brand thật ngoài ảnh logo riêng đã có quyền; subject đúng product/dòng hàng. Tạo lại ảnh vi phạm, import ảnh cuối qua state đúng target. Checkpoint ẢNH CUỐI đạt khi ảnh đã duyệt được import lại.
8. Kiểm tra sau import: tập handle trên store bằng tập handle trong `products.json`; `/collections/all` trên storefront có ≥ 500 product; tra thử SKU và MPN qua `/search/suggest`; không có SKU trùng; nội dung recipe có đủ resource để chọn bằng editor; fixture chỉ có trên feature test store. Kiểm tra `.gitignore`/`.shopifyignore` của phase 1 đã loại các đường dẫn nêu ở Related Code Files (đặc biệt `mockup/`); nếu thiếu thì ghi sai lệch cho phase 1/phase 9 xử lý.
9. Thu hồi token `store auth` (logout CLI hoặc gỡ quyền trong admin) và kiểm tra token không còn trên máy; ghi lại cách auth lại cho phase 9 nếu cần.

## Todo

- [ ] `lines.json` (có `subject` từng dòng)
- [ ] `generate-catalog.mjs` sinh ≥ 500 product, dữ liệu test tính năng và kiểm tra subject
- [ ] Nội dung trang, blog, PDF spec sheet và nội dung recipe R01–R03
- [ ] Fixture stress (`fixtures.json`, media tỷ lệ cực đoan) import vào feature test store
- [ ] Import idempotent, publish, definition, B2B demo (checkpoint IMPORT)
- [ ] 3 ảnh mẫu được anh duyệt
- [ ] Pilot 10 ảnh đạt
- [ ] Đủ packshot và ảnh lifestyle/editorial, đã hậu kỳ, contact sheet đạt ba tiêu chí, import lại ảnh cuối (checkpoint ẢNH CUỐI)
- [ ] Kiểm tra sau import trên storefront
- [ ] Xác nhận quy tắc `.gitignore`/`.shopifyignore` của phase 1 (loại `mockup/`, `demo-data/`, `scripts/`...), báo sai lệch nếu có
- [ ] Thu hồi token

## Success Criteria

- Acceptance criterion số 9 của contract: chạy lại script cho ra cùng dữ liệu và không tạo product mới; ảnh đã duyệt được lưu trong repo và upload lại được; contact sheet đồng bộ nền, góc máy, ánh sáng và bóng đổ.
- Storefront `/collections/all` của demo store có ≥ 500 product; tập handle trên store bằng tập trong `products.json`.
- Không có chữ "(demo)", Lorem Ipsum hay brand thật trong dữ liệu (kiểm tra bằng `rg` trên `products.json` và nội dung, và bằng truy vấn Admin trên store).
- Mỗi product nằm trong một dòng hàng có `subject` khớp; contact sheet được duyệt có ảnh đúng subject, không dùng ảnh category cho product khác loại.
- Nội dung recipe R01–R03 đủ để người đóng vai merchant chọn resource, sửa 2 FAQ, đổi CTA và image-with-text bằng editor mà không cần viết nội dung hoặc code; không có số liệu, tuyên bố hay logo bịa.
- Fixture stress phủ title 120 ký tự, SKU/MPN 40 ký tự, thiếu ảnh/spec/download, sold-out/low-stock, collection rỗng; chỉ ở feature test store.
- Quy tắc ignore của phase 1 loại `mockup/` và các thư mục không thuộc gói theme (phase 8 chỉ kiểm tra; việc đóng gói được chứng minh ở phase 9); không có file mockup, ảnh mockup, preview control hoặc logo giả nằm trong thư mục theme.

## Risk Assessment

- Hạn mức gói ChatGPT có thể hết giữa chừng; chạy theo lô 10 ảnh, manifest cho biết dòng nào đã xong.
- Import 520 product bằng từng lệnh `store execute` có thể chậm; nếu quá chậm thì dùng `shopify store bulk execute`.
- Subject hẹp có thể làm tăng số lần tạo lại ảnh; giữ khoảng 6 ảnh editorial, tái dùng crop thay vì tự tăng số ảnh. Nếu không đủ nội dung được duyệt, ghi change request effort/asset rõ ràng, không lấy reserve làm quyền tăng scope.
- Vendor marks hư cấu phải là nội dung demo tự tạo được duyệt, không placeholder. Nếu chưa được duyệt, hoàn tất bước duyệt trong phase 8 thay vì bỏ kiểm chứng S07 khỏi G2/G3; tài nguyên trong gói preset vẫn để trống đúng quy định.

## Security Considerations

- Không ghi token hay mật khẩu vào `vars/`, `import-state.json` hoặc log; chỉ in trạng thái thành công/thất bại.
- Phiên Codex chạy trong thư mục tạm, không có quyền ghi vào repo.
- Email test của tài khoản B2B không đưa vào repo.
- Fixture và nội dung recipe không chứa dữ liệu cá nhân, email hoặc số điện thoại thật; logo chỉ dùng khi có quyền; fixture không chứa token hoặc tên miền store thật.

## Next Steps

Phase 4, 5, 6 dùng catalog đã import chỉ sau khi toàn bộ phase 8 hoàn tất. Phase 7 dùng nội dung recipe cho G2; phase 9 dùng cùng dữ liệu cho G3 và nối metafield trên demo store, kiểm tra preset parity.
