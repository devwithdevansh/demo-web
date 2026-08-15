import { motion } from 'framer-motion'

export default function FadeIn({
  children,
  delay = 0,
  duration = 0.8,
  y = 30,
  className = '',
  as = 'div',
}) {
  const Component = motion[as]

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }} // elegant custom easing
    >
      {children}
    </Component>
  )
}
