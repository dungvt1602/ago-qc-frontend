"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  TextAreaField,
  TextField,
} from "@/features/qc/components/shared/form-field";
import {
  itemResultSchema,
  resultToInput,
  type ItemResultInput,
} from "@/features/qc/schemas/item-result-schema";
import type { ResultFields } from "@/features/qc/types/qc-file";

/*
 * Form tỷ lệ đạt / không đạt / nhận xét + nút Lưu — GIAO DIỆN THUẦN, trao
 * giá trị cho cha bắn mutation. Dùng chung cho hạng mục QC ngày và mục ảnh
 * container. `labels` cho phép hàng container bỏ phần tiếng Anh như bản cũ.
 */
export function ItemResultForm({
  item,
  saving,
  onSubmit,
  labels = { pass: "Tỷ lệ đạt / Pass rate", fail: "Tỷ lệ không đạt / Fail rate" },
}: {
  item: ResultFields;
  saving: boolean;
  onSubmit: (value: ItemResultInput) => void;
  labels?: { pass: string; fail: string };
}) {
  const form = useForm<ItemResultInput>({
    resolver: zodResolver(itemResultSchema),
    defaultValues: resultToInput(item),
  });
  const errors = form.formState.errors;

  return (
    <form
      className="flex flex-col gap-2.5"
      onSubmit={form.handleSubmit((v) => onSubmit(v))}
      noValidate
    >
      <div className="grid gap-2.5 sm:grid-cols-2">
        <TextField label={labels.pass} error={errors.passRate} {...form.register("passRate")} />
        <TextField label={labels.fail} error={errors.failRate} {...form.register("failRate")} />
      </div>
      <TextAreaField
        label="Nhận xét / Remarks"
        error={errors.remarks}
        {...form.register("remarks")}
      />
      <div>
        <Button type="submit" variant="secondary" size="lg" disabled={saving}>
          Lưu hạng mục
        </Button>
      </div>
    </form>
  );
}
