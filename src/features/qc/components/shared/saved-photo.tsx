/* eslint-disable @next/next/no-img-element -- ảnh QC là URL ngoài (Supabase) hoặc dataURL lạc quan; không qua next/image. */

import { cn } from "@/lib/utils";

/*
 * Ảnh đã lưu của một hạng mục: bấm mở ảnh lớn ở tab mới + dòng thời gian
 * chụp. Chưa có ảnh → khung gạch đứt "Chưa có ảnh".
 */
export function SavedPhoto({
  url,
  capturedAt,
  alt = "Ảnh QC",
}: {
  url?: string;
  capturedAt?: string;
  alt?: string;
}) {
  if (!url) return <EmptyPhoto />;
  return (
    <div>
      <a href={url} target="_blank" rel="noreferrer" title="Bấm để xem ảnh lớn">
        <img
          src={url}
          alt={alt}
          className="block max-h-[300px] w-full rounded-lg border bg-neutral-100 object-contain"
        />
      </a>
      <p className="pt-1 text-xs text-muted-foreground">
        ✅ Đã lưu ảnh{capturedAt ? ` · ${capturedAt}` : ""} · bấm ảnh để xem lớn
      </p>
    </div>
  );
}

/* Ảnh thu nhỏ trong ô mẫu (hàng nhập). */
export function PhotoThumb({
  url,
  alt,
  className,
}: {
  url?: string;
  alt: string;
  className?: string;
}) {
  if (!url) return <EmptyPhoto className={cn("h-[120px]", className)} />;
  return (
    <a href={url} target="_blank" rel="noreferrer">
      <img
        src={url}
        alt={alt}
        className={cn("h-[120px] w-full rounded-lg border object-cover", className)}
      />
    </a>
  );
}

export function EmptyPhoto({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-[140px] items-center justify-center rounded-lg border border-dashed bg-neutral-50 p-2.5 text-center text-sm text-neutral-500 italic",
        className,
      )}
    >
      Chưa có ảnh
    </div>
  );
}
