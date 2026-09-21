import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { PageSkeleton } from '../ui/Skeleton'
import { useBootState } from '../../hooks/useBootState'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const booting = useBootState()

  return (
    <div className="min-h-screen">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-[248px]">
        <Topbar onOpenMenu={() => setMenuOpen(true)} />
        <main className="mx-auto w-full max-w-[1480px] px-4 pt-6 pb-24 sm:px-6 lg:px-8">
          {booting ? <PageSkeleton /> : <Outlet />}
        </main>
      </div>
    </div>
  )
}
