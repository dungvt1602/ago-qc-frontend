"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import { makeQueryClient } from "@/lib/query-client";

/*
 * Provider cấp app, mount một lần ở root layout:
 * TanStack Query (server state), devtools (chỉ dev) và Toaster của sonner.
 * QueryClient tạo trong useState để mỗi phiên trình duyệt có đúng một client
 * (an toàn với React strict mode / RSC streaming).
 *
 * Toast đặt top-center: app dùng một tay trên điện thoại, thông báo hiện
 * ngay dưới thanh tiêu đề như bản vanilla, không che nút thao tác ở đáy.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-center" richColors closeButton />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
