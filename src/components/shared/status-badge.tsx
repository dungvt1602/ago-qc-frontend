import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/*
 * Nhãn trạng thái (pill) — map tông màu về một chỗ để mọi màn hiển thị
 * trạng thái giống nhau: DRAFT/loại hồ sơ (brand), đã có ảnh (success),
 * chưa có ảnh (danger)...
 */
export type StatusTone = "neutral" | "brand" | "success" | "danger" | "warning";

const toneClasses: Record<StatusTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  brand: "bg-accent text-primary",
  success: "bg-emerald-100 text-emerald-800",
  danger: "bg-red-100 text-red-800",
  warning: "bg-amber-100 text-amber-800",
};

export function StatusBadge({
  tone = "brand",
  className,
  children,
}: {
  tone?: StatusTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn("h-6 px-2.5 font-semibold", toneClasses[tone], className)}
    >
      {children}
    </Badge>
  );
}
