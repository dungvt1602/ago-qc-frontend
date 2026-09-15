import axios from "axios";

/*
 * Axios instance DUY NHẤT của app (AGENTS.md API Rule).
 *
 * baseURL:
 * - Mặc định `/api` → same-origin, Route Handler tại
 *   src/app/api/[[...path]]/route.ts chuyển tiếp sang BACKEND_URL (không CORS).
 * - Đặt NEXT_PUBLIC_API_URL (vd https://ago-qc-backend.onrender.com/api) →
 *   trình duyệt gọi thẳng backend, giống bản vanilla trước đây.
 *
 * Timeout 120s: backend chạy trên Render free tier, lần gọi đầu trong ngày
 * phải chờ server "thức dậy" (~30–60s); upload ảnh và xuất PDF cũng lâu.
 * Feature nào cần khác thì override per-request, không tạo instance mới.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 120_000,
  headers: { "Content-Type": "application/json" },
});
