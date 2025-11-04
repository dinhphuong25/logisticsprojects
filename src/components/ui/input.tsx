import * as React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  error?: string;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon: Icon, iconPosition = 'left', error, label, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {Icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-11 w-full rounded-xl border-2 bg-background px-4 py-2.5 text-sm font-medium transition-all duration-200",
              "border-gray-200 dark:border-gray-700",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:border-primary",
              "hover:border-gray-300 dark:hover:border-gray-600",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-900",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              error && "border-red-500 focus-visible:ring-red-500/20 focus-visible:border-red-500",
              Icon && iconPosition === 'left' && "pl-11",
              Icon && iconPosition === 'right' && "pr-11",
              className
            )}
            ref={ref}
            {...props}
          />
          {Icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs font-medium text-red-500 flex items-center gap-1 animate-fade-in">
            ⚠️ {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
