"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { CameraIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ROUTES } from "@/lib/constants";
import { useCamera } from "@/features/qc/components/camera/camera-provider";
import { ItemResultForm } from "@/features/qc/components/shared/item-result-form";
import { SavedPhoto } from "@/features/qc/components/shared/saved-photo";
import { SectionCard } from "@/features/qc/components/shared/section-card";
import { useQcFileDetail } from "@/features/qc/hooks/use-qc-file";
import {
  useDeletePhoto,
  useSaveDailyItem,
} from "@/features/qc/hooks/use-qc-file-mutations";
import { useQcLock } from "@/features/qc/hooks/use-qc-lock";
import type { DailyItem, DailySession } from "@/features/qc/types/qc-file";
import { findSession, hasPhoto } from "@/features/qc/utils/qc-file";

/* Một hạng mục QC (hàng xuất): ảnh + chụp / xóa ảnh + tỷ lệ + nhận xét. */
export function DailyItemDetail() {
  const detail = useQcFileDetail();
  const { sessionId, itemCode } = useParams<{ sessionId: string; itemCode: string }>();
  if (!detail) return null;
  const session = findSession(detail, sessionId);
  const item = session?.items?.find((x) => x.ITEM_CODE === itemCode);
  const backHref = ROUTES.qcDailySession(detail.qcFile.ID, sessionId);

  if (!session || !item) {
    return (
      <SectionCard title="Không tìm thấy hạng mục">
        <Button variant="secondary" size="lg" nativeButton={false} render={<Link href={backHref} />}>
          Quay lại hạng mục
        </Button>
      </SectionCard>
    );
  }
  return <ItemBody key={item.ID} session={session} item={item} backHref={backHref} />;
}

function ItemBody({
  session,
  item,
  backHref,
}: {
  session: DailySession;
  item: DailyItem;
  backHref: string;
}) {
  const { openCamera } = useCamera();
  const save = useSaveDailyItem(session.ID, item.ITEM_CODE);
  const deletePhoto = useDeletePhoto();
  const { guard } = useQcLock();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const photo = hasPhoto(item);

  return (
    <SectionCard
      title={item.ITEM_NAME_VI}
      subtitle={`${item.ITEM_NAME_EN} | QC ${session.QC_DATE}`}
      actions={
        <Button variant="secondary" size="lg" nativeButton={false} render={<Link href={backHref} />}>
          Quay lại hạng mục
        </Button>
      }
    >
      <div className="flex max-w-3xl flex-col gap-2.5">
        <SavedPhoto url={item.PHOTO_URL} capturedAt={item.CAPTURED_AT} />
        <div className="flex flex-wrap gap-2">
          <Button
            size="lg"
            className="h-10"
            onClick={() =>
              openCamera({
                targetType: "daily",
                dailyQcId: session.ID,
                itemCode: item.ITEM_CODE,
                title: item.ITEM_NAME_VI,
                subtitle: `QC ${session.QC_DATE}`,
              })
            }
          >
            <CameraIcon data-icon="inline-start" />
            {photo ? "Chụp lại" : "Chụp ảnh mục này"}
          </Button>
          {photo ? (
            <Button
              variant="destructive"
              size="lg"
              className="h-10"
              onClick={() => !guard() && setConfirmDelete(true)}
            >
              <Trash2Icon data-icon="inline-start" />
              Xóa ảnh
            </Button>
          ) : null}
        </div>
        <ItemResultForm
          item={item}
          saving={save.isPending}
          onSubmit={(v) => !guard() && save.mutate(v)}
        />
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Xóa ảnh của mục này?"
        confirmLabel="Xóa ảnh"
        destructive
        onConfirm={() =>
          deletePhoto.mutate({
            targetType: "daily",
            dailyQcId: session.ID,
            itemCode: item.ITEM_CODE,
          })
        }
      />
    </SectionCard>
  );
}
