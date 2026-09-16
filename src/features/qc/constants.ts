import type { QcSectionSlug } from "@/lib/constants";
import type { QcType } from "@/features/qc/types/qc-file";

/*
 * Hằng số nghiệp vụ của module QC.
 */

/*
 * Nén ảnh trước khi gửi lên backend. Mục tiêu: ảnh đủ rõ để làm hồ sơ QC,
 * nhưng PDF không quá nặng.
 *
 * 1024px / JPEG 0.72 là đúng cỡ ảnh mà bản PDF cũ (Chrome) từng thu nhỏ rồi in;
 * backend giờ nhúng NGUYÊN ảnh trong Storage vào PDF (không thu nhỏ nữa), nên
 * kích thước ảnh lúc chụp quyết định thẳng dung lượng PDF (~130KB/ảnh).
 * Ô ảnh trên A4 chỉ ~6cm nên 1024px vẫn dư nét. (Trước đây: 1280 / 0.7.)
 */
export const PHOTO_MAX_SIDE = 1024;
export const PHOTO_JPEG_QUALITY = 0.72;
/* Quá thời gian này coi như webview xử lý ảnh bị treo → báo chụp lại. */
export const PHOTO_PROCESS_TIMEOUT_MS = 30_000;

/* Hàng nhập: mỗi mẫu QC có đúng 4 ô ảnh. */
export const SAMPLE_PHOTO_SLOTS = 4;

/* PDF: mỗi 9 ảnh container tự chia thành một trang. */
export const CONTAINER_PHOTOS_PER_PDF_PAGE = 9;

export const QC_TYPE_LABEL: Record<QcType, string> = {
  IMPORT: "Hàng nhập",
  EXPORT: "Hàng xuất",
};

export interface QcSectionDef {
  slug: QcSectionSlug;
  vi: string;
  en: string;
}

const SECTION_DEFS: Record<QcSectionSlug, Omit<QcSectionDef, "slug">> = {
  info: { vi: "Thông tin lô hàng", en: "Lot information" },
  summary: { vi: "Thống kê", en: "Summary" },
  daily: { vi: "QC chất lượng", en: "Quality check" },
  container: { vi: "Hình ảnh container", en: "Container photos" },
  export: { vi: "Xuất PDF", en: "Export PDF" },
};

/*
 * Thứ tự đầu mục theo loại hồ sơ. Hàng nhập đưa "Hình ảnh container" lên
 * trước "QC chất lượng" (hàng về là chụp cont trước). Chữ cái A–E gắn theo
 * thứ tự này.
 */
const SECTION_ORDER: Record<QcType, QcSectionSlug[]> = {
  IMPORT: ["info", "summary", "container", "daily", "export"],
  EXPORT: ["info", "summary", "daily", "container", "export"],
};

export function sectionsFor(type: QcType): (QcSectionDef & { letter: string })[] {
  return SECTION_ORDER[type].map((slug, i) => ({
    slug,
    letter: String.fromCharCode(65 + i),
    ...SECTION_DEFS[slug],
  }));
}

/* Tiêu đề "A. Thông tin lô hàng / Lot information" của một đầu mục. */
export function sectionTitle(type: QcType, slug: QcSectionSlug): string {
  const s = sectionsFor(type).find((x) => x.slug === slug);
  return s ? `${s.letter}. ${s.vi} / ${s.en}` : SECTION_DEFS[slug].vi;
}
