import * as React from "react"
import { cn } from "../../lib/utils"

interface CollapsibleContextType {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CollapsibleContext = React.createContext<CollapsibleContextType | null>(null)

const useCollapsible = () => {
  const context = React.useContext(CollapsibleContext)
  if (!context) {
    throw new Error("useCollapsible must be used within a Collapsible")
  }
  return context
}

interface CollapsibleProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  children: React.ReactNode
  className?: string
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ open: controlledOpen, defaultOpen = false, onOpenChange, disabled = false, children, className, ...props }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen

    const handleOpenChange = React.useCallback((newOpen: boolean) => {
      if (disabled) return
      
      if (!isControlled) {
        setInternalOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    }, [disabled, isControlled, onOpenChange])

    const contextValue = React.useMemo(() => ({
      open,
      onOpenChange: handleOpenChange
    }), [open, handleOpenChange])

    return (
      <CollapsibleContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("", className)}
          {...props}
        >
          {children}
        </div>
      </CollapsibleContext.Provider>
    )
  }
)
Collapsible.displayName = "Collapsible"

interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ className, onClick, asChild = false, ...props }, ref) => {
    const { open, onOpenChange } = useCollapsible()

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onOpenChange(!open)
      onClick?.(event)
    }

    if (asChild) {
      return React.cloneElement(props.children as React.ReactElement, {
        onClick: handleClick,
        'aria-expanded': open,
        'data-state': open ? 'open' : 'closed',
      })
    }

    return (
      <button
        ref={ref}
        type="button"
        aria-expanded={open}
        data-state={open ? 'open' : 'closed'}
        className={cn("", className)}
        onClick={handleClick}
        {...props}
      />
    )
  }
)
CollapsibleTrigger.displayName = "CollapsibleTrigger"

interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean
}

const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ className, forceMount = false, children, style, ...props }, ref) => {
    const { open } = useCollapsible()
    const [height, setHeight] = React.useState<number | undefined>(open ? undefined : 0)
    const contentRef = React.useRef<HTMLDivElement>(null)

    React.useImperativeHandle(ref, () => contentRef.current!)

    React.useEffect(() => {
      if (!contentRef.current) return

      if (open) {
        const scrollHeight = contentRef.current.scrollHeight
        setHeight(scrollHeight)
        
        // Reset to auto after animation
        const timer = setTimeout(() => {
          setHeight(undefined)
        }, 300)
        
        return () => clearTimeout(timer)
      } else {
        setHeight(contentRef.current.scrollHeight)
        // Force reflow
        contentRef.current.getBoundingClientRect()
        setHeight(0)
      }
    }, [open])

    if (!forceMount && !open && height === 0) {
      return null
    }

    return (
      <div
        ref={contentRef}
        data-state={open ? 'open' : 'closed'}
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          className
        )}
        style={{
          height: height,
          ...style
        }}
        {...props}
      >
        <div className="pb-0">
          {children}
        </div>
      </div>
    )
  }
)
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }