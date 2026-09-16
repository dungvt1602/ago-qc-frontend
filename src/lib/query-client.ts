import { QueryClient } from "@tanstack/react-query";
import { apiStatus } from "@/lib/api-error";

/*
 * Cấu hình TanStack Query.
 * - staleTime 30s: mở lại màn trong 30s không gọi lại API (QC thao tác nhanh
 *   qua lại giữa các đầu mục).
 * - retry 1 lần cho lỗi tạm thời (mạng chập chờn trong kho); KHÔNG retry
 *   401/403 vì gọi lại cũng bị từ chối y hệt.
 * - Không refetch khi focus lại tab: trong webview Zalo/Telegram tab đổi
 *   focus liên tục khi mở camera, refetch lúc đó chỉ tốn mạng.
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => {
          const status = apiStatus(error);
          if (status === 401 || status === 403) return false;
          return failureCount < 1;
        },
        refetchOnWindowFocus: false,
      },
    },
  });
}
