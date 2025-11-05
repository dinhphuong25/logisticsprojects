import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import toast from 'react-hot-toast'
import { 
  Mail, 
  Lock, 
  ArrowRight
} from 'lucide-react'

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
      toast.error('Email hoặc mật khẩu không chính xác')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Main Content - Centered Login Form */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md animate-slide-in">
          {/* Enhanced Box Shadow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[2rem] blur-2xl opacity-20 scale-105"></div>
          
          <Card className="relative w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_70px_-15px_rgba(0,0,0,0.8)] rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-[0_25px_80px_-15px_rgba(59,130,246,0.5)] hover:scale-[1.02] group">
              {/* Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-900/10 dark:via-transparent dark:to-purple-900/10 opacity-50"></div>
              
              <CardContent className="p-8 sm:p-10 lg:p-12 relative z-10">
                {/* Welcome Message */}
                <div className="text-center mb-10">
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Chào mừng bạn trở lại! 👋
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Đăng nhập để sử dụng hệ thống
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      Email
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 group-focus-within:scale-110 transition-all" />
                      <Input
                        type="email"
                        placeholder="admin@wms.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-14 text-base rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-600 dark:focus:border-blue-600 focus:ring-4 focus:ring-blue-600/20 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-sm hover:shadow-md transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-blue-600" />
                      Mật khẩu
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 group-focus-within:scale-110 transition-all" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 h-14 text-base rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-600 dark:focus:border-blue-600 focus:ring-4 focus:ring-blue-600/20 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-sm hover:shadow-md transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Login Button */}
                  <Button 
                    type="submit" 
                    className="group/btn w-full h-14 text-lg font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-2xl shadow-blue-600/50 hover:shadow-3xl hover:shadow-blue-600/70 rounded-xl transition-all duration-500 hover:scale-[1.02] active:scale-95 relative overflow-hidden" 
                    disabled={loading}
                  >
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                    
                    {loading ? (
                      <div className="flex items-center justify-center gap-3 relative z-10">
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Đang đăng nhập...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3 relative z-10">
                        <span>Đăng nhập ngay</span>
                        <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
