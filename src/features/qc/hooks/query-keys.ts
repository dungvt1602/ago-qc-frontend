/*
 * Query key của module QC — theo quy ước `[module, resource, params]`.
 * Chỉ khai ở đây; hook và mutation đều lấy key từ đây để invalidate đúng.
 */
export const qcKeys = {
  all: ["qc"] as const,
  files: () => ["qc", "files"] as const,
  file: (id: string) => ["qc", "file", id] as const,
};
