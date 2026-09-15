"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { sectionTitle } from "@/features/qc/constants";
import { ReadonlyField } from "@/features/qc/components/shared/form-field";
import { QcFileInfoFields } from "@/features/qc/components/shared/qc-file-info-fields";
import { SectionCard } from "@/features/qc/components/shared/section-card";
import { useQcFileDetail } from "@/features/qc/hooks/use-qc-file";
import { useUpdateQcFileInfo } from "@/features/qc/hooks/use-qc-file-mutations";
import {
  infoInputToPayload,
  qcFileInfoSchema,
  qcFileToInfoInput,
  type QcFileInfoInput,
} from "@/features/qc/schemas/qc-file-schema";
import type { QcFile } from "@/features/qc/types/qc-file";

/* Đầu mục A: thông tin lô hàng — 4 ô chỉ đọc + form sửa. */
export function InfoSection() {
  const detail = useQcFileDetail();
  if (!detail) return null;
  return <InfoForm key={detail.qcFile.UPDATED_AT} file={detail.qcFile} />;
}

function InfoForm({ file }: { file: QcFile }) {
  const update = useUpdateQcFileInfo(file.ID);
  const form = useForm<QcFileInfoInput>({
    resolver: zodResolver(qcFileInfoSchema),
    defaultValues: qcFileToInfoInput(file),
  });

  const submit = form.handleSubmit((input) =>
    update.mutate(infoInputToPayload(input, file.QC_TYPE)),
  );

  return (
    <SectionCard
      title={sectionTitle(file.QC_TYPE, "info")}
      actions={
        <Button variant="secondary" size="lg" onClick={submit} disabled={update.isPending}>
          Lưu thông tin
        </Button>
      }
    >
      <div className="grid gap-2.5 sm:grid-cols-2">
        <ReadonlyField label="Mã hồ sơ QC / QC file no." value={file.QC_FILE_NO} />
        <ReadonlyField label="Mã lô / Lot code" value={file.LOT_CODE} />
        <ReadonlyField label="Ngày bắt đầu / Start date" value={file.START_DATE} />
        <ReadonlyField label="Ngày tạo / Created at" value={file.CREATED_AT} />
      </div>
      <form onSubmit={submit} noValidate>
        <QcFileInfoFields form={form} qcType={file.QC_TYPE} />
      </form>
    </SectionCard>
  );
}
