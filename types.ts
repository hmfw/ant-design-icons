import type { FunctionalComponent, SVGAttributes } from 'vue'

export type IconComponent = FunctionalComponent<SVGAttributes>

export interface IconProps {
  component?: IconComponent
  spin?: boolean
  rotate?: number
  twoToneColor?: string
  style?: string | Record<string, string>
  class?: string
}
