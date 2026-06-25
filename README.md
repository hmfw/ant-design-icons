# @hmfw/icons

基于 Ant Design 的 Vue 3 图标组件库 —— **681 个高质量 SVG 图标**，全面支持 Tree Shaking。

[![npm version](https://img.shields.io/npm/v/@hmfw/icons)](https://www.npmjs.com/package/@hmfw/icons)
[![license](https://img.shields.io/npm/l/@hmfw/icons)](https://github.com/hmfw/ant-design-icons/blob/main/LICENSE)

## 特性

- 🎨 **681 个图标** —— 完整覆盖 Ant Design 图标集
- 🌲 **Tree Shaking** —— 每个图标独立文件，按需引入，零冗余
- 🔍 **内置搜索** —— 支持中英文关键词搜索、按分类筛选
- 📦 **双模式构建** —— ESM（支持 tree-shaking）+ UMD（CDN 直接引入）
- 💪 **TypeScript** —— 完整类型定义，每个图标组件独立 `.d.ts`
- ⚡ **轻量高效** —— 函数式组件，零运行时开销

## 安装

```bash
pnpm add @hmfw/icons
```

> 要求：Vue >= 3.3.0，Node >= 18

## 使用

### 按需引入（推荐）

```vue
<script setup>
import { HomeOutlined, BellFilled, LoadingOutlined } from '@hmfw/icons'
</script>

<template>
  <HomeOutlined />
  <BellFilled style="color: #1677ff; font-size: 24px" />
  <LoadingOutlined class="spin" />
</template>
```

### 搜索图标

```ts
import { searchIcons } from '@hmfw/icons'

// 按关键词搜索
const results = searchIcons('home')
// [{ name: 'home', component: HomeOutlined, category: '网站通用', keywords: [...], score: 10 }]

// 中文搜索
searchIcons('设置')   // → setting 相关图标
searchIcons('删除')   // → delete 相关图标
```

### 按分类获取

```ts
import { getIconsByCategory, getAllCategories } from '@hmfw/icons'

// 获取所有分类
const categories = getAllCategories()
// ['方向指示', '品牌标识', '提示建议', '编辑操作', ...]

// 获取某个分类下的所有图标
const editIcons = getIconsByCategory('编辑操作')
```

### CDN 引入

```html
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script src="https://unpkg.com/@hmfw/icons/dist/hmfw-icons.umd.global.js"></script>
<script>
  // 全局变量 HmfwIcons
  const { HomeOutlined, BellFilled } = HmfwIcons
</script>
```

### 精准导入（最优 Tree Shaking）

```ts
import { HomeOutlined } from '@hmfw/icons/icons/HomeOutlined'
```

## 图标分类

| 分类     | 示例图标                                                                 |
| -------- | ------------------------------------------------------------------------ |
| 方向指示 | ArrowUp, CaretDown, SwapLeft, StepForward, AlignCenter                   |
| 品牌标识 | Github, Wechat, Alipay, Discord, Youtube, Docker                         |
| 提示建议 | CheckCircle, Warning, InfoCircle, QuestionCircle                          |
| 编辑操作 | Edit, Delete, Copy, Download, Upload, Save, Filter                       |
| 编辑格式 | Bold, Italic, Underline, Strikethrough, FontSize                         |
| 网站通用 | Home, User, Setting, Search, Menu, Dashboard, Lock                       |
| 数据图表 | BarChart, LineChart, PieChart, Table, Fund, Stock                        |
| 网络通讯 | Message, Mail, Bell, Phone, Wifi, Api                                    |
| 文件文档 | File, Folder, FilePdf, FileExcel, Book                                   |
| 商业财产 | Shop, ShoppingCart, Gift, Wallet, Dollar, Trophy                         |
| 办公应用 | Desktop, Laptop, Code, Robot, Printer, Coffee                            |
| 地图交通 | Car, Rocket, Compass, Aim                                                |
| 多媒体   | PlayCircle, PauseCircle, Sound, Camera                                   |
| 时间日期 | Calendar, ClockCircle, Hourglass                                         |
| 标记     | Star, Heart, Like, Tag, Crown, Bookmark                                  |

## 图标命名规则

- 线框风格：`ArrowUpOutlined`、`HomeOutlined`
- 实底风格：`ArrowUpFilled`、`HomeFilled`
- 对应 SVG 文件：`arrow-up.svg`、`arrow-up-filled.svg`

## 本地开发

```bash
# 安装依赖
pnpm install

# 添加/修改图标：将 SVG 放入 svg/ 目录

# 生成图标组件
pnpm gen:icons

# 生成图标元数据
pnpm gen:icon-metadata

# 运行测试
pnpm test

# 构建
pnpm build
```

### 构建流程

```
SVG 文件 (svg/)
    │
    ├── scripts/generate-icons.ts ──→ icons/  (组件代码)
    └── scripts/generate-icon-metadata.ts ──→ metadata.ts (分类/关键词)
                    │
                    ▼
              tsup 编译
                    │
            ┌───────┴───────┐
            ▼               ▼
      dist/icons/*.js   dist/hmfw-icons.umd.global.js
      (ESM 独立文件)      (UMD 单文件)
```

## License

MIT © [hmfw](https://github.com/hmfw)
