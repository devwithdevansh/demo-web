import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from './useReducedMotion'

const MAX_PULL = 14 // px, how far an element can be dragged toward the cursor
const STRENGTH = 0.35 // 0-1, how strongly the element chases the pointer

/**
 * Attach the returned ref to any element (or a react-router <Link>, which
 * forwards refs to its underlying <a>) to give it a magnetic pull toward
 * the cursor on hover. No-ops on touch devices and when the user prefers
 * reduced motion.
 */
export function useMagneticHover() {
  const ref = useRef(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window === 'undefined' || !window.matchMedia) return
    const fine = window.matchMedia('(pointer: fine)').matches
    if (!fine || reducedMotion) return

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect()
      const relX = e.clientX - (rect.left + rect.width / 2)
      const relY = e.clientY - (rect.top + rect.height / 2)
      const pullX = Math.max(-MAX_PULL, Math.min(MAX_PULL, relX * STRENGTH))
      const pullY = Math.max(-MAX_PULL, Math.min(MAX_PULL, relY * STRENGTH))
      el.style.transform = `translate(${pullX}px, ${pullY}px)`
    }
    const handleLeave = () => {
      el.style.transform = ''
    }

    el.addEventListener('pointermove', handleMove)
    el.addEventListener('pointerleave', handleLeave)
    return () => {
      el.removeEventListener('pointermove', handleMove)
      el.removeEventListener('pointerleave', handleLeave)
      el.style.transform = ''
    }
  }, [reducedMotion])

  return ref
}
