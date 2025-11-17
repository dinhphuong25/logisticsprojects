import { describe, expect, it } from 'vitest'
import {
  calculatePercentage,
  cn,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  getExpiryStatus,
  getSeverityColor,
  getStatusColor,
  truncate
} from './utils'

describe('utils formatting helpers', () => {
  it('formatDate returns fallback on invalid date', () => {
    expect(formatDate('invalid-date')).toBe('-')
  })

  it('formatDate formats iso string', () => {
    expect(formatDate('2025-11-17', 'yyyy/MM/dd')).toBe('2025/11/17')
  })

  it('formatDateTime returns date with time', () => {
    expect(formatDateTime('2025-11-17T08:30:00Z')).toContain('2025')
  })

  it('formatNumber respects decimals', () => {
    expect(formatNumber(1234.567, 2)).toBe('1.234,57')
  })

  it('formatCurrency formats to VND', () => {
    expect(formatCurrency(18000)).toContain('18.000')
  })

  it('calculatePercentage guards divide by zero', () => {
    expect(calculatePercentage(10, 0)).toBe(0)
    expect(calculatePercentage(25, 50)).toBe(50)
  })

  it('getExpiryStatus categorizes days properly', () => {
    const now = new Date()
    const iso = (delta: number) =>
      new Date(now.getTime() + delta * 24 * 60 * 60 * 1000).toISOString()

    expect(getExpiryStatus(iso(-1))).toBe('expired')
    expect(getExpiryStatus(iso(2))).toBe('critical')
    expect(getExpiryStatus(iso(6))).toBe('warning')
    expect(getExpiryStatus(iso(10))).toBe('ok')
  })

  it('getStatusColor returns default when missing', () => {
    expect(getStatusColor('UNKNOWN')).toContain('bg-gray-100')
  })

  it('getSeverityColor falls back to gray', () => {
    expect(getSeverityColor('NONE')).toContain('bg-gray-100')
  })

  it('truncate short strings untouched', () => {
    expect(truncate('EcoFresh', 10)).toBe('EcoFresh')
    expect(truncate('EcoFresh Platform', 5)).toBe('EcoFr...')
  })

  it('cn merges class names intelligently', () => {
    expect(cn('px-4', false && 'hidden', 'text-sm')).toBe('px-4 text-sm')
  })
})

