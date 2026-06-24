import type { IconComponent } from "../types";
import { h } from "vue";

// 此文件由 scripts/generate-icons.ts 自动生成
// 请勿手动编辑，运行 pnpm gen:icons 重新生成

export const CompassFilled: IconComponent = () =>
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
        d: "M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zM327.3 702.4c-2 .9-4.4 0-5.3-2.1-.4-1-.4-2.2 0-3.2l98.7-225.5 132.1 132.1-225.5 98.7zm375.1-375.1l-98.7 225.5-132.1-132.1L697.1 322c2-.9 4.4 0 5.3 2.1.4 1 .4 2.1 0 3.2z",
      }),
    ],
  );
