export function formatCurrency(
  amount: number, 
  currency: string = 'USD', 
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(
  number: number, 
  decimals: number = 2, 
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number)
}

export function formatQuantity(quantity: number, unit: string): string {
  const formattedNumber = formatNumber(quantity, getDecimalPlacesForUnit(unit))
  return `${formattedNumber} ${unit}`
}

function getDecimalPlacesForUnit(unit: string): number {
  const wholeNumberUnits = ['pieces', 'packages', 'cans', 'boxes', 'units']
  const oneDecimalUnits = ['kg', 'lb', 'L']
  const twoDecimalUnits = ['g', 'ml', 'oz']
  
  if (wholeNumberUnits.includes(unit)) return 0
  if (oneDecimalUnits.includes(unit)) return 1
  if (twoDecimalUnits.includes(unit)) return 2
  return 2 
}

export function formatDate(
  date: Date | string, 
  options: Intl.DateTimeFormatOptions = {}
): string {
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
    hour12: true,
  }).format(dateObj)
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMs = now.getTime() - dateObj.getTime()
  
  const diffInSeconds = Math.floor(diffInMs / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  const diffInWeeks = Math.floor(diffInDays / 7)
  const diffInMonths = Math.floor(diffInDays / 30)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`
  } else if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`
  } else {
    return formatDate(dateObj)
  }
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (hours === 0) {
    return `${remainingMinutes}m`
  } else if (remainingMinutes === 0) {
    return `${hours}h`
  } else {
    return `${hours}h ${remainingMinutes}m`
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  
  return phoneNumber
}

export function formatCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    'dough': 'Dough & Base',
    'sauce': 'Sauces',
    'cheese': 'Cheese',
    'meat': 'Meat',
    'vegetables': 'Vegetables',
    'toppings': 'Toppings',
    'drinks': 'Drinks',
    'supplies': 'Supplies',
  }
  
  return categoryMap[category] || category.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function formatStockStatus(quantity: number, reorderThreshold: number): {
  text: string
  emoji: string
  colorClass: string
  isLowStock: boolean
  isOutOfStock: boolean
} {
  if (quantity === 0) {
    return {
      text: 'Out of Stock',
      emoji: '❌',
      colorClass: 'text-red-600 bg-red-50 border-red-200',
      isLowStock: true,
      isOutOfStock: true,
    }
  } else if (quantity <= reorderThreshold) {
    return {
      text: 'Low Stock',
      emoji: '⚠️',
      colorClass: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      isLowStock: true,
      isOutOfStock: false,
    }
  } else {
    return {
      text: 'In Stock',
      emoji: '✅',
      colorClass: 'text-green-600 bg-green-50 border-green-200',
      isLowStock: false,
      isOutOfStock: false,
    }
  }
}

export function formatChange(change: number): {
  display: string
  colorClass: string
  isPositive: boolean
} {
  const isPositive = change > 0
  const display = `${isPositive ? '+' : ''}${change}`
  
  return {
    display,
    colorClass: isPositive ? 'text-green-600' : 'text-red-600',
    isPositive,
  }
}

export function truncateText(text: string, maxLength: number, addEllipsis: boolean = true): string {
  if (text.length <= maxLength) return text
  return addEllipsis ? text.substring(0, maxLength) + '...' : text.substring(0, maxLength)
}

export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatInventoryItem(item: {
  name: string
  category: string
  quantity: number
  unit: string
  costPrice: number
}): {
  displayName: string
  displayCategory: string
  displayQuantity: string
  displayCost: string
} {
  return {
    displayName: toTitleCase(item.name),
    displayCategory: formatCategory(item.category),
    displayQuantity: formatQuantity(item.quantity, item.unit),
    displayCost: formatCurrency(item.costPrice),
  }
}

export const formatters = {
  formatCurrency,
  formatNumber,
  formatQuantity,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatDuration,
  formatFileSize,
  formatPhoneNumber,
  formatCategory,
  formatStockStatus,
  formatChange,
  truncateText,
  toTitleCase,
  formatPercentage,
  formatInventoryItem,
}

export default formatters