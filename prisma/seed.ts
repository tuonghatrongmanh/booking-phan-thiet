import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1. Tài khoản admin mặc định
  const passwordHash = await bcrypt.hash("Admin@123", 10);
  const admin = await prisma.admin.upsert({
    where: { email: "admin@bookingphanthiet.vn" },
    update: {},
    create: {
      email: "admin@bookingphanthiet.vn",
      password: passwordHash,
      name: "Quản trị viên",
      role: "ADMIN",
    },
  });

  // 2. Một địa điểm mẫu
  const place = await prisma.place.create({
    data: {
      name: "Mai Phương Homestay",
      category: "HOMESTAY",
      status: "TRUSTED",
      phone: "0945123456",
      address: "Mũi Né, Phan Thiết",
      description: "Homestay view biển, giá tốt, được cộng đồng đánh giá cao.",
      reviews: {
        create: [
          {
            reviewerName: "Phạm Thảo Linh",
            rating: 4,
            content: "Không gian đẹp, gần biển, giá hợp lý. Rất hài lòng!",
            trustLabel: "Uy tín",
            likes: 20,
          },
        ],
      },
    },
  });

  // 3. Một chương trình sale mẫu
  await prisma.sale.create({
    data: {
      title: "Giảm 20% homestay view biển dịp cuối tuần",
      description: "Áp dụng cho đặt phòng từ 2 đêm trở lên, liên hệ trực tiếp để nhận ưu đãi.",
      image: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      discountPercent: 20,
      placeName: place.name,
      phone: place.phone,
      category: "HOMESTAY",
      active: true,
    },
  });

  // 4. Một bài tin tức mẫu
  await prisma.news.create({
    data: {
      title: "5 kinh nghiệm du lịch Phan Thiết mùa hè 2026",
      slug: "5-kinh-nghiem-du-lich-phan-thiet-mua-he-2026",
      excerpt: "Những lưu ý quan trọng giúp chuyến đi Phan Thiết của bạn trọn vẹn hơn.",
      content: "Nội dung chi tiết bài viết sẽ được cập nhật tại đây...",
      coverImage: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      published: true,
      authorId: admin.id,
    },
  });

  console.log("Seed dữ liệu thành công.");
  console.log("Đăng nhập admin với: admin@bookingphanthiet.vn / Admin@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
