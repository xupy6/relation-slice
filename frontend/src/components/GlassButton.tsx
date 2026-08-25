import { motion, type HTMLMotionProps } from 'framer-motion'

type GlassButtonProps = HTMLMotionProps<'button'>

function GlassButton({ className = '', type = 'button', children, ...props }: GlassButtonProps) {
  const isDisabled = Boolean(props.disabled)

  return (
    <motion.button
      type={type}
      whileHover={isDisabled ? undefined : { y: -1, scale: 1.01 }}
      whileTap={isDisabled ? undefined : { y: 0, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className={`glass-button ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export default GlassButton
