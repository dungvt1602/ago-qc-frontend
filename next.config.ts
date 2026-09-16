import type { NextConfig } from "next";

/*
 * /api/* được proxy sang backend QC (Apps Script / Render) bởi Route Handler
 * tại src/app/api/[[...path]]/route.ts — KHÔNG dùng rewrite. Handler gọi
 * server-to-server và bỏ header Origin/Referer của trình duyệt nên backend
 * không cần bật CORS. Đặt NEXT_PUBLIC_API_URL để trình duyệt gọi thẳng backend
 * (backend phải cho phép CORS — bản vanilla trước đây chạy theo cách này).
 */
/*
 * Dev-only: Next chặn tài nguyên `/_next/*` khi trang được mở bằng host KHÁC
 * host khởi động server (mặc định chỉ `localhost`). App QC dùng trên điện
 * thoại → thường mở qua IP LAN để test camera thật. Khai host LAN ở đây để
 * mở khoá. Không ảnh hưởng bản build production.
 */
const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.*", "192.168.0.*", "127.0.0.1"],
};

export default nextConfig;
