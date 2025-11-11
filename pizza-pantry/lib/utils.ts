import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const safeAmount = typeof amount === 'number' ? amount : 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(safeAmount)
}

export function formatNumber(number: number, decimals: number = 2): string {
  const safeNumber = typeof number === 'number' ? number : 0
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(safeNumber)
}

export function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj)
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMs = now.getTime() - dateObj.getTime()
  
  const diffInSeconds = Math.floor(diffInMs / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  } else {
    return formatDate(dateObj)
  }
}

export function getStockStatus(quantity: unknown, reorderThreshold: unknown): {
  status: 'out-of-stock' | 'low-stock' | 'in-stock'
  color: string
  text: string
} {
  const safeQuantity = typeof quantity === 'number' ? quantity : 0
  const safeReorderThreshold = typeof reorderThreshold === 'number' ? reorderThreshold : 0
  
  if (safeQuantity === 0) {
    return {
      status: 'out-of-stock',
      color: 'red',
      text: 'Out of Stock'
    }
  } else if (safeQuantity <= safeReorderThreshold) {
    return {
      status: 'low-stock',
      color: 'yellow',
      text: 'Low Stock'
    }
  } else {
    return {
      status: 'in-stock',
      color: 'green',
      text: 'In Stock'
    }
  }
}

export function calculateStockPercentage(quantity: unknown, reorderThreshold: unknown): number {
  const safeQuantity = typeof quantity === 'number' ? quantity : 0
  const safeReorderThreshold = typeof reorderThreshold === 'number' ? reorderThreshold : 1

  const maxQuantity = Math.max(safeQuantity, safeReorderThreshold * 2)

  if (maxQuantity === 0) return 0

  const percentage = (safeQuantity / maxQuantity) * 100
  return Math.min(percentage, 100)
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

export function sortInventoryItems<T extends { 
  name: string; 
  quantity: number; 
  category: string; 
  costPrice: number;
  updatedAt: string | Date;
}>(
  items: T[], 
  sortBy: string
): T[] {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      
      case 'quantity':
        return a.quantity - b.quantity
      
      case 'quantity-desc':
        return b.quantity - a.quantity
      
      case 'category':
        return a.category.localeCompare(b.category)
      
      case 'cost':
        return a.costPrice - b.costPrice
      
      case 'cost-desc':
        return b.costPrice - a.costPrice
      
      case 'updated':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      
      default:
        return 0
    }
  })
}

export function filterInventoryItems<T extends { 
  name: string; 
  category: string;
}>(
  items: T[], 
  search: string, 
  category: string
): T[] {
  return items.filter(item => {
    const matchesSearch = search === '' || 
      item.name.toLowerCase().includes(search.toLowerCase())
    
    const matchesCategory = category === 'all' || item.category === category
    
    return matchesSearch && matchesCategory
  })
}

export function calculateTotalInventoryValue(items: Array<{ quantity: unknown; costPrice: unknown }>): number {
  return items.reduce((total, item) => {
    const quantity = typeof item.quantity === 'number' ? item.quantity : 0
    const costPrice = typeof item.costPrice === 'number' ? item.costPrice : 0
    return total + (quantity * costPrice)
  }, 0)
}

export function getLowStockItems<T extends { quantity: unknown; reorderThreshold: unknown }>(items: T[]): T[] {
  return items.filter(item => {
    const quantity = typeof item.quantity === 'number' ? item.quantity : 0
    const reorderThreshold = typeof item.reorderThreshold === 'number' ? item.reorderThreshold : 0
    return quantity <= reorderThreshold
  })
}

export function generatePagination(currentPage: number, totalPages: number): (number | string)[] {
  const delta = 2
  const range: (number | string)[] = []
  const rangeWithDots: (number | string)[] = []

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i)
    }
  }

  let prev: number | null = null
  for (const i of range) {
    if (prev !== null) {
      if (i - prev === 2) {
        rangeWithDots.push(prev + 1)
      } else if (i - prev !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    prev = i as number
  }

  return rangeWithDots
}

export function downloadCSV(data: any[], filename: string): void {
  const headers = Object.keys(data[0] || {})
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => 
        `"${String(row[header] || '').replace(/"/g, '""')}"`
      ).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      return true
    } catch {
      return false
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

export function deepMerge<T extends object, U extends object>(target: T, source: U): T & U {
  const output = { ...target } as any
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(output[key] || {}, source[key])
    } else {
      output[key] = source[key]
    }
  }
  
  return output
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

export const utils = {
  cn,
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
  getRelativeTime,
  getStockStatus,
  calculateStockPercentage,
  groupBy,
  sortInventoryItems,
  filterInventoryItems,
  calculateTotalInventoryValue,
  getLowStockItems,
  generatePagination,
  downloadCSV,
  copyToClipboard,
  sleep,
  isValidObjectId,
  deepClone,
  deepMerge,
  getInitials,
  formatFileSize,
}

export default utils
