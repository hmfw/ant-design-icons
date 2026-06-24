import { iconMetadata } from './metadata'
import type { IconComponent } from './types'
import * as Icons from './icons'

export interface IconSearchResult {
  /** 图标名称（kebab-case，如 'bell-filled'） */
  name: string
  /** 图标组件 */
  component: IconComponent
  /** 分类 */
  category: string
  /** 关键词列表 */
  keywords: string[]
  /** 匹配相关度评分（仅 search 时有效） */
  score: number
}

/**
 * 将 kebab-case 名称转换为对应的导出组件名
 * - 'bell' -> 'BellOutlined'
 * - 'bell-filled' -> 'BellFilled'
 * - 'arrow-up' -> 'ArrowUpOutlined'
 */
function toComponentName(iconName: string): string {
  const isFilled = iconName.endsWith('-filled')
  const baseName = isFilled ? iconName.slice(0, -'-filled'.length) : iconName
  const pascal = baseName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
  return pascal + (isFilled ? 'Filled' : 'Outlined')
}

/**
 * 搜索图标
 * @param query 搜索关键词
 * @returns 匹配的图标列表，按相关度排序
 */
export function searchIcons(query: string): IconSearchResult[] {
  const normalizedQuery = query.toLowerCase().trim()
  const results: IconSearchResult[] = []
  const allIcons = getAllIcons()

  allIcons.forEach((icon) => {
    let score = 0

    // 检查图标名称匹配
    if (icon.name.toLowerCase().includes(normalizedQuery)) {
      score += 10
    }

    // 检查关键词匹配
    icon.keywords.forEach((keyword) => {
      if (keyword.toLowerCase() === normalizedQuery) {
        score += 5 // 完全匹配
      } else if (keyword.toLowerCase().includes(normalizedQuery)) {
        score += 3 // 部分匹配
      }
    })

    // 检查分类匹配
    if (icon.category.toLowerCase().includes(normalizedQuery)) {
      score += 2
    }

    if (score > 0) {
      results.push({ ...icon, score })
    }
  })

  // 按相关度排序
  return results.sort((a, b) => b.score - a.score)
}

/**
 * 按分类获取图标
 * @param category 分类名称
 * @returns 该分类下的所有图标
 */
export function getIconsByCategory(category: string): IconSearchResult[] {
  const normalizedCategory = category.toLowerCase()
  const allIcons = getAllIcons()

  return allIcons.filter((icon) => icon.category.toLowerCase() === normalizedCategory)
}

/**
 * 获取所有分类
 * @returns 所有分类列表（按推荐顺序排列）
 */
export function getAllCategories(): string[] {
  // 预定义分类顺序（按重要性和使用频率）
  const categoryOrder = [
    '方向指示',
    '品牌标识',
    '提示建议',
    '编辑操作',
    '编辑格式',
    '网站通用',
    '数据图表',
    '网络通讯',
    '文件文档',
    '商业财产',
    '办公应用',
    '地图交通',
    '多媒体',
    '时间日期',
    '标记',
  ]

  const categories = new Set<string>()

  // 从所有图标中提取分类
  const allIcons = getAllIcons()
  allIcons.forEach((icon) => {
    categories.add(icon.category)
  })

  const categoriesArray = Array.from(categories)

  // 按预定义顺序排序，未知分类放在最后
  return categoriesArray.sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a)
    const bIndex = categoryOrder.indexOf(b)
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })
}

/**
 * 获取所有图标及其元数据
 * @returns 所有图标的完整信息
 */
export function getAllIcons(): IconSearchResult[] {
  const results: IconSearchResult[] = []

  // 基于 metadata 遍历（metadata 的 key 与 SVG 文件名一致，可准确转换为组件名）
  Object.entries(iconMetadata).forEach(([iconName, metadata]) => {
    const componentName = toComponentName(iconName)
    const component = (Icons as unknown as Record<string, IconComponent | undefined>)[componentName]

    if (component) {
      results.push({
        name: iconName,
        component,
        category: metadata.category,
        keywords: metadata.keywords,
        score: 0,
      })
    }
  })

  return results.sort((a, b) => a.name.localeCompare(b.name))
}
