// @hmfw/icons — Vue3 图标组件库入口
// 基于 Ant Design v6 图标集，681 个高质量 SVG 图标

// 图标组件（全部 681 个）
export * from './icons/index'

// 图标元数据
export { iconMetadata } from './metadata'
export type { IconMetadata } from './metadata'

// 图标搜索和分类工具
export { searchIcons, getIconsByCategory, getAllCategories, getAllIcons } from './utils'
export type { IconSearchResult } from './utils'

// 类型定义
export type { IconComponent } from './types'
