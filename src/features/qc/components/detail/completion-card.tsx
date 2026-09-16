"use client";

import { useState } from "react";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { OrderBadge } from "@/features/qc/components/shared/qc-file-flag-badges";
import { Note } from "@/features/qc/components/shared/section-card";
import {
  useCompleteQc,
  useReopenQc,
} from "@/features/qc/hooks/use-qc-file-mutations";
import type { QcFileDetail, QcProgress } from "@/features/qc/types/qc-file";
import { isQcLocked } from "@/features/qc/utils/qc-file";

/*
 * Thẻ "Hoàn tất QC" trên màn Tổng quan (bản vanilla: `renderCompletionCard`) —
 * điểm tích hợp với hệ thống checklist:
 *  - Chưa xong: tiến độ ảnh x/y (%), thanh %, nút Hoàn tất chỉ bật khi đủ 100%.
 *  - Đã xong: viền xanh, thời điểm hoàn tất, giải thích khóa, nút Mở lại để sửa.
 * Cả hai nút đều qua ConfirmDialog vì đổi trạng thái mà bên checklist nhìn thấy.
 */
const EMPTY_PROGRESS: QcProgress = {
  filled: 0,
  total: 0,
  units: 0,
  complete: false,
  unitLabel: "đợt QC",
};

export function CompletionCard({ detail }: { detail: QcFileDetail }) {
  const file = detail.qcFile;
  const progress = detail.progress ?? EMPTY_PROGRESS;
  const complete = useCompleteQc(file.ID);
  const reopen = useReopenQc(file.ID);
  const [confirm, setConfirm] = useState<"complete" | "reopen" | null>(null);

  const pct = progress.total ? Math.round((progress.filled * 100) / progress.total) : 0;
  const locked = isQcLocked(file);

  return (
    <>
      <Card className={locked ? "ring-2 ring-emerald-700" : undefined}>
        <CardContent className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-heading text-[17px] font-semibold text-primary">
              {locked ? "🔒 Đã hoàn tất QC" : "Hoàn tất QC"}
            </h3>
            <OrderBadge file={file} />
          </div>

          {locked ? (
            <>
              <Note>
                Hoàn tất lúc <b>{file.QC_DONE_AT}</b>. Hồ sơ đang <b>khóa</b>: không chụp/xóa
                ảnh, không thêm/xóa phiên, không sửa thông tin. Vẫn xuất PDF bình thường.
                {file.ORDER_ID ? " Hệ thống checklist đã có thể đóng đơn sản xuất này." : ""}
              </Note>
              <div>
                <Button
                  variant="destructive"
                  size="lg"
                  className="h-10"
                  disabled={reopen.isPending}
                  onClick={() => setConfirm("reopen")}
                >
                  Mở lại để sửa
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span>Ảnh đã chụp</span>
                <b>
                  {progress.filled}/{progress.total} ({pct}%)
                </b>
              </div>
              <ProgressBar percent={pct} />
              <Note>
                {progress.complete ? (
                  <>
                    Đã chụp đủ <b>100%</b> ảnh — có thể hoàn tất. Sau khi hoàn tất, hồ sơ sẽ
                    khóa (vẫn xuất PDF được).
                  </>
                ) : (
                  <>
                    Chỉ hoàn tất được khi chụp đủ <b>100%</b> ảnh.{" "}
                    {progress.units === 0 ? (
                      <>Chưa có {progress.unitLabel} nào.</>
                    ) : (
                      <>
                        Còn thiếu <b>{progress.total - progress.filled}</b> ảnh.
                      </>
                    )}
                  </>
                )}
              </Note>
              <div>
                <Button
                  size="lg"
                  className="h-10"
                  disabled={!progress.complete || complete.isPending}
                  onClick={() => setConfirm("complete")}
                >
                  <CheckIcon data-icon="inline-start" />
                  Hoàn tất QC
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirm === "complete"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Hoàn tất QC hồ sơ này?"
        description={
          "Sau khi hoàn tất, hồ sơ sẽ KHÓA (không chụp/sửa thêm) và hệ thống checklist sẽ thấy đơn đã QC xong."
        }
        confirmLabel="Hoàn tất QC"
        onConfirm={() => complete.mutate()}
      />
      <ConfirmDialog
        open={confirm === "reopen"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Mở lại hồ sơ để sửa?"
        description={
          "Hệ thống checklist sẽ thấy đơn CHƯA QC xong cho tới khi bạn bấm Hoàn tất lại."
        }
        confirmLabel="Mở lại"
        destructive
        onConfirm={() => reopen.mutate()}
      />
    </>
  );
}

/* Thanh tiến độ mỏng (`.progress` bản vanilla) — CSS thuần, không thêm thư viện. */
function ProgressBar({ percent }: { percent: number }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className="h-2.5 overflow-hidden rounded-full border bg-[#eef1ea]"
    >
      <div
        className="h-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
        style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
      />
    </div>
  );
}
