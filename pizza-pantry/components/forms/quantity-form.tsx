'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AdjustQuantityInput, adjustQuantitySchema } from '@/lib/validations'
import { InventoryItem } from '@/types/inventory'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormError } from './form-error'
import { Plus, Minus, Calculator } from 'lucide-react'

interface QuantityFormProps {
  item: InventoryItem
  onSubmit: (data: AdjustQuantityInput) => void
  isLoading: boolean
  initialType?: 'add' | 'remove'
}

interface QuantityFormData {
  change: number
  reason?: string
  type: 'add' | 'remove'
}

export function QuantityForm({ item, onSubmit, isLoading, initialType = 'add' }: QuantityFormProps) {
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>(initialType)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AdjustQuantityInput>({
    resolver: zodResolver(adjustQuantitySchema),
    defaultValues: {
      change: 0,
      reason: '',
    },
  })

  const change = watch('change', 0)
  const reason = watch('reason', '')

  const calculateNewQuantity = () => {
    const numericChange = Number(change) || 0
    const actualChange = adjustmentType === 'add' ? numericChange : -numericChange
    return item.quantity + actualChange
  }

  const handleTypeChange = (type: 'add' | 'remove') => {
    setAdjustmentType(type)
    // Clear the change value when switching types to prevent confusion
    setValue('change', 0)
  }

  const handleFormSubmit = (data: AdjustQuantityInput) => {
    const numericChange = Number(data.change)
    const actualChange = adjustmentType === 'add' ? numericChange : -numericChange
    
    onSubmit({
      change: actualChange,
      reason: data.reason || `${adjustmentType === 'add' ? 'Stock added' : 'Stock used'}`,
    })
  }

  const newQuantity = calculateNewQuantity()
  const isInvalidRemoval = adjustmentType === 'remove' && newQuantity < 0

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Current Stock Display */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Current Stock</p>
          <p className="text-2xl font-bold text-gray-900">
            {item.quantity} {item.unit}
          </p>
          <p className="text-sm text-gray-500">{item.name}</p>
        </div>
      </div>

      {/* Adjustment Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Adjustment Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={adjustmentType === 'add' ? 'primary' : 'secondary'}
            onClick={() => handleTypeChange('add')}
            disabled={isLoading}
            className="flex items-center gap-2 h-12"
          >
            <Plus className="w-4 h-4" />
            Add Stock
          </Button>
          <Button
            type="button"
            variant={adjustmentType === 'remove' ? 'primary' : 'secondary'}
            onClick={() => handleTypeChange('remove')}
            disabled={isLoading}
            className="flex items-center gap-2 h-12"
          >
            <Minus className="w-4 h-4" />
            Use Stock
          </Button>
        </div>
      </div>

      {/* Quantity Input */}
      <div>
        <label htmlFor="change" className="block text-sm font-medium text-gray-700 mb-2">
          Quantity to {adjustmentType === 'add' ? 'Add' : 'Use'} ({item.unit}) *
        </label>
        <Input
          id="change"
          type="number"
          step="0.01"
          min="0.01"
          {...register('change', { 
            valueAsNumber: true,
            setValueAs: (value) => value === '' ? 0 : parseFloat(value)
          })}
          placeholder={`Enter quantity in ${item.unit}`}
          disabled={isLoading}
        />
        <FormError error={errors.change} />
        <p className="text-xs text-gray-500 mt-1">
          Enter the amount of stock to {adjustmentType === 'add' ? 'add to' : 'remove from'} inventory
        </p>
      </div>

      {/* Reason Input */}
      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
          Reason (Optional)
        </label>
        <Input
          id="reason"
          type="text"
          {...register('reason')}
          placeholder={`e.g., ${adjustmentType === 'add' ? 'New delivery, Supplier restock' : 'Used for orders, Wastage'}`}
          disabled={isLoading}
        />
        <FormError error={errors.reason} />
        <p className="text-xs text-gray-500 mt-1">
          Helpful for tracking why stock levels changed
        </p>
      </div>

      {/* Preview Section */}
      {(change > 0) && (
        <div className={`rounded-lg p-4 border ${
          isInvalidRemoval 
            ? 'bg-red-50 border-red-200' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-4 h-4 text-blue-600" />
            <span className={`text-sm font-medium ${
              isInvalidRemoval ? 'text-red-800' : 'text-blue-800'
            }`}>
              Stock Level Preview
            </span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Current:</span>
              <span className="font-medium">{item.quantity} {item.unit}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Change:</span>
              <span className={`font-medium ${
                adjustmentType === 'add' ? 'text-green-600' : 'text-red-600'
              }`}>
                {adjustmentType === 'add' ? '+' : '-'}{change} {item.unit}
              </span>
            </div>
            
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="text-gray-600">New Total:</span>
              <span className={`font-bold ${
                isInvalidRemoval ? 'text-red-600' : 'text-blue-600'
              }`}>
                {newQuantity} {item.unit}
              </span>
            </div>
          </div>

          {isInvalidRemoval && (
            <p className="text-xs text-red-600 mt-2">
              Cannot remove more stock than is available
            </p>
          )}
        </div>
      )}

      {/* Stock Status After Change */}
      {(change > 0 && !isInvalidRemoval) && (
        <div className={`rounded-lg p-3 border ${
          newQuantity <= item.reorderThreshold
            ? newQuantity === 0 
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-yellow-50 border-yellow-200 text-yellow-800'
            : 'bg-green-50 border-green-200 text-green-800'
        }`}>
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${
              newQuantity <= item.reorderThreshold
                ? newQuantity === 0 ? 'bg-red-500' : 'bg-yellow-500'
                : 'bg-green-500'
            }`} />
            {newQuantity <= item.reorderThreshold ? (
              newQuantity === 0 ? (
                <span>This item will be out of stock</span>
              ) : (
                <span>This item will be low on stock</span>
              )
            ) : (
              <span>Stock level will be healthy</span>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button 
        type="submit" 
        disabled={isLoading || !change || change <= 0 || isInvalidRemoval}
        className="w-full h-12"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {adjustmentType === 'add' ? (
              <Plus className="w-4 h-4 mr-2" />
            ) : (
              <Minus className="w-4 h-4 mr-2" />
            )}
            {adjustmentType === 'add' ? 'Add' : 'Use'} Stock
          </>
        )}
      </Button>

      {/* Helper Text */}
      <p className="text-xs text-gray-500 text-center">
        This adjustment will be recorded in the audit log with timestamp and reason.
      </p>
    </form>
  )
}