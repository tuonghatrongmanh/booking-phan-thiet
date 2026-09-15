import { z } from "zod";

// Chấp nhận URL tuyệt đối (Cloudinary...) hoặc đường dẫn tương đối bắt đầu bằng "/"
// (ảnh lưu local khi chưa cấu hình Cloudinary, xem src/app/api/upload/route.ts)
export const imagePathSchema = z
  .string()
  .refine((val) => val.startsWith("/") || /^https?:\/\//.test(val), {
    message: "Đường dẫn ảnh không hợp lệ",
  });

// Số điện thoại Việt Nam: 0xxxxxxxxx hoặc +84xxxxxxxxx (9-10 số sau đầu số)
const vnPhoneRegex = /^(0|\+84)[35789][0-9]{8}$/;

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Họ tên phải có ít nhất 2 ký tự").max(100),
  phone: z.string().trim().regex(vnPhoneRegex, "Số điện thoại không hợp lệ"),
  email: z.string().trim().email("Email không hợp lệ"),
  dob: z
    .string()
    .refine((val) => !Number.isNaN(new Date(val).getTime()), "Ngày sinh không hợp lệ")
    .refine((val) => new Date(val) < new Date(), "Ngày sinh phải ở quá khứ")
    .refine((val) => new Date(val) > new Date("1900-01-01"), "Ngày sinh không hợp lệ")
    .refine((val) => {
      const age = (Date.now() - new Date(val).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      return age >= 13;
    }, "Bạn phải từ 13 tuổi trở lên"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

export const profileEditSchema = z.object({
  name: z.string().trim().min(2, "Họ tên phải có ít nhất 2 ký tự").max(100),
  phone: z.string().trim().regex(vnPhoneRegex, "Số điện thoại không hợp lệ"),
  email: z.string().trim().email("Email không hợp lệ"),
  dob: z
    .string()
    .refine((val) => !Number.isNaN(new Date(val).getTime()), "Ngày sinh không hợp lệ")
    .refine((val) => new Date(val) < new Date(), "Ngày sinh phải ở quá khứ")
    .refine((val) => {
      const age = (Date.now() - new Date(val).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      return age >= 13;
    }, "Bạn phải từ 13 tuổi trở lên"),
  avatar: imagePathSchema.optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
  newPassword: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
});

export const forumMediaItemSchema = z.object({
  url: imagePathSchema,
  type: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
});

export const forumPostSchema = z.object({
  title: z.string().trim().min(3, "Tiêu đề phải có ít nhất 3 ký tự").max(150),
  content: z.string().trim().min(5, "Nội dung phải có ít nhất 5 ký tự").max(5000),
  postType: z.enum(["POST", "REVIEW", "QUESTION", "EXPERIENCE"]).optional().default("POST"),
  locationTag: z.string().trim().max(100).optional(),
  media: z.array(forumMediaItemSchema).max(8).optional().default([]),
});

export const forumCommentSchema = z.object({
  content: z.string().trim().min(1, "Vui lòng nhập bình luận").max(1000),
});

export const forumReactionSchema = z.object({
  type: z.enum(["LIKE", "LOVE", "HAHA", "WOW", "SAD", "ANGRY"]),
});
