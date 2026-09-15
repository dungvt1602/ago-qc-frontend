"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCwIcon } from "lucide-react";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

/*
 * Thanh tiêu đề dính trên cùng của app (thay <header class="topbar"> bản
 * vanilla): logo + phụ đề bên trái, nút "Tải lại" bên phải.
 *
 * "Tải lại" không reload cả trang (mất vị trí đang thao tác, và trong webview
 * Zalo/Telegram reload rất chậm): nó chỉ đánh dấu mọi query là cũ để
 * TanStack Query gọi lại API, rồi refresh cây Server Component.
 */
export function AppHeader({ subtitle }: { subtitle: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const refresh = () => {
    queryClient.invalidateQueries();
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-3.5 py-2.5">
        <Link href={ROUTES.home} className="flex min-w-0 flex-col gap-0.5">
          <BrandMark />
          <span className="truncate text-xs text-muted-foreground">
            {subtitle}
          </span>
        </Link>
        <Button
          variant="secondary"
          size="lg"
          onClick={refresh}
          aria-label="Tải lại"
        >
          <RefreshCwIcon data-icon="inline-start" />
          Tải lại
        </Button>
      </div>
    </header>
  );
}
