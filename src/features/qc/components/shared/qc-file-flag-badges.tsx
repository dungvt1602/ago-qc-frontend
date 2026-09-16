import { StatusBadge } from "@/components/shared/status-badge";
import type { QcFile } from "@/features/qc/types/qc-file";
import { isQcLocked } from "@/features/qc/utils/qc-file";

/*
 * Nhãn cờ tích hợp checklist (bản vanilla: `orderPill` + `donePill`):
 *  - "Đơn #N"     khi hồ sơ liên kết với một đơn bên checklist;
 *  - "🔒 QC xong"  khi đã Hoàn tất QC (hồ sơ đang khóa).
 * Mỗi nhãn render null khi không áp dụng.
 */
export function OrderBadge({ file }: { file: QcFile }) {
  const id = file.ORDER_ID;
  if (id === undefined || id === null || id === "") return null;
  return <StatusBadge>Đơn #{String(id)}</StatusBadge>;
}

export function DoneBadge({ file }: { file: QcFile }) {
  if (!isQcLocked(file)) return null;
  return <StatusBadge tone="success">🔒 QC xong</StatusBadge>;
}

/* Cả hai nhãn — dùng ở thẻ danh sách và header chi tiết. */
export function QcFileFlagBadges({ file }: { file: QcFile }) {
  return (
    <>
      <OrderBadge file={file} />
      <DoneBadge file={file} />
    </>
  );
}
