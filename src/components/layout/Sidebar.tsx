import { BarChart3, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { adminNavItems, navItems, type NavItem } from '../../config/nav'
import { campaign } from '../../data/campaign'
import { cnDate } from '../../utils/format'

/** 单条导航项：前台模块与后台入口共用同一套样式与交互 */
function NavItemLink({ item, onClose }: { item: NavItem; onClose: () => void }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={onClose}
      className={({ isActive }) =>
        [
          'group relative mb-0.5 flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 transition-all duration-150',
          isActive
            ? 'bg-blue-50/80 text-blue-700'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.99]',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          {isActive ? (
            <span className="absolute top-1/2 left-0 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-blue-600" />
          ) : null}
          <Icon
            size={16}
            strokeWidth={2}
            className={
              isActive
                ? 'text-blue-600'
                : 'text-slate-400 transition-colors group-hover:text-slate-600'
            }
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12.5px] leading-tight font-medium">
              {item.zh}
            </span>
            <span
              className={`block truncate text-[10px] tracking-[0.02em] ${
                isActive ? 'text-blue-500/80' : 'text-slate-400'
              }`}
            >
              {item.label}
            </span>
          </span>
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-30 bg-slate-900/25 backdrop-blur-[1px] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* 品牌区 */}
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-blue-600 text-white shadow-[0_4px_12px_-4px_rgba(37,99,235,0.6)]">
            <BarChart3 size={17} strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13.5px] leading-tight font-semibold tracking-[-0.01em] text-slate-900">
              IMC Command Center
            </div>
            <div className="mt-0.5 truncate text-[10.5px] tracking-[0.02em] text-slate-400">
              整合营销作战台
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            aria-label="关闭菜单"
          >
            <X size={16} />
          </button>
        </div>

        {/* 当前 Campaign */}
        <div className="mx-4 mt-4 mb-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
          <div className="text-[10.5px] tracking-[0.02em] text-slate-400">当前 Campaign</div>
          <div className="mt-1 line-clamp-2 text-[12px] leading-5 font-medium text-slate-700">
            {campaign.name}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[10.5px] text-slate-500">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {campaign.status}
          </div>
        </div>

        {/* 导航 */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="px-2 pt-3 pb-1.5 text-[10.5px] font-medium tracking-[0.08em] text-slate-400 uppercase">
            功能模块
          </div>
          {navItems.map((item) => (
            <NavItemLink key={item.to} item={item} onClose={onClose} />
          ))}

          {/* 数据管理：后台入口单独一组，放在最下方 */}
          <div className="mt-3 border-t border-slate-100 pt-3">
            <div className="px-2 pb-1.5 text-[10.5px] font-medium tracking-[0.08em] text-slate-400 uppercase">
              数据管理
            </div>
            {adminNavItems.map((item) => (
              <NavItemLink key={item.to} item={item} onClose={onClose} />
            ))}
            <p className="mt-1.5 px-2.5 text-[10.5px] leading-5 text-slate-400">
              编辑演示数据，保存后前台页面同步读取
            </p>
          </div>
        </nav>

        {/* 底部说明 */}
        <div className="border-t border-slate-100 px-5 py-3.5">
          <div className="text-[10.5px] leading-5 text-slate-400">
            数据截止 {cnDate(campaign.dataCutoff)}
          </div>
          <div className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium tracking-[0.01em] text-amber-700">
            演示数据 · 非真实业务
          </div>
        </div>
      </aside>
    </>
  )
}
