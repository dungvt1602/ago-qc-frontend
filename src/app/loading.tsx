import { Skeleton } from "@/components/ui/skeleton";

/*
 * Loading toàn cục: khung xương khớp bố cục thẻ của các màn (không màn trắng,
 * không spinner trơ).
 */
export default function GlobalLoading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-3.5 pt-3.5">
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
    </div>
  );
}
