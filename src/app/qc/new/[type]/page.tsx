import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CreateQcFileScreen } from "@/features/qc/components/create/create-qc-file-screen";
import type { QcType } from "@/features/qc/types/qc-file";

export const metadata: Metadata = { title: "Tạo hồ sơ QC" };

/* /qc/new/import · /qc/new/export — slug khác thì 404. */
const TYPE_BY_SLUG: Record<string, QcType> = {
  import: "IMPORT",
  export: "EXPORT",
};

export default async function CreateQcFilePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const qcType = TYPE_BY_SLUG[type];
  if (!qcType) notFound();
  return <CreateQcFileScreen qcType={qcType} />;
}
