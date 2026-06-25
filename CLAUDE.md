# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 常用命令

```bash
pnpm test              # 运行全部测试（vitest）
pnpm test:watch        # 监视模式运行测试
pnpm typecheck         # TypeScript 类型检查（不产出文件）
pnpm build             # 完整构建：生成图标 → 生成元数据 → tsup 编译 → 修复 ESM 扩展名
pnpm gen:icons         # 从 svg/ 重新生成图标组件（修改 SVG 后运行）
pnpm gen:icon-metadata # 重新生成 metadata.ts（新增/移动 SVG 后运行）
```

## 架构

Vue 3 图标组件库（`@hmfw/icons`）—— **681 个 Ant Design 图标，封装为独立的函数式组件**。构建系统采用代码生成 + tsup 编译的流水线。

**三阶段流水线：**

1. **代码生成（`prebuild`）**：`scripts/generate-icons.ts` 读取 `svg/` 中的 681 个 SVG 文件，为每个图标生成一个 Vue 函数式组件，输出到 `icons/`。`scripts/generate-icon-metadata.ts` 生成 `metadata.ts`，包含分类/关键词数据供搜索和筛选工具使用。
2. **编译打包（`tsup`）**：两份产出 —— ESM（`bundle: false`，每个图标独立文件，支持 tree-shaking）和 IIFE/UMD（`bundle: true`，单文件供 CDN 使用）。
3. **后处理（`scripts/fix-extensions.js`）**：ESM 产物中相对导入缺少 `.js` 扩展名（tsup 在 `bundle: false` 模式下保留源码的裸标识符导入），此脚本将相对 `import`/`export` 补全 `.js`，并清理纯类型文件擦除后留下的空 `.js` 文件。

**核心文件：**
- `index.ts` — 公开入口：图标组件、元数据、工具函数、类型定义
- `types.ts` — `IconComponent` 类型（Vue `FunctionalComponent<SVGAttributes>`）
- `metadata.ts` — 自动生成的扁平映射：图标名称 → `{ keywords, category, tags? }`
- `utils.ts` — `searchIcons()`、`getIconsByCategory()`、`getAllCategories()`、`getAllIcons()`
- `icons/` — 682 个自动生成的文件：681 个图标组件 + `index.ts` 桶导出

**图标命名规则：** SVG 文件名使用 kebab-case（如 `bell-filled.svg`、`arrow-up.svg`）。生成器转换为 PascalCase 组件名：`-filled` 后缀 → `Filled` 结尾，其他 → `Outlined` 结尾。示例：`bell-filled.svg` → `BellFilled`，`arrow-up.svg` → `ArrowUpOutlined`，`home.svg` → `HomeOutlined`。

**生成的图标模式：** 每个图标是 `FunctionalComponent<SVGAttributes>`，返回 Vue 的 `h('svg', {...})` 调用，包含源 SVG 的 `viewBox`，固定 `width: '1em'` / `height: '1em'`、`fill: 'currentColor'`、`focusable: false`。

## 重要约定

- **切勿手动编辑自动生成的文件。** `icons/` 和 `metadata.ts` 由 prebuild 脚本重新生成。修改 SVG 应放在 `svg/`；修改图标渲染逻辑应修改 `scripts/generate-icons.ts`；修改分类/关键词应修改 `scripts/generate-icon-metadata.ts`。
- **纯 ESM 包。** `package.json` 中 `"type": "module"`。IIFE 构建仅用于 CDN `<script>` 引入场景。
- **`sideEffects: false`** 已设置 —— 打包器可安全剔除未使用的图标导入。
- **元数据是静态查表** —— 无运行时文件系统访问。`getAllIcons()` 遍历 `Object.entries(iconMetadata)` 并通过 `toComponentName()` 约定匹配实际导出的组件。
