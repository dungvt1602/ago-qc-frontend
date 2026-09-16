import type { AxiosRequestConfig } from "axios";
import { api } from "@/lib/api";
import type { QcApiRequest, QcApiResponse } from "@/types/common";
import type { CameraTarget } from "@/features/qc/types/camera";
import type {
  PdfVariant,
  QcFile,
  QcFileDetail,
  QcType,
} from "@/features/qc/types/qc-file";

/*
 * Lớp gọi API của module QC — nơi DUY NHẤT biết tên `action` của backend.
 * Mọi hàm đi qua `callQc`: gửi `{ action, payload }`, bóc envelope
 * `{ ok, result }`, ném Error khi `ok === false` để hook/toast báo lỗi.
 */
async function callQc<T>(
  action: string,
  payload: Record<string, unknown> = {},
  config?: AxiosRequestConfig,
): Promise<T> {
  const body: QcApiRequest = { action, payload };
  const res = await api.post<QcApiResponse<T>>("", body, config);
  const data = res.data;
  if (!data || typeof data !== "object") {
    throw new Error("API trả về dữ liệu không hợp lệ.");
  }
  if (!data.ok) {
    throw new Error(data.error || data.errorMessage || "API error");
  }
  return data.result;
}

/* ===== Hồ sơ ===== */

export function listQCFiles() {
  return callQc<QcFile[]>("listQCFiles");
}

export function getQCFile(qcFileId: string) {
  return callQc<QcFileDetail>("getQCFile", { qcFileId });
}

export type QcFileInfoPayload = Record<string, string>;

export function createQCFile(info: QcFileInfoPayload, qcType: QcType) {
  return callQc<QcFileDetail>("createQCFile", { ...info, qcType });
}

export function updateQCFile(qcFileId: string, info: QcFileInfoPayload) {
  return callQc<QcFileDetail>("updateQCFile", { ...info, qcFileId });
}

export function deleteQCFile(qcFileId: string) {
  return callQc<unknown>("deleteQCFile", { qcFileId });
}

export interface SummaryPayload {
  cumulativePassRate: string;
  cumulativeFailRate: string;
  failReason: string;
  handlingAction: string;
}

export function updateSummary(qcFileId: string, summary: SummaryPayload) {
  return callQc<QcFileDetail>("updateSummary", { ...summary, qcFileId });
}

/* ===== Đợt QC chất lượng ===== */

export function addDailyQC(qcFileId: string, qcDate: string) {
  return callQc<QcFileDetail>("addDailyQC", { qcFileId, qcDate });
}

export function updateDailyQC(dailyQcId: string, qcDate: string) {
  return callQc<QcFileDetail>("updateDailyQC", { dailyQcId, qcDate });
}

export function deleteDailyQC(dailyQcId: string) {
  return callQc<QcFileDetail>("deleteDailyQC", { dailyQcId });
}

export interface ItemResultPayload {
  passRate: string;
  failRate: string;
  remarks: string;
}

export function saveDailyQCItem(
  dailyQcId: string,
  itemCode: string,
  result: ItemResultPayload,
) {
  return callQc<QcFileDetail>("saveDailyQCItem", {
    dailyQcId,
    itemCode,
    ...result,
  });
}

/* Hàng nhập: mẫu QC */

export function addSample(dailyQcId: string) {
  return callQc<QcFileDetail>("addSample", { dailyQcId });
}

export function deleteSample(sampleId: string) {
  return callQc<QcFileDetail>("deleteSample", { sampleId });
}

/* ===== Ảnh container ===== */

export function saveContainerItem(
  qcFileId: string,
  photoNo: number,
  result: ItemResultPayload,
) {
  return callQc<QcFileDetail>("saveContainerItem", {
    qcFileId,
    photoNo,
    ...result,
  });
}

/* ===== Ảnh ===== */

export interface UploadPhotoPayload {
  qcFileId: string;
  target: CameraTarget;
  dataUrl: string;
  capturedAt: string;
  fileName: string;
}

/*
 * Body gửi kèm mọi trường của `target` (targetType, dailyQcId/itemCode,
 * photoNo, sampleId/slot) — đúng như bản vanilla để backend tự nhận dạng.
 */
export function uploadPhoto({ target, ...rest }: UploadPhotoPayload) {
  return callQc<QcFileDetail>("uploadPhoto", { ...rest, ...target });
}

export type DeletePhotoPayload =
  | { targetType: "daily"; dailyQcId: string; itemCode: string }
  | { targetType: "container"; qcFileId: string; photoNo: number }
  | { targetType: "sample"; qcFileId: string; sampleId: string; slot: number };

export function deletePhoto(payload: DeletePhotoPayload) {
  return callQc<QcFileDetail>("deletePhoto", { ...payload });
}

/* ===== PDF ===== */

export function exportPDF(qcFileId: string, variant: PdfVariant) {
  return callQc<QcFileDetail>("exportPDF", { qcFileId, variant });
}

/* ===== Hoàn tất QC (tích hợp checklist) ===== */

/* Chỉ gọi được khi `progress.complete`; backend đặt QC_DONE_AT và khóa hồ sơ. */
export function completeQC(qcFileId: string) {
  return callQc<QcFileDetail>("completeQC", { qcFileId });
}

/* Mở khóa để sửa tiếp; bên checklist sẽ thấy đơn CHƯA QC xong cho tới khi hoàn tất lại. */
export function reopenQC(qcFileId: string) {
  return callQc<QcFileDetail>("reopenQC", { qcFileId });
}
