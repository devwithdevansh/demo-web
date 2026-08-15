import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { usePrefersReducedMotion } from '../hooks/useReducedMotion'
import './cursor.css'

const INTERACTIVE_SELECTOR = 'a, button, input, textarea, select, [role="button"]'

export default function CustomCursor() {
  const reducedMotion = usePrefersReducedMotion()
  const [enabled, setEnabled] = useState(false)
  const [active, setActive] = useState(false)
  // Center of the currently-hovered interactive element, or null when following the raw pointer
  const snapRef = useRef(null)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const springX = useSpring(x, { stiffness: 300, damping: 26, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 300, damping: 26, mass: 0.4 })

  // Only enable on devices with a real pointer, and never fight reduced-motion preferences
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    setEnabled(window.matchMedia('(pointer: fine)').matches && !reducedMotion)
  }, [reducedMotion])

  useEffect(() => {
    if (!enabled) return

    document.documentElement.classList.add('has-custom-cursor')

    const handleMove = (e) => {
      if (snapRef.current) {
        x.set(snapRef.current.cx)
        y.set(snapRef.current.cy)
      } else {
        x.set(e.clientX)
        y.set(e.clientY)
      }
    }
    const handleOver = (e) => {
      const el = e.target.closest?.(INTERACTIVE_SELECTOR)
      if (!el) return
      const rect = el.getBoundingClientRect()
      snapRef.current = { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 }
      setActive(true)
    }
    const handleOut = (e) => {
      const el = e.target.closest?.(INTERACTIVE_SELECTOR)
      if (!el) return
      snapRef.current = null
      setActive(false)
    }
    const handleWindowLeave = () => {
      x.set(-100)
      y.set(-100)
    }

    window.addEventListener('pointermove', handleMove, { passive: true })
    document.addEventListener('pointerover', handleOver)
    document.addEventListener('pointerout', handleOut)
    document.addEventListener('mouseleave', handleWindowLeave)

    return () => {
      document.documentElement.classList.remove('has-custom-cursor')
      window.removeEventListener('pointermove', handleMove)
      document.removeEventListener('pointerover', handleOver)
      document.removeEventListener('pointerout', handleOut)
      document.removeEventListener('mouseleave', handleWindowLeave)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  return (
    <motion.div
      className={`custom-cursor ${active ? 'custom-cursor--active' : ''}`}
      style={{ x: springX, y: springY }}
      aria-hidden="true"
    />
  )
}
