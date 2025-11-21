import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import toast from 'react-hot-toast'
import {
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const keyPoints = [
    'Theo dõi nhiệt độ container theo thời gian thực',
    'Cảnh báo tức thì khi vượt ngưỡng an toàn',
    'Tổng quan xuất – nhập được cập nhật liên tục'
  ]

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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 px-4 py-8 sm:px-6 lg:px-12">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
        
        {/* Animated Orbs */}
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 blur-3xl animate-float" />
        <div className="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 blur-3xl animate-float-delayed" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-500/20 to-blue-500/20 blur-3xl animate-pulse-slow" />
        
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 lg:flex-row lg:items-center xl:gap-20">
        {/* Left Content */}
        <div className="w-full space-y-6 text-center text-white lg:w-1/2 lg:text-left lg:space-y-8">
          <div className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-md shadow-lg lg:justify-start transition-all duration-300 hover:bg-white/15">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.5em] text-blue-100">EcoFresh</p>
              <p className="text-sm font-semibold text-white/90">Logistics Control Center</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
              Đơn giản hóa quản trị kho lạnh của bạn
            </h1>
            <p className="text-sm text-white/80 sm:text-base lg:text-lg">
              EcoFresh kết nối cảm biến, lịch vận chuyển và thao tác nhập – xuất vào một giao diện thống nhất để
              bạn kiểm soát mọi thứ trong vài giây.
            </p>
          </div>

          <ul className="space-y-3 max-w-xl mx-auto lg:mx-0">
            {keyPoints.map((point, index) => (
              <li key={point} className="flex items-start gap-3 text-left text-sm text-white/90 sm:text-base lg:text-left">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 shadow-lg flex-shrink-0" />
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Content - Login Form */}
        <div className="w-full lg:w-1/2 flex justify-center items-center">
          <Card className="relative w-full max-w-md overflow-hidden border-0 bg-white/95 shadow-2xl backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50" />
            <CardContent className="relative space-y-6 px-6 py-8 sm:px-8 sm:py-10">
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 mb-2">
                  <Zap className="h-3.5 w-3.5 text-blue-600" />
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Đăng nhập</p>
                </div>
                <h2 className="text-2xl font-black text-gray-900 sm:text-3xl">Truy cập bảng điều khiển</h2>
                <p className="text-sm text-gray-600">Nhập thông tin EcoFresh của bạn để tiếp tục</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Mail className="h-4 w-4 text-blue-600" />
                  Email
                </label>
                <div className="group relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-all duration-300 group-focus-within:text-blue-600 group-focus-within:scale-110" />
                  <Input
                    type="email"
                    placeholder="admin@wms.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 rounded-xl border-2 border-gray-200 bg-white pl-12 pr-4 text-base font-medium text-gray-900 placeholder:text-gray-400 transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-offset-0 hover:border-gray-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Lock className="h-4 w-4 text-blue-600" />
                  Mật khẩu
                </label>
                <div className="group relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-all duration-300 group-focus-within:text-blue-600 group-focus-within:scale-110" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 rounded-xl border-2 border-gray-200 bg-white pl-12 pr-4 text-base font-medium text-gray-900 placeholder:text-gray-400 transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-offset-0 hover:border-gray-300"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="group relative flex h-14 w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-base font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    <span>Đang đăng nhập...</span>
                  </div>
                ) : (
                  <div className="relative z-10 flex items-center gap-3">
                    <span>Vào bảng điều khiển</span>
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                )}
              </Button>
            </form>

            <div className="space-y-2 rounded-xl border border-gray-100 bg-gradient-to-br from-blue-50/50 to-purple-50/30 p-5 text-center">
              <p className="text-sm font-medium text-gray-600">Cần hỗ trợ? Liên hệ đội EcoFresh 24/7</p>
              <a 
                href="mailto:support@ecofresh.com" 
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                support@ecofresh.com
              </a>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Decorative Footer */}
      <div className="relative z-10 mt-8 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-white/80">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
          <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Mã hóa chuẩn doanh nghiệp</span>
        </div>
        <span className="h-1 w-1 rounded-full bg-white/50 hidden sm:block" />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
          <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>AI điều phối thông minh</span>
        </div>
        <span className="h-1 w-1 rounded-full bg-white/50 hidden sm:block" />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
          <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Hỗ trợ 24/7</span>
        </div>
      </div>

      {/* Premium CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(20px, -20px) scale(1.1);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-20px, 20px) scale(1.1);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(1.2);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes shine {
          0% {
            transform: translateX(-100%) skewX(-15deg);
          }
          100% {
            transform: translateX(200%) skewX(-15deg);
          }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite 2s;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 8s linear infinite;
        }
        
        .animate-shine {
          animation: shine 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
