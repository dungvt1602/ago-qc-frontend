import { z } from "zod";

/* Form thêm / sửa đợt QC: chỉ có ngày QC. */
export const dailySessionSchema = z.object({
  qcDate: z.string().min(1, "Vui lòng chọn ngày QC"),
});

export type DailySessionInput = z.infer<typeof dailySessionSchema>;
