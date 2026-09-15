# AGO QC Frontend

> Ứng dụng QC lô hàng của AGO Fruit: tạo hồ sơ QC (hàng nhập / hàng xuất), nhập thông tin lô,
> chụp ảnh từng hạng mục ngay trên điện thoại, xuất PDF song ngữ.
> Frontend Next.js (App Router), nối backend QC tại `https://ago-qc-backend.onrender.com/api`.
> Kiến trúc và quy tắc code soi gương `ago_erp/ago_frontend`.

---

## 1. Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| UI | Tailwind CSS v4 + shadcn/ui (Base UI) + lucide icons |
| Server state | TanStack Query |
| HTTP | Axios (instance duy nhất `src/lib/api.ts`) |
| Form | React Hook Form + Zod |
| Thông báo | sonner (toast) |
| PWA | `app/manifest.ts` + `public/sw.js` (cài app ra màn hình chính) |

Backend QC nhận **một endpoint POST** với body `{ action, payload }` và trả `{ ok, result }`
(xem `src/types/common.ts`).

---

## 2. Project Structure

```text
ago-qc-frontend/
├── AGENTS.md                     # ★ Quy tắc code (Rule 0–4) — ĐỌC TRƯỚC KHI CODE
├── CLAUDE.md                     # Trỏ về AGENTS.md (cho AI agent)
├── README.md
├── docs/plans/                   # Kế hoạch từng việc lớn (PLAN-xxxx)
├── public/                       # logo.png, icon-192/512.png, sw.js
├── src/
│   ├── app/                      # App Router: CHỈ routing + layout
│   │   ├── layout.tsx            # Root: font + providers + đăng ký SW
│   │   ├── page.tsx              # /  → render component từ features/
│   │   ├── manifest.ts           # Web App Manifest (PWA)
│   │   ├── loading.tsx · error.tsx · not-found.tsx
│   │   ├── globals.css           # Tailwind + theme xanh AGO (CSS variables)
│   │   └── api/[[...path]]/route.ts   # Proxy same-origin /api → BACKEND_URL
│   ├── features/                 # ★ Nghiệp vụ theo module (features/qc — nhánh tính năng)
│   │   └── <module>/  api/ components/<sub-domain>/ hooks/ schemas/ types/ utils/ constants.ts
│   ├── components/
│   │   ├── ui/                   # shadcn/ui — không sửa tay
│   │   ├── layout/               # app-shell, app-header, brand-mark
│   │   ├── shared/               # page-header, confirm-dialog, api-error-state,
│   │   │                         #   status-badge, pending-indicator
│   │   └── pwa/                  # service-worker-register
│   ├── lib/                      # api.ts (axios), api-error.ts, query-client.ts,
│   │                             #   constants.ts (ROUTES, tên app), utils.ts (cn)
│   ├── providers/app-providers.tsx
│   └── types/common.ts           # Envelope API của backend QC
├── .env.example                  # Mẫu env — COMMIT (env thật không commit)
├── next.config.ts · eslint.config.mjs · postcss.config.mjs · components.json · tsconfig.json
└── package.json                  # dev, build, start, lint
```

---

## 3. Getting Started

Yêu cầu: Node.js 20+.

```bash
npm install
copy .env.example .env.local
npm run dev
# → http://localhost:3000
```

Test trên điện thoại (camera thật): mở `http://<IP LAN>:3000`. IP LAN cần nằm trong
`allowedDevOrigins` ở `next.config.ts`.

| Lệnh | Mục đích |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build + type check |
| `npm run start` | Chạy bản build |
| `npm run lint` | ESLint |

### Biến môi trường

| Biến | Mặc định | Mô tả |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://ago-qc-backend.onrender.com/api` (trong `.env.example`) | Đặt → trình duyệt gọi thẳng backend (như bản vanilla). Để trống → gọi same-origin `/api` qua proxy |
| `BACKEND_URL` | `https://ago-qc-backend.onrender.com` | URL backend mà proxy `/api` chuyển tiếp tới (server-side) |

---

## 4. Core Rules (tóm tắt — chi tiết trong AGENTS.md)

```text
1. app/ chỉ routing — logic nằm trong features/.
2. Mọi API call qua axios instance chung + TanStack Query. Component không gọi axios.
3. Server state = TanStack Query. Không copy sang state khác.
4. Form = React Hook Form + Zod schema trong features/<module>/schemas/.
5. Route path khai báo tập trung trong lib/constants.ts.
6. Mobile-first: app dùng một tay trên điện thoại, trong webview Zalo/Telegram.
7. Việc lớn phải có plan trong docs/plans/ trước khi code.
```

---

## 5. Lịch sử

- Bản đầu: vanilla JS (`index.html` + `app.js` + `styles.css`) — xem git history trước commit
  chuyển nền.
- Chuyển sang Next.js: `docs/plans/PLAN-0001-nextjs-migration.md`.
