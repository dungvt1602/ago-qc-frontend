/*
 * Tiêu đề chuẩn cho mỗi màn: tên + mô tả ngắn + cụm nút hành động bên phải.
 * Trên điện thoại cụm nút tự xuống dòng và giãn hết bề rộng.
 */
export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-heading text-xl font-semibold tracking-tight text-primary">
          {title}
        </h1>
        {description ? (
          <p className="pt-0.5 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children ? (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {children}
        </div>
      ) : null}
    </div>
  );
}
