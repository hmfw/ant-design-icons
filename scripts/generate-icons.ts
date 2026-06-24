#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync } from 'fs'
import { join, basename } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import prettier from 'prettier'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// SVG 文件目录
const SVG_DIR = join(__dirname, '../svg')
const OUTPUT_DIR = join(__dirname, '../icons')
const INDEX_FILE = join(OUTPUT_DIR, 'index.ts')

// 将 kebab-case 转换为 PascalCase
function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

// 解析 SVG 文件，提取 viewBox 和 path 元素
function parseSvg(svgContent: string): { viewBox: string; paths: string[] } {
  // 提取 viewBox
  const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/)
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 1024 1024'

  // 提取所有 path 元素
  const pathMatches = svgContent.matchAll(/<path\s+([^>]+)>/g)
  const paths: string[] = []

  for (const match of pathMatches) {
    const pathAttrs = match[1]
    // 提取 d 属性
    const dMatch = pathAttrs.match(/d="([^"]+)"/)
    if (dMatch) {
      const d = dMatch[1]
      // 检查是否有 fill 属性
      const fillMatch = pathAttrs.match(/fill="([^"]+)"/)
      const fill = fillMatch ? fillMatch[1] : undefined

      if (fill && fill !== 'currentColor') {
        // 如果有特定的 fill 颜色，保留它
        paths.push(`h('path', { d: '${d}', fill: '${fill}' })`)
      } else {
        paths.push(`h('path', { d: '${d}' })`)
      }
    }
  }

  return { viewBox, paths }
}

// 生成图标组件代码（单个文件）
function generateIconComponent(
  name: string,
  viewBox: string,
  paths: string[],
): { componentName: string; code: string } {
  // 文件名以 -filled 结尾时生成 Filled 后缀组件，否则默认 Outlined
  const isFilled = name.endsWith('-filled')
  const baseName = isFilled ? name.slice(0, -'-filled'.length) : name
  const suffix = isFilled ? 'Filled' : 'Outlined'
  const componentName = `${toPascalCase(baseName)}${suffix}`
  const pathsCode = paths.length > 0 ? paths.join(', ') : ''

  const code = `import type { IconComponent } from '../types'
import { h } from 'vue'

// 此文件由 scripts/generate-icons.ts 自动生成
// 请勿手动编辑，运行 pnpm gen:icons 重新生成

export const ${componentName}: IconComponent = () =>
  h('svg', {
    viewBox: '${viewBox}',
    width: '1em',
    height: '1em',
    fill: 'currentColor',
    focusable: false,
  }, [${pathsCode}])
`

  return { componentName, code }
}

// 主函数
async function main() {
  console.log('🔍 Scanning SVG files...')

  // 读取所有 SVG 文件
  const svgFiles = readdirSync(SVG_DIR)
    .filter((file) => file.endsWith('.svg'))
    .sort()

  if (svgFiles.length === 0) {
    console.error('❌ No SVG files found in', SVG_DIR)
    process.exit(1)
  }

  console.log(`📦 Found ${svgFiles.length} SVG files`)

  // 清空并重建输出目录
  rmSync(OUTPUT_DIR, { recursive: true, force: true })
  mkdirSync(OUTPUT_DIR, { recursive: true })

  // 生成独立的图标文件
  const componentNames: string[] = []
  const prettierConfig = await prettier.resolveConfig(INDEX_FILE)

  for (const file of svgFiles) {
    const filePath = join(SVG_DIR, file)
    const name = basename(file, '.svg')
    const svgContent = readFileSync(filePath, 'utf8')

    try {
      const { viewBox, paths } = parseSvg(svgContent)
      const { componentName, code } = generateIconComponent(name, viewBox, paths)

      // 格式化并写入单独文件
      const formatted = await prettier.format(code, { ...prettierConfig, parser: 'typescript' })
      const outputFile = join(OUTPUT_DIR, `${componentName}.ts`)
      writeFileSync(outputFile, formatted, 'utf8')

      componentNames.push(componentName)
      // console.log(`  ✓ ${componentName}`)
    } catch (error) {
      console.error(`  ✗ ${name}: ${error}`)
    }
  }

  // 生成 index.ts 统一导出
  const indexContent = `// 此文件由 scripts/generate-icons.ts 自动生成
// 请勿手动编辑，运行 pnpm gen:icons 重新生成

${componentNames.map((name) => `export { ${name} } from './${name}'`).join('\n')}
`

  const formattedIndex = await prettier.format(indexContent, { ...prettierConfig, parser: 'typescript' })
  writeFileSync(INDEX_FILE, formattedIndex, 'utf8')

  // console.log(`\n✅ Generated ${componentNames.length} icon files in ${OUTPUT_DIR}`)
  console.log(`✅ Generated ${INDEX_FILE}`)
}

main()
