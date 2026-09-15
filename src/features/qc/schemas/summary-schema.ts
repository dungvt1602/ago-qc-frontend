import { z } from "zod";
import type { QcSummary } from "@/features/qc/types/qc-file";

/* Form thống kê (đầu mục B): 4 ô, không bắt buộc. */
export const summarySchema = z.object({
  cumulativePassRate: z.string(),
  cumulativeFailRate: z.string(),
  failReason: z.string(),
  handlingAction: z.string(),
});

export type SummaryInput = z.infer<typeof summarySchema>;

export function summaryToInput(summary?: QcSummary): SummaryInput {
  return {
    cumulativePassRate: summary?.CUMULATIVE_PASS_RATE ?? "",
    cumulativeFailRate: summary?.CUMULATIVE_FAIL_RATE ?? "",
    failReason: summary?.FAIL_REASON ?? "",
    handlingAction: summary?.HANDLING_ACTION ?? "",
  };
}
