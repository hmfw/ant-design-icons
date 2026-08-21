import { h, mergeProps } from 'vue'
import type { IconComponent } from './types'

/** 单个 path 的属性（至少含 d，可选 fill） */
export type IconPath = { d: string; fill?: string }

// 旋转动画样式只注入一次
const STYLE_ID = 'hmfw-icons-style'
let styleInjected = false

// 懒注入 .anticon 基础样式与旋转 keyframes。
// 仅在浏览器环境执行（SSR 下 document 不存在），保持包无构建期副作用。
function injectStyle(): void {
  if (styleInjected) return
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) {
    styleInjected = true
    return
  }
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
.anticon{display:inline-flex;align-items:center;color:inherit;font-style:normal;line-height:0;text-align:center;text-transform:none;vertical-align:-0.125em;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;}
.anticon > svg{display:inline-block;}
.anticon-spin{animation:hmfw-icon-spin 1s infinite linear;}
@keyframes hmfw-icon-spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}
`
  document.head.appendChild(style)
  styleInjected = true
}

/**
 * 由生成的图标文件调用，构造一个函数式图标组件。
 * 渲染结构：<span role="img" class="anticon anticon-{name}"><svg>…</svg></span>
 * - spin：为 svg 添加 anticon-spin 类，持续旋转
 * - rotate：为 svg 添加 transform: rotate(Ndeg) 内联样式
 * - 其余属性（class、style、onClick 等）透传到外层 span
 */
export function createIconComponent(name: string, viewBox: string, paths: IconPath[]): IconComponent {
  const Icon: IconComponent = (props, { attrs }) => {
    injectStyle()

    const { spin, rotate } = props

    const svgStyle =
      typeof rotate === 'number' && rotate !== 0 ? { transform: `rotate(${rotate}deg)` } : undefined

    // 用 mergeProps 而非对象展开：展开会让 attrs.class 直接覆盖内置 class，
    // mergeProps 会把两者的 class/style 合并，其余同名属性仍以 attrs 优先
    return h(
      'span',
      mergeProps(
        {
          role: 'img',
          'aria-label': name,
          class: `anticon anticon-${name}${spin ? ' anticon-spin' : ''}`,
        },
        attrs,
      ),
      [
        h(
          'svg',
          {
            viewBox,
            width: '1em',
            height: '1em',
            fill: 'currentColor',
            focusable: false,
            style: svgStyle,
          },
          paths.map((p) => h('path', p)),
        ),
      ],
    )
  }

  Icon.props = {
    spin: Boolean,
    rotate: Number,
  }
  Icon.inheritAttrs = false
  Icon.displayName = name

  return Icon
}
