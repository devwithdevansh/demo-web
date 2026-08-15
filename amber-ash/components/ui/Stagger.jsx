import { motion } from 'framer-motion'
import { Children, isValidElement, cloneElement } from 'react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
}

export function StaggerContainer({ children, className = '', as = 'div' }) {
  const Component = motion[as]
  
  return (
    <Component
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10%' }}
    >
      {children}
    </Component>
  )
}

export function StaggerItem({ children, className = '', as = 'div' }) {
  const Component = motion[as]

  return (
    <Component className={className} variants={itemVariants}>
      {children}
    </Component>
  )
}
