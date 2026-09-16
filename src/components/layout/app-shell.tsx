import { AppHeader } from "@/components/layout/app-header";
import { PendingIndicator } from "@/components/shared/pending-indicator";

/*
 * Khung app dùng chung cho mọi màn: header dính + vùng nội dung tối đa
 * 1100px (giữ đúng bề rộng bản vanilla) + chỉ báo "Đang xử lý..." nổi ở đáy
 * khi có mutation đang chạy. <main> là flex-col để màn lỗi / 404 có thể
 * căn giữa bằng flex-1.
 */
export function AppShell({
  subtitle,
  children,
}: {
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader subtitle={subtitle} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-3 pt-3.5 pb-12 sm:px-3.5">
        {children}
      </main>
      <PendingIndicator />
    </div>
  );
}
