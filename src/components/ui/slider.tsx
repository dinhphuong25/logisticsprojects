import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  value: [number, number]
  onValueChange: (value: [number, number]) => void
  max: number
  min: number
  step: number
  className?: string
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value, onValueChange, max, min, step, ...props }, ref) => {
    const handleChange = (index: number, newValue: number) => {
      const newValues: [number, number] = [...value]
      newValues[index] = Math.max(min, Math.min(max, newValue))
      onValueChange(newValues)
    }

    return (
      <div
        ref={ref}
        className={cn("relative flex w-full items-center space-x-4", className)}
        {...props}
      >
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(e) => handleChange(0, Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={(e) => handleChange(1, Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }