import * as React from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface Step {
  id: string
  title: string
  description?: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  className?: string
  variant?: 'default' | 'dots' | 'progress'
}

export function Stepper({
  steps,
  currentStep,
  className,
  variant = 'default',
}: StepperProps) {
  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        {steps.map((_, index) => (
          <div
            key={index}
            className={cn(
              'w-3 h-3 rounded-full transition-all duration-300',
              index <= currentStep
                ? 'bg-primary scale-125'
                : 'bg-gray-300 dark:bg-gray-600'
            )}
          />
        ))}
      </div>
    )
  }

  if (variant === 'progress') {
    const progress = ((currentStep + 1) / steps.length) * 100
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="text-gray-700 dark:text-gray-300">
            Bước {currentStep + 1} / {steps.length}
          </span>
          <span className="text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {steps[currentStep]?.title}
        </p>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isLast = index === steps.length - 1

        return (
          <React.Fragment key={step.id}>
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 shadow-lg',
                  isCompleted &&
                    'bg-primary text-white scale-110',
                  isCurrent &&
                    'bg-primary text-white scale-125 ring-4 ring-primary/30',
                  !isCompleted &&
                    !isCurrent &&
                    'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                )}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    'text-sm font-semibold transition-colors',
                    (isCurrent || isCompleted)
                      ? 'text-primary'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div
                className={cn(
                  'flex-1 h-1 mx-4 rounded-full transition-all duration-500',
                  index < currentStep
                    ? 'bg-primary'
                    : 'bg-gray-200 dark:bg-gray-700'
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
