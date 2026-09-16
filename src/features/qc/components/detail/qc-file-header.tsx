"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ROUTES } from "@/lib/constants";
import { QC_TYPE_LABEL } from "@/features/qc/constants";
import { QcFileFlagBadges } from "@/features/qc/components/shared/qc-file-flag-badges";
import type { QcFile } from "@/features/qc/types/qc-file";

/* Thẻ đầu trang chi tiết: mã lô, mã hồ sơ, nhãn loại / cờ đơn & QC xong / trạng thái / số ngày / kho, link PDF. */
export function QcFileHeader({ file }: { file: QcFile }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-heading text-xl leading-tight font-semibold text-primary">
              {file.LOT_CODE}
            </h2>
            <p className="pt-0.5 text-xs text-muted-foreground">
              Mã hồ sơ: {file.QC_FILE_NO} | PDF tự tăng trang theo số ngày/kho QC và
              số ảnh thực tế.
            </p>
          </div>
          <Button
            variant="secondary"
            size="lg"
            className="shrink-0"
            nativeButton={false}
            render={<Link href={ROUTES.home} />}
          >
            Danh sách
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge>{QC_TYPE_LABEL[file.QC_TYPE] ?? QC_TYPE_LABEL.IMPORT}</StatusBadge>
          <QcFileFlagBadges file={file} />
          <StatusBadge>{file.STATUS}</StatusBadge>
          <StatusBadge>Ngày SX: {file.TOTAL_PRODUCTION_DAYS || "0"}</StatusBadge>
          <StatusBadge>Kho/cơ sở: {file.TOTAL_WAREHOUSES || "0"}</StatusBadge>
          {file.PDF_URL ? (
            <a
              href={file.PDF_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-6 items-center rounded-4xl bg-accent px-2.5 text-xs font-semibold text-primary hover:underline"
            >
              Mở PDF
            </a>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
