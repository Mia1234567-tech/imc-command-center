import { useLayoutEffect, useState } from 'react'

/**
 * 首屏「正在载入」状态，只用于展示骨架屏。
 *
 * 为什么用 useLayoutEffect 而不是 useEffect：
 * useLayoutEffect 在浏览器绘制之前同步执行，所以骨架屏能出现在第一帧，
 * 不会出现「先闪一下真实内容、再跳成骨架屏」的抖动；
 * 而在 Node 里做静态渲染（SSR）时 effect 不会执行，
 * 直接输出真实内容，方便做自动化校验。
 */
export function useBootState(delay = 420): boolean {
  const [booting, setBooting] = useState(false)

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    setBooting(true)
    const timer = window.setTimeout(() => setBooting(false), delay)
    return () => window.clearTimeout(timer)
  }, [delay])

  return booting
}
