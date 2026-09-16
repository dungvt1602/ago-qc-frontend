"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { sectionsFor } from "@/features/qc/constants";
import { Note } from "@/features/qc/components/shared/section-card";
import type { QcType } from "@/features/qc/types/qc-file";

/*
 * Menu 5 đầu mục A–E của hồ sơ. Mỗi đầu mục là một route con; đầu mục đang
 * mở lấy từ segment con của layout `/qc/[id]` (null = màn tổng quan).
 */
export function StepMenu({ qcFileId, qcType }: { qcFileId: string; qcType: QcType }) {
  const active = useSelectedLayoutSegment();
  return (
    <Card>
      <CardContent className="flex flex-col gap-2.5">
        <h3 className="font-heading text-[17px] font-semibold text-primary">
          Chọn đầu mục thao tác
        </h3>
        <div className="grid gap-2 sm:grid-cols-5">
          {sectionsFor(qcType).map((s) => {
            const isActive = active === s.slug;
            return (
              <Link
                key={s.slug}
                href={ROUTES.qcSection(qcFileId, s.slug)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "grid min-h-[58px] gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors sm:min-h-[68px]",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-[#f4f8ef] text-primary hover:border-primary",
                )}
              >
                <b className="text-sm leading-snug">
                  {s.letter}. {s.vi}
                </b>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    isActive ? "text-[#e7f3df]" : "text-muted-foreground",
                  )}
                >
                  {s.en}
                </span>
              </Link>
            );
          })}
        </div>
        <Note>
          Mỗi đầu mục mở riêng một màn hình để QC thao tác nhanh, tránh kéo cuộn quá dài.
        </Note>
      </CardContent>
    </Card>
  );
}
