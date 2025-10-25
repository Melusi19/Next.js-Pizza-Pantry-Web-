export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function isValidPositiveNumber(value: any): boolean {
  const num = Number(value)
  return !isNaN(num) && num >= 0
}

export function isValidPositiveInteger(value: any): boolean {
  const num = Number(value)
  return !isNaN(num) && Number.isInteger(num) && num >= 0
}

export function isValidInventoryItem(data: any): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Item name is required')
  } else if (data.name.length > 100) {
    errors.push('Item name must be 100 characters or less')
  }

  if (!data.category || typeof data.category !== 'string' || data.category.trim().length === 0) {
    errors.push('Category is required')
  }

  if (!data.unit || typeof data.unit !== 'string' || data.unit.trim().length === 0) {
    errors.push('Unit is required')
  }

  if (!isValidPositiveNumber(data.quantity)) {
    errors.push('Quantity must be a positive number')
  }

  if (!isValidPositiveNumber(data.reorderThreshold)) {
    errors.push('Reorder threshold must be a positive number')
  }

  if (!isValidPositiveNumber(data.costPrice)) {
    errors.push('Cost price must be a positive number')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function isValidQuantityAdjustment(data: any): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (typeof data.change !== 'number' || isNaN(data.change)) {
    errors.push('Change amount must be a number')
  } else if (data.change === 0) {
    errors.push('Change amount cannot be zero')
  }

  if (data.reason && typeof data.reason !== 'string') {
    errors.push('Reason must be a string')
  } else if (data.reason && data.reason.length > 200) {
    errors.push('Reason must be 200 characters or less')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function isValidPassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function isValidPhoneNumber(phoneNumber: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''))
}

export function isPastDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj < new Date()
}

export function isFutureDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj > new Date()
}

export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

export function isAlphanumericWithSpaces(str: string): boolean {
  const regex = /^[a-zA-Z0-9\s]*$/
  return regex.test(str)
}

export function isValidCategory(category: string, validCategories: string[]): boolean {
  return validCategories.includes(category)
}

export function isValidUnit(unit: string, validUnits: string[]): boolean {
  return validUnits.includes(unit)
}

export function isValidFile(file: File, options: {
  allowedTypes?: string[]
  maxSizeInMB?: number
} = {}): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const { allowedTypes = ['image/jpeg', 'image/png', 'image/gif'], maxSizeInMB = 5 } = options

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`)
  }

  if (maxSizeInMB > 0 && file.size > maxSizeInMB * 1024 * 1024) {
    errors.push(`File size must be less than ${maxSizeInMB}MB`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function isNotEmpty(value: any): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
}

export function isValidPercentage(value: number): boolean {
  return isValidPositiveNumber(value) && value <= 100
}

export function isValidSearchParams(params: any): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (params.search && typeof params.search !== 'string') {
    errors.push('Search term must be a string')
  }

  if (params.category && typeof params.category !== 'string') {
    errors.push('Category must be a string')
  }

  if (params.sortBy && typeof params.sortBy !== 'string') {
    errors.push('Sort by must be a string')
  }

  if (params.page && (!isValidPositiveInteger(params.page) || Number(params.page) < 1)) {
    errors.push('Page must be a positive integer')
  }

  if (params.limit && (!isValidPositiveInteger(params.limit) || Number(params.limit) < 1)) {
    errors.push('Limit must be a positive integer')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

export const validators = {
  isValidEmail,
  isValidObjectId,
  isValidUrl,
  isValidPositiveNumber,
  isValidPositiveInteger,
  isValidInventoryItem,
  isValidQuantityAdjustment,
  isValidPassword,
  isValidPhoneNumber,
  isPastDate,
  isFutureDate,
  isInRange,
  isAlphanumericWithSpaces,
  isValidCategory,
  isValidUnit,
  isValidFile,
  isNotEmpty,
  isValidPercentage,
  isValidSearchParams,
  sanitizeInput,
}

export default validators