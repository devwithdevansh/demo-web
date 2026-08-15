import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export function Parallax({ children, offset = 50, className = '', style = {} }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // When element enters viewport to when it leaves, translate y from -offset to offset
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset])

  return (
    <motion.div ref={ref} className={className} style={{ y, ...style }}>
      {children}
    </motion.div>
  )
}
