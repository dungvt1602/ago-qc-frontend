"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useQcFileDetail } from "@/features/qc/hooks/use-qc-file";
import { isQcLocked } from "@/features/qc/utils/qc-file";

export const QC_LOCKED_MESSAGE =
  'Hồ sơ đã Hoàn tất QC nên đang khóa. Vào "Tổng quan" bấm "Mở lại" nếu cần sửa.';

/*
 * Khóa sửa khi hồ sơ đã Hoàn tất QC (bản vanilla: `guardLocked()`).
 *
 * Gọi `guard()` ở ĐẦU mọi handler sửa (lưu thông tin / thống kê, thêm-xóa đợt
 * & mẫu, lưu hạng mục, xóa ảnh): trả `true` + toast báo khóa thì dừng ngay,
 * không bắn mutation. Mở camera được chặn tập trung trong CameraProvider.
 * Backend cũng chặn lần nữa — lớp này chỉ để người dùng hiểu vì sao không sửa được.
 *
 * Xuất PDF và xóa hồ sơ KHÔNG bị khóa.
 */
export function useQcLock() {
  const detail = useQcFileDetail();
  const locked = isQcLocked(detail?.qcFile);
  const guard = useCallback(() => {
    if (!locked) return false;
    toast.error(QC_LOCKED_MESSAGE);
    return true;
  }, [locked]);
  return { locked, guard };
}
