import Link from "next/link";
import { cn } from "@/lib/utils";

/*
 * Thẻ bấm được cả khối (`.file-item` bản vanilla) dẫn tới một route.
 * Dùng kiểu "stretched link": Link chỉ bọc tiêu đề nhưng phủ ::after lên cả
 * thẻ → cả thẻ bấm được, mà nút/anchor con (đặt `relative z-10`) vẫn hoạt
 * động riêng và HTML không lồng <a> trong <a>.
 */
export function LinkCard({
  href,
  title,
  badges,
  className,
  children,
}: {
  href: string;
  title: React.ReactNode;
  /** Cụm nhãn hiện bên phải tiêu đề. */
  badges?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative grid gap-1.5 rounded-xl border bg-card p-3 transition-colors hover:border-primary",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={href}
          className="min-w-0 font-semibold text-foreground after:absolute after:inset-0 after:rounded-xl after:content-['']"
        >
          {title}
        </Link>
        {badges ? (
          <div className="flex shrink-0 flex-wrap justify-end gap-1.5">{badges}</div>
        ) : null}
      </div>
      {children}
    </div>
  );
}
