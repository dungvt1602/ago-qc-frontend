import Image from "next/image";
import { cn } from "@/lib/utils";

/*
 * Logo thương hiệu agofruit (public/logo.png, nền trong suốt) — giữ đúng
 * ảnh logo đang dùng ở header bản vanilla.
 */
export function BrandMark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "md" | "lg";
}) {
  return (
    <div className={cn("inline-flex items-center", className)}>
      <Image
        src="/logo.png"
        alt="agofruit"
        width={172}
        height={72}
        priority
        className={cn("w-auto", size === "lg" ? "h-12" : "h-9")}
      />
    </div>
  );
}
