#!/usr/bin/env node

/**
 * 为 transpile-only（bundle: false）产物的相对 import/export 补全扩展名。
 *
 * 原因：tsup/esbuild 在 bundle:false 下保留源码的无扩展名相对引用
 * （如 `from './Button'`、`from '../config-provider'`）。bundler 能解析，
 * 但 Node 原生 ESM 必须显式扩展名。本脚本按目标是文件还是目录精确补全：
 *   - `./Button`        → `./Button.js`（存在同名文件）
 *   - `../config-provider` → `../config-provider/index.js`（目录）
 *
 * 纯 ESM 包：只处理 .js 与声明文件 .d.ts。声明里写 `.js` 后缀，
 * 解析时 TS 自动匹配同名 .d.ts。存在性检查以实际声明文件为准。
 */

import { readdirSync, readFileSync, writeFileSync, statSync, existsSync, unlinkSync } from 'fs'
import { resolve, dirname, join, relative } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = resolve(__dirname, '../dist')

// 本包名（用于识别「自引用」说明符）
const pkgName = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf-8')).name
const escaped = pkgName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
// 裸包名子路径：  @scope/pkg            → sub=''（包根）
//                @scope/pkg/icons/X    → sub='icons/X'
const bareSelfRe = new RegExp(`^${escaped}(?:/(.*))?$`)
// 任意路径中的 node_modules 自引用（含 pnpm 虚拟存储绝对路径）：
//   .../.pnpm/@scope+pkg@x_.../node_modules/@scope/pkg/icons/X → sub='icons/X'
const nmSelfRe = new RegExp(`[\\\\/]node_modules[\\\\/]${escaped}[\\\\/](.+)$`)

/**
 * 若说明符指向本包自身，返回其规范化子路径（相对包根，去掉 dist/ 前缀与扩展名）；
 * 否则返回 null。相对路径与第三方（如 vue）一律返回 null。
 *
 * 背景：在 pnpm workspace / 自链接环境执行 tsc 声明生成时，本包内部的相对
 * 再导出可能被解析成包名或 .pnpm 绝对路径写进 .d.ts / .js，例如
 *   export { DownOutlined } from "@hmfw/icons/icons/DownOutlined"
 * 消费端据此解析到不存在的目录，具名导入报「没有导出的成员」。
 * 本函数把这类自引用识别出来，交由下方统一改回相对路径。
 */
function selfRefSub(spec) {
  if (spec.startsWith('.')) return null // 相对路径不是自引用场景
  let m = spec.match(bareSelfRe)
  if (m) return m[1] ?? '' // 子路径，可能为空（包根）
  m = spec.match(nmSelfRe)
  if (m) return m[1].replace(/^dist\//, '').replace(/\.(js|mjs|d\.ts)$/, '')
  return null
}

// 收集 dist 下所有 .js / .d.ts（跳过 sourcemap 与 UMD）
function collect(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name)
    if (e.isDirectory()) collect(full, out)
    else if (/\.(js|d\.ts)$/.test(e.name) && !e.name.includes('.umd.')) out.push(full)
  }
  return out
}

// 把单个相对说明符解析为带扩展名的目标。
// importExt：写进代码里的后缀（始终 .js）；probeExt：用于存在性探测的实际文件后缀
// （声明文件探测 .d.ts，但写入仍用 .js 让 TS 自动匹配）。
function resolveSpec(fromFile, spec, importExt, probeExt) {
  const baseDir = dirname(fromFile)
  const abs = resolve(baseDir, spec)
  // 已有扩展名则不动
  if (/\.(js|mjs|json|css)$/.test(spec)) return spec
  // 同名文件优先
  if (existsSync(abs + probeExt)) return spec + importExt
  // 否则按目录入口
  if (existsSync(abs) && statSync(abs).isDirectory() && existsSync(join(abs, 'index' + probeExt))) {
    return spec.replace(/\/?$/, '') + '/index' + importExt
  }
  // 兜底：保持原样（让 bundler 处理）
  return spec
}

// 按文件类型决定写入后缀与探测后缀
function extsFor(file) {
  if (file.endsWith('.d.ts')) return { importExt: '.js', probeExt: '.d.ts' }
  return { importExt: '.js', probeExt: '.js' }
}

let patched = 0
let normalized = 0
for (const file of collect(distDir)) {
  const { importExt, probeExt } = extsFor(file)
  const src = readFileSync(file, 'utf-8')
  // 匹配 import/export ... from '...'、import('...') 的任意说明符
  // （含裸包名与绝对路径，以便识别自引用）
  const re = /(\bfrom\s*|\bimport\s*\(\s*)(['"])([^'"]+)\2/g
  let changed = false
  const next = src.replace(re, (m, kw, q, spec) => {
    let s = spec
    // 1) 自引用说明符 → 改回 dist 内相对路径（dist 布局镜像子路径）
    const sub = selfRefSub(s)
    if (sub !== null) {
      const targetAbs = resolve(distDir, sub === '' ? 'index' : sub)
      let rel = relative(dirname(file), targetAbs).replace(/\\/g, '/')
      if (!rel.startsWith('.')) rel = './' + rel
      s = rel
      normalized++
    }
    // 2) 相对说明符 → 补全扩展名（第三方裸包如 vue 保持不变）
    if (s.startsWith('.')) s = resolveSpec(file, s, importExt, probeExt)
    if (s !== spec) changed = true
    return `${kw}${q}${s}${q}`
  })
  if (changed) {
    writeFileSync(file, next)
    patched++
  }
}

console.log(`✅ 补全相对引用扩展名：处理 ${patched} 个文件`)
if (normalized > 0) {
  console.log(`🔧 修正包自引用说明符（改回相对路径）：${normalized} 处`)
}

// ── 第二遍：删除「运行时为空」的 .js ───────────────────────────────
// transpile-only 下，纯类型源文件（types.ts / interface.ts 等）擦除后只剩
// banner 注释，产出 0 体积的空 .js。基于内容统一识别并清理，而非按文件名：
//   1. 剥离注释/空白后无任何可执行内容（空 / `export {}` / `"use strict"`）→ 运行时为空
//   2. 删除前查引用图：编译后的 .js 里任何残留相对 import 都是真实运行时引用
//      （类型 import 已被 esbuild 擦除），被引用则保留
//   3. index.js 永不删（子路径入口安全）；.d.ts 一律保留（类型链走声明文件）
function isRuntimeEmpty(src) {
  const stripped = src
    .replace(/\/\*[\s\S]*?\*\//g, '') // 块注释（含 banner）
    .replace(/\/\/[^\n]*/g, '') // 行注释
    .replace(/["']use strict["'];?/g, '') // use strict 指令
    .replace(/export\s*\{\s*\}\s*;?/g, '') // 空再导出
    .replace(/\s+/g, '') // 所有空白
  return stripped.length === 0
}

const jsFiles = []
function collectJs(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name)
    if (e.isDirectory()) collectJs(full)
    else if (e.name.endsWith('.js') && !e.name.includes('.umd.')) jsFiles.push(full)
  }
}
collectJs(distDir)

// 建立运行时引用集合：被任意 .js import 的绝对路径
const referenced = new Set()
const importRe = /\bfrom\s*['"](\.\.?\/[^'"]*)['"]|\bimport\s*\(\s*['"](\.\.?\/[^'"]*)['"]/g
for (const file of jsFiles) {
  const src = readFileSync(file, 'utf-8')
  let m
  while ((m = importRe.exec(src)) !== null) {
    const spec = m[1] || m[2]
    referenced.add(resolve(dirname(file), spec))
  }
}

let removed = 0
for (const file of jsFiles) {
  if (file.endsWith('/index.js') || file.endsWith('\\index.js')) continue
  if (referenced.has(file)) continue
  if (isRuntimeEmpty(readFileSync(file, 'utf-8'))) {
    unlinkSync(file)
    removed++
  }
}

if (removed > 0) console.log(`🧹 清理运行时为空的 .js：删除 ${removed} 个文件（类型声明 .d.ts 保留）`)
