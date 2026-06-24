import { describe, it, expect } from 'vitest'
import { searchIcons, getIconsByCategory, getAllCategories, getAllIcons } from '../utils'
import { iconMetadata } from '../metadata'

describe('Icon Utils', () => {
  describe('searchIcons', () => {
    it('finds icons by exact name match', () => {
      const results = searchIcons('home')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some((r) => r.name === 'home')).toBe(true)
    })

    it('finds icons by keyword', () => {
      const results = searchIcons('house')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some((r) => r.name === 'home')).toBe(true)
    })

    it('finds icons by category', () => {
      const results = searchIcons('网站通用')
      expect(results.length).toBeGreaterThan(0)
      expect(results.every((r) => r.category === '网站通用')).toBe(true)
    })

    it('returns empty array for no matches', () => {
      const results = searchIcons('nonexistent')
      expect(results).toEqual([])
    })

    it('sorts results by relevance score', () => {
      const results = searchIcons('search')
      expect(results.length).toBeGreaterThan(0)
      // First result should have highest score
      if (results.length > 1) {
        expect(results[0].score).toBeGreaterThanOrEqual(results[1].score)
      }
    })

    it('is case insensitive', () => {
      const lower = searchIcons('home')
      const upper = searchIcons('HOME')
      expect(lower.length).toBe(upper.length)
    })
  })

  describe('getIconsByCategory', () => {
    it('returns all icons in a category', () => {
      const results = getIconsByCategory('编辑操作')
      expect(results.length).toBeGreaterThan(0)
      expect(results.every((r) => r.category === '编辑操作')).toBe(true)
    })

    it('returns empty array for non-existent category', () => {
      const results = getIconsByCategory('nonexistent')
      expect(results).toEqual([])
    })

    it('is case insensitive', () => {
      const lower = getIconsByCategory('编辑操作')
      const upper = getIconsByCategory('编辑操作'.toUpperCase())
      expect(lower.length).toBe(upper.length)
    })
  })

  describe('getAllCategories', () => {
    it('returns all unique categories', () => {
      const categories = getAllCategories()
      expect(categories.length).toBeGreaterThan(0)
      expect(new Set(categories).size).toBe(categories.length) // No duplicates
    })

    it('returns categories in predefined order', () => {
      const categories = getAllCategories()
      // 验证顺序是预定义的，而非字母排序
      expect(categories[0]).toBe('方向指示')
      expect(categories[1]).toBe('品牌标识')
      expect(categories.length).toBeGreaterThan(10)
    })

    it('includes expected categories', () => {
      const categories = getAllCategories()
      expect(categories).toContain('编辑操作')
      expect(categories).toContain('网站通用')
      expect(categories).toContain('提示建议')
    })
  })

  describe('getAllIcons', () => {
    it('returns all icons (should be 681)', () => {
      const icons = getAllIcons()
      expect(icons.length).toBe(681)
    })

    it('each icon has required properties', () => {
      const icons = getAllIcons()
      icons.forEach((icon) => {
        expect(icon).toHaveProperty('name')
        expect(icon).toHaveProperty('component')
        expect(icon).toHaveProperty('category')
        expect(icon).toHaveProperty('keywords')
        expect(Array.isArray(icon.keywords)).toBe(true)
      })
    })

    it('all components are functions', () => {
      const icons = getAllIcons()
      icons.forEach((icon) => {
        expect(typeof icon.component).toBe('function')
      })
    })

    // P2: 新增覆盖
    it('resolves -filled icon names to Filled component variants', () => {
      const icons = getAllIcons()
      const bellFilled = icons.find((i) => i.name === 'bell-filled')
      const bellOutlined = icons.find((i) => i.name === 'bell')
      expect(bellFilled).toBeDefined()
      expect(bellOutlined).toBeDefined()
      // outlined 与 filled 必须是不同的组件
      expect(bellFilled!.component).not.toBe(bellOutlined!.component)
    })

    it('includes the new AntD v6 sync icons', () => {
      const icons = getAllIcons()
      const names = icons.map((i) => i.name)
      const expected = [
        'calendar',
        'clock-circle',
        'mail',
        'phone',
        'bell',
        'star',
        'heart',
        'lock',
        'unlock',
        'global',
        'arrow-up',
        'arrow-down',
        'caret-up',
        'copy',
        'reload',
        'sync',
      ]
      expected.forEach((name) => {
        expect(names).toContain(name)
      })
    })
  })
})
