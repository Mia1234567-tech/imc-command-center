import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import CampaignOverview from './pages/CampaignOverview'
import ProjectExecution from './pages/ProjectExecution'
import Budget from './pages/Budget'
import Kpi from './pages/Kpi'
import Risk from './pages/Risk'
import AdminHome from './pages/admin/AdminHome'
import AdminCampaign from './pages/admin/AdminCampaign'
import AdminExecution from './pages/admin/AdminExecution'
import AdminBudget from './pages/admin/AdminBudget'
import AdminKpi from './pages/admin/AdminKpi'
import AdminRisk from './pages/admin/AdminRisk'

// ============================================================
// 路由表
//
// 前台 6 个页面：任何人打开网址都能看，不需要登录。
// 后台 6 个页面：直接访问 #/admin 即可进入，同样**不需要登录**
//   —— 这是个人作品集 Demo，没有后端也没有账号体系；
//      后台改动只保存在「当前这台电脑的这个浏览器」里（localStorage）。
// ============================================================

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/campaign" element={<CampaignOverview />} />
        <Route path="/execution" element={<ProjectExecution />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/kpi" element={<Kpi />} />
        <Route path="/risk" element={<Risk />} />
        {/* 后台管理：编辑演示数据，前台页面读取同一份数据 */}
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/campaign" element={<AdminCampaign />} />
        <Route path="/admin/execution" element={<AdminExecution />} />
        <Route path="/admin/budget" element={<AdminBudget />} />
        <Route path="/admin/kpi" element={<AdminKpi />} />
        <Route path="/admin/risk" element={<AdminRisk />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
