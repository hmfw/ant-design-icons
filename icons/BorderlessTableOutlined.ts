import type { IconComponent } from "../types";
import { h } from "vue";

// 此文件由 scripts/generate-icons.ts 自动生成
// 请勿手动编辑，运行 pnpm gen:icons 重新生成

export const BorderlessTableOutlined: IconComponent = () =>
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
        d: "M117 368h231v64H117zM676 368h241v64H676zM412 368h200v64H412zM412 592h200v64H412zM676 592h241v64H676zM117 592h231v64H117zM412 432V179h-64v666h64V592zM676 368V179h-64v666h64V432z",
      }),
    ],
  );
