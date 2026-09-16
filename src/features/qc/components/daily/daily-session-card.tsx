"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { ROUTES } from "@/lib/constants";
import { LinkCard } from "@/features/qc/components/shared/link-card";
import type { DailySession } from "@/features/qc/types/qc-file";
import { hasPhoto, hasResult, sessionPhotoCount } from "@/features/qc/utils/qc-file";

/* Thẻ một đợt QC trong danh sách: hàng nhập đếm mẫu, hàng xuất đếm hạng mục. */
export function DailySessionCard({
  qcFileId,
  session,
}: {
  qcFileId: string;
  session: DailySession;
}) {
  const href = ROUTES.qcDailySession(qcFileId, session.ID);
  const title = `QC ${session.QC_DATE}`;

  if (Array.isArray(session.samples)) {
    return (
      <LinkCard
        href={href}
        title={title}
        badges={<StatusBadge>{session.samples.length} mẫu</StatusBadge>}
      >
        <div className="text-xs text-muted-foreground">
          {sessionPhotoCount(session)} ảnh đã chụp
        </div>
      </LinkCard>
    );
  }

  const items = session.items ?? [];
  const photos = items.filter(hasPhoto).length;
  const filled = items.filter(hasResult).length;
  return (
    <LinkCard
      href={href}
      title={title}
      badges={
        <StatusBadge>
          {photos}/{items.length} ảnh
        </StatusBadge>
      }
    >
      <div className="text-xs text-muted-foreground">
        Đã nhập: {filled}/{items.length} hạng mục
      </div>
    </LinkCard>
  );
}
