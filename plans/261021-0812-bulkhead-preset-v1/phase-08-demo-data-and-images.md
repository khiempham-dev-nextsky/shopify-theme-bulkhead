---
phase: 8
title: "Phase 8: Dữ liệu demo và ảnh"
status: pending
priority: P1
effort: "2w"
dependencies: [1]
---

<!-- Updated: Red Team 2026-10-21 -->

# Phase 8: Dữ liệu demo và ảnh

## Goal

Script sinh lại được demo store Bulkhead với ít nhất 500 sản phẩm authentic, hiển thị được trên storefront, cùng khoảng 100 ảnh packshot đồng bộ tạo bằng Codex CLI, nội dung trang và bài viết thật. Phần import dữ liệu phải xong trước khi phase 4 và 5 đóng; ảnh cuối có thể về sau.

## Context Links

- [Contract](../reports/brainstorm-261021-1421-bulkhead-preset-contract.md), mục Demo store và acceptance criterion số 9.
- [Research dữ liệu demo](../reports/researcher-261021-1503-demo-data-image-pipeline.md), mục 1–5.
- `reports/prototype-results.md` của plan này (P-e quyết định đường import, P-g kênh MPN, P-h metafield spec chuẩn).

## Key Insights

- Demo store phải khớp tag Lots (500+), nên sinh khoảng 520 sản phẩm từ khoảng 100 dòng hàng; sản phẩm cùng dòng dùng chung ảnh.
- `productSet` không publish và không tạo metafield definition; xoá các list bị bỏ khỏi input; không có `identifier` thì mỗi lần chạy là một lần tạo mới.
- Built-in `image_gen` của Codex không có seed và không cố định kích thước (thường 1254px); không phóng to quá kích thước gốc.
- Nội dung phải "authentic": không Lorem Ipsum, không text onboarding, không dùng brand thật; ảnh không có logo, chữ hay màu nhận diện của brand thật.

## Requirements

- **Catalog:** khoảng 10–12 danh mục (fasteners, hand tools, power tools, electrical, plumbing, safety/PPE, adhesives, storage, abrasives, fixings…), khoảng 8 brand hư cấu, khoảng 100 dòng hàng, ≥ 500 product. Mỗi product có title, mô tả thật, vendor, product type, category theo Standard Product Taxonomy, tag, SKU theo mẫu (ví dụ `BH-4410-075`), giá, tồn kho (có hàng, sắp hết, hết hàng, một vài variant `continue`), MPN (ghi vào custom metafield và vào kênh tìm kiếm đã chốt ở P-g), spec (metafield chuẩn `shopify.*` nếu P-h đạt, kèm custom metafield cho PDP) và downloads (`url`). Không sinh barcode/GTIN.
- **Dữ liệu cho test tính năng:** ít nhất một product 2 option kích thước đúng 5×6, khoảng 20 product 2 option, ít nhất một product 3 option, một gift card, một vài product bán theo hộp có unit price.
- **Collections:** smart collection theo product type và tag, collection "All", collection "Contractor favourites".
- **Nội dung:** trang About, Shipping, Returns, Trade terms, Quick order, Open a trade account, Contact; blog "Guides & resources" 4–6 bài hướng dẫn thật; menu header (mega menu) và footer.
- **Tài liệu tải về:** spec sheet PDF sinh từ template HTML bằng Chrome headless (`--print-to-pdf`), upload qua `stagedUploadsCreate` + `fileCreate`, poll tới READY, ghi URL CDN vào metafield `url`.
- **B2B demo:** quantity rule và bậc giá cho khoảng 30 product trong catalog B2B (qua Admin API nếu P-e đạt, nếu không thì cấu hình tay cho khoảng 10 product).
- **Ảnh:** 3 ảnh mẫu theo nhóm hình dáng (đồ dài, hộp vật tư, dụng cụ điện) do anh duyệt; khoảng 100 packshot nền `#ECEAE4`; khoảng 6 ảnh hero/lifestyle (công trường, kho, tông lạnh, không có chữ). Logo list dùng biểu tượng hình học không có chữ.

## Architecture

- `demo-data/catalog/lines.json`: nguồn duy nhất mô tả dòng hàng và brand (danh mục, brand, mẫu tên, biến thể kích thước, spec, giá gốc, nhóm hình dáng, prompt subject).
- `scripts/demo-data/generate-catalog.mjs` (Node, không dependency, seed cố định để sinh lại giống hệt) ghi ra `demo-data/generated/products.json`.
- `scripts/demo-data/import.mjs` chạy theo thứ tự: metafield definitions → file (mỗi dòng hàng upload ảnh một lần, poll READY, dùng lại file GID cho mọi product cùng dòng) → `productSet` với `identifier: { handle }` → publish lên Online Store và đưa vào publication của catalog B2B → collection, page, blog, menu. Mỗi product ghi vào `demo-data/generated/import-state.json` (handle, product GID, hash của input, trạng thái); chạy lại thì bỏ qua handle có hash không đổi. Gặp lỗi 401 hoặc 403 thì dừng toàn bộ batch và báo cần auth lại.
- Nếu P-e thất bại: `scripts/demo-data/export-csv.mjs` sinh product CSV (metafield cấp product, ảnh host công khai); definition và publish làm tay.
- `scripts/images/generate.sh`: mỗi lần gọi `codex exec -C <thư-mục-tạm-riêng> -s workspace-write --ephemeral -i demo-data/images/anchors/<group>.png` với prompt template cố định, chỉ thay dòng `Subject:`. Chụp danh sách file trong `~/.codex/generated_images/` trước và sau lần gọi; chỉ nhận đúng một file mới, nếu không có hoặc có nhiều hơn một thì đánh dấu thất bại. Dừng batch khi log có dấu hiệu hết hạn mức hoặc bắt đầu trừ credits. Kiểm tra `git status` của repo sạch sau mỗi lô.
- `demo-data/images/manifest.json`: mỗi ảnh có dòng hàng, sha256, prompt, ảnh mẫu, phiên bản Codex, ngày tạo; báo lỗi khi hai dòng hàng có cùng sha256.
- `scripts/images/postprocess.sh`: đo màu góc, loại ảnh có ΔE so với `#ECEAE4` vượt ngưỡng (đặt trong script, mặc định 3) để tạo lại; thay nền bằng flood-fill từ góc với `-fuzz`; `-trim` có `-fuzz`; không phóng to quá kích thước gốc; `-extent` vuông; xuất JPEG chất lượng cao; dựng contact sheet và một ảnh cắt 100% cho mỗi lô.
- Git: commit `lines.json`, prompt template, ảnh mẫu, manifest, script, `products.json` và ảnh `final/` đã duyệt (JPEG, ước tính khoảng 30 MB); đưa `demo-data/images/raw/`, `demo-data/generated/vars/` và `import-state.json` vào `.gitignore`.

## Related Code Files

- Create: `demo-data/catalog/lines.json`, `demo-data/content/pages/*.md`, `demo-data/content/blog/*.md`, `demo-data/graphql/metafield-definitions.graphql`, `demo-data/graphql/file-create.graphql`, `demo-data/graphql/product-set.graphql`, `demo-data/graphql/publish.graphql`, `demo-data/images/prompt-template.txt`, `demo-data/images/anchors/*.png`, `demo-data/images/manifest.json`, `demo-data/images/final/*.jpg`, `demo-data/pdf/spec-sheet.html`, `scripts/demo-data/generate-catalog.mjs`, `scripts/demo-data/import.mjs`, `scripts/demo-data/make-pdfs.mjs`, `scripts/images/generate.sh`, `scripts/images/postprocess.sh`; `scripts/demo-data/export-csv.mjs` chỉ khi P-e thất bại.
- Modify: `.gitignore`, `.shopifyignore`.

## Implementation Steps

1. Viết `lines.json` (gồm brand hư cấu; kiểm tra tên không trùng brand thật bằng web search).
2. `generate-catalog.mjs` sinh ≥ 500 product; kiểm tra SKU duy nhất, đủ trường và đủ dữ liệu test tính năng.
3. Viết nội dung trang và bài blog; sinh PDF spec sheet.
4. Import theo đường đã chốt ở P-e (dùng ảnh tạm của dòng hàng nếu ảnh cuối chưa xong); chạy lại lần hai để chứng minh idempotent; cấu hình B2B demo. Mốc này chặn việc đóng phase 4 và 5.
5. Ảnh mẫu: tạo 3 ảnh mẫu bằng Codex, **anh duyệt**.
6. Pilot 10 ảnh, xác nhận bằng log cú pháp gọi skill, vị trí file và cách ghép ảnh theo dòng hàng; dựng contact sheet. Nếu lệch phong cách quá 20% hoặc hết hạn mức: chỉnh prompt và ảnh mẫu, chạy lại pilot. Chuyển sang OpenAI API key **chỉ khi anh đồng ý**.
7. Chạy nốt khoảng 90 packshot và 6 ảnh lifestyle; hậu kỳ; duyệt contact sheet theo hai tiêu chí: đồng bộ phong cách, và không logo, chữ hay màu nhận diện của brand công cụ lớn; tạo lại ảnh vi phạm; import lại ảnh cuối (chỉ đổi file, nhờ `import-state.json`).
8. Kiểm tra sau import: tập handle trên store bằng tập handle trong `products.json`; `/collections/all` trên storefront có ≥ 500 product; tra thử SKU và MPN qua `/search/suggest`; không có SKU trùng.
9. Thu hồi token `store auth` (logout CLI hoặc gỡ quyền trong admin) và kiểm tra token không còn trên máy; ghi lại cách auth lại cho phase 9 nếu cần.

## Todo

- [ ] `lines.json`
- [ ] `generate-catalog.mjs` sinh ≥ 500 product và dữ liệu test tính năng
- [ ] Nội dung trang, blog, PDF spec sheet
- [ ] Import idempotent, publish, definition, B2B demo
- [ ] 3 ảnh mẫu được anh duyệt
- [ ] Pilot 10 ảnh đạt
- [ ] Đủ packshot và ảnh lifestyle, đã hậu kỳ, contact sheet đạt hai tiêu chí
- [ ] Kiểm tra sau import trên storefront
- [ ] Thu hồi token

## Success Criteria

- Acceptance criterion số 9 của contract: chạy lại script cho ra cùng dữ liệu và không tạo product mới; ảnh đã duyệt được lưu trong repo và upload lại được; contact sheet đồng bộ nền, góc máy, ánh sáng và bóng đổ.
- Storefront `/collections/all` của demo store có ≥ 500 product; tập handle trên store bằng tập trong `products.json`.
- Không có chữ "(demo)", Lorem Ipsum hay brand thật trong dữ liệu (kiểm tra bằng `rg` trên `products.json` và nội dung, và bằng truy vấn Admin trên store).

## Risk Assessment

- Hạn mức gói ChatGPT có thể hết giữa chừng; chạy theo lô 10 ảnh, manifest cho biết dòng nào đã xong.
- Import 520 product bằng từng lệnh `store execute` có thể chậm; nếu quá chậm thì dùng `shopify store bulk execute`.

## Security Considerations

- Không ghi token hay mật khẩu vào `vars/`, `import-state.json` hoặc log; chỉ in trạng thái thành công/thất bại.
- Phiên Codex chạy trong thư mục tạm, không có quyền ghi vào repo.
- Email test của tài khoản B2B không đưa vào repo.

## Next Steps

Phase 4, 5, 6 dùng catalog đã import. Phase 9 nối metafield trên demo store và kiểm tra preset parity.
