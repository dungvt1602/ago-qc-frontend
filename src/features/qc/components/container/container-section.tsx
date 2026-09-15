"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { ContainerItemCard } from "@/features/qc/components/container/container-item-card";
import { Note, SectionCard } from "@/features/qc/components/shared/section-card";
import { useQcFileDetail } from "@/features/qc/hooks/use-qc-file";

/* Đầu mục ảnh giao hàng / container: danh sách 21 mục ảnh. */
export function ContainerSection() {
  const detail = useQcFileDetail();
  if (!detail) return null;

  return (
    <SectionCard
      title="Hình ảnh giao hàng - Container"
      actions={
        <Button
          variant="secondary"
          size="lg"
          nativeButton={false}
          render={<Link href={ROUTES.qcFile(detail.qcFile.ID)} />}
        >
          Về đầu mục
        </Button>
      }
    >
      <Note>
        Chọn từng đầu mục ảnh để mở màn hình chụp/nhập riêng. Mỗi 9 ảnh sẽ tự chia thành
        một trang trong PDF.
      </Note>
      <div className="grid gap-2.5">
        {detail.containerItems.map((it) => (
          <ContainerItemCard key={it.ID} qcFileId={detail.qcFile.ID} item={it} />
        ))}
      </div>
    </SectionCard>
  );
}
