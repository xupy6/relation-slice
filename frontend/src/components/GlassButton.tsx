import { motion, type HTMLMotionProps } from 'framer-motion'

type GlassButtonProps = HTMLMotionProps<'button'>

function GlassButton({ className = '', type = 'button', children, ...props }: GlassButtonProps) {
  return (
    <motion.button
      type={type}
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ y: 0, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className={`glass-button ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export default GlassButton
