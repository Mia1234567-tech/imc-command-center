import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// ============================================================
// 只用于生成「离线演示版」的构建配置。
//
// 和正式的 vite.config.ts 的区别：
// 1. base 用 './'（相对路径），这样用 file:// 直接打开也能找到资源；
// 2. 输出成普通脚本（iife）而不是 ES module —— 浏览器在 file:// 下
//    会用 CORS 拦截 type="module" 的脚本，普通脚本没有这个限制；
// 3. 资源全部内联，最终把 HTML/CSS/JS 合成一个单文件，双击即可打开。
//
// 正式部署（GitHub Pages）仍然走 vite.config.ts，本文件与它互不影响。
// ============================================================

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'demo',
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'app.js',
        assetFileNames: 'app.[ext]',
      },
    },
  },
})
