"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { sectionTitle } from "@/features/qc/constants";
import { TextAreaField, TextField } from "@/features/qc/components/shared/form-field";
import { SectionCard } from "@/features/qc/components/shared/section-card";
import { useQcFileDetail } from "@/features/qc/hooks/use-qc-file";
import { useUpdateSummary } from "@/features/qc/hooks/use-qc-file-mutations";
import { useQcLock } from "@/features/qc/hooks/use-qc-lock";
import {
  summarySchema,
  summaryToInput,
  type SummaryInput,
} from "@/features/qc/schemas/summary-schema";
import type { QcFileDetail } from "@/features/qc/types/qc-file";

/* Đầu mục B: thống kê — 4 ô (tỷ lệ đạt / không đạt, lý do, hướng xử lý). */
export function SummarySection() {
  const detail = useQcFileDetail();
  if (!detail) return null;
  return <SummaryForm key={detail.summary?.UPDATED_AT} detail={detail} />;
}

function SummaryForm({ detail }: { detail: QcFileDetail }) {
  const update = useUpdateSummary(detail.qcFile.ID);
  const { guard } = useQcLock();
  const form = useForm<SummaryInput>({
    resolver: zodResolver(summarySchema),
    defaultValues: summaryToInput(detail.summary),
  });
  const errors = form.formState.errors;
  const submit = form.handleSubmit((v) => {
    if (guard()) return;
    update.mutate(v);
  });

  return (
    <SectionCard
      title={sectionTitle(detail.qcFile.QC_TYPE, "summary")}
      actions={
        <Button variant="secondary" size="lg" onClick={submit} disabled={update.isPending}>
          Lưu thống kê
        </Button>
      }
    >
      <form className="grid gap-2.5 sm:grid-cols-2" onSubmit={submit} noValidate>
        <TextField
          label="Tỷ lệ đạt / Pass rate"
          error={errors.cumulativePassRate}
          {...form.register("cumulativePassRate")}
        />
        <TextField
          label="Tỷ lệ không đạt / Fail rate"
          error={errors.cumulativeFailRate}
          {...form.register("cumulativeFailRate")}
        />
        <TextAreaField
          label="Lý do không đạt / Reason for failure"
          error={errors.failReason}
          {...form.register("failReason")}
        />
        <TextAreaField
          label="Hướng xử lý / Handling action"
          error={errors.handlingAction}
          {...form.register("handlingAction")}
        />
      </form>
    </SectionCard>
  );
}
