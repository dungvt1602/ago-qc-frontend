"use client";

import type { UseFormReturn } from "react-hook-form";
import { TextField } from "@/features/qc/components/shared/form-field";
import {
  INFO_FIELD_KEYS,
  type QcFileInfoInput,
  type QcFileInfoKey,
} from "@/features/qc/schemas/qc-file-schema";
import type { QcType } from "@/features/qc/types/qc-file";

/*
 * Lưới ô nhập thông tin lô hàng — dùng chung cho màn tạo hồ sơ và đầu mục A.
 * Nhãn song ngữ; hàng nhập đổi nhãn cho hợp ngữ cảnh nhập khẩu (NCC = người
 * xuất khẩu, ngày đóng cont = ngày hàng về).
 */
type FieldMeta = { label: string; required?: boolean; type?: "text" | "date" };

const COMMON_LABELS: Record<QcFileInfoKey, FieldMeta> = {
  contractNo: { label: "Hợp đồng số / Contract no." },
  poNo: { label: "PO số / PO no.", required: true },
  productionOrder: { label: "Lệnh sản xuất / Production order" },
  standardAppendix: { label: "Phụ lục tiêu chuẩn / Standard appendix" },
  productName: { label: "Tên sản phẩm / Product name", required: true },
  specification: { label: "Quy cách/Size/Grade / Specification" },
  supplier: { label: "Nhà cung cấp / Supplier" },
  supplierCode: { label: "Mã NCC / Supplier code" },
  poQuantity: { label: "Số lượng theo PO / PO quantity" },
  unit: { label: "Đơn vị tính / Unit" },
  estFinishDate: { label: "Dự kiến kết thúc / Est. finish date", type: "date" },
  qcStaff: { label: "Nhân viên QC / QC staff", required: true },
  customer: { label: "Khách hàng / Customer" },
  containerNo: { label: "Số container / Container no." },
  sealNo: { label: "Số seal / Seal no." },
  containerLoadingDate: { label: "Ngày đóng cont / Container loading date", type: "date" },
};

const IMPORT_LABEL_OVERRIDES: Partial<Record<QcFileInfoKey, FieldMeta>> = {
  contractNo: { label: "Hợp đồng / Invoice" },
  poNo: { label: "Số PO / Tham chiếu", required: true },
  supplier: { label: "Nhà cung cấp / Người xuất khẩu" },
  productName: { label: "Tên hàng / Product name", required: true },
  poQuantity: { label: "Số lượng" },
  containerLoadingDate: { label: "Ngày hàng về / Arrival date", type: "date" },
};

export function QcFileInfoFields({
  form,
  qcType,
}: {
  form: UseFormReturn<QcFileInfoInput>;
  qcType: QcType;
}) {
  const errors = form.formState.errors;
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {INFO_FIELD_KEYS[qcType].map((key) => {
        const meta =
          (qcType === "IMPORT" && IMPORT_LABEL_OVERRIDES[key]) || COMMON_LABELS[key];
        return (
          <TextField
            key={key}
            label={meta.label}
            required={meta.required}
            type={meta.type ?? "text"}
            error={errors[key]}
            {...form.register(key)}
          />
        );
      })}
    </div>
  );
}
