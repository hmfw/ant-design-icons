import type { IconComponent } from "../types";
import { h } from "vue";

// 此文件由 scripts/generate-icons.ts 自动生成
// 请勿手动编辑，运行 pnpm gen:icons 重新生成

export const XFilled: IconComponent = () =>
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
        d: "M711.111 800H88.89C39.8 800 0 760.2 0 711.111V88.89C0 39.8 39.8 0 88.889 0H711.11C760.2 0 800 39.8 800 88.889V711.11C800 760.2 760.2 800 711.111 800",
        fill: "#000",
      }),
      h("path", {
        d: "M628 623H484.942L174 179h143.058zm-126.012-37.651h56.96L300.013 216.65h-56.96z",
        fill: "#FFF",
      }),
      h("path", {
        d: "M219.296885 623 379 437.732409 358.114212 410 174 623z",
        fill: "#FFF",
      }),
      h("path", {
        d: "M409 348.387347 429.212986 377 603 177 558.330417 177z",
        fill: "#FFF",
      }),
    ],
  );
