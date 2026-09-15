import { auth } from "@/lib/auth";

export type Actor = { id: string; type: "user" | "admin" };

// Diễn đàn cho phép cả tài khoản người dùng lẫn admin thao tác (đăng bài, bình luận, thả cảm xúc)
export async function getActor(): Promise<Actor | null> {
  const session = await auth();
  const user = session?.user as { id?: string; type?: string } | undefined;
  if (!user?.id || (user.type !== "user" && user.type !== "admin")) return null;
  return { id: user.id, type: user.type };
}
