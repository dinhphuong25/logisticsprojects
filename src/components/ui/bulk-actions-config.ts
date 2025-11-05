import { Trash2, Archive, Send, MoreHorizontal } from 'lucide-react'
import type { BulkAction } from './bulk-actions'

// Default bulk actions for common use cases
export const defaultBulkActions: BulkAction[] = [
  {
    id: 'delete',
    label: 'Xóa',
    icon: Trash2,
    variant: 'destructive',
    action: (ids) => console.log('Delete:', ids),
    confirmMessage: 'Bạn có chắc chắn muốn xóa các mục đã chọn?',
  },
  {
    id: 'archive',
    label: 'Lưu trữ',
    icon: Archive,
    variant: 'outline',
    action: (ids) => console.log('Archive:', ids),
  },
  {
    id: 'send',
    label: 'Gửi',
    icon: Send,
    variant: 'default',
    action: (ids) => console.log('Send:', ids),
  },
  {
    id: 'more',
    label: 'Khác',
    icon: MoreHorizontal,
    variant: 'outline',
    action: (ids) => console.log('More:', ids),
  },
]
