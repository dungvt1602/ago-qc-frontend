"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/api-error";
import { deleteQCFile, listQCFiles } from "@/features/qc/api/qc-api";
import { qcKeys } from "@/features/qc/hooks/query-keys";

/* Danh sách hồ sơ QC (màn chính). */
export function useQcFiles() {
  return useQuery({
    queryKey: qcKeys.files(),
    queryFn: listQCFiles,
  });
}

/*
 * Xóa hồ sơ: bỏ cache chi tiết của nó rồi tải lại danh sách. Backend không
 * trả gì hữu ích sau khi xóa nên refetch danh sách là nguồn sự thật.
 */
export function useDeleteQcFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (qcFileId: string) => deleteQCFile(qcFileId),
    onSuccess: async (_, qcFileId) => {
      queryClient.removeQueries({ queryKey: qcKeys.file(qcFileId) });
      await queryClient.invalidateQueries({ queryKey: qcKeys.files() });
      toast.success("Đã xóa hồ sơ.");
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Không xóa được hồ sơ.")),
  });
}
