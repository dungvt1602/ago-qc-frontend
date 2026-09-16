import { StatusBadge } from "@/components/shared/status-badge";

/* Nhãn "Đã có ảnh" (xanh) / "Chưa có ảnh" (đỏ) trên thẻ hạng mục. */
export function PhotoStatusBadge({ hasPhoto }: { hasPhoto: boolean }) {
  return (
    <StatusBadge tone={hasPhoto ? "success" : "danger"}>
      {hasPhoto ? "Đã có ảnh" : "Chưa có ảnh"}
    </StatusBadge>
  );
}
