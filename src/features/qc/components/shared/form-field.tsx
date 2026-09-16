"use client";

import * as React from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/*
 * Ô nhập chuẩn của module QC: nhãn đậm nhỏ + input cao 40px (dễ chạm trên
 * điện thoại, font 16px để iOS không tự zoom) + dòng lỗi. Bọc Input/Textarea
 * của shadcn, KHÔNG sửa file trong components/ui.
 */
type BaseProps = {
  label: string;
  required?: boolean;
  error?: { message?: string };
  className?: string;
};

export function TextField({
  label,
  required,
  error,
  className,
  id,
  ...inputProps
}: BaseProps & React.ComponentProps<typeof Input>) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  return (
    <Field className={cn("gap-1.5", className)} data-invalid={!!error || undefined}>
      <FieldLabel htmlFor={inputId} className="text-xs font-bold text-[#31411f]">
        {label}
        {required ? " *" : ""}
      </FieldLabel>
      <Input
        id={inputId}
        aria-invalid={!!error}
        className="h-10 bg-background"
        {...inputProps}
      />
      <FieldError errors={[error]} />
    </Field>
  );
}

export function TextAreaField({
  label,
  required,
  error,
  className,
  id,
  ...textareaProps
}: BaseProps & React.ComponentProps<typeof Textarea>) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  return (
    <Field className={cn("gap-1.5", className)} data-invalid={!!error || undefined}>
      <FieldLabel htmlFor={inputId} className="text-xs font-bold text-[#31411f]">
        {label}
        {required ? " *" : ""}
      </FieldLabel>
      <Textarea
        id={inputId}
        aria-invalid={!!error}
        className="min-h-18 bg-background"
        {...textareaProps}
      />
      <FieldError errors={[error]} />
    </Field>
  );
}

/* Ô chỉ đọc (mã hồ sơ, mã lô, ngày tạo...). */
export function ReadonlyField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Field className="gap-1.5">
      <FieldLabel className="text-xs font-bold text-[#31411f]">{label}</FieldLabel>
      <div className="flex h-10 items-center rounded-lg border bg-muted px-2.5 text-base text-muted-foreground md:text-sm">
        {value || "—"}
      </div>
    </Field>
  );
}
