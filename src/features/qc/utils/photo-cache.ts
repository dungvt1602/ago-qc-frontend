import { SAMPLE_PHOTO_SLOTS } from "@/features/qc/constants";
import type { CameraTarget } from "@/features/qc/types/camera";
import type {
  ContainerItem,
  DailyItem,
  QcFileDetail,
  SamplePhoto,
} from "@/features/qc/types/qc-file";

/*
 * Cập nhật ảnh của MỘT đích (daily item / container item / ô mẫu) trong bộ
 * dữ liệu hồ sơ, theo kiểu bất biến (trả về object mới, không sửa cache
 * tại chỗ) — để TanStack Query nhận ra thay đổi và React render lại đúng.
 *
 * Dùng cho optimistic upload:
 *   snapshot = readPhoto(detail, target)         // giữ để hoàn tác
 *   detail'  = applyPhoto(detail, target, local) // hiện ảnh ngay
 *   lỗi      → applyPhoto(detail, target, snapshot)
 *   xong     → applyPhoto(detail, target, readPhoto(fromServer, target))
 */

export type PhotoSnapshot =
  | { kind: "item"; PHOTO_URL?: string; PHOTO_PATH?: string; CAPTURED_AT?: string }
  | { kind: "sample"; photo: SamplePhoto | null };

function slotIndex(slot: number): number {
  return Math.max(1, Math.min(SAMPLE_PHOTO_SLOTS, Number(slot) || 1)) - 1;
}

function itemSnapshot(it?: DailyItem | ContainerItem): PhotoSnapshot {
  return {
    kind: "item",
    PHOTO_URL: it?.PHOTO_URL ?? "",
    PHOTO_PATH: it?.PHOTO_PATH,
    CAPTURED_AT: it?.CAPTURED_AT ?? "",
  };
}

export function readPhoto(detail: QcFileDetail, target: CameraTarget): PhotoSnapshot {
  if (target.targetType === "daily") {
    const sess = detail.dailySessions.find((s) => s.ID === target.dailyQcId);
    return itemSnapshot(sess?.items?.find((it) => it.ITEM_CODE === target.itemCode));
  }
  if (target.targetType === "container") {
    return itemSnapshot(
      detail.containerItems.find(
        (it) => Number(it.PHOTO_NO) === Number(target.photoNo),
      ),
    );
  }
  for (const sess of detail.dailySessions) {
    const sm = sess.samples?.find((x) => x.ID === target.sampleId);
    if (sm) {
      return { kind: "sample", photo: sm.PHOTOS?.[slotIndex(target.slot)] ?? null };
    }
  }
  return { kind: "sample", photo: null };
}

export function applyPhoto(
  detail: QcFileDetail,
  target: CameraTarget,
  snap: PhotoSnapshot,
): QcFileDetail {
  if (target.targetType === "daily" && snap.kind === "item") {
    return {
      ...detail,
      dailySessions: detail.dailySessions.map((sess) =>
        sess.ID !== target.dailyQcId
          ? sess
          : {
              ...sess,
              items: sess.items?.map((it) =>
                it.ITEM_CODE !== target.itemCode
                  ? it
                  : { ...it, PHOTO_URL: snap.PHOTO_URL, PHOTO_PATH: snap.PHOTO_PATH, CAPTURED_AT: snap.CAPTURED_AT },
              ),
            },
      ),
    };
  }
  if (target.targetType === "container" && snap.kind === "item") {
    return {
      ...detail,
      containerItems: detail.containerItems.map((it) =>
        Number(it.PHOTO_NO) !== Number(target.photoNo)
          ? it
          : { ...it, PHOTO_URL: snap.PHOTO_URL, PHOTO_PATH: snap.PHOTO_PATH, CAPTURED_AT: snap.CAPTURED_AT },
      ),
    };
  }
  if (target.targetType === "sample" && snap.kind === "sample") {
    const idx = slotIndex(target.slot);
    return {
      ...detail,
      dailySessions: detail.dailySessions.map((sess) => {
        if (!sess.samples?.some((x) => x.ID === target.sampleId)) return sess;
        return {
          ...sess,
          samples: sess.samples.map((sm) => {
            if (sm.ID !== target.sampleId) return sm;
            const photos: (SamplePhoto | null)[] = [...(sm.PHOTOS ?? [])];
            while (photos.length < SAMPLE_PHOTO_SLOTS) photos.push(null);
            photos[idx] = snap.photo;
            return { ...sm, PHOTOS: photos };
          }),
        };
      }),
    };
  }
  return detail;
}
