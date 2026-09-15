"use client";

/* eslint-disable @next/next/no-img-element -- ảnh xem lại là dataURL vừa xử lý trên canvas. */

import { CameraIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Note } from "@/features/qc/components/shared/section-card";

/*
 * Popup XEM LẠI ảnh vừa chụp để chốt: "Sử dụng ảnh" (lưu) hoặc "Chụp lại".
 * Ảnh đã được đóng dấu mã lô / thời gian / hạng mục trước khi hiện ở đây.
 */
export function CameraPreviewDialog({
  open,
  title,
  subtitle,
  dataUrl,
  onRetake,
  onUse,
  onClose,
}: {
  open: boolean;
  title: string;
  subtitle: string;
  dataUrl: string;
  onRetake: () => void;
  onUse: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[96vh] overflow-auto sm:max-w-3xl" showCloseButton={false}>
        <DialogHeader className="flex-row items-start justify-between gap-2">
          <div className="min-w-0">
            <DialogTitle className="truncate">{title || "Ảnh QC"}</DialogTitle>
            <DialogDescription className="truncate">{subtitle}</DialogDescription>
          </div>
          <Button variant="destructive" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </DialogHeader>
        {dataUrl ? (
          <img
            src={dataUrl}
            alt="Ảnh vừa chụp"
            className="max-h-[68vh] w-full rounded-lg bg-neutral-900 object-contain"
          />
        ) : null}
        <div className="flex gap-2">
          <Button variant="secondary" size="lg" className="h-10 flex-1" onClick={onRetake}>
            <CameraIcon data-icon="inline-start" />
            Chụp lại
          </Button>
          <Button size="lg" className="h-10 flex-1" onClick={onUse}>
            Sử dụng ảnh
          </Button>
        </div>
        <Note>
          Bấm sẽ mở camera điện thoại để chụp. Ảnh tự ghép mã lô, thời gian,
          nhân viên QC và hạng mục trước khi lưu.
        </Note>
      </DialogContent>
    </Dialog>
  );
}
