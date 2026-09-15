/*
 * Hằng số dùng chung toàn app.
 * Đường dẫn route CHỈ khai báo ở đây — không hardcode chuỗi path trong
 * feature/component (AGENTS.md Routing Rule).
 */

export const APP_NAME = "AGO QC App";
export const APP_SHORT_NAME = "AGO QC";
export const APP_DESCRIPTION = "Tạo hồ sơ QC lô hàng và xuất PDF song ngữ";

/* Màu thương hiệu — dùng cho manifest PWA + thanh trạng thái điện thoại. */
export const BRAND_THEME_COLOR = "#3f7f25";
export const BRAND_BACKGROUND_COLOR = "#f6f8f3";

export const ROUTES = {
  home: "/",
} as const;
