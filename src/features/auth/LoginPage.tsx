import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import toast from 'react-hot-toast'
import { Snowflake, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success(t('auth.welcome'))
      navigate('/dashboard')
    } catch {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-950 dark:via-blue-950 dark:to-cyan-950">
      {/* Animated Background Elements - Enhanced */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large Gradient Orbs with animations */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-300 opacity-30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-[700px] h-[700px] bg-gradient-to-br from-cyan-400 via-teal-400 to-cyan-300 opacity-30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-300 opacity-20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-300 opacity-25 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Small floating particles */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-20 rounded-full blur-2xl animate-float"></div>
        <div className="absolute top-2/3 right-1/3 w-24 h-24 bg-gradient-to-br from-teal-500 to-emerald-500 opacity-20 rounded-full blur-2xl animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-28 h-28 bg-gradient-to-br from-purple-500 to-pink-500 opacity-15 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-white/50 dark:to-black/50"></div>
      </div>

      {/* Main Content - Centered Modern Design */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-8 animate-slide-in">
          
          {/* Login Form Card */}
          <div className="w-full space-y-6">
            <Card className="backdrop-blur-3xl bg-white/95 dark:bg-gray-900/95 border-2 border-white/60 dark:border-gray-700/60 shadow-3xl rounded-[2rem] overflow-hidden transition-all duration-500 relative group">
              {/* Card background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Animated border glow */}
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
              
              <CardContent className="p-12 relative z-10">
                {/* Logo - Enhanced */}
                <div className="flex justify-center mb-12">
                  <div className="relative group/logo">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-[2rem] blur-3xl opacity-70 group-hover/logo:opacity-100 group-hover/logo:scale-110 transition-all duration-500 animate-pulse"></div>
                    <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-[2rem] flex items-center justify-center shadow-3xl group-hover/logo:scale-110 group-hover/logo:rotate-6 transition-all duration-500">
                      <Snowflake className="w-16 h-16 text-white animate-spin-slow" />
                    </div>
                  </div>
                </div>

                <div className="text-center mb-14">
                  <h2 className="text-6xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent mb-5 animate-fade-in leading-tight">
                    Chào mừng trở lại
                  </h2>
                  <p className="text-xl text-gray-600 dark:text-gray-400 font-bold">
                    Đăng nhập vào hệ thống
                  </p>
                  <p className="text-base text-gray-500 dark:text-gray-500 font-medium mt-2">
                    Cold Chain WMS - Nhóm 3 VENTURE
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-7">
                  <div className="space-y-4">
                    <label className="text-base font-black text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      Email
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-blue-600 group-focus-within:scale-110 transition-all" />
                      <Input
                        type="email"
                        placeholder="admin@wms.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-14 h-16 text-lg rounded-2xl border-3 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-base font-black text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-blue-600" />
                      Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-blue-600 group-focus-within:scale-110 transition-all" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-14 h-16 text-lg rounded-2xl border-3 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="group w-full h-16 text-xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 shadow-2xl shadow-blue-500/50 hover:shadow-3xl hover:shadow-blue-500/70 rounded-2xl transition-all duration-500 hover:scale-105 relative overflow-hidden" 
                    disabled={loading}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                    {loading ? (
                      <div className="flex items-center justify-center gap-3 relative z-10">
                        <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Đang đăng nhập...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3 relative z-10">
                        <span>Đăng nhập</span>
                        <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform" />
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 text-sm text-gray-600 dark:text-gray-400 font-bold">
                <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                <span>© 2025 Nhóm 3 - VENTURE | Cold Chain WMS Project</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
