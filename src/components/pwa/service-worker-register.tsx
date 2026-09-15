"use client";

import { useEffect } from "react";

/*
 * Đăng ký service worker (public/sw.js) để app CÀI ĐƯỢC như app trên màn
 * hình chính điện thoại (PWA). SW chỉ chuyển tiếp request ra mạng, không
 * cache → luôn lấy bản mới nhất. Render null — chỉ là side-effect.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
