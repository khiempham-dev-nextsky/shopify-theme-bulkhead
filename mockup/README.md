# Bulkhead HTML design preview

Mockup độc lập theo `plans/261021-0812-bulkhead-preset-v1/` và brainstorm contract đã chốt. Không có Liquid, Shopify API, thay đổi theme hoặc triển khai store. Các phase của plan gốc vẫn chưa được đánh dấu hoàn thành.

## Mở preview

Từ thư mục gốc repository, dùng Node.js 22 trở lên:

```sh
node mockup/serve.mjs
```

Mở <http://127.0.0.1:4173>. Không mở `index.html` bằng `file://`: trình duyệt cần HTTP để import ES modules. Server chỉ bind loopback, không công khai ra mạng.

Nếu cổng đang được sử dụng, chọn cổng khác:

```sh
PORT=4174 node mockup/serve.mjs
```

Không cần npm install, tài khoản Shopify hoặc kết nối Internet khi xem. Font và ảnh đã lưu cục bộ.

## Các màn hình để duyệt

| Màn hình | Đường dẫn |
| --- | --- |
| Homepage | `/#home` |
| Collection dạng Grid | `/#collection` |
| Collection dạng List | `/#collection?view=list` |
| Collection dạng Table | `/#collection?view=table` |
| Product và matrix 5 × 6 | `/#product?id=hex-bolt` |
| Quick order | `/#quick-order` |
| Trade account | `/#trade` |
| Guides | `/#guides` |
| Cart | Nút Cart trong header |

Thanh **Design preview** cho phép đổi guest/trade và Comfortable/Compact. Đây là công cụ duyệt mockup, không phải giao diện đăng nhập khách hàng.

### Thử tương tác

- Search: nhập `BH-4410-075` hoặc MPN `HX-M10-050`. Có gợi ý, Arrow Up/Down, Enter và Escape. Chọn MPN của biến thể mở đúng diameter/length.
- Collection: đổi view, sort, filter tồn kho/department/price; URL giữ view. Trên mobile dùng filter drawer. Table cuộn ngang bên trong vùng bảng, không làm tràn trang.
- Quick order: chọn **Paste a list → Use sample list → Check list**. Danh sách mẫu có hàng hợp lệ, SKU sai và hàng hết. Chỉ dòng hợp lệ được thêm vào cart. Không tự làm tròn số lượng. Trên 50 dòng bị từ chối toàn bộ, không cắt ngầm. SKU trùng và SKU/MPN cùng variant được gộp.
- Product: đổi đường kính/chiều dài, kiểm tra biến thể hết hàng, nhập nhiều ô trong matrix và thêm cùng lúc. Specifications và CSV tải xuống theo biến thể đang chọn.
- Trade preview: ship-to, price tiers và quantity rules xuất hiện; đổi về guest sẽ ẩn. Fixture trade có min 5, step 5, max 100; giảm 5% từ 20 pack, 10% từ 50 pack.
- Cart: sửa số lượng, xóa dòng, clear cart và review order. Đổi buyer mode giữ cart nhưng báo các dòng không còn hợp rule.
- Form trade: required fields, email không hợp lệ và thông báo hoàn tất preview. Newsletter cũng có phản hồi nhưng không tạo subscription.
- Escape đóng dialog; native dialog giữ focus trong overlay. Skip link chuyển focus tới main mà không đổi route.

Cart, buyer mode và density lưu bằng `sessionStorage` trong tab hiện tại. Form không gửi hoặc lưu dữ liệu bằng mã của mockup. Không nhập thông tin thật khi duyệt.

## Design brief

- **Register:** Brand, industrial catalog.
- **Scene:** Contractor tra vật tư trên desktop tại văn phòng hoặc điện thoại ở công trường; đọc nhanh SKU, tồn kho và quy cách.
- **Direction:** Catalog rõ ràng, cạnh sắc, mật độ vừa cao; lấy việc tra hàng và đặt nhiều mã làm trọng tâm.
- **Color:** Restrained, đúng palette đã chốt: background `#F4F3EF`, text `#16191D`, CTA `#FFC20E`, steel band `#234157`, packshot surface `#ECEAE4`.
- **Type:** Archivo 700/800; IBM Plex Sans 400/500/600; IBM Plex Mono cho dữ liệu. Giữ ba family theo brand contract, thay vì default tối đa hai family của skill.
- **Signature:** Quick order pad có tồn kho và lỗi theo dòng.
- **Dials:** variance 3 / motion 2 / density 6.
- **Geometry:** container 1360px, gutter 32/16px, spacing theo thang 4px, control radius 2px và card radius 4px.
- **Default collection view:** Grid để duyệt theo ảnh; List/Table là lựa chọn cho việc so thông số và nhập đơn.

## Giới hạn của bản duyệt

- 12 product fixtures, 6 department và 30 bolt variants. Không giả lập rằng catalog 500+ sản phẩm đã được tạo hoặc kiểm chứng hiệu năng trên catalog thật.
- Giá, tồn kho, SKU, MPN, quantity rules, price tiers và company location đều là dữ liệu mẫu, không phải dữ liệu Shopify.
- 7 ảnh tạo bằng Codex CLI là minh họa AI tạm thời. Các product dùng ảnh theo danh mục, không phải packshot chính xác theo SKU. Nền chưa được chuẩn hóa hoàn toàn theo `#ECEAE4`; hero là cảnh tổng hợp, không phải ảnh tài liệu kho thật. Chi tiết và provenance trong `assets/sources.json`.
- Supplier marks là hình học placeholder, không phải brand/đối tác thật. Chưa có logo thương hiệu merchant đã duyệt.
- Downloads dùng CSV thực sự tải được, ghi rõ dữ liệu preview; chưa có PDF chứng nhận, SDS, CAD hoặc tài liệu kỹ thuật thật.
- Không tích hợp checkout, account authentication, delivery/pickup, payment, rich media video/3D, order history hoặc submission requirements của Shopify. Không khẳng định các prototype rủi ro trong phase 1 đã được giải quyết.
- Nội dung chính sách/support mở phần giải thích phạm vi preview, không bịa chính sách giao hàng/đổi trả.

## Verification đã chạy

- Smoke trực tiếp bằng Chromium: quick order hỗn hợp, duplicate merge, SKU/MPN chính xác, hàng hết, lỗi số lượng, giới hạn 51 dòng, thêm một phần, cart, review order, price tier, matrix nhiều ô, đổi biến thể, form lỗi/thành công, newsletter, density và keyboard navigation.
- CSV được tải thật cho `BH-4410-M12-060`; nội dung có `M12 × 60 mm` và MPN `HX-M12-060`.
- Kiểm tra 36 tổ hợp: 6 route/view × 375/768/1440px × guest/trade. Không có document overflow hoặc ảnh hỏng ở lần chạy sau cùng.
- Bundled `ak-frontend-design/scripts/render-check.mjs`: home, collection Table, product, trade, mỗi trang ở 375×812 / 768×1024 / 1440×900. Kết quả cuối: **0 errors cho cả bốn trang**. Mỗi trang có 6 warning lặp lại từ hai `label.sr-only` cho search ở ba viewport; đây là nhãn ẩn có chủ đích cho accessibility, không phải chữ hiển thị bị cắt.
- Không có browser runtime error trong phiên smoke sau cùng.
- Chưa kiểm tra thiết bị vật lý, Safari/iOS, in-app webview, screen reader hoặc backend Shopify. Không có kết luận Lighthouse/Theme Store từ bản mockup.

### Visual critique cuối: 22/24

| Tiêu chí | Điểm / 2 | Bằng chứng / giới hạn |
| --- | --- | --- |
| Brief fidelity | 2 | Industrial, rõ ràng, thực dụng; palette và fonts đúng contract. |
| Hierarchy | 2 | Hero có một CTA vàng chính; hành động phụ không cạnh tranh màu. |
| Spacing rhythm | 2 | Section 64/48px, nhóm nội dung dùng scale; ảnh card đã sửa đúng tỉ lệ. |
| Alignment | 2 | Container và cột catalog thẳng hàng; số tiền trong table căn phải. |
| Typography | 2 | Archivo/IBM Plex có vai trò riêng, H1 56/38px, SKU monospace. |
| Color discipline | 2 | Vàng cho hành động, xanh thép cho band và điều hướng, stock có cả chữ lẫn màu. |
| Depth and shape | 2 | Hairline borders, radius 2/4px, không bóng nặng hoặc gradient. |
| States and feedback | 2 | Hover/focus, disabled sold-out, lỗi theo dòng, empty/filter state và cart feedback đã exercise. |
| Responsiveness | 2 | Bố cục mobile tái tổ chức, drawer cho filter; table/matrix cuộn trong vùng riêng. |
| Slop tells | 2 | Không testimonial/metric bịa, urgency, gradient, bo pill hoặc animation trang trí. |
| Content and copy | 1 | Copy dùng được để duyệt; catalog, dữ liệu và chính sách merchant chưa phải nội dung production. |
| Craft details | 1 | Icon/font/number formatting đồng bộ; ảnh hiện vẫn theo danh mục, chưa là packshot chính xác. |

Ba điểm yếu đã sửa trong critique: ảnh card quá cao do HTML height, vùng chạm nhỏ trên mobile, và Table view làm tràn document. Hai điểm còn 1/2 phụ thuộc dữ liệu/ảnh merchant được duyệt, không được nâng điểm bằng cách coi fixture là production.

## Ảnh chụp để đối chiếu

- [Home desktop](review/home-desktop.png), [mobile](review/home-mobile.png), [tablet](review/home-tablet.png)
- [Collection Table desktop](review/collection-table-desktop.png), [mobile](review/collection-table-mobile.png)
- [Product desktop](review/product-desktop.png), [mobile](review/product-mobile.png)
- [Trade mobile](review/trade-mobile.png)

Font tải từ Google Fonts; SIL Open Font License cho từng family nằm trong `assets/fonts/*-OFL.txt`. Source files dùng chung: `index.html` (shell), `styles.css` (tokens/layout), `app.mjs` (UI), `domain.mjs` (fixture/parser/rules/cart), `serve.mjs` (static preview server).
