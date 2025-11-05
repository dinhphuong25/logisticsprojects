import { useEffect, useRef, useState } from 'react'

/**
 * Custom hook for intersection observer (lazy loading)
 * Perfect for infinite scroll and lazy loading images
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const targetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [options])

  return { targetRef, isIntersecting }
}
