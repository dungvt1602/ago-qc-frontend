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
  useSaveContainerItem,
} from "@/features/qc/hooks/use-qc-file-mutations";
import { useQcLock } from "@/features/qc/hooks/use-qc-lock";
import type { ContainerItem } from "@/features/qc/types/qc-file";
import { findContainerItem, hasPhoto } from "@/features/qc/utils/qc-file";

/* Một mục ảnh container: mô tả + ảnh + chụp / xóa ảnh + tỷ lệ + nhận xét. */
export function ContainerItemDetail() {
  const detail = useQcFileDetail();
  const { photoNo } = useParams<{ photoNo: string }>();
  if (!detail) return null;
  const item = findContainerItem(detail, photoNo);
  const backHref = ROUTES.qcSection(detail.qcFile.ID, "container");

  if (!item) {
    return (
      <SectionCard title="Không tìm thấy mục ảnh">
        <Button variant="secondary" size="lg" nativeButton={false} render={<Link href={backHref} />}>
          Quay lại ảnh container
        </Button>
      </SectionCard>
    );
  }
  return <ItemBody key={item.ID} qcFileId={detail.qcFile.ID} item={item} backHref={backHref} />;
}

function ItemBody({
  qcFileId,
  item,
  backHref,
}: {
  qcFileId: string;
  item: ContainerItem;
  backHref: string;
}) {
  const { openCamera } = useCamera();
  const no = Number(item.PHOTO_NO);
  const save = useSaveContainerItem(qcFileId, no);
  const deletePhoto = useDeletePhoto();
  const { guard } = useQcLock();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const photo = hasPhoto(item);

  return (
    <SectionCard
      title={item.ITEM_NAME_VI}
      subtitle={item.ITEM_NAME_EN}
      actions={
        <Button variant="secondary" size="lg" nativeButton={false} render={<Link href={backHref} />}>
          Quay lại ảnh container
        </Button>
      }
    >
      <div className="flex max-w-3xl flex-col gap-2.5">
        <p className="text-sm">
          {item.DESCRIPTION_VI} / {item.DESCRIPTION_EN}
        </p>
        <SavedPhoto url={item.PHOTO_URL} capturedAt={item.CAPTURED_AT} />
        <div className="flex flex-wrap gap-2">
          <Button
            size="lg"
            className="h-10"
            onClick={() =>
              openCamera({
                targetType: "container",
                photoNo: no,
                title: item.ITEM_NAME_VI,
                subtitle: item.DESCRIPTION_VI,
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
          labels={{ pass: "Tỷ lệ đạt", fail: "Tỷ lệ không đạt" }}
        />
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Xóa ảnh của mục này?"
        confirmLabel="Xóa ảnh"
        destructive
        onConfirm={() => deletePhoto.mutate({ targetType: "container", qcFileId, photoNo: no })}
      />
    </SectionCard>
  );
}
