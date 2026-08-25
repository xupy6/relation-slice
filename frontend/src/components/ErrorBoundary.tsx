import { Component, type ErrorInfo, type ReactNode } from 'react'

import GlassButton from './GlassButton'
import GlassCard from './GlassCard'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

const COPY = {
  title: '\u754c\u9762\u6682\u65f6\u5931\u53bb\u54cd\u5e94',
  copy: '\u91cd\u65b0\u8f7d\u5165\u540e\u53ef\u4ee5\u7ee7\u7eed\u4e0a\u4f20\u6216\u67e5\u770b\u5206\u6790\u7ed3\u679c\u3002',
  reload: '\u91cd\u65b0\u8f7d\u5165',
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[800px] items-center px-5 py-10">
          <GlassCard className="p-6 sm:p-8">
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{COPY.title}</h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-[rgb(var(--text-secondary))]">{COPY.copy}</p>
            <GlassButton className="mt-6 px-5 py-3 text-sm font-semibold" onClick={() => window.location.reload()}>
              {COPY.reload}
            </GlassButton>
          </GlassCard>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
