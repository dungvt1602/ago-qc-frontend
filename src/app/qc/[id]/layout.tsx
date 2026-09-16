import type { Metadata } from "next";
import { QcFileLayout } from "@/features/qc/components/detail/qc-file-layout";

export const metadata: Metadata = { title: "Hồ sơ QC" };

/*
 * Layout cho mọi màn trong một hồ sơ: header + menu đầu mục do feature dựng,
 * giữ nguyên khi chuyển giữa các đầu mục con.
 */
export default function QcFileRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <QcFileLayout>{children}</QcFileLayout>;
}
