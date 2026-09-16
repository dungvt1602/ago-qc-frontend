/* Util định dạng ngày giờ của module QC. */

const pad = (n: number) => String(n).padStart(2, "0");

/*
 * Ngày hôm nay dạng yyyy-mm-dd theo GIỜ MÁY (không dùng toISOString — hàm đó
 * trả ngày UTC, sau 0h–7h sáng ở Việt Nam sẽ lệch về hôm trước).
 */
export function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/* "yyyy-mm-dd HH:MM:SS" — định dạng backend dùng cho CAPTURED_AT. */
export function formatDateTime(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
