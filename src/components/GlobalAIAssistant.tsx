/**
 * 🤖 Global AI Assistant - Floating AI trợ lý ở mọi trang
 */

import { useLocation } from 'react-router-dom'
import { AIAssistantWidget, useAIInsights } from '@/components/ui/ai-assistant-widget'

export function GlobalAIAssistant() {
  const location = useLocation()
  
  // Determine context from current route
  const getContext = () => {
    const path = location.pathname
    if (path.includes('/inventory')) return 'inventory'
    if (path.includes('/inbound')) return 'inbound'
    if (path.includes('/outbound')) return 'outbound'
    if (path.includes('/temperature')) return 'temperature'
    if (path.includes('/reports')) return 'reports'
    if (path.includes('/alerts')) return 'alerts'
    if (path.includes('/energy')) return 'energy'
    if (path.includes('/zones')) return 'zones'
    if (path.includes('/dashboard')) return 'dashboard'
    if (path.includes('/analytics')) return 'analytics'
    return 'general'
  }

  const context = getContext()
  const { insights } = useAIInsights(context)

  // Don't show on login page
  if (location.pathname === '/login') return null

  return (
    <AIAssistantWidget
      context={context}
      insights={insights}
      onAction={(insightId, action) => {
        console.log(`AI Action on ${context}:`, insightId, action)
      }}
      compact
    />
  )
}
