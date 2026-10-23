---
phase: 0
title: "Phase 0: Design scope và section inventory"
status: pending
priority: P1
effort: "1.5w"
dependencies: []
---

<!-- Updated: Scope revision 2026-10-23 -->

# Phase 0: Design scope và section inventory

## Goal

Chốt cấu hình thiết kế, thư viện section tái sử dụng và ba bài merchant tự xây trang trước khi triển khai foundation. Có thể làm khi anh đang chuẩn bị store; không cần Shopify login để duyệt thiết kế. Phase 1 kiểm chứng platform độc lập, không bị chặn bởi phase này.

## Context Links

- [Contract](../reports/brainstorm-261021-1421-bulkhead-preset-contract.md), Design và AC11/12.
- [Section inventory](./section-inventory.md), S01–S19, D01–D05 và R01–R03.
- [Mockup hiện có](../../mockup/README.md), chỉ là reference HTML với fixture, không phải code theme hoặc bằng chứng B2B thật.
- [Phase 1](./phase-01-start.md), P-a…P-j và gate spec/downloads.

## Key Insights

- Mockup hiện có chứng minh một số interaction nhưng chưa chứng minh merchant tự dựng trang, cấu hình theme editor, catalog 500+ hoặc Shopify integration.
- Thư viện có nhiều section không đảm bảo theme thương mại dùng được; mỗi section core cần mục đích, nơi dùng, layout, block/setting, empty/long-content behavior và owner.
- Cùng một hero/banner, CTA và FAQ phải tái sử dụng qua các trang; section presets không tạo thêm theme preset.
- Bước này quyết định thiết kế sớm; phase 7 triển khai và ghép lại thiết kế đã duyệt, không phải nơi bắt đầu khám phá toàn bộ art direction.

## Requirements

- Giữ palette, Archivo/IBM Plex Sans/Mono, scale spacing, radius 2/4px, Comfortable/Compact, một preset Bulkhead và mô hình hai lớp guest/B2B.
- Core theo S01–S19. Image with text và Multicolumn bắt buộc; flexible banner nằm trong S01 hero/banner. FAQ S18 và CTA S06 dùng chung. Standalone video O01 và collection tabs O02 chỉ là optional extensions, không có code/setting/demo trong baseline v1. PDP rich media và Grid/List/Table vẫn bắt buộc.
- Duyệt D01 hero Search first/Image led/Compact banner; D02 card Browsing/Technical; D03 collection Browsing/Order first; D04 PDP Simple/Multi-size; D05 content layouts. Các lựa chọn không được nhân đôi engine giá, stock, quantity hoặc cart.
- Default home đặt Quick order trước category trên cả desktop/mobile. Header search mobile không dành chỗ cố định cho scope selector làm cắt vai trò SKU/MPN; phải thiết kế control scope riêng hoặc giản lược hàng search.
- Dựng ba composition R01 Homepage, R02 landing ngành nghề, R03 About/dịch vụ từ cùng inventory. Có minh họa cấu trúc editor: section nào, blocks/settings nào merchant sẽ thao tác; chưa tuyên bố đó là editor thật.
- Nội dung stress và viewports theo inventory: 375/768/1440px, guest/trade, thiếu resource, title/SKU dài, sold-out. Ảnh mockup ghi rõ là minh họa; ảnh cuối theo pipeline phase 8, không dùng ảnh nhóm làm packshot sai SKU.

## Architecture và boundaries

- Authority thiết kế: inventory hiện tại + quyết định anh duyệt ghi ở `reports/design-approval.md` khi thực thi phase này. Outcome/AC vẫn thuộc contract; dependency/effort thuộc plan index.
- Tái dùng `mockup/` để review khi phase 0 được thực thi; không mang hash routing, hardcoded price rules hoặc `innerHTML` page renderer sang kiến trúc theme. Theme dùng Liquid/templates/sections/blocks và progressive enhancement theo phase 2.
- G0 là gate thiết kế, không xác minh P-a…P-j. Phase 2 và phase 8 chỉ bắt đầu sau G0 + kết quả phase 1; đối chiếu thay đổi platform trước khi vào implementation.
- Nếu phase 1 bác giả định của thiết kế, cập nhật phần bị ảnh hưởng trong inventory và approval, giữ pending các gate liên quan cho đến khi anh duyệt lại. Không cần lặp các cấu hình không bị ảnh hưởng.
- Ranh giới lượt cập nhật plan 2026-10-23: chỉ author tài liệu; không sửa mockup/theme, không tạo store hoặc chạy prototype. Phase này vẫn pending sau lượt cập nhật đó.

## Related Code Files

- Existing references: `mockup/README.md`, `mockup/index.html`, `mockup/styles.css`, `mockup/app.mjs`, `mockup/domain.mjs`.
- Khi thực thi phase 0 sau này: chỉnh `mockup/` và ảnh review theo nhu cầu duyệt; tạo `plans/261021-0812-bulkhead-preset-v1/reports/design-approval.md`.
- Không tạo file Liquid hoặc sửa theme trong phase này. Phase 1 sở hữu import Skeleton và code prototype tạm; phase 2 trở đi sở hữu implementation theme.

## Implementation Steps

1. Đối chiếu S01–S19 với mục đích merchant; giữ nguyên phân loại core/optional, owner và các file dùng chung. Chỉ đổi scope khi có quyết định của anh và cập nhật effort.
2. Thiết kế D01–D05 với breakpoint, thứ tự DOM/focus và hành vi thiếu/dài nội dung; cập nhật mockup khi bắt đầu thực thi phase này, không trong lượt sửa plan.
3. Dựng R01–R03, chỉ dùng module đã liệt kê; ghi các thao tác editor dự kiến và nội dung/resource cần phase 8 cung cấp.
4. Preview thực tế ở ba viewport, exercise search/ordering/mobile controls; ghi phát hiện và ảnh. Không gọi dữ liệu fixture là dữ liệu thật hoặc score mockup là kết luận Theme Store.
5. Anh duyệt G0; ghi ngày, cấu hình chọn, phần chưa duyệt và ảnh đối chiếu vào approval. Chỉ đánh dấu phase hoàn thành khi các lựa chọn bắt buộc đã được duyệt.
6. Khi P-a…P-j có kết quả, phase 1 và phase 2 đối chiếu approval; ghi delta/reapproval cho phần bị ảnh hưởng trước phase 2/8. Câu hỏi spec/downloads với Theme Support vẫn theo phase 1, không bị bỏ qua.

## Todo

- [ ] D01–D05 được thiết kế với mobile/content-state behavior cụ thể
- [ ] R01–R03 được dựng từ inventory chung và preview ở 375/768/1440px
- [ ] Search-first, Technical card và mobile ordering thể hiện rõ khác biệt của Bulkhead
- [ ] Anh duyệt G0, có `reports/design-approval.md` ghi bằng chứng và quyết định

## Success Criteria

- G0 có approval cho core inventory, D01–D05 và R01–R03, không có cấu hình bắt buộc còn bỏ ngỏ.
- Không cần thêm section riêng cho landing ngành nghề/About để hoàn thành ba composition; FAQ, CTA và hero/banner không bị nhân đôi.
- Không có document overflow hoặc controls đè nhau trong preview; các vùng Table/matrix cuộn có ngữ cảnh và keyboard access. Kiểm chứng integration/editor thật vẫn thuộc phase 1/7/9.
- Các thay đổi platform phát hiện sau G0 được truy vết để reconcile trước phase 2/8; completion G0 không tự đóng gate platform.

## Risk Assessment

- Section bloat: không thêm O01/O02 hoặc nhánh settings chỉ vì đủ số; change request phải chỉ ra use case và effort.
- Chờ store không chặn thiết kế; ngược lại, thiết kế đẹp không được bỏ qua kết quả prototype và Theme Support.
- Title, ảnh hoặc số block khác demo có thể phá layout: stress content là tiêu chí duyệt, không phải cleanup sau khi code xong.

## Security Considerations

Chỉ dùng fixture không có dữ liệu cá nhân cho preview. Không cần token, company contact thật hoặc checkout thật; approval/screenshot phải che dữ liệu nhạy cảm nếu bổ sung từ store sau này.

## Next Steps

Phase 1 tiếp tục chuẩn bị store và prototype độc lập. Sau G0 và phase 1, phase 2 + phase 8 chạy ở hai session/worktree như quyết định cũ; các điểm platform chưa chốt phải được giải quyết theo gate tương ứng, không tự suy diễn từ mockup.
