import type { IconComponent } from "../types";
import { h } from "vue";

// 此文件由 scripts/generate-icons.ts 自动生成
// 请勿手动编辑，运行 pnpm gen:icons 重新生成

export const CameraFilled: IconComponent = () =>
  h(
    "svg",
    {
      viewBox: "0 0 1024 1024",
      width: "1em",
      height: "1em",
      fill: "currentColor",
      focusable: false,
    },
    [
      h("path", {
        d: "M864 260H728l-32.4-90.8a32.07 32.07 0 0 0-30.2-21.2H358.6c-13.5 0-25.6 8.5-30.1 21.2L296 260H160c-44.2 0-80 35.8-80 80v456c0 44.2 35.8 80 80 80h704c44.2 0 80-35.8 80-80V340c0-44.2-35.8-80-80-80zM512 716c-88.4 0-160-71.6-160-160s71.6-160 160-160 160 71.6 160 160-71.6 160-160 160zm-96-160a96 96 0 1 0 192 0 96 96 0 1 0-192 0z",
      }),
    ],
  );
