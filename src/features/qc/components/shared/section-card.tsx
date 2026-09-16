import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/*
 * Thẻ của một đầu mục / màn con: tiêu đề xanh bên trái, cụm nút bên phải,
 * dòng phụ (muted) rồi tới nội dung. Thay `.card > .between > h3` bản vanilla
 * để mọi màn trong hồ sơ cùng một bố cục.
 */
export function SectionCard({
  title,
  subtitle,
  actions,
  className,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-heading text-[17px] leading-snug font-semibold text-primary">
              {title}
            </h3>
            {subtitle ? (
              <div className="pt-0.5 text-xs text-muted-foreground">{subtitle}</div>
            ) : null}
          </div>
          {actions ? (
            <div className={cn("flex shrink-0 flex-wrap items-center gap-2")}>
              {actions}
            </div>
          ) : null}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

/* Câu hướng dẫn nhỏ, xám — `.note` bản vanilla. */
export function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs leading-relaxed text-muted-foreground">{children}</p>
  );
}

/* Dải tiêu đề xanh đậm ngăn các nhóm trong một thẻ — `.section-title` bản vanilla. */
export function SectionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-primary px-2.5 py-2 text-sm font-bold text-primary-foreground">
      {children}
    </div>
  );
}
