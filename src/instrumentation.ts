import type { Instrumentation } from "next";

// Next gọi hàm này mỗi khi máy chủ gặp lỗi khi xử lý request (trang, API, server action).
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { reportServerError } = await import("@/lib/error-report");
  await reportServerError(err, request, context).catch(() => {});
};
