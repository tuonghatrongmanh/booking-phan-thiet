import type { Metadata } from "next";
import LegalLayout, { type LegalSection } from "@/components/legal/LegalLayout";
import { SITE_URL } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Chính sách bảo mật | Booking Phan Thiết",
  description: "Booking Phan Thiết thu thập, sử dụng và bảo vệ dữ liệu cá nhân của bạn như thế nào: đăng nhập Google, đặt phòng/thuê xe, giọng nói, cookie.",
  alternates: { canonical: `${SITE_URL}/chinh-sach-bao-mat` },
};

const SECTIONS: LegalSection[] = [
  {
    title: "Chúng tôi thu thập những thông tin nào",
    bullets: [
      "Tài khoản: họ tên, email, số điện thoại và ngày sinh (nếu bạn nhập), ảnh đại diện. Mật khẩu được mã hóa một chiều, chúng tôi không đọc được mật khẩu của bạn.",
      "Đăng nhập bằng Google: chúng tôi chỉ nhận email, tên và ảnh đại diện công khai từ tài khoản Google. Chúng tôi không nhận mật khẩu Google và không truy cập Gmail, danh bạ hay Google Drive của bạn.",
      "Đặt phòng / thuê xe: tên, số điện thoại, email (nếu bạn nhập), ngày nhận - trả, số lượng, ghi chú và mã tham chiếu chuyển khoản đặt cọc.",
      "Nội dung bạn đăng: bài viết, bình luận, đánh giá và hình ảnh tải lên diễn đàn, đánh giá quán ăn, lưu trú.",
      "Dữ liệu kỹ thuật: địa chỉ IP, loại trình duyệt/thiết bị và các trang đã truy cập, dùng để thống kê lượt xem và phát hiện truy cập bất thường.",
      "Dữ liệu lưu trên thiết bị của bạn (cookie, localStorage): phiên đăng nhập, danh sách yêu thích, thông tin đặt chỗ nhập dở để bạn không phải nhập lại, lựa chọn ẩn/hiện thông tin.",
    ],
  },
  {
    title: "Chúng tôi dùng thông tin để làm gì",
    bullets: [
      "Tạo và quản lý tài khoản, xác thực đăng nhập, gửi email xác thực hoặc đặt lại mật khẩu.",
      "Tiếp nhận, xử lý và xác nhận đơn đặt phòng/thuê xe, đối chiếu tiền cọc, liên hệ với bạn về đơn.",
      "Hiển thị nội dung cộng đồng, đánh giá, kiểm duyệt để ngăn lừa đảo và spam.",
      "Bảo mật hệ thống: giới hạn số lần đăng nhập, phát hiện hành vi bất thường, cảnh báo cho quản trị viên.",
      "Cải thiện website (thống kê ẩn danh, sửa lỗi) và trả lời câu hỏi của bạn qua trợ lý AI.",
    ],
    paragraphs: ["Chúng tôi không bán dữ liệu cá nhân của bạn cho bất kỳ bên nào."],
  },
  {
    title: "Micro, giọng nói và trợ lý AI",
    bullets: [
      "Micro chỉ được bật khi bạn chủ động bấm nút micro. Đoạn ghi âm ngắn được gửi đến dịch vụ Google Gemini để chuyển thành chữ; chúng tôi không lưu file ghi âm trên máy chủ của mình.",
      "Câu hỏi bạn nhập hoặc nói với trợ lý AI được gửi đến Google Gemini để trả lời. Với câu hỏi ngoài phạm vi website (thời tiết, kiến thức chung), hệ thống có thể tra cứu thêm từ Open-Meteo, Wikipedia hoặc công cụ tìm kiếm.",
      "Vui lòng không nhập thông tin nhạy cảm (mật khẩu, số thẻ, giấy tờ tùy thân) vào khung chat hoặc nói vào micro.",
    ],
  },
  {
    title: "Chia sẻ dữ liệu với bên thứ ba",
    paragraphs: ["Chúng tôi dùng một số nhà cung cấp dịch vụ để vận hành website. Họ chỉ nhận dữ liệu cần thiết cho đúng nhiệm vụ:"],
    bullets: [
      "Hạ tầng: dịch vụ lưu trữ web và cơ sở dữ liệu, mạng phân phối nội dung (CDN).",
      "Lưu trữ hình ảnh tải lên.",
      "Google: đăng nhập bằng Google, trợ lý AI/nhận dạng giọng nói (Gemini) và thống kê truy cập nếu được bật.",
      "Gửi email (xác nhận đơn, đặt lại mật khẩu) nếu bạn cung cấp email.",
      "Kênh thông báo nội bộ cho quản trị viên (Telegram) để kịp xử lý đơn mới; tin báo có tên, số điện thoại và thông tin đơn của khách.",
      "Cơ quan nhà nước có thẩm quyền khi có yêu cầu hợp pháp bằng văn bản.",
    ],
  },
  {
    title: "Thời gian lưu trữ và bảo mật",
    paragraphs: [
      "Chúng tôi lưu dữ liệu tài khoản cho đến khi bạn yêu cầu xóa hoặc tài khoản không còn được sử dụng; dữ liệu đơn đặt phòng/thuê xe được lưu để phục vụ đối soát và giải quyết khiếu nại.",
      "Website dùng kết nối HTTPS, mã hóa mật khẩu, giới hạn số lần đăng nhập, xác thực hai lớp cho quản trị viên và phân quyền truy cập dữ liệu. Không hệ thống nào an toàn tuyệt đối; nếu phát hiện sự cố, chúng tôi sẽ xử lý và thông báo theo quy định.",
    ],
  },
  {
    title: "Quyền của bạn",
    bullets: [
      "Xem và chỉnh sửa thông tin cá nhân trong trang Tài khoản (kể cả nút Ẩn thông tin để che số điện thoại, email, ngày sinh trên màn hình).",
      "Yêu cầu cung cấp bản sao, chỉnh sửa hoặc xóa dữ liệu cá nhân của bạn bằng cách liên hệ chúng tôi (mục Liên hệ bên dưới).",
      "Rút lại sự đồng ý, thu hồi quyền của Google đối với website tại trang quản lý tài khoản Google của bạn.",
      "Xóa cookie/dữ liệu trang bất cứ lúc nào bằng cài đặt trình duyệt.",
    ],
  },
  {
    title: "Trẻ em và thay đổi chính sách",
    paragraphs: [
      "Website không dành cho trẻ em dưới 16 tuổi tự tạo tài khoản. Nếu phát hiện, chúng tôi sẽ xóa tài khoản đó.",
      "Chính sách này có thể được cập nhật khi tính năng thay đổi hoặc quy định pháp luật thay đổi. Ngày cập nhật gần nhất được ghi ở đầu trang; việc tiếp tục sử dụng website sau khi cập nhật đồng nghĩa bạn đã đọc nội dung mới.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Chính sách bảo mật"
      intro="Booking Phan Thiết (bookingphanthiet.com) tôn trọng quyền riêng tư của bạn. Trang này giải thích chúng tôi thu thập gì, dùng vào việc gì và bạn kiểm soát dữ liệu của mình ra sao."
      updated="19/9/2026"
      sections={SECTIONS}
      otherLink={{ href: "/dieu-khoan", label: "Xem Điều khoản sử dụng →" }}
    />
  );
}
