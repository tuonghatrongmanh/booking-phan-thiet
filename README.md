# Booking Phan Thiết

Hệ thống tra cứu & đánh giá uy tín homestay, sale, thuê xe, quán ăn, điểm tham quan tại Phan Thiết.

## Công nghệ sử dụng

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Prisma + MySQL** — lưu trữ dữ liệu
- **NextAuth (Auth.js v5)** — đăng nhập admin
- **Cloudinary** — lưu trữ ảnh (avatar, sale, bằng chứng mạng xã hội...)

## 1. Cài đặt

```bash
npm install
```

## 2. Cấu hình biến môi trường

Sao chép `.env.example` thành `.env` và điền thông tin thật:

```bash
cp .env.example .env
```

| Biến | Mô tả |
|---|---|
| `DATABASE_URL` | Chuỗi kết nối MySQL, ví dụ: `mysql://user:pass@localhost:3306/booking_phan_thiet` |
| `NEXTAUTH_SECRET` | Chuỗi bí mật ngẫu nhiên, dùng để ký session. Tạo bằng: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL của website, khi chạy local là `http://localhost:3000` |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Lấy từ Dashboard tài khoản Cloudinary (miễn phí tại cloudinary.com) |

## 3. Khởi tạo database

Tạo database MySQL trống trước (VD: `booking_phan_thiet`), sau đó chạy:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Lệnh `migrate dev` sẽ tự tạo toàn bộ bảng dựa theo `prisma/schema.prisma`.

## 4. Tạo dữ liệu mẫu (tùy chọn nhưng khuyến khích)

```bash
npx prisma db seed
```

Lệnh này tạo:
- 1 tài khoản admin: **admin@bookingphanthiet.vn / Admin@123** (đổi mật khẩu sau khi đăng nhập lần đầu)
- 1 địa điểm, 1 sale, 1 bài tin tức mẫu để bạn xem giao diện có dữ liệu ngay

## 5. Chạy dự án

```bash
npm run dev
```

- Trang chủ: http://localhost:3000
- Đăng nhập quản trị: http://localhost:3000/admin/login

## Cấu trúc thư mục chính

```
src/
  app/
    page.tsx                 # Trang chủ (Server Component, đọc dữ liệu trực tiếp từ DB)
    admin/
      login/                 # Trang đăng nhập
      (dashboard)/            # Toàn bộ trang quản trị (được bảo vệ bởi middleware)
        page.tsx              # Tổng quan
        news/                 # CRUD tin tức
        sales/                # CRUD sale
        places/               # CRUD địa điểm + ảnh + bằng chứng MXH + đánh giá
    api/
      auth/[...nextauth]/     # NextAuth route
      upload/                 # Upload ảnh lên Cloudinary
      news/, sales/, places/  # REST API — dùng chung cho web admin và app di động sau này
  components/
    home/                     # Component trang chủ (Header, Hero, SaleSection...)
    admin/                    # Component khu vực quản trị (form, upload, sidebar...)
  lib/
    prisma.ts                 # Prisma client singleton
    auth.ts                   # Cấu hình NextAuth
    cloudinary.ts              # Cấu hình Cloudinary
prisma/
  schema.prisma               # Định nghĩa toàn bộ bảng dữ liệu
  seed.ts                     # Script tạo dữ liệu mẫu
```

## API sẵn có (dùng lại được cho app di động trong tương lai)

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/news` | Danh sách tin tức (phân trang) |
| POST | `/api/news` | Đăng bài mới (yêu cầu đăng nhập) |
| PATCH/DELETE | `/api/news/:id` | Sửa/xóa bài viết |
| GET | `/api/sales` | Danh sách sale (lọc theo `active`, `category`) |
| POST | `/api/sales` | Thêm sale mới |
| PATCH/DELETE | `/api/sales/:id` | Sửa/xóa sale |
| GET | `/api/places` | Danh sách địa điểm (lọc theo `category`, `status`, `q`) |
| POST | `/api/places` | Thêm địa điểm |
| PATCH/DELETE | `/api/places/:id` | Sửa/xóa địa điểm |
| POST | `/api/places/:id/images` | Thêm ảnh liên quan |
| DELETE | `/api/places/:id/images/:imageId` | Xóa ảnh |
| POST | `/api/places/:id/social-comments` | Thêm bằng chứng bình luận MXH (ảnh) |
| DELETE | `/api/places/:id/social-comments/:commentId` | Xóa bằng chứng |
| POST | `/api/places/:id/reviews` | Thêm đánh giá |
| DELETE | `/api/places/:id/reviews/:reviewId` | Xóa đánh giá |
| GET | `/api/reviews` | Đánh giá mới nhất toàn hệ thống (cho trang chủ) |
| POST | `/api/upload` | Upload 1 ảnh lên Cloudinary (yêu cầu đăng nhập) |

Tất cả các API POST/PATCH/DELETE đều yêu cầu đã đăng nhập admin (kiểm tra qua session NextAuth), phù hợp để tái sử dụng làm backend cho app di động (khi đó app sẽ gọi các API này qua HTTP, có thể cần đổi cơ chế xác thực sang JWT Bearer token nếu không dùng cookie).

## Lưu ý khi phát triển tiếp

- Trang chủ (`src/app/page.tsx`) dùng `export const dynamic = "force-dynamic"` để luôn lấy dữ liệu mới nhất — có thể cân nhắc cache/ISR khi lượng truy cập lớn.
- Các trang danh mục công khai (`/homestay`, `/thue-xe`, `/sale`, `/quan-an`, `/diem-tham-quan`, `/hoan-tien`, `/tin-tuc/[slug]`) hiện chưa được tạo — đây là bước tiếp theo hợp lý, tái sử dụng dữ liệu và API đã có sẵn.
- Nên đổi mật khẩu tài khoản admin mẫu ngay sau khi seed, hoặc xóa và tạo tài khoản admin thật qua Prisma Studio (`npx prisma studio`).
