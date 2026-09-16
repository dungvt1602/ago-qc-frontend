"use client";

import { Button } from "@/components/ui/button";

/*
 * Error boundary toàn cục — lỗi render bất ngờ hiện màn phục hồi thân thiện
 * thay vì trang trắng.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-lg font-semibold">Đã có lỗi xảy ra</p>
      <p className="max-w-md text-sm text-muted-foreground">{error.message}</p>
      <Button size="lg" onClick={reset}>
        Thử lại
      </Button>
    </div>
  );
}
