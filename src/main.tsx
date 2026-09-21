import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App'

// ============================================================
// 入口（纯前端 Demo）
//
// 这是一个**没有任何后端**的演示项目：不连数据库、不调接口、不发任何网络请求。
// 数据来源只有两处：
//   1. src/data/*.ts 里的 Demo 初始数据；
//   2. 后台（#/admin）改过之后存进浏览器 localStorage 的数据 —— 有则优先用。
//
// 使用 HashRouter（网址里会带一个 # 号）：
// 目标是部署到 GitHub Pages 这类纯静态托管，用 HashRouter 可以保证刷新页面不会 404。
// ============================================================

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
