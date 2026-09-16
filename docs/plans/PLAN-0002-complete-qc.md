# PLAN-0002 — Port tính năng "Hoàn tất QC" từ `main` (vanilla) sang Next.js

## Bối cảnh

Sau khi tách nhánh Next.js, `main` (bản vanilla) có thêm commit f049a65 (15/09/2026): tích hợp với
hệ thống checklist — hồ sơ QC có thể **Hoàn tất** khi chụp đủ 100% ảnh, sau đó bị **khóa** (không
sửa / chụp / xóa), có thể **Mở lại**. Không merge `main` vào nhánh Next.js (chỉ xung đột ở
`app.js`/`styles.css` đã xóa) — port lại tính năng vào `features/qc`.

## Hợp đồng backend (đã kiểm tra thật 16/09/2026)

- `getQCFile` và mọi mutation trả thêm `progress: { filled, total, units, complete, unitLabel }`.
- `qcFile.QC_DONE_AT` (chuỗi thời gian, rỗng nếu chưa xong), `qcFile.ORDER_ID` (mã đơn bên
  checklist, rỗng nếu không liên kết) — có cả trong `listQCFiles`.
- Action mới: `completeQC { qcFileId }`, `reopenQC { qcFileId }` → trả `QcFileDetail`.
- Backend cũng tự chặn thao tác sửa khi đã hoàn tất; frontend chặn trước để báo rõ.

## Việc cần làm (tương ứng bản vanilla)

| Bản vanilla | Next.js |
|---|---|
| `orderPill` / `donePill` ở thẻ danh sách + header chi tiết | `components/shared/qc-file-flag-badges.tsx`, dùng ở `files/qc-file-card` + `detail/qc-file-header` |
| `renderCompletionCard` trên màn Tổng quan (tiến độ x/y, thanh %, nút Hoàn tất / Mở lại) | `components/detail/completion-card.tsx`, render đầu `overview-section` |
| `completeQC` / `reopenQC` (confirm → api → setMsg) | `api/qc-api.ts` + `useCompleteQc` / `useReopenQc` trong `hooks/use-qc-file-mutations.ts`, xác nhận bằng `ConfirmDialog` |
| `isLocked` / `guardLocked` chặn 15 thao tác sửa bằng toast | `utils/qc-file.ts#isQcLocked` + `hooks/use-qc-lock.ts#useQcLock()` trả `{ locked, guard }`; gọi `guard()` ở đầu handler sửa; camera chặn tập trung trong `CameraProvider.openCamera` |
| `.progress` CSS | Thanh tiến độ Tailwind trong `completion-card` |

Xuất PDF và xóa hồ sơ KHÔNG bị khóa (giữ đúng bản vanilla).

## Checklist

- [x] types: `QcProgress`, `QC_DONE_AT`, `ORDER_ID`, `QcFileDetail.progress`
- [x] api + hooks: completeQC / reopenQC, `useQcLock`
- [x] UI: nhãn cờ, thẻ hoàn tất, guard ở các handler sửa + camera
- [x] lint + build xanh
- [x] Xem màn Tổng quan với hồ sơ đủ 100% ảnh (thanh 33/33, nút Hoàn tất bật)
- [x] Giả lập trạng thái khóa bằng stub XHR trong trang (KHÔNG ghi backend): thẻ "Đã hoàn tất",
      nhãn Đơn #N / QC xong ở header, guard chặn + toast ở: lưu thông tin lô, lưu mục container,
      xóa ảnh container, mở camera, thêm đợt QC; nút Xuất PDF vẫn bật
- [ ] Chưa xác nhận trên UI (cùng cơ chế guard, chỉ chưa chạy được phép thử): lưu/xóa phiên,
      lưu hạng mục QC ngày, thêm/xóa mẫu, xóa ảnh mẫu; nút Mở lại → `reopenQC`
- [ ] Chưa thử thật `completeQC` / `reopenQC` trên backend

## LƯU Ý — backend là production

`https://ago-qc-backend.onrender.com/api` là backend production đang dùng thật. KHÔNG bấm thao tác
ghi trên trình duyệt khi app trỏ vào đó. Muốn thử luồng Hoàn tất / Mở lại thật cần backend staging
hoặc mock cục bộ (đặt qua `NEXT_PUBLIC_API_URL`).
