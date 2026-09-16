"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getQCFile } from "@/features/qc/api/qc-api";
import { qcKeys } from "@/features/qc/hooks/query-keys";
import type { QcFileDetail } from "@/features/qc/types/qc-file";

/* Id hồ sơ đang mở, lấy từ segment `[id]` của URL. */
export function useQcFileId(): string {
  const { id } = useParams<{ id: string }>();
  return id;
}

/*
 * Chi tiết một hồ sơ. Một query duy nhất cho cả 5 đầu mục — mọi mutation
 * trả về bản mới thì `setQueryData` vào đúng key này, không refetch thừa.
 */
export function useQcFile(qcFileId: string) {
  return useQuery({
    queryKey: qcKeys.file(qcFileId),
    queryFn: () => getQCFile(qcFileId),
    enabled: !!qcFileId,
  });
}

/*
 * Cho các màn con bên trong `/qc/[id]`: layout cha đã chặn loading / lỗi,
 * nên ở đây chỉ cần dữ liệu (có thể undefined trong chớp mắt đầu).
 */
export function useQcFileDetail(): QcFileDetail | undefined {
  const id = useQcFileId();
  return useQcFile(id).data;
}
