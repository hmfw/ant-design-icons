# 图标元数据生成脚本

自动为所有图标生成元数据（分类、关键词、同义词），支持搜索和分类过滤。

## 功能

- ✅ 自动扫描 `components/icon/svg/` 下的所有 SVG 文件
- ✅ 基于文件名智能推导分类（12 个分类）
- ✅ 自动生成搜索关键词和同义词
- ✅ 输出格式化的 TypeScript 文件

## 使用

```bash
pnpm gen:icon-metadata
```

生成的文件：`components/icon/metadata.ts`

## 分类规则

共 15 个中文分类（按优先级匹配）：

| 分类     | 数量 | 关键词示例                                     |
| -------- | ---- | ---------------------------------------------- |
| 品牌标识 | 186  | android, apple, github, wechat, alipay, docker |
| 方向指示 | 100  | up, down, left, right, arrow, sort, align      |
| 网站通用 | 64   | home, menu, user, setting, search, dashboard   |
| 编辑操作 | 62   | edit, delete, copy, save, download, upload     |
| 文件文档 | 50   | file, folder, picture, video, audio, book      |
| 办公应用 | 44   | desktop, laptop, code, robot, cloud, printer   |
| 商业财产 | 33   | shop, wallet, gift, bank, dollar, trophy       |
| 数据图表 | 27   | table, database, chart, fund, stock            |
| 提示建议 | 26   | check, close, info, warning, loading, smile    |
| 网络通讯 | 26   | message, mail, bell, phone, api, wifi          |
| 标记     | 22   | star, heart, tag, crown, lock, like            |
| 地图交通 | 16   | car, truck, rocket, compass, sun, moon         |
| 编辑格式 | 13   | bold, italic, underline, font, format-painter  |
| 多媒体   | 7    | camera, play, pause, sound, muted              |
| 时间日期 | 5    | calendar, clock, hourglass, history            |

> 注：分类按优先级从上到下匹配，先匹配的分类生效。

## 同义词映射

脚本内置常用图标的中英文同义词映射：

```typescript
home → ['house', 'homepage', '首页', '主页']
search → ['find', 'magnifier', 'lookup', '搜索', '查找']
user → ['account', 'person', 'profile', '用户', '账号']
delete → ['trash', 'remove', 'bin', '删除', '移除']
check → ['tick', 'done', 'success', 'ok', '勾选', '完成', '成功']
```

## 自定义

编辑 `scripts/generate-icon-metadata.ts`：

### 1. 添加新分类

```typescript
const categoryRules = {
  // 添加新分类
  myCategory: ['keyword1', 'keyword2'],
  // ...
}
```

### 2. 添加同义词

```typescript
const synonyms: Record<string, string[]> = {
  // 添加新同义词
  myIcon: ['synonym1', 'synonym2'],
  // ...
}
```

### 3. 自定义分类逻辑

修改 `inferCategory` 函数实现自定义分类规则。

## 输出示例

```typescript
export const iconMetadata: Record<string, IconMetadata> = {
  home: {
    keywords: ['home', 'house', 'homepage', '首页', '主页'],
    category: '网站通用',
  },
  delete: {
    keywords: ['delete', 'trash', 'remove', 'bin', '删除', '移除'],
    category: '编辑操作',
  },
  loading: {
    keywords: ['loading', 'spinner', 'spin', 'waiting', 'progress'],
    category: '提示建议',
    tags: ['animation'],
  },
  // ... 681 个图标
}
```

## 统计信息

运行后会输出分类统计：

```
📊 分类统计:
  品牌标识: 186
  方向指示: 100
  网站通用: 64
  编辑操作: 62
  文件文档: 50
  办公应用: 44
  商业财产: 33
  数据图表: 27
  提示建议: 26
  网络通讯: 26
  标记: 22
  地图交通: 16
  编辑格式: 13
  多媒体: 7
  时间日期: 5
```

## 与图标生成的关系

图标系统的完整流程：

1. `pnpm gen:icons` - 从 SVG 生成图标组件
2. `pnpm gen:icon-metadata` - 生成图标元数据
3. `pnpm build:lib` - 自动执行上述两步

## 注意事项

- ⚠️ 生成的文件会覆盖现有的 `metadata.ts`，请勿手动编辑
- ⚠️ 修改分类规则后需要重新运行脚本
- ✅ 脚本会自动格式化输出（使用 Prettier）
