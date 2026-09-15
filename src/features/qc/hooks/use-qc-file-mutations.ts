"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/api-error";
import {
  addDailyQC,
  addSample,
  createQCFile,
  deleteDailyQC,
  deletePhoto,
  deleteSample,
  exportPDF,
  saveContainerItem,
  saveDailyQCItem,
  updateDailyQC,
  updateQCFile,
  updateSummary,
  type DeletePhotoPayload,
  type ItemResultPayload,
  type QcFileInfoPayload,
  type SummaryPayload,
} from "@/features/qc/api/qc-api";
import { qcKeys } from "@/features/qc/hooks/query-keys";
import type {
  PdfVariant,
  QcFileDetail,
  QcType,
} from "@/features/qc/types/qc-file";

/*
 * Khung chung cho mọi mutation TRẢ VỀ bản hồ sơ mới (backend QC luôn trả
 * cả QcFileDetail sau mỗi thao tác):
 *  - ghi thẳng vào cache chi tiết (`setQueryData`) → màn cập nhật tức thì,
 *    không refetch;
 *  - `invalidateList` khi thao tác đổi thông tin hiện trên thẻ danh sách
 *    (tên hàng, PO, NCC, link PDF);
 *  - toast thành công / lỗi một giọng cho cả module.
 */
function useDetailMutation<TVars>({
  mutationFn,
  successMessage,
  errorFallback,
  invalidateList = false,
  onSuccess,
}: {
  mutationFn: (vars: TVars) => Promise<QcFileDetail>;
  successMessage: string | ((detail: QcFileDetail, vars: TVars) => string);
  errorFallback: string;
  invalidateList?: boolean;
  onSuccess?: (detail: QcFileDetail, vars: TVars) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (detail, vars) => {
      queryClient.setQueryData(qcKeys.file(detail.qcFile.ID), detail);
      if (invalidateList) {
        queryClient.invalidateQueries({ queryKey: qcKeys.files() });
      }
      toast.success(
        typeof successMessage === "function"
          ? successMessage(detail, vars)
          : successMessage,
      );
      onSuccess?.(detail, vars);
    },
    onError: (err) => toast.error(apiErrorMessage(err, errorFallback)),
  });
}

/* ===== Hồ sơ ===== */

export function useCreateQcFile(onCreated: (detail: QcFileDetail) => void) {
  return useDetailMutation({
    mutationFn: ({ info, qcType }: { info: QcFileInfoPayload; qcType: QcType }) =>
      createQCFile(info, qcType),
    successMessage: "Đã tạo hồ sơ QC.",
    errorFallback: "Không tạo được hồ sơ.",
    invalidateList: true,
    onSuccess: onCreated,
  });
}

export function useUpdateQcFileInfo(qcFileId: string) {
  return useDetailMutation({
    mutationFn: (info: QcFileInfoPayload) => updateQCFile(qcFileId, info),
    successMessage: "Đã lưu thông tin lô hàng.",
    errorFallback: "Không lưu được thông tin lô hàng.",
    invalidateList: true,
  });
}

export function useUpdateSummary(qcFileId: string) {
  return useDetailMutation({
    mutationFn: (summary: SummaryPayload) => updateSummary(qcFileId, summary),
    successMessage: "Đã lưu thống kê.",
    errorFallback: "Không lưu được thống kê.",
  });
}

/* ===== Đợt QC chất lượng ===== */

export function useAddDailySession(qcFileId: string) {
  return useDetailMutation({
    mutationFn: (qcDate: string) => addDailyQC(qcFileId, qcDate),
    successMessage: "Đã thêm đợt QC.",
    errorFallback: "Không thêm được đợt QC.",
  });
}

export function useUpdateDailySession(dailyQcId: string) {
  return useDetailMutation({
    mutationFn: (qcDate: string) => updateDailyQC(dailyQcId, qcDate),
    successMessage: "Đã lưu sửa phiên QC.",
    errorFallback: "Không lưu được phiên QC.",
  });
}

export function useDeleteDailySession(onDeleted?: () => void) {
  return useDetailMutation({
    mutationFn: (dailyQcId: string) => deleteDailyQC(dailyQcId),
    successMessage: "Đã xóa phiên QC.",
    errorFallback: "Không xóa được phiên QC.",
    onSuccess: onDeleted,
  });
}

export function useSaveDailyItem(dailyQcId: string, itemCode: string) {
  return useDetailMutation({
    mutationFn: (result: ItemResultPayload) =>
      saveDailyQCItem(dailyQcId, itemCode, result),
    successMessage: "Đã lưu hạng mục QC.",
    errorFallback: "Không lưu được hạng mục QC.",
  });
}

export function useAddSample() {
  return useDetailMutation({
    mutationFn: (dailyQcId: string) => addSample(dailyQcId),
    successMessage: "Đã thêm mẫu.",
    errorFallback: "Không thêm được mẫu.",
  });
}

export function useDeleteSample() {
  return useDetailMutation({
    mutationFn: (sampleId: string) => deleteSample(sampleId),
    successMessage: "Đã xóa mẫu.",
    errorFallback: "Không xóa được mẫu.",
  });
}

/* ===== Ảnh container ===== */

export function useSaveContainerItem(qcFileId: string, photoNo: number) {
  return useDetailMutation({
    mutationFn: (result: ItemResultPayload) =>
      saveContainerItem(qcFileId, photoNo, result),
    successMessage: "Đã lưu mục container.",
    errorFallback: "Không lưu được mục container.",
  });
}

/* ===== Ảnh ===== */

export function useDeletePhoto() {
  return useDetailMutation({
    mutationFn: (payload: DeletePhotoPayload) => deletePhoto(payload),
    successMessage: "Đã xóa ảnh.",
    errorFallback: "Không xóa được ảnh.",
  });
}

/* ===== PDF ===== */

/*
 * Xuất PDF rồi thử mở tab mới. Popup có thể bị chặn vì mở sau một lượt
 * await — link "Mở bản ..." trên màn vẫn dùng được.
 */
export function useExportPdf(qcFileId: string) {
  return useDetailMutation({
    mutationFn: (variant: PdfVariant) => exportPDF(qcFileId, variant),
    successMessage: (_, variant) =>
      variant === "en"
        ? 'Đã tạo PDF khách hàng. Bấm "Mở bản khách hàng" để xem/tải.'
        : 'Đã tạo PDF nội bộ. Bấm "Mở bản nội bộ" để xem/tải.',
    errorFallback: "Không tạo được PDF.",
    invalidateList: true,
    onSuccess: (detail, variant) => {
      const url =
        variant === "en" ? detail.qcFile.PDF_URL_EN : detail.qcFile.PDF_URL;
      if (url) window.open(url, "_blank");
    },
  });
}
