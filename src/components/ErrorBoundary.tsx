import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    // You can also log to an error reporting service here
    // Example: logErrorToService(error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
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
                
                {/* Error Details */}
                {this.state.error && (
                  <details className="mt-6 text-left">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                      Chi tiết lỗi (dành cho developer)
                    </summary>
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-sm font-mono text-red-800 dark:text-red-300 mb-2">
                        <strong>Error:</strong> {this.state.error.message}
                      </p>
                      {this.state.errorInfo && (
                        <pre className="text-xs font-mono text-gray-700 dark:text-gray-400 overflow-auto max-h-64 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  </details>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
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
              </div>

              {/* Help Text */}
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                Nếu vấn đề vẫn tiếp diễn, vui lòng liên hệ bộ phận hỗ trợ kỹ thuật
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
