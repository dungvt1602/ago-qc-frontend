"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadPhoto } from "@/features/qc/api/qc-api";
import { qcKeys } from "@/features/qc/hooks/query-keys";
import type { CameraTarget } from "@/features/qc/types/camera";
import type { QcFile, QcFileDetail } from "@/features/qc/types/qc-file";
import { formatDateTime } from "@/features/qc/utils/format";
import { makePhotoFileName } from "@/features/qc/utils/image";
import {
  applyPhoto,
  readPhoto,
  type PhotoSnapshot,
} from "@/features/qc/utils/photo-cache";

/*
 * Upload ảnh LẠC QUAN (optimistic) — giữ cảm giác "ăn liền" của bản vanilla:
 * 1) gắn dataURL vào cache chi tiết ngay → ảnh hiện tức thì, camera đóng;
 * 2) upload chạy ngầm (`meta.silent` → không hiện viên "Đang xử lý...");
 * 3) xong → chép link thật từ kết quả vào đúng ô ảnh đó (không thay cả hồ sơ,
 *    để hai ảnh upload song song không đè nhau);
 *    lỗi → hoàn lại ảnh cũ + báo "chưa lưu được".
 */
export function usePhotoUpload(qcFile: QcFile) {
  const queryClient = useQueryClient();
  const key = qcKeys.file(qcFile.ID);

  return useMutation({
    meta: { silent: true },
    mutationFn: ({ target, dataUrl }: { target: CameraTarget; dataUrl: string }) =>
      uploadPhoto({
        qcFileId: qcFile.ID,
        target,
        dataUrl,
        capturedAt: formatDateTime(new Date()),
        fileName: makePhotoFileName(qcFile, target.title),
      }),
    onMutate: ({ target, dataUrl }) => {
      const current = queryClient.getQueryData<QcFileDetail>(key);
      if (!current) return { previous: undefined as PhotoSnapshot | undefined };
      const previous = readPhoto(current, target);
      const capturedAt = formatDateTime(new Date());
      const local: PhotoSnapshot =
        target.targetType === "sample"
          ? { kind: "sample", photo: { url: dataUrl, captured_at: capturedAt } }
          : { kind: "item", PHOTO_URL: dataUrl, CAPTURED_AT: capturedAt };
      queryClient.setQueryData<QcFileDetail>(key, applyPhoto(current, target, local));
      return { previous };
    },
    onSuccess: (updated, { target }) => {
      queryClient.setQueryData<QcFileDetail>(key, (current) =>
        current ? applyPhoto(current, target, readPhoto(updated, target)) : updated,
      );
      toast.success("Đã lưu ảnh ✓");
    },
    onError: (_err, { target }, context) => {
      if (context?.previous) {
        const previous = context.previous;
        queryClient.setQueryData<QcFileDetail>(key, (current) =>
          current ? applyPhoto(current, target, previous) : current,
        );
      }
      toast.error("Ảnh CHƯA lưu được. Hãy chụp lại.");
    },
  });
}
