import { isAxiosError } from "axios";

/*
 * Đọc lỗi API ở MỘT chỗ duy nhất — mọi màn báo lỗi cùng một giọng.
 *
 * Backend QC trả JSON dạng `{ ok: false, error: "..." }` (đôi khi
 * `errorMessage`). Lỗi mạng / timeout không có response → câu chung.
 * Lỗi do tầng api ném ra (`Error` thường) thì lấy message của nó.
 */

export function apiStatus(err: unknown): number | undefined {
  return isAxiosError(err) ? err.response?.status : undefined;
}

type BackendErrorBody = {
  error?: string;
  errorMessage?: string;
  message?: string;
};

/* Câu báo lỗi backend gửi kèm, nếu có. */
export function apiMessage(err: unknown): string | undefined {
  if (isAxiosError(err)) {
    const data = err.response?.data as BackendErrorBody | string | undefined;
    if (data && typeof data === "object") {
      return data.error || data.errorMessage || data.message || undefined;
    }
    if (err.code === "ECONNABORTED") {
      return "Máy chủ phản hồi quá lâu. Vui lòng thử lại.";
    }
    if (!err.response) {
      return "Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.";
    }
    return `Lỗi máy chủ (HTTP ${err.response.status}).`;
  }
  if (err instanceof Error && err.message) return err.message;
  return undefined;
}

export function apiErrorMessage(err: unknown, fallback: string): string {
  return apiMessage(err) ?? fallback;
}
