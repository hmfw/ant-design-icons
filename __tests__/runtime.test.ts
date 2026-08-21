import { describe, it, expect } from 'vitest'
import { h, createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { DownOutlined } from '../icons/DownOutlined'
import type { IconProps } from '../types'

function render(props: IconProps = {}) {
  return renderToString(createSSRApp({ render: () => h(DownOutlined, props) }))
}

describe('createIconComponent', () => {
  it('renders span > svg with base classes', async () => {
    const html = await render()
    expect(html).toContain('class="anticon anticon-down"')
    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="down"')
    expect(html).toContain('<svg')
  })

  it('merges user class with built-in classes instead of overriding them', async () => {
    const html = await render({ class: 'hmfw-icon' })
    expect(html).toContain('anticon')
    expect(html).toContain('anticon-down')
    expect(html).toContain('hmfw-icon')
  })

  it('merges user style with built-in span attrs', async () => {
    const html = await render({ style: { color: 'red' } })
    expect(html).toContain('color:red')
    expect(html).toContain('anticon-down')
  })

  it('adds anticon-spin when spin is set', async () => {
    const html = await render({ spin: true })
    expect(html).toContain('anticon-spin')
  })

  it('keeps built-in classes when spin and a custom class are combined', async () => {
    const html = await render({ spin: true, class: 'hmfw-icon' })
    expect(html).toContain('anticon-down')
    expect(html).toContain('anticon-spin')
    expect(html).toContain('hmfw-icon')
  })

  it('applies rotate as an inline transform on the svg', async () => {
    const html = await render({ rotate: 90 })
    expect(html).toContain('transform:rotate(90deg)')
  })

  it('does not emit a transform for rotate 0', async () => {
    const html = await render({ rotate: 0 })
    expect(html).not.toContain('transform')
  })

  it('does not leak spin/rotate as DOM attributes', async () => {
    const html = await render({ spin: true, rotate: 90 })
    expect(html).not.toContain('spin="')
    expect(html).not.toContain('rotate="')
  })
})
