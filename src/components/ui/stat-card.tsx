import * as React from 'react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from './card'
import { Badge } from './badge'

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: string
    direction: 'up' | 'down' | 'neutral'
  }
  gradient?: string
  iconBg?: string
  iconColor?: string
  description?: string
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      className,
      title,
      value,
      icon: Icon,
      trend,
      gradient = 'from-blue-500 to-cyan-500',
      iconBg = 'bg-blue-100 dark:bg-blue-900/30',
      iconColor = 'text-blue-600 dark:text-blue-400',
      description,
      ...props
    },
    ref
  ) => {
    const getTrendIcon = () => {
      if (!trend) return null
      switch (trend.direction) {
        case 'up':
          return '↗'
        case 'down':
          return '↘'
        default:
          return '→'
      }
    }

    const getTrendColor = () => {
      if (!trend) return ''
      switch (trend.direction) {
        case 'up':
          return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
        case 'down':
          return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
        default:
          return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
      }
    }

    return (
      <Card
        ref={ref}
        hover
        className={cn('group relative overflow-hidden', className)}
        {...props}
      >
        {/* Gradient Background */}
        <div
          className={cn(
            'absolute inset-0 bg-linear-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300',
            gradient
          )}
        />

        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div
              className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300',
                iconBg
              )}
            >
              <Icon className={cn('w-7 h-7', iconColor)} />
            </div>
            {trend && (
              <Badge className={cn('font-semibold', getTrendColor())}>
                <span className="flex items-center gap-1">
                  <span className="text-base">{getTrendIcon()}</span>
                  {trend.value}
                </span>
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <p className="text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {value}
            </p>
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>

          {/* Sparkline effect */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-current to-transparent opacity-20" />
        </CardContent>
      </Card>
    )
  }
)

StatCard.displayName = 'StatCard'

export { StatCard }
