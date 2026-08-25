import { motion, type HTMLMotionProps } from 'framer-motion'

type GlassCardProps = HTMLMotionProps<'div'>

const springTransition = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
} as const

function GlassCard({ className = '', children, ...props }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className={`glass ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default GlassCard
