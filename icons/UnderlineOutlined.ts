import type { IconComponent } from "../types";
import { h } from "vue";

// 此文件由 scripts/generate-icons.ts 自动生成
// 请勿手动编辑，运行 pnpm gen:icons 重新生成

export const UnderlineOutlined: IconComponent = () =>
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
        d: "M824 804H200c-4.4 0-8 3.4-8 7.6v60.8c0 4.2 3.6 7.6 8 7.6h624c4.4 0 8-3.4 8-7.6v-60.8c0-4.2-3.6-7.6-8-7.6zm-312-76c69.4 0 134.6-27.1 183.8-76.2C745 602.7 772 537.4 772 468V156c0-6.6-5.4-12-12-12h-60c-6.6 0-12 5.4-12 12v312c0 97-79 176-176 176s-176-79-176-176V156c0-6.6-5.4-12-12-12h-60c-6.6 0-12 5.4-12 12v312c0 69.4 27.1 134.6 76.2 183.8C377.3 701 442.6 728 512 728z",
      }),
    ],
  );
