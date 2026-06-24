import { defineConfig } from 'tsup'

export default defineConfig([
  // ESM 构建 —— 每个图标单独编译，tree-shaking 友好
  {
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
    dts: { entry: 'index.ts' },
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
  },
  // UMD 构建 (CDN 使用，如 <script src="hmfw-icons.umd.js">)
  {
    entry: { 'hmfw-icons.umd': 'index.ts' },
    format: ['iife'],
    globalName: 'HmfwIcons',
    external: ['vue'],
    outDir: 'dist',
    minify: true,
    sourcemap: true,
    esbuildOptions(options) {
      options.jsx = 'automatic'
      options.jsxImportSource = 'vue'
      options.banner = {
        js: '/* @hmfw/icons (UMD) | MIT License | https://github.com/hmfw/ant-design-icons */',
      }
    },
    onSuccess: async () => {
      console.log('✅ @hmfw/icons UMD build completed!')
    },
  },
])
