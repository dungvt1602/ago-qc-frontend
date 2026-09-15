"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { DailySessionCard } from "@/features/qc/components/daily/daily-session-card";
import { TextField } from "@/features/qc/components/shared/form-field";
import {
  Note,
  SectionBar,
  SectionCard,
} from "@/features/qc/components/shared/section-card";
import { useQcFileDetail } from "@/features/qc/hooks/use-qc-file";
import { useAddDailySession } from "@/features/qc/hooks/use-qc-file-mutations";
import {
  dailySessionSchema,
  type DailySessionInput,
} from "@/features/qc/schemas/daily-session-schema";
import { today } from "@/features/qc/utils/format";

/* Đầu mục QC chất lượng: form thêm đợt QC theo ngày + danh sách các đợt. */
export function DailySection() {
  const detail = useQcFileDetail();
  const add = useAddDailySession(detail?.qcFile.ID ?? "");
  const form = useForm<DailySessionInput>({
    resolver: zodResolver(dailySessionSchema),
    defaultValues: { qcDate: today() },
  });
  if (!detail) return null;

  return (
    <SectionCard
      title="QC chất lượng / Quality check"
      actions={
        <Button
          variant="secondary"
          size="lg"
          nativeButton={false}
          render={<Link href={ROUTES.qcFile(detail.qcFile.ID)} />}
        >
          Về đầu mục
        </Button>
      }
    >
      <form
        className="flex flex-wrap items-end gap-2.5"
        noValidate
        onSubmit={form.handleSubmit((v) => add.mutate(v.qcDate))}
      >
        <TextField
          label="Ngày QC / QC date"
          type="date"
          required
          className="min-w-[200px] flex-1"
          error={form.formState.errors.qcDate}
          {...form.register("qcDate")}
        />
        <Button type="submit" size="lg" className="h-10" disabled={add.isPending}>
          <PlusIcon data-icon="inline-start" />
          Thêm đợt QC
        </Button>
      </form>

      <SectionBar>Danh sách đợt QC</SectionBar>
      {detail.dailySessions.length ? (
        <div className="grid gap-2.5">
          {detail.dailySessions.map((s) => (
            <DailySessionCard key={s.ID} qcFileId={detail.qcFile.ID} session={s} />
          ))}
        </div>
      ) : (
        <Note>Chưa có ngày QC.</Note>
      )}
    </SectionCard>
  );
}
