import { Upload, FileSpreadsheet, FileJson, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ExportImportProps {
  data: Record<string, unknown>[]
  filename?: string
  onImport?: (data: Record<string, unknown>[]) => void
}

/**
 * Export/Import Data Component
 * Support CSV, JSON, Excel export and import
 */
export function ExportImportData({ data, filename = 'export', onImport }: ExportImportProps) {
  // Export to CSV
  const exportToCSV = () => {
    if (!data || data.length === 0) {
      toast.error('Không có dữ liệu để xuất')
      return
    }

    try {
      // Get headers from first object
      const headers = Object.keys(data[0])
      
      // Create CSV content
      const csvContent = [
        headers.join(','), // Header row
        ...data.map(row => 
          headers.map(header => {
            const value = row[header]
            // Escape commas and quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value ?? ''
          }).join(',')
        )
      ].join('\n')

      // Create blob and download
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      
      toast.success('✅ Đã xuất file CSV thành công')
    } catch (error) {
      console.error('Export CSV error:', error)
      toast.error('❌ Không thể xuất file CSV')
    }
  }

  // Export to JSON
  const exportToJSON = () => {
    if (!data || data.length === 0) {
      toast.error('Không có dữ liệu để xuất')
      return
    }

    try {
      const jsonContent = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`
      link.click()
      
      toast.success('✅ Đã xuất file JSON thành công')
    } catch (error) {
      console.error('Export JSON error:', error)
      toast.error('❌ Không thể xuất file JSON')
    }
  }

  // Export to Excel (HTML table format)
  const exportToExcel = () => {
    if (!data || data.length === 0) {
      toast.error('Không có dữ liệu để xuất')
      return
    }

    try {
      const headers = Object.keys(data[0])
      
      // Create HTML table
      const htmlContent = `
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #4CAF50; color: white; font-weight: bold; }
              tr:nth-child(even) { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <table>
              <thead>
                <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
              </thead>
              <tbody>
                ${data.map(row => 
                  `<tr>${headers.map(h => `<td>${row[h] ?? ''}</td>`).join('')}</tr>`
                ).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `

      const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.xls`
      link.click()
      
      toast.success('✅ Đã xuất file Excel thành công')
    } catch (error) {
      console.error('Export Excel error:', error)
      toast.error('❌ Không thể xuất file Excel')
    }
  }

  // Import from file
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        
        if (file.name.endsWith('.json')) {
          // Parse JSON
          const jsonData = JSON.parse(content)
          onImport?.(Array.isArray(jsonData) ? jsonData : [jsonData])
          toast.success('✅ Đã nhập dữ liệu từ JSON')
        } else if (file.name.endsWith('.csv')) {
          // Parse CSV
          const lines = content.split('\n').filter(line => line.trim())
          if (lines.length < 2) {
            toast.error('File CSV không hợp lệ')
            return
          }
          
          const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
          const csvData = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
            return headers.reduce((obj, header, index) => {
              obj[header] = values[index]
              return obj
            }, {} as Record<string, unknown>)
          })
          
          onImport?.(csvData)
          toast.success('✅ Đã nhập dữ liệu từ CSV')
        }
      } catch (error) {
        console.error('Import error:', error)
        toast.error('❌ Không thể đọc file. Vui lòng kiểm tra định dạng.')
      }
    }
    
    reader.readAsText(file)
    // Reset input
    event.target.value = ''
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Export Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={exportToCSV}
          className="hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
          CSV
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={exportToJSON}
          className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          <FileJson className="w-4 h-4 mr-2 text-blue-600" />
          JSON
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={exportToExcel}
          className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
        >
          <FileText className="w-4 h-4 mr-2 text-emerald-600" />
          Excel
        </Button>
      </div>

      {/* Import Button */}
      {onImport && (
        <div className="relative">
          <input
            type="file"
            accept=".csv,.json"
            onChange={handleImport}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
          >
            <Upload className="w-4 h-4 mr-2 text-purple-600" />
            Nhập dữ liệu
          </Button>
        </div>
      )}
    </div>
  )
}
