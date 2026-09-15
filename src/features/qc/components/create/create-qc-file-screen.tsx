"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { QC_TYPE_LABEL } from "@/features/qc/constants";
import { QcFileInfoFields } from "@/features/qc/components/shared/qc-file-info-fields";
import { Note, SectionCard } from "@/features/qc/components/shared/section-card";
import { useCreateQcFile } from "@/features/qc/hooks/use-qc-file-mutations";
import {
  infoInputToPayload,
  qcFileInfoSchema,
  qcFileToInfoInput,
  type QcFileInfoInput,
} from "@/features/qc/schemas/qc-file-schema";
import type { QcType } from "@/features/qc/types/qc-file";

/*
 * Màn tạo hồ sơ (hàng nhập / hàng xuất). Tạo xong → mở thẳng chi tiết; cache
 * chi tiết đã được mutation ghi sẵn nên màn sau hiện ngay không chờ tải.
 */
export function CreateQcFileScreen({ qcType }: { qcType: QcType }) {
  const router = useRouter();
  const label = QC_TYPE_LABEL[qcType];
  const create = useCreateQcFile((detail) => router.push(ROUTES.qcFile(detail.qcFile.ID)));

  const form = useForm<QcFileInfoInput>({
    resolver: zodResolver(qcFileInfoSchema),
    defaultValues: qcFileToInfoInput(),
  });

  return (
    <SectionCard
      title={`Tạo hồ sơ ${label}`}
      actions={
        <Button variant="secondary" size="lg" nativeButton={false} render={<Link href={ROUTES.home} />}>
          Quay lại
        </Button>
      }
    >
      <Note>
        Loại: <b>{label}</b>. Mã hồ sơ QC và mã lô sẽ tự tạo theo PO và ngày tạo.
      </Note>
      <form
        className="flex flex-col gap-3"
        noValidate
        onSubmit={form.handleSubmit((input) =>
          create.mutate({ info: infoInputToPayload(input, qcType), qcType }),
        )}
      >
        <QcFileInfoFields form={form} qcType={qcType} />
        <Button type="submit" size="lg" className="h-11 w-full" disabled={create.isPending}>
          Tạo hồ sơ {label}
        </Button>
      </form>
    </SectionCard>
  );
}
