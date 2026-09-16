import { z } from "zod";
import type { QcFile, QcType } from "@/features/qc/types/qc-file";
import type { QcFileInfoPayload } from "@/features/qc/api/qc-api";

/*
 * Form thông tin lô hàng — dùng cho cả tạo hồ sơ lẫn sửa (đầu mục A).
 * Bắt buộc: số PO, tên hàng, nhân viên QC (đúng các ô `required` bản vanilla).
 * Các ô còn lại là chuỗi (có thể rỗng); ngày ở dạng yyyy-mm-dd.
 */
export const qcFileInfoSchema = z.object({
  contractNo: z.string(),
  poNo: z.string().trim().min(1, "Vui lòng nhập số PO"),
  productionOrder: z.string(),
  standardAppendix: z.string(),
  productName: z.string().trim().min(1, "Vui lòng nhập tên hàng"),
  specification: z.string(),
  supplier: z.string(),
  supplierCode: z.string(),
  poQuantity: z.string(),
  unit: z.string(),
  estFinishDate: z.string(),
  qcStaff: z.string().trim().min(1, "Vui lòng nhập nhân viên QC"),
  customer: z.string(),
  containerNo: z.string(),
  sealNo: z.string(),
  containerLoadingDate: z.string(),
});

export type QcFileInfoInput = z.infer<typeof qcFileInfoSchema>;
export type QcFileInfoKey = keyof QcFileInfoInput;

/* Cột backend tương ứng với từng ô form. */
const FIELD_TO_COLUMN: Record<QcFileInfoKey, keyof QcFile> = {
  contractNo: "CONTRACT_NO",
  poNo: "PO_NO",
  productionOrder: "PRODUCTION_ORDER",
  standardAppendix: "STANDARD_APPENDIX",
  productName: "PRODUCT_NAME",
  specification: "SPECIFICATION",
  supplier: "SUPPLIER",
  supplierCode: "SUPPLIER_CODE",
  poQuantity: "PO_QUANTITY",
  unit: "UNIT",
  estFinishDate: "EST_FINISH_DATE",
  qcStaff: "QC_STAFF",
  customer: "CUSTOMER",
  containerNo: "CONTAINER_NO",
  sealNo: "SEAL_NO",
  containerLoadingDate: "CONTAINER_LOADING_DATE",
};

/*
 * Ô nào hiện cho loại nào (thứ tự = thứ tự trên màn). Hàng nhập bỏ các
 * trường sản xuất (lệnh SX, phụ lục tiêu chuẩn, dự kiến kết thúc).
 */
export const INFO_FIELD_KEYS: Record<QcType, QcFileInfoKey[]> = {
  IMPORT: [
    "contractNo",
    "poNo",
    "supplier",
    "supplierCode",
    "productName",
    "specification",
    "poQuantity",
    "unit",
    "customer",
    "containerNo",
    "sealNo",
    "containerLoadingDate",
    "qcStaff",
  ],
  EXPORT: [
    "contractNo",
    "poNo",
    "productionOrder",
    "standardAppendix",
    "productName",
    "specification",
    "supplier",
    "supplierCode",
    "poQuantity",
    "unit",
    "estFinishDate",
    "qcStaff",
    "customer",
    "containerNo",
    "sealNo",
    "containerLoadingDate",
  ],
};

/* Giá trị mặc định của form từ hồ sơ có sẵn (hoặc rỗng khi tạo mới). */
export function qcFileToInfoInput(file?: QcFile): QcFileInfoInput {
  const out = {} as QcFileInfoInput;
  (Object.keys(FIELD_TO_COLUMN) as QcFileInfoKey[]).forEach((key) => {
    const v = file?.[FIELD_TO_COLUMN[key]];
    out[key] = v === undefined || v === null ? "" : String(v);
  });
  return out;
}

/* Payload gửi backend: CHỈ các ô thuộc loại hồ sơ đó (như form bản vanilla). */
export function infoInputToPayload(
  input: QcFileInfoInput,
  type: QcType,
): QcFileInfoPayload {
  const payload: QcFileInfoPayload = {};
  INFO_FIELD_KEYS[type].forEach((key) => {
    payload[key] = input[key] ?? "";
  });
  return payload;
}
