"use client";

import { FileTextIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Note, SectionCard } from "@/features/qc/components/shared/section-card";
import { useQcFileDetail } from "@/features/qc/hooks/use-qc-file";
import { useExportPdf } from "@/features/qc/hooks/use-qc-file-mutations";

/* Đầu mục E: xuất PDF nội bộ (song ngữ) hoặc khách hàng (tiếng Anh, ẩn tỷ lệ). */
export function ExportSection() {
  const detail = useQcFileDetail();
  const exportPdf = useExportPdf(detail?.qcFile.ID ?? "");
  if (!detail) return null;
  const f = detail.qcFile;

  return (
    <SectionCard title="Xuất file PDF">
      <Note>
        Bấm xuất, chờ vài giây. Lần đầu trong ngày có thể lâu hơn vì server vừa thức
        dậy. Tạo xong, link PDF hiện ngay bên dưới.
        <br />
        <b>Bản nội bộ</b>: song ngữ, có đầy đủ tỉ lệ đạt / không đạt / lý do / hướng xử
        lý.
        <br />
        <b>Bản khách hàng</b>: tiếng Anh, có dòng Khách hàng,{" "}
        <b>ẩn toàn bộ tỉ lệ và nhận xét</b> — chỉ thông tin lô và hình ảnh.
      </Note>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="lg"
          className="h-10"
          disabled={exportPdf.isPending}
          onClick={() => exportPdf.mutate("internal")}
        >
          <FileTextIcon data-icon="inline-start" />
          Xuất PDF nội bộ
        </Button>
        {f.PDF_URL ? <PdfLink href={f.PDF_URL}>Mở bản nội bộ</PdfLink> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="lg"
          className="h-10"
          disabled={exportPdf.isPending}
          onClick={() => exportPdf.mutate("en")}
        >
          <FileTextIcon data-icon="inline-start" />
          Xuất PDF khách hàng (EN)
        </Button>
        {f.PDF_URL_EN ? <PdfLink href={f.PDF_URL_EN}>Mở bản khách hàng</PdfLink> : null}
      </div>
    </SectionCard>
  );
}

function PdfLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-10 items-center rounded-lg bg-secondary px-3 text-sm font-semibold text-secondary-foreground hover:underline"
    >
      {children}
    </a>
  );
}
