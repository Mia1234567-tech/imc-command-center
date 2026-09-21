import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// 说明：
// 本地开发（npm run dev）时 base 用 '/'，浏览器打开 http://localhost:5173 即可。
// 打包发布（npm run build）时 base 换成 GitHub 仓库名，
// 这样部署到 https://<用户名>.github.io/imc-command-center/ 后资源路径才不会 404。
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/imc-command-center/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: true,
  },
}))
