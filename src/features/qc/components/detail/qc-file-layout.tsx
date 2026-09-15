"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { ApiErrorState } from "@/components/shared/api-error-state";
import { CameraProvider } from "@/features/qc/components/camera/camera-provider";
import { QcFileHeader } from "@/features/qc/components/detail/qc-file-header";
import { StepMenu } from "@/features/qc/components/detail/step-menu";
import { useQcFile, useQcFileId } from "@/features/qc/hooks/use-qc-file";

/*
 * Khung chung của mọi màn trong `/qc/[id]`: tải chi tiết hồ sơ MỘT lần,
 * chặn loading / lỗi ở đây, rồi vẽ header + menu đầu mục cố định phía trên
 * màn con. CameraProvider bọc ngoài để màn con nào cũng mở được camera.
 */
export function QcFileLayout({ children }: { children: React.ReactNode }) {
  const id = useQcFileId();
  const { data, isLoading, error, refetch } = useQcFile(id);

  if (isLoading) return <QcFileLayoutSkeleton />;
  if (error || !data) {
    return (
      <ApiErrorState
        error={error}
        fallback="Không tải được hồ sơ QC."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <CameraProvider qcFile={data.qcFile}>
      <div className="flex flex-col gap-3">
        <QcFileHeader file={data.qcFile} />
        <StepMenu qcFileId={data.qcFile.ID} qcType={data.qcFile.QC_TYPE} />
        {children}
      </div>
    </CameraProvider>
  );
}

function QcFileLayoutSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2.5 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="flex justify-between gap-2">
          <div className="grid gap-1.5">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-3.5 w-64" />
          </div>
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
      <div className="flex flex-col gap-2.5 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <Skeleton className="h-5 w-48" />
        <div className="grid gap-2 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[58px] rounded-lg sm:h-[68px]" />
          ))}
        </div>
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}
