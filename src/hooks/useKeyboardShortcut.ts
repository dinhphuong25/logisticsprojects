import { useEffect } from 'react'

/**
 * Custom hook for keyboard shortcuts
 * Makes the app more productive
 */
export function useKeyboardShortcut(
  keys: string[],
  callback: () => void,
  options: { ctrl?: boolean; alt?: boolean; shift?: boolean } = {}
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { ctrl = false, alt = false, shift = false } = options
      
      if (
        (!ctrl || event.ctrlKey || event.metaKey) &&
        (!alt || event.altKey) &&
        (!shift || event.shiftKey) &&
        keys.includes(event.key.toLowerCase())
      ) {
        event.preventDefault()
        callback()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [keys, callback, options])
}
