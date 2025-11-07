import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface AnimatedPageProps {
  children: ReactNode
  className?: string
  delay?: number
}

const variants = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -16, scale: 0.98 },
}

export function AnimatedPage({ children, className = '', delay = 0 }: AnimatedPageProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.35, ease: 'easeInOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
