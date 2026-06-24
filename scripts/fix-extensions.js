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
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = resolve(__dirname, '../dist')

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
for (const file of collect(distDir)) {
  const { importExt, probeExt } = extsFor(file)
  const src = readFileSync(file, 'utf-8')
  // 匹配 import/export ... from '...'、import('...')，仅相对路径
  const re = /(\bfrom\s*|\bimport\s*\(\s*)(['"])(\.\.?\/[^'"]*)\2/g
  let changed = false
  const next = src.replace(re, (m, kw, q, spec) => {
    const resolved = resolveSpec(file, spec, importExt, probeExt)
    if (resolved !== spec) changed = true
    return `${kw}${q}${resolved}${q}`
  })
  if (changed) {
    writeFileSync(file, next)
    patched++
  }
}

console.log(`✅ 补全相对引用扩展名：处理 ${patched} 个文件`)

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
