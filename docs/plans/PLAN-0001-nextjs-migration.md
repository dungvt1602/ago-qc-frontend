# PLAN-0001 — Chuyển AGO QC App từ vanilla JS sang Next.js

## Bối cảnh

Bản đầu của app là 4 file tĩnh (`index.html`, `app.js` 45KB, `styles.css`, `sw.js`): mọi màn
render bằng `innerHTML`, state là biến toàn cục, handler gắn qua `window.*`. Khó mở rộng (thêm
loại hồ sơ, thêm mẫu, thêm ngôn ngữ PDF đều phải chen vào một file), không có type, không có
kiểm tra build.

Công ty đã có `ago_erp/ago_frontend` (Next.js 16, feature-first, shadcn, TanStack Query). Chuyển
QC app sang cùng nền để hai frontend một kiểu, và để sau này gộp QC vào ERP (GĐ2) không phải viết
lại.

## Mục tiêu

1. **Nhánh `dev`** — nền Next.js sạch, build/lint xanh, chưa có nghiệp vụ QC:
   - Tooling: Next 16, React 19, TS strict, Tailwind v4, shadcn (Base UI), ESLint flat config.
   - Hạ tầng: axios instance duy nhất, `api-error`, `query-client`, providers, envelope type.
   - App shell: header (logo + "Tải lại"), `AppShell`, `PageHeader`, `ConfirmDialog`,
     `ApiErrorState`, `StatusBadge`, `PendingIndicator`.
   - PWA: `app/manifest.ts` + `public/sw.js` + đăng ký SW + icon/theme giữ nguyên bản cũ.
   - Proxy `/api` → backend (tùy chọn; mặc định `.env.example` gọi thẳng backend như bản cũ).
   - Tài liệu: `README.md`, `AGENTS.md`, plan này.
2. **Nhánh tính năng `feature/qc-app` (tách từ `dev`)** — port toàn bộ nghiệp vụ hiện có vào
   `features/qc`:
   - Danh sách hồ sơ; tạo hồ sơ hàng nhập / hàng xuất; xóa hồ sơ.
   - Chi tiết hồ sơ với 5 đầu mục: Thông tin lô · Thống kê · QC chất lượng · Ảnh container ·
     Xuất PDF (nội bộ / khách hàng EN).
   - QC chất lượng: hàng xuất = 6 hạng mục/đợt (ảnh + tỷ lệ + nhận xét); hàng nhập = mẫu QC,
     mỗi mẫu 4 ảnh. Thêm/sửa ngày/xóa đợt, thêm/xóa mẫu.
   - Ảnh container: 21 mục, mỗi mục ảnh + tỷ lệ + nhận xét.
   - Camera: input file `capture=environment`, nén 1280px/JPEG 0.7, đóng dấu mã lô / thời gian /
     nhân viên / hạng mục, popup xem lại, optimistic upload chạy ngầm, xóa ảnh.
   - Toast, chỉ báo đang xử lý, xác nhận xóa bằng dialog.

## Quyết định kiến trúc

| Vấn đề | Quyết định | Lý do |
|---|---|---|
| Điều hướng đầu mục | Mỗi đầu mục = route con `/qc/[id]/<section>` | Nút Back webview hoạt động; link chia sẻ được; layout `[id]` giữ header + step menu |
| Dữ liệu chi tiết | Một query `['qc','file',id]`; mutation trả hồ sơ mới → `setQueryData` | Backend đã trả cả hồ sơ sau mỗi thao tác — không refetch thừa |
| Upload ảnh | Optimistic: gắn dataURL vào cache, upload `meta.silent`, lỗi thì rollback | Giữ cảm giác "ăn liền" của bản cũ |
| Gọi backend | Mặc định gọi thẳng (`NEXT_PUBLIC_API_URL`), có proxy `/api` dự phòng | Ảnh base64 không phải đi vòng qua server Next; backend đã bật CORS |
| Camera | Giữ input file, không `getUserMedia` | Đã fix crash webview ở bản cũ — không được rơi mất |
| Form | RHF + Zod, một schema cho cả tạo và sửa thông tin lô | Trường bắt buộc: PO, tên hàng, nhân viên QC (như `required` bản cũ) |

## Checklist

### Nhánh `dev` — nền
- [x] Xóa file vanilla, chuyển asset vào `public/`
- [x] package.json, tsconfig, next.config, eslint, postcss, components.json, .gitignore, .env.example
- [x] `lib/`: api, api-error, constants, query-client, utils · `types/common.ts` · providers
- [x] `components/ui` (shadcn) · `components/layout` · `components/shared` · `components/pwa`
- [x] `app/`: layout, page, globals.css, manifest.ts, loading, error, not-found, api proxy
- [x] README, AGENTS, CI workflow, launch.json
- [x] `npm run lint` + `npm run build` xanh

### Nhánh `feature/qc-app` — `features/qc`
- [ ] types, constants, api, hooks (list/detail/mutations/upload)
- [ ] schemas (qc-file, summary, item-result, daily-session)
- [ ] utils (image decode/stamp, photo merge, format)
- [ ] components: files/ detail/ daily/ container/ camera/ shared/
- [ ] routes `/`, `/qc/new`, `/qc/[id]/...`
- [ ] `npm run lint` + `npm run build` xanh, kiểm tra trên bề rộng điện thoại
