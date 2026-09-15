import { z } from "zod";
import type { ResultFields } from "@/features/qc/types/qc-file";

/*
 * Kết quả một hạng mục (QC ngày hoặc ảnh container): tỷ lệ đạt / không đạt /
 * nhận xét. Tỷ lệ để chuỗi tự do (QC ghi "95%", "5/100", "đạt"...) như bản cũ.
 */
export const itemResultSchema = z.object({
  passRate: z.string(),
  failRate: z.string(),
  remarks: z.string(),
});

export type ItemResultInput = z.infer<typeof itemResultSchema>;

export function resultToInput(item?: ResultFields): ItemResultInput {
  return {
    passRate: item?.PASS_RATE ?? "",
    failRate: item?.FAIL_RATE ?? "",
    remarks: item?.REMARKS ?? "",
  };
}
