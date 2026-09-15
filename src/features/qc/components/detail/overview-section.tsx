"use client";

import { Note, SectionCard } from "@/features/qc/components/shared/section-card";
import { useQcFileDetail } from "@/features/qc/hooks/use-qc-file";
import {
  estimatedPdfPages,
  hasPhoto,
  sessionPhotoCount,
} from "@/features/qc/utils/qc-file";

/* Màn tổng quan (mặc định khi mở hồ sơ): 4 ô đếm nhanh. */
export function OverviewSection() {
  const detail = useQcFileDetail();
  if (!detail) return null;

  const dailyCount = detail.dailySessions.length;
  const dailyPhotoCount = detail.dailySessions.reduce(
    (acc, s) => acc + sessionPhotoCount(s),
    0,
  );
  const containerPhotoCount = detail.containerItems.filter(hasPhoto).length;

  const boxes: [number, string][] = [
    [dailyCount, "phiên QC"],
    [dailyPhotoCount, "ảnh QC hàng ngày"],
    [containerPhotoCount, "ảnh container"],
    [estimatedPdfPages(detail), "trang PDF dự kiến"],
  ];

  return (
    <SectionCard title="Tổng quan hồ sơ">
      <div className="grid gap-2.5 sm:grid-cols-4">
        {boxes.map(([n, label]) => (
          <div
            key={label}
            className="grid gap-1 rounded-xl border bg-[#f4f8ef] p-3.5"
          >
            <b className="text-2xl leading-none text-primary">{n}</b>
            <span className="text-xs font-bold text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
      <Note>
        Bấm từng đầu mục phía trên để nhập thông tin, thêm ngày QC, chụp ảnh hoặc xuất PDF.
      </Note>
    </SectionCard>
  );
}
