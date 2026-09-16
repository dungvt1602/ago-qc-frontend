"use client";

import { ROUTES } from "@/lib/constants";
import { LinkCard } from "@/features/qc/components/shared/link-card";
import { PhotoStatusBadge } from "@/features/qc/components/shared/photo-status-badge";
import type { ContainerItem } from "@/features/qc/types/qc-file";
import { hasPhoto, hasResult } from "@/features/qc/utils/qc-file";

/* Thẻ một mục ảnh container trong danh sách 21 mục. */
export function ContainerItemCard({
  qcFileId,
  item,
}: {
  qcFileId: string;
  item: ContainerItem;
}) {
  return (
    <LinkCard
      href={ROUTES.qcContainerItem(qcFileId, Number(item.PHOTO_NO))}
      title={item.ITEM_NAME_VI}
      badges={<PhotoStatusBadge hasPhoto={hasPhoto(item)} />}
    >
      <div className="text-xs text-muted-foreground">
        {item.DESCRIPTION_VI} / {item.DESCRIPTION_EN} |{" "}
        {hasResult(item) ? "Đã nhập kết quả" : "Chưa nhập kết quả"}
      </div>
    </LinkCard>
  );
}
