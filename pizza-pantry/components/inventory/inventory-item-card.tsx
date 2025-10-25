'use client'

import { useState } from 'react'
import { InventoryItem } from '@/types/inventory'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Edit2, Trash2, Plus, Minus, AlertTriangle } from 'lucide-react'
import { EditItemModal } from './edit-item-modal'
import { AdjustQuantityModal } from './adjust-quantity-modal'
import { DeleteItemDialog } from './delete-item-dialog'

interface InventoryItemCardProps {
  item: InventoryItem
  onUpdate: (item: InventoryItem) => void
  onDelete: (itemId: string) => void
}

export function InventoryItemCard({ item, onUpdate, onDelete }: InventoryItemCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const isLowStock = item.quantity <= item.reorderThreshold
  const isOutOfStock = item.quantity === 0

  const getStockStatusColor = () => {
    if (isOutOfStock) return 'text-red-600 bg-red-50 border-red-200'
    if (isLowStock) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-green-600 bg-green-50 border-green-200'
  }

  const getStockStatusText = () => {
    if (isOutOfStock) return 'Out of Stock'
    if (isLowStock) return 'Low Stock'
    return 'In Stock'
  }

  return (
    <>
      <Card className={`p-6 relative ${isLowStock ? 'border-l-4 border-l-yellow-400' : ''}`}>
        {/* Low Stock Badge */}
        {isLowStock && (
          <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Low Stock
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-1">{item.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{item.category}</p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stock Info */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Current Stock</span>
            <span className="font-semibold text-gray-900">
              {item.quantity} {item.unit}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Reorder Threshold</span>
            <span className="text-sm text-gray-600">
              {item.reorderThreshold} {item.unit}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Cost Price</span>
            <span className="font-semibold text-gray-900">
              ${item.costPrice.toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Status</span>
            <span className={`text-xs px-2 py-1 rounded-full border ${getStockStatusColor()}`}>
              {getStockStatusText()}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Stock Level</span>
            <span>{Math.round((item.quantity / Math.max(item.reorderThreshold * 2, item.quantity)) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                isOutOfStock ? 'bg-red-500' : 
                isLowStock ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{
                width: `${Math.min((item.quantity / Math.max(item.reorderThreshold * 2, item.quantity)) * 100, 100)}%`
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setIsAdjustModalOpen(true)}
            className="flex-1 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adjust
          </Button>
          <Button
            onClick={() => {
              setIsAdjustModalOpen(true)
              // You could pass a prop to pre-fill with negative adjustment
            }}
            className="flex-1 flex items-center gap-2"
          >
            <Minus className="w-4 h-4" />
            Use
          </Button>
        </div>
      </Card>

      {/* Modals */}
      <EditItemModal
        item={item}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onItemUpdated={onUpdate}
      />

      <AdjustQuantityModal
        item={item}
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        onQuantityAdjusted={onUpdate}
      />

      <DeleteItemDialog
        item={item}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onItemDeleted={onDelete}
      />
    </>
  )
}