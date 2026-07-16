import type { FunctionalComponent, SVGAttributes } from 'vue'

/** 图标组件的 props：继承所有 SVG/HTML 属性，并扩展 spin / rotate */
export interface IconProps extends /* @vue-ignore */ SVGAttributes {
  /** 是否让图标持续旋转（常用于 loading 场景） */
  spin?: boolean
  /** 图标旋转的角度（单位：度），如 90、180、-90 */
  rotate?: number
}

/** Vue 函数式图标组件类型 */
export type IconComponent = FunctionalComponent<IconProps>
