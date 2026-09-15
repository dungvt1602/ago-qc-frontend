/*
 * Hợp đồng API toàn cục — ĐIỂM CHỐT DUY NHẤT giữa frontend và backend QC.
 *
 * Backend QC nhận một endpoint POST duy nhất với body `{ action, payload }`
 * và trả về envelope `{ ok, result }` hoặc `{ ok: false, error }`.
 * Backend đổi envelope → sửa file này trước.
 */

export interface QcApiRequest<TPayload = Record<string, unknown>> {
  action: string;
  payload: TPayload;
}

export type QcApiResponse<T> =
  | { ok: true; result: T }
  | { ok: false; error?: string; errorMessage?: string };
