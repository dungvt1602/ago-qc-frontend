/*
 * Kiểu dữ liệu khớp đúng JSON backend QC trả về (tên cột viết HOA giữ nguyên
 * để không phải map hai chiều — AGENTS.md Naming Convention).
 *
 * Số liệu (tỷ lệ, số lượng, số ngày) backend trả dạng chuỗi hoặc số tùy
 * bản ghi → khai `string | number` ở những chỗ đã thấy cả hai.
 */

export type QcType = "IMPORT" | "EXPORT";

/* Bản PDF: nội bộ (song ngữ, đủ tỷ lệ) · khách hàng (tiếng Anh, ẩn tỷ lệ). */
export type PdfVariant = "internal" | "en";

export interface QcFile {
  ID: string;
  QC_FILE_NO: string;
  LOT_CODE: string;
  QC_TYPE: QcType;
  CONTRACT_NO: string;
  PO_NO: string;
  PRODUCTION_ORDER: string;
  STANDARD_APPENDIX: string;
  PRODUCT_NAME: string;
  SPECIFICATION: string;
  SUPPLIER: string;
  SUPPLIER_CODE: string;
  PO_QUANTITY: string | number;
  UNIT: string;
  START_DATE: string;
  EST_FINISH_DATE: string;
  TOTAL_PRODUCTION_DAYS: string | number;
  TOTAL_WAREHOUSES: string | number;
  CUSTOMER: string;
  CONTAINER_NO: string;
  SEAL_NO: string;
  CONTAINER_LOADING_DATE: string;
  QC_STAFF: string;
  STATUS: string;
  PDF_URL: string;
  PDF_URL_EN: string;
  CREATED_AT: string;
  UPDATED_AT: string;
  /** Thời điểm bấm "Hoàn tất QC"; rỗng = chưa xong. Có giá trị → hồ sơ bị khóa sửa. */
  QC_DONE_AT?: string;
  /** Mã đơn bên hệ thống checklist liên kết với hồ sơ này; rỗng = không liên kết. */
  ORDER_ID?: string | number;
  /** Tên người bấm "Hoàn tất QC" (app hỏi lúc bấm); checklist hiện "QC xong bởi ...". */
  QC_DONE_BY?: string;
  /** Tên người bấm "Tạo đơn QC" bên checklist (CreateQC.created_by_name); rỗng = tạo tay trong app. */
  CREATED_BY?: string;
}

/*
 * Tiến độ chụp ảnh do backend tính: `filled/total` ảnh, `units` = số đợt QC
 * (hoặc số mẫu), `complete` = đủ 100% → được phép Hoàn tất.
 */
export interface QcProgress {
  filled: number;
  total: number;
  units: number;
  complete: boolean;
  unitLabel: string;
}

/* Thống kê của hồ sơ — form chỉ dùng 4 cột, các cột khác backend vẫn trả. */
export interface QcSummary {
  QC_FILE_ID: string;
  CUMULATIVE_PASS_RATE: string;
  CUMULATIVE_FAIL_RATE: string;
  FAIL_REASON: string;
  HANDLING_ACTION: string;
  PRODUCED_QTY?: string;
  PENDING_PRODUCTION_QTY?: string;
  TOTAL_PASSED_FINISHED_GOODS?: string;
  TOTAL_FAILED_PENDING?: string;
  TOTAL_DELIVERED?: string;
  TOTAL_STOCK_ON_HAND?: string;
  DIFFERENCE_TO_RESOLVE?: string;
  UPDATED_AT?: string;
}

/* Trường ảnh chung cho hạng mục QC ngày và mục ảnh container. */
export interface PhotoFields {
  PHOTO_URL?: string;
  PHOTO_PATH?: string;
  /** Bản backend cũ (Google Drive) — giữ để hồ sơ cũ vẫn hiện "đã có ảnh". */
  PHOTO_FILE_ID?: string;
  CAPTURED_AT?: string;
}

/* Kết quả nhập tay cho một hạng mục. */
export interface ResultFields {
  PASS_RATE: string;
  FAIL_RATE: string;
  REMARKS: string;
}

/* Hạng mục QC chất lượng (hàng xuất: 6 hạng mục / đợt). */
export interface DailyItem extends PhotoFields, ResultFields {
  ID: string;
  DAILY_QC_ID: string;
  QC_FILE_ID: string;
  ITEM_CODE: string;
  ITEM_NAME_VI: string;
  ITEM_NAME_EN: string;
}

export interface SamplePhoto {
  url: string;
  captured_at?: string;
}

/* Mẫu QC (hàng nhập): mỗi mẫu tối đa 4 ảnh, ô trống là null. */
export interface QcSample {
  ID: string;
  SAMPLE_NO: number;
  PHOTOS?: (SamplePhoto | null)[];
}

/* Một đợt QC (theo ngày). Hàng xuất có `items`, hàng nhập có `samples`. */
export interface DailySession {
  ID: string;
  QC_FILE_ID: string;
  LOT_CODE: string;
  QC_DATE: string;
  WAREHOUSE?: string;
  QC_STAFF?: string;
  STATUS?: string;
  CREATED_AT?: string;
  UPDATED_AT?: string;
  items?: DailyItem[];
  samples?: QcSample[];
}

/* Mục ảnh giao hàng / container (21 mục cố định do backend tạo sẵn). */
export interface ContainerItem extends PhotoFields, ResultFields {
  ID: string;
  QC_FILE_ID: string;
  LOT_CODE: string;
  PHOTO_NO: number | string;
  ITEM_CODE: string;
  ITEM_NAME_VI: string;
  ITEM_NAME_EN: string;
  DESCRIPTION_VI: string;
  DESCRIPTION_EN: string;
}

/* Bộ dữ liệu đầy đủ của một hồ sơ — mọi mutation của backend đều trả lại nó. */
export interface QcFileDetail {
  qcFile: QcFile;
  summary?: QcSummary;
  dailySessions: DailySession[];
  containerItems: ContainerItem[];
  progress?: QcProgress;
}
