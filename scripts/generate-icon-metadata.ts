#!/usr/bin/env node
import { writeFileSync, readdirSync, readFileSync, existsSync } from 'fs'
import { join, basename } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createHash } from 'crypto'
import prettier from 'prettier'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SVG_DIR = join(__dirname, '../svg')
const OUTPUT_FILE = join(__dirname, '../metadata.ts')
const CACHE_FILE = join(__dirname, '../icons', '.cache-svg-hash')

// 中文分类规则（基于图标名称关键词）
// 优先级：从上到下，先匹配的分类生效
const categoryRules: Record<string, string[]> = {
  // 1. 方向指示 (80+)
  方向指示: [
    'up',
    'down',
    'left',
    'right',
    'arrow',
    'caret',
    'double',
    'step',
    'forward',
    'backward',
    'enter',
    'rollback',
    'retweet',
    'shrink',
    'arrows-alt',
    'fullscreen',
    'vertical',
    'horizontal',
    'rotate',
    'swap',
    'align',
    'menu-fold',
    'menu-unfold',
    'sort-ascending',
    'sort-descending',
    'to-top',
    // 移除: more, ellipsis, holder, drag (应该是编辑操作)
    // 移除: download, upload (应该是编辑操作，已经在那里了)
    // 移除: copyright (应该是标记)
    // 移除: group, ungroup (应该是编辑操作)
  ],

  // 2. 品牌标识 (81)
  品牌标识: [
    'android',
    'apple',
    'windows',
    'chrome',
    'github',
    'gitlab',
    'linkedin',
    'twitter',
    'facebook',
    'instagram',
    'youtube',
    'wechat',
    'qq',
    'weibo',
    'taobao',
    'alipay',
    'dingtalk',
    'alibaba',
    'amazon',
    'google',
    'slack',
    'skype',
    'behance',
    'dribbble',
    'medium',
    'codepen',
    'reddit',
    'dropbox',
    'zhihu',
    'yahoo',
    'baidu',
    'aliyun',
    'aliwangwang',
    'bilibili',
    'yuque',
    'sketch',
    'chrome',
    'ie',
    'html5',
    'code-sandbox',
    'gitlab',
    'ci',
    'discord',
    'docker',
    'kubernetes',
    'dot-net',
    'java',
    'java-script',
    'python',
    'ruby',
    'spotify',
    'tik-tok',
    'twitch',
    'whats-app',
    // 移除 'line'（这是分隔线图标，不是 Line 品牌）
    'dingding',
    'open-a-i',
    'harmony-o-s',
    'linux',
    // 移除 'product' 和 'x-filled'（不是品牌关键词）
    'ant-design',
    'ant-cloud',
  ],

  // 3. 提示建议 (30+)
  提示建议: [
    'check',
    'close',
    'info',
    'warning',
    'error',
    'success',
    'exclamation',
    'question',
    'alert',
    'loading',
    'loading3-quarters',
    'stop',
    'smile',
    'meh',
    'frown',
    'issues-close',
  ],

  // 4. 编辑格式 (20+)
  编辑格式: [
    'bold',
    'italic',
    'underline',
    'strikethrough',
    'font-colors',
    'font-size',
    'bg-colors',
    'format-painter',
    'line-height',
    'dash',
    'small-dash',
    'radius',
  ],

  // 5. 数据图表 (40+)
  数据图表: [
    'table',
    'database',
    'bar-chart',
    'line-chart',
    'pie-chart',
    'area-chart',
    'fund',
    'stock',
    'rise',
    'fall',
    'radar-chart',
    'heat-map',
    'dot-chart',
    'box-plot',
    'reconciliation',
    'percentage',
    'funnel-plot',
    'sliders',
    'transaction',
    'account-book',
  ],

  // 6. 网络通讯 (30+)
  网络通讯: [
    'message',
    'mail',
    'notification',
    'comment',
    'contacts',
    'phone',
    'customer-service',
    'bell',
    // 移除 sound（应该是多媒体）
    'api',
    'send',
    'wifi',
    'disconnect',
    // 移除 usb（应该是办公应用）
    'bluetooth',
    'mobile',
  ],

  // 7. 文件文档 (50+)
  文件文档: [
    'file',
    'folder',
    'picture',
    'video',
    'audio',
    'container',
    'snippets',
    'file-text',
    'file-image',
    'file-pdf',
    'file-word',
    'file-excel',
    'file-ppt',
    'file-zip',
    'file-markdown',
    'file-unknown',
    'book',
    'read',
  ],

  // 8. 网站通用 (100+)
  网站通用: [
    'home',
    'appstore',
    'dashboard',
    'layout',
    'menu',
    'bars',
    'unordered-list',
    'ordered-list',
    'setting',
    'search',
    'user',
    'team',
    'usergroup',
    'user-add',
    'user-switch',
    'user-delete',
    'solution',
    'idcard',
    'contacts',
    'audit',
    'logout',
    'login',
    'pull-request',
    'fork',
    'branch',
    'branches',
    'inbox',
    'flag',
    'apartment',
    'deployment-unit',
    'gateway',
    'cluster',
    'border',
    'compass',
    'carry-out',
    'global',
    'environment',
    'qrcode',
    'barcode',
    'scan',
    'node-collapse',
    'node-index',
    'node-expand',
    'subnode',
    'sisternode',
    'merge',
    'one-to-one',
    'partition',
    'delivered-procedure',
    // 移除 usb，应该是办公应用
    'more',
    'ellipsis',
  ],

  // 9. 编辑操作 (100+)
  编辑操作: [
    'edit',
    'delete',
    'copy',
    'save',
    'download',
    'upload',
    'cloud-download',
    'cloud-upload',
    'cloud-sync',
    'plus',
    'plus-circle',
    'plus-square',
    'minus',
    'minus-circle',
    'minus-square',
    'reload',
    'sync',
    'undo',
    'redo',
    'eye',
    'eye-invisible',
    'tool',
    'share',
    'export',
    'import',
    'filter',
    'scissor',
    'highlight',
    'drag',
    'zoom-in',
    'zoom-out',
    'compress',
    'expand',
    'build',
    'clear',
    'block',
    'ordered-list',
    'unordered-list',
    'link',
    'paper-clip',
    'pushpin',
    'form',
    'select',
    'rest',
    'column-width',
    'column-height',
    'diff',
    'split-cells',
    'merge-cells',
    'insert-row',
    'delete-row',
    'partition',
    'group', // 添加：组合/取消组合
    'ungroup',
    'holder', // 添加：拖拽句柄
  ],

  // 10. 商业财产 (40+)
  商业财产: [
    'shop',
    'shopping',
    'shopping-cart',
    'gift',
    'wallet',
    'credit-card',
    'red-envelope',
    'money-collect',
    'pay-circle',
    'property-safety',
    'safety',
    'insurance',
    'security-scan',
    'medicine-box',
    'rest',
    'bank',
    'invest',
    'trophy',
    'gold',
    'skin',
    'dollar',
    'euro',
    'pound',
    'number',
    'transaction',
  ],

  // 11. 时间日期 (8)
  时间日期: ['calendar', 'clock', 'hourglass', 'field-time', 'history'],

  // 12. 多媒体 (20+)
  多媒体: [
    'camera',
    'video-camera',
    'sound',
    'audio',
    'notification',
    'picture',
    'play-circle',
    'play-square',
    'pause',
    'pause-circle',
    'backward',
    'forward',
    'step-backward',
    'step-forward',
    'fast-backward',
    'fast-forward',
    'customer-service',
    'muted',
  ],

  // 13. 地图交通 (20+)
  地图交通: ['car', 'rocket', 'environment', 'compass', 'aim', 'shake', 'man', 'woman', 'truck', 'sun', 'moon'],

  // 14. 办公应用 (30+)
  办公应用: [
    'printer',
    'calculator',
    'project',
    'schedule',
    'control',
    'delivery',
    'experiment',
    'thunderbolt',
    'fire',
    'bulb',
    'heat-map',
    'console-sql',
    'code',
    'bug',
    'desktop',
    'laptop',
    'monitor',
    'hdd',
    'cloud',
    'cloud-server',
    'robot',
    'function',
    'coffee',
    'gif',
    'signature',
    'translation',
    'poweroff',
    'switcher',
    'exception',
    'signal',
    'usb', // 添加：USB 接口属于办公硬件
  ],

  // 15. 标记 (30+)
  标记: [
    'star',
    'heart',
    'like',
    'dislike',
    'tag',
    'tags',
    'bookmark',
    'crown',
    'key',
    'lock',
    'unlock',
    'safety-certificate',
    'verified',
    'trademark',
    'copyright',
    'issues-close',
    'interaction',
  ],

  // 16. 其他 (剩余未分类的)
  其他: [],
}

// 从图标名推导分类（按顺序匹配，优先级从上到下）
function inferCategory(iconName: string): string {
  const name = iconName.toLowerCase().replace(/-filled$/, '')

  // 特殊处理：单字母品牌图标
  if (name === 'x') return '品牌标识' // X (Twitter)

  // 特殊处理：按前缀归类（优先级最高）
  if (name.startsWith('file-')) return '文件文档'
  if (name.startsWith('folder-')) return '文件文档'
  if (name.startsWith('user-')) return '网站通用'
  if (name.startsWith('cloud-')) return '办公应用'
  if (name.startsWith('field-')) return '数据图表' // field- 是数据字段类型

  // 特殊处理：精确匹配（避免被其他规则误匹配）
  const exactMatches: Record<string, string> = {
    copyright: '标记',
    'copyright-circle': '标记',
    download: '编辑操作',
    upload: '编辑操作',
    group: '编辑操作',
    ungroup: '编辑操作',
    'usergroup-add': '网站通用',
    'usergroup-delete': '网站通用',
    line: '网站通用', // 分隔线（不是 Line 通讯软件）
    underline: '编辑格式',
    'line-height': '编辑格式',
    product: '商业财产', // 产品、商品
  }
  if (exactMatches[name]) return exactMatches[name]

  for (const [category, keywords] of Object.entries(categoryRules)) {
    if (category === '其他') continue // 跳过"其他"分类，作为默认值

    // 品牌标识使用更严格的匹配：必须是完整的单词匹配或者特定后缀
    if (category === '品牌标识') {
      for (const keyword of keywords) {
        // 忽略通用词
        if (['line', 'product', 'x-filled'].includes(keyword)) continue

        // 品牌名必须是开头或者带特定后缀
        if (
          name === keyword ||
          name === keyword + '-circle' ||
          name === keyword + '-square' ||
          name.startsWith(keyword + '-')
        ) {
          return category
        }
      }
      continue
    }

    // 其他分类使用包含匹配
    for (const keyword of keywords) {
      if (name.includes(keyword) || name === keyword) {
        return category
      }
    }
  }

  return '其他'
}

// 从图标名生成关键词
function generateKeywords(iconName: string): string[] {
  const name = iconName.replace(/-filled$/, '')
  const parts = name.split('-')

  const keywords = new Set<string>()

  // 添加完整名称
  keywords.add(name)

  // 添加各个部分
  parts.forEach((part) => keywords.add(part))

  // 添加同义词（英文和中文）
  const synonyms: Record<string, string[]> = {
    home: ['house', 'homepage', '首页', '主页'],
    search: ['find', 'magnifier', 'lookup', '搜索', '查找'],
    user: ['account', 'person', 'profile', '用户', '账号'],
    setting: ['config', 'preferences', 'gear', '设置', '配置'],
    delete: ['trash', 'remove', 'bin', '删除', '移除'],
    edit: ['pencil', 'modify', 'write', '编辑', '修改'],
    check: ['tick', 'done', 'success', 'ok', '勾选', '完成', '成功'],
    close: ['x', 'cancel', 'exit', '关闭', '取消'],
    plus: ['add', 'create', 'new', '添加', '新增'],
    minus: ['subtract', 'remove', 'decrease', '减少', '删除'],
    eye: ['view', 'show', 'visible', '查看', '显示'],
    lock: ['secure', 'private', 'protected', '锁定', '加密'],
    unlock: ['open', 'unsecure', '解锁', '打开'],
    star: ['favorite', 'bookmark', '收藏', '星标'],
    heart: ['like', 'love', 'favorite', '喜欢', '点赞'],
    mail: ['email', 'message', 'envelope', '邮件', '信息'],
    bell: ['notification', 'alarm', 'alert', '通知', '提醒'],
    calendar: ['date', 'schedule', 'event', '日历', '日期'],
    clock: ['time', 'watch', '时钟', '时间'],
    warning: ['alert', 'caution', 'danger', '警告', '注意'],
    info: ['information', 'help', 'about', '信息', '帮助'],
    file: ['document', 'doc', '文件', '文档'],
    folder: ['directory', 'dir', '文件夹', '目录'],
    picture: ['image', 'photo', 'img', '图片', '照片'],
    download: ['save', 'export', '下载', '保存'],
    upload: ['import', 'publish', '上传', '导入'],
    message: ['chat', 'comment', 'text', '消息', '聊天'],
    phone: ['telephone', 'call', 'mobile', '电话', '手机'],
    shopping: ['cart', 'buy', 'purchase', '购物', '购买'],
    global: ['world', 'international', 'web', '全球', '国际'],
    cloud: ['storage', 'server', 'sync', '云', '云端'],
    menu: ['navigation', 'list', '菜单', '导航'],
    dashboard: ['control', 'panel', '仪表盘', '控制台'],
    team: ['group', 'organization', '团队', '组织'],
    tag: ['label', 'category', '标签', '分类'],
    code: ['programming', 'develop', '代码', '开发'],
    gift: ['present', 'reward', '礼物', '奖励'],
    fire: ['hot', 'popular', '火', '热门'],
    rocket: ['fast', 'launch', '火箭', '快速'],
    car: ['vehicle', 'transport', '汽车', '交通'],
  }

  parts.forEach((part) => {
    if (synonyms[part]) {
      synonyms[part].forEach((syn) => keywords.add(syn))
    }
  })

  return Array.from(keywords)
}

// 主函数
async function main() {
  console.log('🔍 扫描 SVG 文件...')

  const svgFiles = readdirSync(SVG_DIR)
    .filter((file) => file.endsWith('.svg'))
    .sort()

  console.log(`📦 找到 ${svgFiles.length} 个 SVG 文件`)

  // 基于 SVG 内容哈希 + 源脚本哈希 快速跳过（与 generate-icons 共享缓存键）
  const svgHash = createHash('sha256')
    .update(svgFiles.map((f) => readFileSync(join(SVG_DIR, f), 'utf8')).join('\n'))
    .digest('hex')

  if (existsSync(CACHE_FILE) && readFileSync(CACHE_FILE, 'utf8') === svgHash) {
    console.log('✅ SVG files unchanged, skipping metadata generation')
    return
  }

  const metadata: Record<string, { keywords: string[]; category: string; tags?: string[] }> = {}

  svgFiles.forEach((file) => {
    const iconName = basename(file, '.svg')
    const category = inferCategory(iconName)
    const keywords = generateKeywords(iconName)

    metadata[iconName] = {
      keywords,
      category,
    }

    // 特殊标记
    if (iconName === 'loading' || iconName.includes('spin')) {
      metadata[iconName].tags = ['animation']
    }
  })

  // 生成代码
  const code = `// 图标元数据
// 此文件由 scripts/generate-icon-metadata.ts 自动生成
// 请勿手动编辑，运行 pnpm gen:icon-metadata 重新生成

export interface IconMetadata {
  /** 搜索关键词（英文和中文） */
  keywords: string[]
  /** 所属分类 */
  category: string
  /** 标签（如 animation） */
  tags?: string[]
}

export const iconMetadata: Record<string, IconMetadata> = ${JSON.stringify(metadata, null, 2)}
`

  // 格式化并写入
  const prettierConfig = await prettier.resolveConfig(OUTPUT_FILE)
  const formatted = await prettier.format(code, { ...prettierConfig, parser: 'typescript' })
  writeFileSync(OUTPUT_FILE, formatted, 'utf8')

  console.log(`\n✅ 生成 ${Object.keys(metadata).length} 个图标元数据`)
  console.log(`✅ 写入 ${OUTPUT_FILE}`)

  // 统计分类
  const categoryCount: Record<string, number> = {}
  Object.values(metadata).forEach((m) => {
    categoryCount[m.category] = (categoryCount[m.category] || 0) + 1
  })

  console.log('\n📊 分类统计:')
  Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`)
    })
}

main()
