// Ten phong Socket.io dung chung giua server (server.ts, API routes) va client
// (ForumFeed, ForumCommentSection, ForumReactionBar) - tach rieng file nay (khong dung
// globalThis/socket.io) de server.ts co the import an toan bang duong dan tuong doi.
export function forumCategoryRoom(categorySlug: string) {
  return `forum:${categorySlug}`;
}

export function forumPostRoom(postId: string) {
  return `forum-post:${postId}`;
}
