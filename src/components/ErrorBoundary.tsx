import React from 'react'
import * as Sentry from '@sentry/react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorCount: number
}

/**
 * Enhanced Error Boundary Component with Sentry Integration
 * Catches JavaScript errors anywhere in the child component tree
 * Features:
 * - Automatic error reporting to Sentry
 * - User-friendly error messages
 * - Error count tracking
 * - Custom fallback UI
 * - Development mode error details
 */
export class ErrorBoundary extends React.Component<Props, State> {
  private errorTimeout: NodeJS.Timeout | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError } = this.props
    const isDevelopment = import.meta.env.DEV

    // Log error to console in development
    if (isDevelopment) {
      console.error('🚨 Error Boundary caught an error:', error, errorInfo)
      console.error('Component Stack:', errorInfo.componentStack)
    }

    // Report to Sentry in production
    if (!isDevelopment) {
      Sentry.withScope((scope) => {
        scope.setContext('errorBoundary', {
          componentStack: errorInfo.componentStack,
          errorCount: this.state.errorCount + 1,
        })
        Sentry.captureException(error)
      })
    }

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo)
    }

    // Update state with error details
    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }))

    // Auto-reset after 10 seconds if error count is low
    if (this.state.errorCount < 3) {
      this.errorTimeout = setTimeout(() => {
        this.handleReset()
      }, 10000)
    }
  }

  componentWillUnmount() {
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout)
    }
  }

  handleReset = () => {
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout)
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleReportBug = () => {
    const { error, errorInfo } = this.state
    const mailtoLink = `mailto:support@coldchain-wms.com?subject=Bug Report: Error Boundary&body=${encodeURIComponent(
      `Error: ${error?.message}\n\nComponent Stack:\n${errorInfo?.componentStack}`
    )}`
    window.location.href = mailtoLink
  }

  render() {
    const { children, fallback } = this.props
    const { hasError, error, errorInfo, errorCount } = this.state
    const isDevelopment = import.meta.env.DEV

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl border-0 shadow-2xl">
            <CardContent className="p-8">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                  <div className="relative w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-xl">
                    <AlertTriangle className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  Oops! Có lỗi xảy ra
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  Chúng tôi xin lỗi vì sự bất tiện này. Một lỗi không mong muốn đã xảy ra.
                </p>

                {/* Error Count Warning */}
                {errorCount > 2 && (
                  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                      ⚠️ Lỗi này đã xảy ra {errorCount} lần. Vui lòng báo cáo lỗi hoặc liên hệ hỗ trợ.
                    </p>
                  </div>
                )}

                {/* Development Error Details */}
                {isDevelopment && error && (
                  <details className="mt-6 text-left">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                      🔍 Chi tiết lỗi (Development Mode)
                    </summary>
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-sm font-mono text-red-800 dark:text-red-300 mb-2">
                        <strong>Error Name:</strong> {error.name}
                      </p>
                      <p className="text-sm font-mono text-red-800 dark:text-red-300 mb-2">
                        <strong>Error Message:</strong> {error.message}
                      </p>
                      {error.stack && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs font-semibold text-red-700 dark:text-red-400">
                            Stack Trace
                          </summary>
                          <pre className="text-xs font-mono text-gray-700 dark:text-gray-400 overflow-auto max-h-48 mt-2 whitespace-pre-wrap">
                            {error.stack}
                          </pre>
                        </details>
                      )}
                      {errorInfo && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs font-semibold text-red-700 dark:text-red-400">
                            Component Stack
                          </summary>
                          <pre className="text-xs font-mono text-gray-700 dark:text-gray-400 overflow-auto max-h-48 mt-2 whitespace-pre-wrap">
                            {errorInfo.componentStack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </details>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center flex-wrap">
                <Button
                  onClick={this.handleReset}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Thử lại
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="font-semibold"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Về trang chủ
                </Button>
                <Button
                  onClick={this.handleReportBug}
                  variant="outline"
                  className="font-semibold border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/30"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Báo cáo lỗi
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-center mt-6 space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nếu vấn đề vẫn tiếp diễn, vui lòng liên hệ bộ phận hỗ trợ kỹ thuật
                </p>
                {!isDevelopment && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Lỗi đã được tự động ghi nhận và gửi đến đội ngũ phát triển
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return children
  }
}