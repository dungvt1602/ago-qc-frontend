import { type NextRequest } from "next/server";

/*
 * Proxy same-origin sang backend QC (dev + self-host).
 *
 * Trình duyệt gọi /api trên CHÍNH origin của app (không CORS), handler này
 * chuyển tiếp sang BACKEND_URL như một cuộc gọi server-to-server — bỏ các
 * header Origin/Referer/Host của trình duyệt. Body (JSON `{action, payload}`,
 * kể cả ảnh base64) và query string được chuyển nguyên vẹn.
 *
 * Backend QC chỉ có MỘT endpoint POST tại /api nên dùng optional catch-all
 * `[[...path]]`: /api → BACKEND_URL/api, /api/x → BACKEND_URL/api/x.
 *
 * Không dùng khi NEXT_PUBLIC_API_URL được đặt (lúc đó trình duyệt gọi thẳng).
 */
const BACKEND_URL =
  process.env.BACKEND_URL ?? "https://ago-qc-backend.onrender.com";

/*
 * Render free tier ngủ khi rảnh; lần gọi đầu có thể mất ~60s để thức dậy.
 * Nâng thời gian chạy tối đa của handler (Vercel) để không cắt ngang.
 */
export const maxDuration = 120;

/* Header hop-by-hop / origin KHÔNG được chuyển tiếp lên backend. */
const STRIP_HEADERS = new Set([
  "host",
  "origin",
  "referer",
  "connection",
  "content-length",
  "accept-encoding",
]);

async function proxy(req: NextRequest, path: string[] | undefined) {
  const suffix = path?.length ? `/${path.join("/")}` : "";
  const target = `${BACKEND_URL}/api${suffix}${req.nextUrl.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!STRIP_HEADERS.has(key.toLowerCase())) headers.set(key, value);
  });

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const upstream = await fetch(target, {
    method: req.method,
    headers,
    body: hasBody ? await req.arrayBuffer() : undefined,
    redirect: "follow",
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) responseHeaders.set("content-type", contentType);

  return new Response(await upstream.arrayBuffer(), {
    status: upstream.status,
    headers: responseHeaders,
  });
}

type Ctx = { params: Promise<{ path?: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}
export async function POST(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}
