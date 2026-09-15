"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ROUTES } from "@/lib/constants";
import { DailyItemCard } from "@/features/qc/components/daily/daily-item-card";
import { SampleCard } from "@/features/qc/components/daily/sample-card";
import { TextField } from "@/features/qc/components/shared/form-field";
import { Note, SectionCard } from "@/features/qc/components/shared/section-card";
import { useQcFileDetail } from "@/features/qc/hooks/use-qc-file";
import {
  useAddSample,
  useDeleteDailySession,
  useDeletePhoto,
  useDeleteSample,
  useUpdateDailySession,
} from "@/features/qc/hooks/use-qc-file-mutations";
import {
  dailySessionSchema,
  type DailySessionInput,
} from "@/features/qc/schemas/daily-session-schema";
import type { DailySession, QcFileDetail, QcSample } from "@/features/qc/types/qc-file";
import { findSession } from "@/features/qc/utils/qc-file";

/*
 * Một đợt QC: sửa ngày / xóa phiên, rồi
 *  - hàng nhập: danh sách mẫu (thêm / xóa mẫu, mỗi mẫu 4 ảnh);
 *  - hàng xuất: 6 hạng mục, bấm vào mở màn nhập riêng.
 */
export function DailySessionDetail() {
  const detail = useQcFileDetail();
  const { sessionId } = useParams<{ sessionId: string }>();
  if (!detail) return null;
  const session = findSession(detail, sessionId);
  if (!session) {
    return (
      <SectionCard title="Không tìm thấy đợt QC">
        <Button
          variant="secondary"
          size="lg"
          nativeButton={false}
          render={<Link href={ROUTES.qcSection(detail.qcFile.ID, "daily")} />}
        >
          Quay lại danh sách
        </Button>
      </SectionCard>
    );
  }
  return <SessionBody key={session.ID + session.QC_DATE} detail={detail} session={session} />;
}

type PendingAction =
  | { kind: "deleteSession" }
  | { kind: "deleteSample"; sample: QcSample }
  | { kind: "deletePhoto"; sample: QcSample; slot: number };

function SessionBody({ detail, session }: { detail: QcFileDetail; session: DailySession }) {
  const router = useRouter();
  const qcFileId = detail.qcFile.ID;
  const isImport = detail.qcFile.QC_TYPE === "IMPORT";
  const dailyHref = ROUTES.qcSection(qcFileId, "daily");

  const update = useUpdateDailySession(session.ID);
  const remove = useDeleteDailySession(() => router.push(dailyHref));
  const addSample = useAddSample();
  const deleteSample = useDeleteSample();
  const deletePhoto = useDeletePhoto();
  const [pending, setPending] = useState<PendingAction | null>(null);

  const form = useForm<DailySessionInput>({
    resolver: zodResolver(dailySessionSchema),
    defaultValues: { qcDate: session.QC_DATE },
  });
  const saveSession = form.handleSubmit((v) => update.mutate(v.qcDate));

  const confirmMeta = (a: PendingAction) => {
    switch (a.kind) {
      case "deleteSession":
        return {
          title: "Xóa phiên QC này?",
          description: "Các hạng mục và ảnh trong phiên sẽ bị xóa.",
          onConfirm: () => remove.mutate(session.ID),
        };
      case "deleteSample":
        return {
          title: `Xóa mẫu ${a.sample.SAMPLE_NO} (kèm các ảnh)?`,
          onConfirm: () => deleteSample.mutate(a.sample.ID),
        };
      case "deletePhoto":
        return {
          title: "Xóa ảnh này?",
          onConfirm: () =>
            deletePhoto.mutate({
              targetType: "sample",
              qcFileId,
              sampleId: a.sample.ID,
              slot: a.slot,
            }),
        };
    }
  };
  const meta = pending ? confirmMeta(pending) : null;

  return (
    <SectionCard
      title={`QC ${session.QC_DATE}`}
      actions={
        <Button variant="secondary" size="lg" nativeButton={false} render={<Link href={dailyHref} />}>
          Quay lại danh sách
        </Button>
      }
    >
      <Note>
        {isImport
          ? "Thêm mẫu để kiểm tra; mỗi mẫu chụp 4 ảnh. Có thể sửa ngày của đợt QC bên dưới."
          : "Chọn từng hạng mục để mở màn hình nhập riêng. Có thể sửa ngày của đợt QC ngay bên dưới."}
      </Note>

      <form className="grid gap-2.5 sm:grid-cols-2" onSubmit={saveSession} noValidate>
        <TextField
          label="Ngày QC / QC date"
          type="date"
          error={form.formState.errors.qcDate}
          {...form.register("qcDate")}
        />
      </form>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="lg" onClick={saveSession} disabled={update.isPending}>
          Lưu sửa phiên
        </Button>
        <Button
          variant="destructive"
          size="lg"
          onClick={() => setPending({ kind: "deleteSession" })}
          disabled={remove.isPending}
        >
          <Trash2Icon data-icon="inline-start" />
          Xóa phiên này
        </Button>
      </div>

      {isImport ? (
        <>
          <div>
            <Button size="lg" onClick={() => addSample.mutate(session.ID)} disabled={addSample.isPending}>
              <PlusIcon data-icon="inline-start" />
              Thêm mẫu
            </Button>
          </div>
          {session.samples?.length ? (
            <div className="grid gap-2.5">
              {session.samples.map((sm) => (
                <SampleCard
                  key={sm.ID}
                  sample={sm}
                  onDeleteSample={(sample) => setPending({ kind: "deleteSample", sample })}
                  onDeletePhoto={(sample, slot) => setPending({ kind: "deletePhoto", sample, slot })}
                />
              ))}
            </div>
          ) : (
            <Note>Chưa có mẫu nào. Bấm &quot;+ Thêm mẫu&quot; để bắt đầu.</Note>
          )}
        </>
      ) : (
        <div className="grid gap-2.5">
          {(session.items ?? []).map((it) => (
            <DailyItemCard key={it.ITEM_CODE} qcFileId={qcFileId} sessionId={session.ID} item={it} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(open) => !open && setPending(null)}
        title={meta?.title ?? ""}
        description={meta?.description}
        confirmLabel="Xóa"
        destructive
        onConfirm={() => meta?.onConfirm()}
      />
    </SectionCard>
  );
}
