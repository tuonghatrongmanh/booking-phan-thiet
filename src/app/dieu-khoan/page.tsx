import type { Metadata } from "next";
import LegalLayout, { type LegalSection } from "@/components/legal/LegalLayout";
import { SITE_URL } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng | Booking Phan Thiết",
  description: "Quy định khi sử dụng Booking Phan Thiết: tài khoản, nội dung cộng đồng, đặt phòng - thuê xe và đặt cọc.",
  alternates: { canonical: `${SITE_URL}/dieu-khoan` },
};

const SECTIONS: LegalSection[] = [
  {
    title: "Chấp nhận điều khoản",
    paragraphs: ["Khi truy cập hoặc sử dụng Booking Phan Thiết, bạn đồng ý với các điều khoản dưới đây và với Chính sách bảo mật. Nếu không đồng ý, vui lòng ngừng sử dụng website."],
  },
  {
    title: "Vai trò của website",
    paragraphs: [
      "Booking Phan Thiết là nền tảng tra cứu, đánh giá và tiếp nhận yêu cầu đặt chỗ lưu trú, thuê xe, thông tin ẩm thực và điểm tham quan tại Phan Thiết - Mũi Né. Thông tin về giá, tình trạng còn phòng/xe có thể thay đổi; đơn chỉ được xem là chốt khi chúng tôi hoặc đối tác xác nhận.",
    ],
  },
  {
    title: "Tài khoản",
    bullets: [
      "Bạn chịu trách nhiệm giữ bí mật mật khẩu và mọi hoạt động dưới tài khoản của mình.",
      "Thông tin đăng ký phải chính xác. Chúng tôi có quyền cảnh báo, ẩn hoặc tạm khóa tài khoản vi phạm quy định.",
    ],
  },
  {
    title: "Nội dung bạn đăng",
    bullets: [
      "Bạn chịu trách nhiệm về bài viết, bình luận, đánh giá, hình ảnh do mình đăng và cam kết có quyền sử dụng chúng.",
      "Nghiêm cấm nội dung sai sự thật, lừa đảo, xúc phạm, vi phạm pháp luật hoặc quảng cáo trái phép; nghiêm cấm đánh giá giả, đánh giá hàng loạt nhằm hạ uy tín người khác.",
      "Bạn cho phép Booking Phan Thiết hiển thị, lưu trữ và sử dụng nội dung đó trên website. Chúng tôi có quyền kiểm duyệt, ẩn hoặc xóa nội dung vi phạm.",
    ],
  },
  {
    title: "Đặt phòng, thuê xe và đặt cọc",
    bullets: [
      "Đơn đặt chỉ là yêu cầu cho đến khi được xác nhận. Khi có yêu cầu đặt cọc, bạn chuyển khoản đúng số tiền và nội dung (mã tham chiếu) hiển thị trên đơn.",
      "Ngày/phòng/xe chỉ được giữ khi khoản cọc đã được quản trị viên đối chiếu và xác nhận. Nút “Tôi đã chuyển khoản” chỉ là thông báo cho chúng tôi kiểm tra, không phải xác nhận thanh toán.",
      "Nếu nhiều khách cùng chuyển cọc cho cùng một ngày, đơn được xác nhận trước sẽ giữ chỗ; các trường hợp còn lại chúng tôi sẽ liên hệ để đổi ngày hoặc xử lý khoản cọc.",
      "Điều kiện huỷ, đổi ngày và hoàn cọc được thông báo khi đặt hoặc do các bên thống nhất qua thông tin liên hệ trên đơn.",
    ],
  },
  {
    title: "Sale uy tín và bên thứ ba",
    paragraphs: [
      "Hồ sơ Sale uy tín, homestay, quán ăn, đơn vị cho thuê là do đối tác cung cấp và được chúng tôi rà soát ở mức hợp lý. Huy hiệu “Đã xác thực” thể hiện thông tin liên hệ đã được quản trị viên kiểm tra, không phải bảo đảm chất lượng dịch vụ. Hãy tự cân nhắc và thỏa thuận rõ ràng trước khi thanh toán cho bất kỳ bên nào.",
    ],
  },
  {
    title: "Sử dụng hợp lý và giới hạn trách nhiệm",
    bullets: [
      "Không can thiệp trái phép vào hệ thống, thu thập dữ liệu hàng loạt, gửi yêu cầu dồn dập hoặc khai thác lỗ hổng.",
      "Website được cung cấp trên cơ sở “hiện có”. Chúng tôi cố gắng vận hành ổn định nhưng không đảm bảo không gián đoạn hay không có sai sót; phần trả lời của trợ lý AI chỉ mang tính tham khảo.",
      "Trong phạm vi pháp luật cho phép, chúng tôi không chịu trách nhiệm cho thiệt hại gián tiếp phát sinh từ giao dịch trực tiếp giữa bạn và bên thứ ba.",
    ],
  },
  {
    title: "Thay đổi điều khoản",
    paragraphs: ["Điều khoản có thể được cập nhật; ngày cập nhật gần nhất ghi ở đầu trang. Việc tiếp tục sử dụng website sau khi cập nhật nghĩa là bạn chấp nhận nội dung mới. Điều khoản này được điều chỉnh theo pháp luật Việt Nam."],
  },
];

export default function TermsPage() {
  return (
    <LegalLayout
      title="Điều khoản sử dụng"
      intro="Vui lòng đọc kỹ các quy định dưới đây khi sử dụng Booking Phan Thiết (bookingphanthiet.com)."
      updated="19/9/2026"
      sections={SECTIONS}
      otherLink={{ href: "/chinh-sach-bao-mat", label: "Xem Chính sách bảo mật →" }}
    />
  );
}
