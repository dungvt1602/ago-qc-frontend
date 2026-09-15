/*
 * Đích của một lần chụp ảnh — quyết định ảnh gắn vào đâu trong hồ sơ và
 * backend lưu theo `targetType` nào. `title` / `subtitle` hiện trên popup
 * xem lại và được đóng dấu lên ảnh.
 */
export type CameraTarget =
  | {
      targetType: "daily";
      dailyQcId: string;
      itemCode: string;
      title: string;
      subtitle: string;
    }
  | {
      targetType: "container";
      photoNo: number;
      title: string;
      subtitle: string;
    }
  | {
      targetType: "sample";
      sampleId: string;
      /** Ô ảnh 1–4 của mẫu. */
      slot: number;
      title: string;
      subtitle: string;
    };
