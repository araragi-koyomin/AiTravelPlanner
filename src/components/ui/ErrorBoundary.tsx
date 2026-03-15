import * as React from 'react'
import { Button } from './Button'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-4">
          <div className="text-center">
            <div className="mb-4 text-6xl">😵</div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900">出错了</h2>
            <p className="mb-6 text-gray-600">
              {this.state.error?.message || '页面遇到了一些问题，请稍后再试'}
            </p>
            <Button onClick={this.handleReset}>重试</Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export { ErrorBoundary }
