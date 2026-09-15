"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { PendingPill } from "@/components/shared/pending-indicator";
import { CameraPreviewDialog } from "@/features/qc/components/camera/camera-preview-dialog";
import { usePhotoUpload } from "@/features/qc/hooks/use-photo-upload";
import type { CameraTarget } from "@/features/qc/types/camera";
import type { QcFile } from "@/features/qc/types/qc-file";
import { makeStampLines, processCaptureFile } from "@/features/qc/utils/image";

/*
 * Luồng chụp ảnh của một hồ sơ, đặt trong layout `/qc/[id]` để mọi màn con
 * (hạng mục QC ngày, mẫu, ảnh container) chỉ cần gọi `openCamera(target)`.
 *
 * Mở camera điện thoại qua <input type="file" capture="environment"> — ổn
 * định trong trình-duyệt-trong-app Zalo/Telegram/Facebook. KHÔNG dùng
 * getUserMedia (hay crash / đóng webview).
 *
 * Chụp xong: xử lý ảnh (giảm cỡ + đóng dấu, có timeout) → popup xem lại →
 * "Sử dụng ảnh" gọi upload lạc quan (usePhotoUpload) rồi đóng popup ngay.
 */
interface CameraContextValue {
  openCamera: (target: CameraTarget) => void;
}

const CameraContext = createContext<CameraContextValue | null>(null);

export function useCamera(): CameraContextValue {
  const ctx = useContext(CameraContext);
  if (!ctx) throw new Error("useCamera phải dùng bên trong CameraProvider");
  return ctx;
}

export function CameraProvider({
  qcFile,
  children,
}: {
  qcFile: QcFile;
  children: React.ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const targetRef = useRef<CameraTarget | null>(null);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<{ target: CameraTarget; dataUrl: string } | null>(null);
  const upload = usePhotoUpload(qcFile);

  /* Reset value để chụp lại cùng mục vẫn kích hoạt onChange. */
  const startCapture = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    input.value = "";
    input.click();
  }, []);

  const openCamera = useCallback(
    (target: CameraTarget) => {
      targetRef.current = target;
      startCapture();
    },
    [startCapture],
  );

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = targetRef.current;
    if (!file || !target) return;
    setProcessing(true);
    try {
      const dataUrl = await processCaptureFile(file, makeStampLines(qcFile, target.title));
      setPreview({ target, dataUrl });
    } catch {
      toast.error("Không xử lý được ảnh, hãy chụp lại.");
    } finally {
      setProcessing(false);
    }
  };

  const closePreview = () => {
    setPreview(null); // giải phóng dataURL khỏi bộ nhớ
    if (inputRef.current) inputRef.current.value = "";
  };

  const usePhoto = () => {
    if (!preview) return;
    const { target, dataUrl } = preview;
    closePreview(); // hiện ảnh ngay + đóng camera, không bắt người dùng chờ mạng
    upload.mutate({ target, dataUrl });
  };

  return (
    <CameraContext.Provider value={{ openCamera }}>
      {children}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handleFile}
      />
      {processing ? <PendingPill label="Đang xử lý ảnh..." /> : null}
      <CameraPreviewDialog
        open={!!preview}
        title={preview?.target.title ?? ""}
        subtitle={preview?.target.subtitle ?? ""}
        dataUrl={preview?.dataUrl ?? ""}
        onRetake={startCapture}
        onUse={usePhoto}
        onClose={closePreview}
      />
    </CameraContext.Provider>
  );
}
