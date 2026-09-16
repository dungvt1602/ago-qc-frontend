"use client";

import Link from "next/link";
import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiErrorState } from "@/components/shared/api-error-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { ROUTES } from "@/lib/constants";
import { QcFileCard } from "@/features/qc/components/files/qc-file-card";
import { useDeleteQcFile, useQcFiles } from "@/features/qc/hooks/use-qc-files";
import type { QcFile } from "@/features/qc/types/qc-file";

/*
 * Màn chính: danh sách hồ sơ QC + 2 nút tạo (hàng nhập / hàng xuất) + xóa
 * hồ sơ (có xác nhận). Skeleton khớp bố cục thẻ để dữ liệu về không nhảy.
 */
export function QcFilesScreen() {
  const { data, isLoading, error, refetch } = useQcFiles();
  const deleteFile = useDeleteQcFile();
  const [pendingDelete, setPendingDelete] = useState<QcFile | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <CardContent>
          <PageHeader
            title="Hồ sơ QC"
            description="Tạo hồ sơ, nhập thông tin, chụp ảnh trực tiếp và xuất PDF theo mẫu song ngữ."
          >
            <Button
              size="lg"
              className="h-10 flex-1 sm:flex-none"
              nativeButton={false}
              render={<Link href={ROUTES.qcNew("import")} />}
            >
              <PlusIcon data-icon="inline-start" />
              QC hàng nhập
            </Button>
            <Button
              size="lg"
              className="h-10 flex-1 sm:flex-none"
              nativeButton={false}
              render={<Link href={ROUTES.qcNew("export")} />}
            >
              <PlusIcon data-icon="inline-start" />
              QC hàng xuất
            </Button>
          </PageHeader>
        </CardContent>
      </Card>

      {isLoading ? (
        <QcFilesSkeleton />
      ) : error ? (
        <ApiErrorState
          error={error}
          fallback="Không tải được danh sách hồ sơ."
          onRetry={() => refetch()}
        />
      ) : data && data.length ? (
        <div className="grid gap-2.5">
          {data.map((f) => (
            <QcFileCard key={f.ID} file={f} onDelete={setPendingDelete} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-sm text-muted-foreground">
            Chưa có hồ sơ QC nào.
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Xóa hồ sơ "${pendingDelete?.LOT_CODE || pendingDelete?.QC_FILE_NO || ""}"?`}
        description={
          "Toàn bộ ngày QC, ảnh và thống kê của hồ sơ này sẽ bị xóa và KHÔNG khôi phục được."
        }
        confirmLabel="Xóa hồ sơ"
        destructive
        onConfirm={() => pendingDelete && deleteFile.mutate(pendingDelete.ID)}
      />
    </div>
  );
}

function QcFilesSkeleton() {
  return (
    <div className="grid gap-2.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="grid gap-2 rounded-xl border bg-card p-3">
          <div className="flex justify-between gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-3.5 w-full max-w-md" />
          <Skeleton className="h-7 w-24 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
