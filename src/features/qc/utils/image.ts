import {
  PHOTO_JPEG_QUALITY,
  PHOTO_MAX_SIDE,
  PHOTO_PROCESS_TIMEOUT_MS,
} from "@/features/qc/constants";
import type { QcFile } from "@/features/qc/types/qc-file";
import { formatDateTime } from "@/features/qc/utils/format";

/*
 * Xử lý ảnh chụp từ camera điện thoại (client-only, chạy trên canvas):
 * đọc file → giảm kích thước → đóng dấu → trả dataURL JPEG.
 *
 * Có giới hạn thời gian để không "đứng" mãi nếu webview xử lý ảnh nặng bị
 * lỗi (đã gặp với ảnh 12MP trong webview Zalo).
 */
export function processCaptureFile(file: File, stampLines: string[]): Promise<string> {
  return Promise.race([
    decodeAndStamp(file, stampLines),
    new Promise<string>((_, reject) =>
      setTimeout(
        () => reject(new Error("Xử lý ảnh quá lâu. Hãy thử chụp lại.")),
        PHOTO_PROCESS_TIMEOUT_MS,
      ),
    ),
  ]);
}

type Drawable = ImageBitmap | HTMLImageElement;

async function decodeAndStamp(file: File, stampLines: string[]): Promise<string> {
  const drawable = await decodeImage(file);
  const w = "naturalWidth" in drawable ? drawable.naturalWidth : drawable.width;
  const h = "naturalHeight" in drawable ? drawable.naturalHeight : drawable.height;
  const scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(w || 1280, h || 720));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round((w || 1280) * scale);
  canvas.height = Math.round((h || 720) * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Trình duyệt không hỗ trợ canvas.");
  ctx.drawImage(drawable, 0, 0, canvas.width, canvas.height);
  if ("close" in drawable) drawable.close(); // giải phóng bitmap khỏi bộ nhớ
  drawStamp(ctx, canvas, stampLines);
  return canvas.toDataURL("image/jpeg", PHOTO_JPEG_QUALITY);
}

/*
 * Giải mã ảnh. Ưu tiên createImageBitmap (nhanh, ít tốn bộ nhớ) và giảm kích
 * thước NGAY khi giải mã → tránh treo với ảnh máy ảnh 12MP. Webview không
 * nhận option → giải mã thường; không hỗ trợ createImageBitmap → dùng Image.
 */
function decodeImage(file: File): Promise<Drawable> {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(file, {
      resizeWidth: PHOTO_MAX_SIDE,
      resizeQuality: "high",
      imageOrientation: "from-image",
    })
      .catch(() => createImageBitmap(file))
      .catch(() => decodeViaImage(file));
  }
  return decodeViaImage(file);
}

function decodeViaImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Ảnh không hợp lệ"));
    };
    img.src = url;
  });
}

/* Đóng dấu các dòng chữ vào dải tối ở đáy ảnh. */
function drawStamp(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  lines: string[],
) {
  const pad = Math.max(14, Math.round(canvas.width * 0.012));
  const lineH = Math.max(22, Math.round(canvas.width * 0.024));
  const boxH = lineH * lines.length + pad * 1.4;
  ctx.fillStyle = "rgba(0,0,0,0.62)";
  ctx.fillRect(0, canvas.height - boxH, canvas.width, boxH);
  ctx.fillStyle = "#fff";
  ctx.font = `${Math.max(17, Math.round(canvas.width * 0.018))}px Arial`;
  lines.forEach((line, i) =>
    ctx.fillText(line, pad, canvas.height - boxH + pad + lineH * (i + 0.65)),
  );
}

/* Nội dung dấu: mã lô / thời gian / hạng mục / nhân viên QC. */
export function makeStampLines(qcFile: QcFile, itemTitle: string): string[] {
  return [
    "AGO FRUIT QC",
    `Mã lô / Lot: ${qcFile.LOT_CODE}`,
    `Thời gian / Time: ${formatDateTime(new Date())}`,
    `Mục QC / QC item: ${itemTitle}`,
    `QC: ${qcFile.QC_STAFF || ""}`,
  ];
}

/* Tên file ảnh gửi lên backend: <mã lô>_<hạng mục>_<timestamp>.jpg */
export function makePhotoFileName(qcFile: QcFile, itemTitle: string): string {
  const safeTitle = (itemTitle || "photo")
    .replace(/[^a-zA-Z0-9À-ỹ]+/g, "-")
    .slice(0, 60);
  return `${qcFile.LOT_CODE}_${safeTitle}_${Date.now()}.jpg`;
}
