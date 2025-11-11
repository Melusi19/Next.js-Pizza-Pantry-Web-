'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateItemInput, createItemSchema, UpdateItemInput, updateItemSchema } from '@/lib/validations'
import { InventoryItem, CATEGORIES, UNITS } from '@/types/inventory'
import { Input } from '@/components/ui/input'
import { FormError } from './form-error'

interface ItemFormProps {
  initialData?: InventoryItem
  onSubmit: (data: CreateItemInput | UpdateItemInput) => void
  isLoading: boolean
  submitButton: React.ReactNode
}

export function ItemForm({ initialData, onSubmit, isLoading, submitButton }: ItemFormProps) {
  const isEditing = !!initialData
  const schema = isEditing ? updateItemSchema : createItemSchema

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateItemInput | UpdateItemInput>({
    resolver: zodResolver(schema),
    defaultValues: initialData ? {
      name: initialData.name,
      category: initialData.category,
      unit: initialData.unit,
      quantity: initialData.quantity,
      reorderThreshold: initialData.reorderThreshold,
      costPrice: initialData.costPrice,
    } : {
      quantity: 0,
      reorderThreshold: 0,
      costPrice: 0,
    },
  })

  const quantity = watch('quantity')!
  const reorderThreshold = watch('reorderThreshold')!

  const isLowStock = quantity <= reorderThreshold
  const stockPercentage = reorderThreshold > 0 ? (quantity / reorderThreshold) * 100 : 0

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Item Name *
        </label>
        <Input
          id="name"
          type="text"
          {...register('name')}
          placeholder="e.g., Mozzarella Cheese, Pizza Dough"
          disabled={isLoading}
        />
        <FormError error={errors.name} />
      </div>

      {/* Category and Unit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            id="category"
            {...register('category')}
            className="input disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <FormError error={errors.category} />
        </div>

        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
            Unit of Measurement *
          </label>
          <select
            id="unit"
            {...register('unit')}
            className="input disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            <option value="">Select a unit</option>
            {UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
          <FormError error={errors.unit} />
        </div>
      </div>

      {/* Quantity and Reorder Threshold */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
            Current Quantity *
          </label>
          <Input
            id="quantity"
            type="number"
            step="0.01"
            min="0"
            {...register('quantity', { valueAsNumber: true })}
            disabled={isLoading}
          />
          <FormError error={errors.quantity} />
        </div>

        <div>
          <label htmlFor="reorderThreshold" className="block text-sm font-medium text-gray-700 mb-2">
            Reorder Threshold *
          </label>
          <Input
            id="reorderThreshold"
            type="number"
            step="0.01"
            min="0"
            {...register('reorderThreshold', { valueAsNumber: true })}
            disabled={isLoading}
          />
          <FormError error={errors.reorderThreshold} />
        </div>
      </div>

      {/* Cost Price */}
      <div>
        <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700 mb-2">
          Cost Price ($) *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            $
          </span>
          <Input
            id="costPrice"
            type="number"
            step="0.01"
            min="0"
            {...register('costPrice', { valueAsNumber: true })}
            placeholder="0.00"
            className="pl-8"
            disabled={isLoading}
          />
        </div>
        <FormError error={errors.costPrice} />
      </div>

      {/* Stock Status Preview */}
      <div className={`p-4 rounded-lg border ${
        isLowStock 
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${
            isLowStock ? 'text-yellow-800' : 'text-green-800'
          }`}>
            Stock Status
          </span>
          <span className={`text-sm ${
            isLowStock ? 'text-yellow-700' : 'text-green-700'
          }`}>
            {isLowStock ? 'Low Stock' : 'Healthy'}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isLowStock 
                ? quantity === 0 ? 'bg-red-500' : 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{
              width: `${Math.min(stockPercentage, 100)}%`
            }}
          />
        </div>
        
        <div className="flex justify-between text-xs">
          <span className={isLowStock ? 'text-yellow-700' : 'text-green-700'}>
            Current: {quantity}
          </span>
          <span className="text-gray-600">
            Reorder at: {reorderThreshold}
          </span>
        </div>
        
        {isLowStock && (
          <p className="text-xs text-yellow-700 mt-2">
            {quantity === 0 
              ? 'This item is out of stock'
              : 'This item is below reorder threshold'
            }
          </p>
        )}
      </div>

      {/* Form Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">About Reorder Threshold</h4>
        <p className="text-xs text-blue-700">
          The reorder threshold is the minimum quantity at which you'll receive low stock alerts. 
          Set this based on your usage patterns and supplier lead times.
        </p>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        {submitButton}
      </div>
    </form>
  )
}
