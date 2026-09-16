"use client";

import { CameraIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SAMPLE_PHOTO_SLOTS } from "@/features/qc/constants";
import { useCamera } from "@/features/qc/components/camera/camera-provider";
import { PhotoThumb } from "@/features/qc/components/shared/saved-photo";
import type { QcSample } from "@/features/qc/types/qc-file";
import { samplePhotoCount } from "@/features/qc/utils/qc-file";

/*
 * Mẫu QC (hàng nhập): 4 ô ảnh, mỗi ô có nút chụp / chụp lại / xóa.
 * Giao diện thuần — xóa ảnh & xóa mẫu trao cho cha.
 */
export function SampleCard({
  sample,
  onDeleteSample,
  onDeletePhoto,
}: {
  sample: QcSample;
  onDeleteSample: (sample: QcSample) => void;
  onDeletePhoto: (sample: QcSample, slot: number) => void;
}) {
  const { openCamera } = useCamera();
  const photos = sample.PHOTOS ?? [];

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center justify-between gap-2 bg-accent px-2.5 py-2 font-bold text-primary">
        <span>
          Mẫu {sample.SAMPLE_NO}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            ({samplePhotoCount(sample)}/{SAMPLE_PHOTO_SLOTS} ảnh)
          </span>
        </span>
        <Button variant="destructive" size="sm" onClick={() => onDeleteSample(sample)}>
          <Trash2Icon data-icon="inline-start" />
          Xóa mẫu
        </Button>
      </div>
      <div className="grid gap-2 p-2.5 sm:grid-cols-2">
        {Array.from({ length: SAMPLE_PHOTO_SLOTS }, (_, i) => {
          const slot = i + 1;
          const p = photos[i];
          const has = Boolean(p?.url);
          return (
            <div key={slot} className="rounded-lg border bg-card p-2">
              <div className="pb-1.5 text-xs font-bold text-[#31411f]">Ảnh {slot}</div>
              <PhotoThumb url={p?.url} alt={`Ảnh ${slot}`} />
              <div className="flex gap-2 pt-1.5">
                <Button
                  size="sm"
                  onClick={() =>
                    openCamera({
                      targetType: "sample",
                      sampleId: sample.ID,
                      slot,
                      title: `Mẫu ${sample.SAMPLE_NO} - Ảnh ${slot}`,
                      subtitle: "",
                    })
                  }
                >
                  <CameraIcon data-icon="inline-start" />
                  {has ? "Chụp lại" : "Chụp"}
                </Button>
                {has ? (
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    aria-label="Xóa ảnh"
                    onClick={() => onDeletePhoto(sample, slot)}
                  >
                    <Trash2Icon />
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
