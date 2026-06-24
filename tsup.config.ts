import { defineConfig } from 'tsup'

export default defineConfig({
  // 编译所有源文件，保留目录结构（bundle: false）
  // 图标组件每个单独编译，tree-shaking 友好
  // 构建后由 fix-extensions.js 补全 .js 扩展名
  entry: [
    'index.ts',
    'metadata.ts',
    'utils.ts',
    'types.ts',
    'icons/**/*.ts',
    '!**/*.test.ts',
    '!**/*.spec.ts',
  ],
  format: ['esm'],
  dts: {
    entry: 'index.ts',
  },
  external: ['vue'],
  bundle: false,
  clean: true,
  sourcemap: false,
  outDir: 'dist',
  minify: false,
  esbuildOptions(options) {
    options.jsx = 'automatic'
    options.jsxImportSource = 'vue'
    options.banner = {
      js: '/* @hmfw/icons | MIT License | https://github.com/hmfw/ant-design-icons */',
    }
  },
})
