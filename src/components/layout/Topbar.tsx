import { Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { navItems } from '../../config/nav'
import { campaign } from '../../data/campaign'
import { cnDate } from '../../utils/format'
import { Badge } from '../ui/Badge'

export default function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { pathname } = useLocation()
  const current = navItems.find((item) =>
    item.to === '/' ? pathname === '/' : pathname.startsWith(item.to),
  )

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[1480px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 active:scale-95 lg:hidden"
          aria-label="打开菜单"
        >
          <Menu size={18} />
        </button>

        <nav
          className="flex min-w-0 flex-1 items-center gap-1.5 text-[12.5px]"
          aria-label="面包屑"
        >
          <span className="hidden shrink-0 tracking-[0.01em] text-slate-400 sm:inline">
            IMC Command Center
          </span>
          <span className="hidden shrink-0 text-slate-300 sm:inline">/</span>
          <span className="shrink-0 font-semibold tracking-[-0.005em] text-slate-900">
            {current?.zh ?? '总览'}
          </span>
          <span className="hidden truncate tracking-[0.01em] text-slate-400 md:inline">
            {current?.label}
          </span>
        </nav>

        <div className="flex shrink-0 items-center gap-2.5">
          <span className="tabular hidden text-[11.5px] text-slate-400 sm:inline">
            数据截止 {cnDate(campaign.dataCutoff)}
          </span>
          <Badge tone="warn">演示数据</Badge>
        </div>
      </div>
    </header>
  )
}
