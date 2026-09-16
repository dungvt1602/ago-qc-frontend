<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — AGO QC Frontend Coding Instructions

## Project Context

Ứng dụng QC lô hàng của AGO Fruit (AGO Import Export Company Limited): nhân viên QC dùng
**trên điện thoại** (thường trong webview Zalo / Telegram / Facebook) để tạo hồ sơ QC hàng nhập /
hàng xuất, nhập thông tin lô, chụp ảnh từng hạng mục, và xuất PDF song ngữ.

Backend là một dịch vụ riêng (`https://ago-qc-backend.onrender.com/api`): **một endpoint POST**
nhận `{ action, payload }`, trả `{ ok, result }` / `{ ok: false, error }`. Không có Swagger nên
KHÔNG có codegen — hàm gọi API viết tay trong `features/<module>/api/`.

Kiến trúc, quy tắc, thư viện soi gương repo `ago_erp/ago_frontend` để cả hai frontend cùng một kiểu.

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui (Base UI) + lucide-react
- TanStack Query (server state) + Axios (HTTP)
- React Hook Form + Zod (form + validation)
- sonner (toast)

Không thêm thư viện cho việc stack này đã giải quyết. Giữ app nhẹ — nó chạy trong webview
điện thoại tầm trung, mạng kho chập chờn.

## Rule 0 — Always Follow the Code Framework (bất khả xâm phạm)

Mọi thay đổi — tính năng, sửa lỗi, chỉnh giao diện — PHẢI nằm trong khung dưới. Không có ngoại lệ
"sửa nhanh". Chủ dự án mở repo sau nhiều tháng vẫn phải biết ngay từng mẩu code nằm ở đâu.

1. **Không gì đi vòng cấu trúc.** Sửa một dòng UI vẫn nằm trong component sở hữu UI đó. Không
   nhét component / fetch / state ad-hoc vào `page.tsx` "tạm thời" — code tạm là code vĩnh viễn.
2. **Biết code đặt đâu trước khi viết:**

| Bạn muốn thêm... | Đặt vào |
|---|---|
| Màn hình / route mới | `app/<route>/page.tsx` — chỉ render component từ features |
| Component nghiệp vụ | `features/<module>/components/<nghiệp-vụ-con>/` — gom theo nghiệp vụ con |
| Gọi API backend | `features/<module>/api/` (qua `lib/api.ts`) + hook trong `features/<module>/hooks/` |
| Form + validation | Zod schema trong `features/<module>/schemas/` + RHF trong component |
| Type dữ liệu khớp backend | `features/<module>/types/` |
| Hằng số nghiệp vụ (danh mục hạng mục QC...) | `features/<module>/constants.ts` |
| Util thuần của một feature (xử lý ảnh, format ngày) | `features/<module>/utils/` |
| Component dùng chung ≥2 feature | `components/shared/` |
| Component shadcn mới | `npx shadcn add ...` → `components/ui/` (không sửa tay) |
| Route path / tên app / màu thương hiệu | `lib/constants.ts` |
| Util thuần toàn app | `lib/` |

3. **Tái dùng trước khi viết.** Trước khi tạo component/hook/util, tìm cái sẵn có
   (`components/shared`, `lib/`, thư mục feature). Hai bảng/form/nhãn trùng nhau là bug.
4. **Viết cho người sửa sau.** Component nhỏ (tách khi một file làm nhiều việc), tên rõ nghĩa,
   block comment cho hạ tầng (Code Comment Rule).
5. **Đổi chính khung** (thư mục cấp cao mới, pattern mới) phải cập nhật `AGENTS.md` + `README.md`
   + plan trong `docs/plans/` trong cùng thay đổi.

## Rule 1 — Tốc độ trước, đẹp sau

App mở hàng chục lần một ngày ngoài kho, trên điện thoại, mạng yếu. "UI tạm được" chấp nhận
được; màn chậm thì không.

- **Dữ liệu**: dựa vào cache TanStack Query + `staleTime`, không gọi lại API mỗi lần mount;
  mutation trả về hồ sơ mới thì `setQueryData` ngay thay vì refetch.
- **Cảm giác nhanh**: skeleton khớp bố cục cuối; **optimistic UI** cho chụp ảnh (hiện ảnh ngay,
  upload chạy ngầm, lỗi thì hoàn lại + báo).
- **Ảnh**: nén phía client trước khi gửi (giới hạn cạnh dài + JPEG quality) — giữ đúng tham số
  trong `features/qc/constants.ts`.
- **Bundle**: không thêm dependency cho việc stack đã có; icon import lẻ từ lucide.
- **Không hiệu ứng tốn kém**: chỉ CSS, không chặn thao tác; tôn trọng `prefers-reduced-motion`.

## Rule 2 — Sửa đâu, đụng đó

Khi được yêu cầu sửa màn/module X, CHỈ chạm file của X. Không "tiện tay" sửa module khác, shared
component, theme, config.

- **Shared code** (`components/shared`, `components/ui`, `lib/`, `types/`, `globals.css`, configs)
  ảnh hưởng mọi màn → chỉ đổi khi yêu cầu nói rõ về nó, hoặc dừng lại hỏi trước.
- Cần đụng chỗ khác để sửa đúng → DỪNG và báo, không âm thầm mở rộng thay đổi.
- Không refactor / đổi tên / format hàng loạt ngoài phạm vi.

## Rule 3 — Đổi giao diện, giữ nguyên kiến trúc

Yêu cầu về giao diện — từ bất kỳ ai — chỉ cho phép đổi **lớp trình bày**: JSX, class Tailwind,
token theme, khoảng cách, chữ. KHÔNG được đổi lớp gọi API (`lib/api.ts`, `features/*/api`,
`features/*/hooks`, query key), cấu trúc thư mục, luồng `component → hook → api → axios`, type
DTO, schema Zod, providers, routing. Nếu yêu cầu giao diện thật sự cần đụng kiến trúc → dừng và
nói rõ, xin go-ahead kỹ thuật trước.

## Rule 4 — Dọn sạch rồi mới code

Khi dựng lại giao diện trên code có sẵn: **XÓA HẲN phần cũ không còn dùng TRƯỚC, rồi mới viết
mới.** Repo không có hai phiên bản của cùng một thứ. Thứ tự: xác định phạm vi bị thay → xóa
(component, type, util, route, mục menu đi kèm) → viết mới → quét lại (không export/file mồ côi,
không import thừa, `build` + `lint` xanh). Năng lực bản cũ mà bản mới vẫn cần (optimistic, skeleton,
empty/error state, a11y) phải mang sang — rơi mất là regression.

## Architecture Rule: Feature-first

```text
src/
├── app/          # App Router: routing + layouts ONLY
├── features/     # mỗi module nghiệp vụ một thư mục (qc, ...)
├── components/   # shared UI only (ui/ = shadcn, layout/, shared/, pwa/)
├── lib/          # axios instance, query client, constants, utils
├── providers/    # app-level providers
└── types/        # global types (envelope API)
```

Trong mỗi feature:

```text
features/<module>/
├── api/          # hàm gọi API của module (qua lib/api.ts)
├── components/   # UI — gom theo sub-domain: files/ detail/ daily/ container/ camera/ shared/
├── hooks/        # TanStack Query hooks (useXxx, useXxxMutation)
├── schemas/      # Zod schemas cho form
├── types/        # type dữ liệu khớp backend
├── utils/        # util thuần của module
└── constants.ts  # hằng số nghiệp vụ
```

- `app/` chỉ import từ `features/` và `components/` rồi render. Không fetch, không nghiệp vụ
  trong `page.tsx` / `layout.tsx`. Component feature đọc `useParams()` khi cần id trên URL.
- Feature KHÔNG import nội bộ feature khác. Dùng chung → `components/shared`, `lib/`, `types/`.
- Component gom theo **nghiệp vụ con** (sub-domain), không theo loại file (`dialogs/`, `forms/` là
  anti-pattern). Dùng chung ≥2 sub-domain trong một feature → `features/<module>/components/shared/`.

## API Rule

- Mọi HTTP đi qua axios instance duy nhất `src/lib/api.ts`. Không `fetch`/`axios` trong component.
- Hàm gọi API của module ở `features/<module>/api/` — gọi `api.post("", { action, payload })`,
  bóc envelope `{ ok, result }` và ném `Error(error)` khi `ok === false`. Component chỉ dùng hook
  trong `features/<module>/hooks/`.
- Base URL từ `NEXT_PUBLIC_API_URL` (hoặc mặc định `/api` qua proxy) — không hardcode.
- Đọc lỗi API bằng `lib/api-error.ts` (`apiErrorMessage`) — một giọng báo lỗi cho cả app.
- **Tách lớp bất khả xâm phạm**: UI component = giao diện thuần (JSX + form state), KHÔNG gọi API.
  Luồng một chiều `component → hook → api → axios`.

## State Rule

- Server data = TanStack Query only. Query key `[module, resource, params]`,
  vd `['qc', 'files']`, `['qc', 'file', id]`.
- Mutation trả về bản hồ sơ mới → `queryClient.setQueryData` cho key chi tiết + invalidate
  danh sách. Không copy data sang `useState`.
- UI state cục bộ (dialog mở, mục camera đang chụp) = `useState` / context trong feature.
- Form = React Hook Form + Zod resolver; schema trong `features/<module>/schemas/` là nguồn sự
  thật duy nhất của validation.

## Routing Rule

- Route path khai báo trong `src/lib/constants.ts` (`ROUTES`) — không hardcode chuỗi path.
- Mỗi đầu mục thao tác của hồ sơ là **một route con** (`/qc/[id]/info`, `/daily`, ...) để
  nút Back của điện thoại/webview hoạt động đúng, thay cho state `section` của bản vanilla.

## Naming Convention

- File/thư mục: kebab-case (`qc-file-card.tsx`, `use-qc-file.ts`).
- Component: PascalCase. Hook: `useXxx`.
- Type dữ liệu giữ đúng tên cột backend trả về (`LOT_CODE`, `QC_FILE_NO`, ...) để không phải
  map hai chiều.

## Coding Rules

- TypeScript strict. Không `any` trừ khi giao tiếp thư viện không có type, và cô lập chỗ đó.
- Server Components mặc định; `"use client"` chỉ nơi cần hook/tương tác.
- Loading dùng shadcn `Skeleton` khớp bố cục cuối. Lỗi hiện `ApiErrorState` có nút thử lại.
- **Mobile-first**: mọi màn dùng được ở 390px, một tay; nút chính cao ≥ 40px; ô nhập font
  ≥ 16px (tránh iOS tự zoom).
- **Camera**: dùng `<input type="file" accept="image/*" capture="environment">` — KHÔNG dùng
  `getUserMedia` (crash / đóng webview Zalo, Telegram, Facebook). Giải mã bằng
  `createImageBitmap` có resize ngay khi decode, có timeout, rồi mới vẽ canvas.
- Xác nhận xóa dùng `ConfirmDialog` (không `window.confirm`).

## Code Comment Rule

Layout shell, provider, interceptor, hook hạ tầng, util xử lý ảnh: thêm block comment ngắn giải
thích làm gì và quy tắc nghiệp vụ / kiến trúc liên quan. Không comment lặp lại tên.

## CI/CD Rule

- CI: `.github/workflows/ci.yml` chạy `npm ci → lint → build` khi push/PR vào `main`/`dev`.
- CD: chưa có. Khi cần demo, nối repo với Vercel (đặt `NEXT_PUBLIC_API_URL` / `BACKEND_URL`
  trong dashboard).

## Git Workflow Rule

Chủ dự án điều khiển git. Chỉ commit / push / tạo nhánh khi được yêu cầu rõ. Xong việc →
`npm run build` + `npm run lint` xanh → báo "ready" → chờ lệnh.

## Planning Rule

Việc lớn (module mới, đổi app shell, đổi lớp API, xuyên nhiều feature) phải có plan trong
`docs/plans/PLAN-xxxx-<ten>.md` trước khi code; cập nhật checklist khi xong.

## Done Definition

- `npm run build` không lỗi TypeScript. `npm run lint` xanh.
- Rule 0–4 được tôn trọng. Không hardcode URL / route path.
- API qua axios instance chung + TanStack Query. Màn dùng được ở bề rộng điện thoại.
