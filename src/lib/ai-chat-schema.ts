import { z } from "zod";
import { MAX_TEXT } from "@/lib/ai-chat-utils";

// Kiem tra hinh dang thoi (mang tin nhan, do dai); noi dung cu the con duoc
// sanitizeTurns() lam sach lai o server.
export const chatRequestSchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "model"]), text: z.string().max(MAX_TEXT * 4) }))
    .min(1)
    .max(40),
});
