import type { IconComponent } from "../types";
import { h } from "vue";

// 此文件由 scripts/generate-icons.ts 自动生成
// 请勿手动编辑，运行 pnpm gen:icons 重新生成

export const PauseOutlined: IconComponent = () =>
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
        d: "M304 176h80v672h-80zm408 0h-64c-4.4 0-8 3.6-8 8v656c0 4.4 3.6 8 8 8h64c4.4 0 8-3.6 8-8V184c0-4.4-3.6-8-8-8z",
      }),
    ],
  );
