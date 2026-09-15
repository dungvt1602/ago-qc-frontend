"use client";

import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { ROUTES } from "@/lib/constants";
import { QC_TYPE_LABEL } from "@/features/qc/constants";
import { LinkCard } from "@/features/qc/components/shared/link-card";
import type { QcFile } from "@/features/qc/types/qc-file";

/* Một thẻ hồ sơ trong danh sách: mã lô, loại, trạng thái, sản phẩm, PO/NCC. */
export function QcFileCard({
  file,
  onDelete,
}: {
  file: QcFile;
  onDelete: (file: QcFile) => void;
}) {
  return (
    <LinkCard
      href={ROUTES.qcFile(file.ID)}
      title={file.LOT_CODE || file.QC_FILE_NO || ""}
      badges={
        <>
          <StatusBadge>{QC_TYPE_LABEL[file.QC_TYPE] ?? QC_TYPE_LABEL.IMPORT}</StatusBadge>
          <StatusBadge>{file.STATUS || "DRAFT"}</StatusBadge>
        </>
      }
    >
      <div className="text-sm">{file.PRODUCT_NAME || "Chưa nhập sản phẩm"}</div>
      <div className="text-xs text-muted-foreground">
        PO: {file.PO_NO || "-"} | NCC: {file.SUPPLIER || "-"} | Ngày tạo:{" "}
        {file.CREATED_AT || ""}
      </div>
      <div className="relative z-10 flex flex-wrap items-center gap-2 pt-1">
        {file.PDF_URL ? (
          <a
            href={file.PDF_URL}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Mở PDF
          </a>
        ) : null}
        <Button variant="destructive" size="sm" onClick={() => onDelete(file)}>
          <Trash2Icon data-icon="inline-start" />
          Xóa hồ sơ
        </Button>
      </div>
    </LinkCard>
  );
}
