/*
 * Hằng số dùng chung toàn app.
 * Đường dẫn route CHỈ khai báo ở đây — không hardcode chuỗi path trong
 * feature/component (AGENTS.md Routing Rule).
 */

export const APP_NAME = "AGO QC App";
export const APP_SHORT_NAME = "AGO QC";
export const APP_DESCRIPTION = "Tạo hồ sơ QC lô hàng và xuất PDF song ngữ";
/* Phụ đề dưới logo ở header. */
export const APP_TAGLINE = "QC App - tạo hồ sơ PDF song ngữ";

/* Màu thương hiệu — dùng cho manifest PWA + thanh trạng thái điện thoại. */
export const BRAND_THEME_COLOR = "#3f7f25";
export const BRAND_BACKGROUND_COLOR = "#f6f8f3";

/*
 * Slug các đầu mục của một hồ sơ QC — mỗi đầu mục là một route con
 * `/qc/[id]/<section>` để nút Back của điện thoại/webview hoạt động đúng.
 */
export const QC_SECTION_SLUGS = [
  "info",
  "summary",
  "daily",
  "container",
  "export",
] as const;
export type QcSectionSlug = (typeof QC_SECTION_SLUGS)[number];

/* Slug loại hồ sơ trên URL tạo mới: /qc/new/import · /qc/new/export */
export type QcTypeSlug = "import" | "export";

export const ROUTES = {
  home: "/",
  qcNew: (type: QcTypeSlug) => `/qc/new/${type}`,
  qcFile: (id: string) => `/qc/${id}`,
  qcSection: (id: string, section: QcSectionSlug) => `/qc/${id}/${section}`,
  qcDailySession: (id: string, sessionId: string) =>
    `/qc/${id}/daily/${sessionId}`,
  qcDailyItem: (id: string, sessionId: string, itemCode: string) =>
    `/qc/${id}/daily/${sessionId}/${itemCode}`,
  qcContainerItem: (id: string, photoNo: number | string) =>
    `/qc/${id}/container/${photoNo}`,
} as const;
