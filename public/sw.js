// Service worker của Booking Phan Thiết: giúp trang cài được như app (PWA) và hiện trang
// "ngoại tuyến" thân thiện khi mất mạng. CỐ Ý không cache trang/API vì nội dung đổi liên tục
// (giá, còn/hết phòng, giao diện lễ hội) - luôn lấy bản mới nhất từ mạng.
const VERSION = "bpt-sw-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll([OFFLINE_URL, "/images/favicon-192.png"])));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.mode !== "navigate") return;
  event.respondWith(fetch(req).catch(() => caches.match(OFFLINE_URL)));
});
