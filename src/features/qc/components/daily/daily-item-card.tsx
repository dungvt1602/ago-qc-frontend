"use client";

import { ROUTES } from "@/lib/constants";
import { LinkCard } from "@/features/qc/components/shared/link-card";
import { PhotoStatusBadge } from "@/features/qc/components/shared/photo-status-badge";
import type { DailyItem } from "@/features/qc/types/qc-file";
import { hasPhoto, hasResult } from "@/features/qc/utils/qc-file";

/* Thẻ một hạng mục QC (hàng xuất) trong một đợt. */
export function DailyItemCard({
  qcFileId,
  sessionId,
  item,
}: {
  qcFileId: string;
  sessionId: string;
  item: DailyItem;
}) {
  return (
    <LinkCard
      href={ROUTES.qcDailyItem(qcFileId, sessionId, item.ITEM_CODE)}
      title={item.ITEM_NAME_VI}
      badges={<PhotoStatusBadge hasPhoto={hasPhoto(item)} />}
    >
      <div className="text-xs text-muted-foreground">
        {item.ITEM_NAME_EN} | {hasResult(item) ? "Đã nhập kết quả" : "Chưa nhập kết quả"}
      </div>
    </LinkCard>
  );
}
