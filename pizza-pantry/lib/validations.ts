import { z } from 'zod'

export const createItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  category: z.string().min(1, 'Category is required'),
  unit: z.string().min(1, 'Unit is required'),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  reorderThreshold: z.number().min(0, 'Reorder threshold cannot be negative'),
  costPrice: z.number().min(0, 'Cost price cannot be negative'),
})

export const updateItemSchema = createItemSchema.partial()

export const adjustQuantitySchema = z.object({
  change: z.number().refine(val => val !== 0, 'Change cannot be zero'),
  reason: z.string().max(200, 'Reason too long').optional(),
})

export type CreateItemInput = z.infer<typeof createItemSchema>
export type UpdateItemInput = z.infer<typeof updateItemSchema>
export type AdjustQuantityInput = z.infer<typeof adjustQuantitySchema>