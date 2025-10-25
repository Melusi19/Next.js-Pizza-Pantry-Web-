'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { InventoryItem } from '@/types/inventory'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { X, Plus, Minus, Calculator } from 'lucide-react'

interface AdjustQuantityModalProps {
  item: InventoryItem
  isOpen: boolean
  onClose: () => void
  onQuantityAdjusted: (item: InventoryItem) => void
}

type AdjustmentType = 'add' | 'remove'

export function AdjustQuantityModal({ 
  item, 
  isOpen, 
  onClose, 
  onQuantityAdjusted 
}: AdjustQuantityModalProps) {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('add')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !quantity) return

    const change = adjustmentType === 'add' ? Math.abs(Number(quantity)) : -Math.abs(Number(quantity))
    
    if (adjustmentType === 'remove' && change + item.quantity < 0) {
      alert('Cannot remove more than available quantity')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/items/${item._id}/quantity`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          change,
          reason: reason || `${adjustmentType === 'add' ? 'Added' : 'Removed'} stock`
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to adjust quantity')
      }

      const updatedItem = await response.json()
      onQuantityAdjusted(updatedItem)
      
      // Reset form
      setQuantity('')
      setReason('')
      onClose()
    } catch (error) {
      console.error('Error adjusting quantity:', error)
      alert(error instanceof Error ? error.message : 'Failed to adjust quantity')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateNewQuantity = () => {
    if (!quantity) return item.quantity
    const change = adjustmentType === 'add' ? Number(quantity) : -Number(quantity)
    return item.quantity + change
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Adjust Stock</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Current Stock Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Current Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {item.quantity} {item.unit}
              </p>
              <p className="text-sm text-gray-500">{item.name}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Adjustment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adjustment Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={adjustmentType === 'add' ? 'primary' : 'secondary'}
                  onClick={() => setAdjustmentType('add')}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Stock
                </Button>
                <Button
                  type="button"
                  variant={adjustmentType === 'remove' ? 'primary' : 'secondary'}
                  onClick={() => setAdjustmentType('remove')}
                  className="flex items-center gap-2"
                >
                  <Minus className="w-4 h-4" />
                  Remove Stock
                </Button>
              </div>
            </div>

            {/* Quantity Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity to {adjustmentType === 'add' ? 'Add' : 'Remove'} ({item.unit})
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={`Enter quantity in ${item.unit}`}
                required
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <Input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., New delivery, Used for orders, etc."
              />
            </div>

            {/* New Quantity Preview */}
            {quantity && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">New Quantity:</span>
                  <span className="text-lg font-bold text-blue-900">
                    {calculateNewQuantity()} {item.unit}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-blue-700">
                  <Calculator className="w-4 h-4" />
                  {item.quantity} {adjustmentType === 'add' ? '+' : '-'} {quantity} = {calculateNewQuantity()}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isLoading || !quantity} 
              className="w-full"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {adjustmentType === 'add' ? (
                    <Plus className="w-4 h-4 mr-2" />
                  ) : (
                    <Minus className="w-4 h-4 mr-2" />
                  )}
                  {adjustmentType === 'add' ? 'Add' : 'Remove'} Stock
                </>
              )}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}