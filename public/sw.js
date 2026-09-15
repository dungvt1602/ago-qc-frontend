// Service worker tối thiểu để app CÀI ĐƯỢC như app (PWA).
// Chỉ chuyển tiếp request ra mạng (không cache) -> luôn lấy bản mới nhất, tránh app hiển thị bản cũ.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
