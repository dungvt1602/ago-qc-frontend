import { CONTAINER_PHOTOS_PER_PDF_PAGE } from "@/features/qc/constants";
import type {
  DailySession,
  PhotoFields,
  QcFile,
  QcFileDetail,
  QcSample,
  ResultFields,
} from "@/features/qc/types/qc-file";

/* Util thuần đọc dữ liệu hồ sơ — không side-effect, dùng chung nhiều màn. */

/* Hồ sơ đã "Hoàn tất QC" → khóa mọi thao tác sửa (vẫn xuất PDF được). */
export function isQcLocked(file?: QcFile): boolean {
  return Boolean(file?.QC_DONE_AT);
}

export function hasPhoto(item: PhotoFields): boolean {
  return Boolean(item.PHOTO_URL || item.PHOTO_FILE_ID);
}

export function hasResult(item: ResultFields): boolean {
  return Boolean(item.PASS_RATE || item.FAIL_RATE || item.REMARKS);
}

/* Số ảnh đã chụp của một mẫu (hàng nhập). */
export function samplePhotoCount(sample: QcSample): number {
  return (sample.PHOTOS ?? []).filter((p) => p?.url).length;
}

/* Số ảnh đã chụp trong một đợt QC — hàng nhập đếm theo mẫu, hàng xuất theo hạng mục. */
export function sessionPhotoCount(session: DailySession): number {
  if (Array.isArray(session.samples)) {
    return session.samples.reduce((acc, s) => acc + samplePhotoCount(s), 0);
  }
  return (session.items ?? []).filter(hasPhoto).length;
}

/* Số trang PDF dự kiến: 1 trang thông tin + mỗi đợt 1 trang + ảnh container chia 9/trang. */
export function estimatedPdfPages(detail: QcFileDetail): number {
  return (
    1 +
    detail.dailySessions.length +
    Math.ceil(detail.containerItems.length / CONTAINER_PHOTOS_PER_PDF_PAGE)
  );
}

export function findSession(detail: QcFileDetail, sessionId: string) {
  return detail.dailySessions.find((s) => s.ID === sessionId);
}

export function findContainerItem(detail: QcFileDetail, photoNo: number | string) {
  return detail.containerItems.find(
    (it) => Number(it.PHOTO_NO) === Number(photoNo),
  );
}
