"use client";

import { useIsMutating } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";

/*
 * Viên trạng thái nổi ở đáy màn (thay showLoader() bản vanilla): chấm xoay +
 * câu ngắn. Dùng cho mọi việc "đang chờ" — mutation, xử lý ảnh...
 */
export function PendingPill({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 left-1/2 z-60 flex -translate-x-1/2 items-center gap-2 rounded-full bg-neutral-900 px-4 py-2.5 text-[13px] font-medium whitespace-nowrap text-white shadow-lg"
    >
      <Loader2Icon className="size-4 animate-spin" />
      {label}
    </div>
  );
}

/*
 * Tự hiện "Đang xử lý..." khi có mutation đang chạy và tự ẩn khi xong —
 * component không cần gọi show/hide. Mutation chạy ngầm (vd upload ảnh
 * lạc quan) khai `meta: { silent: true }` để không hiện viên này.
 */
export function PendingIndicator() {
  const pending = useIsMutating({
    predicate: (mutation) => !mutation.options.meta?.silent,
  });
  if (!pending) return null;
  return <PendingPill label="Đang xử lý..." />;
}
