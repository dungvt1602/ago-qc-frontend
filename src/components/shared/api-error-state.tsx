"use client";

import { Button } from "@/components/ui/button";
import { apiErrorMessage } from "@/lib/api-error";

/*
 * Khung báo lỗi tải dữ liệu của một màn, thống nhất toàn app: câu lỗi đọc
 * được + nút thử lại. Không bao giờ để màn trắng hay crash khi backend tắt.
 */
export function ApiErrorState({
  error,
  fallback,
  onRetry,
}: {
  error: unknown;
  /** Câu hiển thị khi backend không gửi message nào. */
  fallback: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
    >
      <span>{apiErrorMessage(error, fallback)}</span>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Thử lại
        </Button>
      ) : null}
    </div>
  );
}
