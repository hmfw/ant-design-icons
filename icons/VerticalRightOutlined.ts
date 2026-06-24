import type { IconComponent } from "../types";
import { h } from "vue";

// 此文件由 scripts/generate-icons.ts 自动生成
// 请勿手动编辑，运行 pnpm gen:icons 重新生成

export const VerticalRightOutlined: IconComponent = () =>
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
        d: "M326 164h-64c-4.4 0-8 3.6-8 8v688c0 4.4 3.6 8 8 8h64c4.4 0 8-3.6 8-8V172c0-4.4-3.6-8-8-8zm444 72.4V164c0-6.8-7.9-10.5-13.1-6.1L335 512l421.9 354.1c5.2 4.4 13.1.7 13.1-6.1v-72.4c0-9.4-4.2-18.4-11.4-24.5L459.4 512l299.2-251.1c7.2-6.1 11.4-15.1 11.4-24.5z",
      }),
    ],
  );
