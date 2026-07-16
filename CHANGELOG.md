# 更新日志

本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.1.2] - 2026-07-16

### 修复

- 修复 `spin` 属性在 Vue 模板中使用布尔语法（如 `<LoadingOutlined spin />`）时不生效的问题。原因：props 定义使用了数组形式，导致 Vue 不做类型转换。现已改为对象形式定义 `{ spin: Boolean, rotate: Number }`，Vue 会自动将 `spin` 转换为 `true`。

## [1.1.1] - 2026-07-16

### 变更

- `spin` 旋转动画由内层 `svg` 移至外层 `span`，`anticon-spin` 类现追加到 `<span>` 上，与 Ant Design 表现一致。

## [1.1.0] - 2026-07-16

### 新增

- 图标新增 `spin` 属性：为 `true` 时图标以 1s/圈匀速持续旋转（适用于 loading 场景）。
- 图标新增 `rotate` 属性：按指定角度静态旋转图标（单位：度，如 `90`、`-90`）。
- 导出 `IconProps` 类型（`SVGAttributes` + `spin` / `rotate`）。

### 变更

- 图标渲染结构调整为 `<span role="img" class="anticon anticon-{name}"><svg>…</svg></span>`。外层 `span` 接收透传的 `class`、`style`、事件等属性，svg 保持 `1em` 尺寸并继承 `currentColor`。
- 旋转所需 CSS（`.anticon` 基类与 `@keyframes`）在图标首次渲染时由 JS 懒注入，无需手动引入样式文件；SSR 环境自动跳过注入。
- 新增共享运行时 `runtime.ts`，所有图标改为一行 `createIconComponent()` 调用生成，减小单文件体积。

## [1.0.2]

- 添加 UMD 构建，全局变量 `HmfwIcons`。
- 多项性能与构建优化。
