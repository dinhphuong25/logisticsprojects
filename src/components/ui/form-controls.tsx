import * as React from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, ...props }, ref) => {
    return (
      <div className="flex items-start gap-3">
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            className={cn(
              "peer h-5 w-5 shrink-0 appearance-none rounded-md border-2 border-gray-300 dark:border-gray-600",
              "transition-all duration-200 cursor-pointer",
              "hover:border-primary dark:hover:border-primary",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
              "checked:bg-primary checked:border-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            ref={ref}
            {...props}
          />
          <Check className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
        {(label || description) && (
          <div className="flex-1 space-y-1">
            {label && (
              <label
                htmlFor={props.id}
                className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, ...props }, ref) => {
    return (
      <div className="flex items-start gap-3">
        <div className="relative flex items-center justify-center">
          <input
            type="radio"
            className={cn(
              "peer h-5 w-5 shrink-0 appearance-none rounded-full border-2 border-gray-300 dark:border-gray-600",
              "transition-all duration-200 cursor-pointer",
              "hover:border-primary dark:hover:border-primary",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
              "checked:border-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            ref={ref}
            {...props}
          />
          <div className="absolute w-2.5 h-2.5 bg-primary rounded-full pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
        {(label || description) && (
          <div className="flex-1 space-y-1">
            {label && (
              <label
                htmlFor={props.id}
                className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Radio.displayName = 'Radio'

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, ...props }, ref) => {
    return (
      <div className="flex items-start justify-between gap-4">
        {(label || description) && (
          <div className="flex-1 space-y-1">
            {label && (
              <label
                htmlFor={props.id}
                className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
            )}
          </div>
        )}
        <div className="relative inline-block">
          <input
            type="checkbox"
            className={cn(
              "peer h-6 w-11 shrink-0 appearance-none rounded-full bg-gray-300 dark:bg-gray-600",
              "transition-all duration-200 cursor-pointer",
              "hover:bg-gray-400 dark:hover:bg-gray-500",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
              "checked:bg-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            ref={ref}
            {...props}
          />
          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full pointer-events-none transition-transform peer-checked:translate-x-5 shadow-md" />
        </div>
      </div>
    )
  }
)

Switch.displayName = 'Switch'
