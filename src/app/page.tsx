import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { APP_DESCRIPTION } from "@/lib/constants";

/*
 * Trang chủ của nền Next.js. Tính năng hồ sơ QC (danh sách, tạo, chi tiết,
 * chụp ảnh, xuất PDF) được dựng trong features/qc ở nhánh tính năng.
 */
export default function HomePage() {
  return (
    <AppShell subtitle="QC App - tạo hồ sơ PDF song ngữ">
      <div className="flex flex-col gap-3">
        <Card>
          <CardContent>
            <PageHeader title="AGO QC App" description={APP_DESCRIPTION} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-sm text-muted-foreground">
            Nền Next.js đã sẵn sàng. Màn hình hồ sơ QC sẽ xuất hiện ở đây.
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
