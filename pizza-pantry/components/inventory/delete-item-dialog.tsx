'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { InventoryItem } from '@/types/inventory'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, Trash2, AlertTriangle } from 'lucide-react'

interface DeleteItemDialogProps {
  item: InventoryItem
  isOpen: boolean
  onClose: () => void
  onItemDeleted: (itemId: string) => void
}

export function DeleteItemDialog({ item, isOpen, onClose, onItemDeleted }: DeleteItemDialogProps) {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (!user) return

    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/items/${item._id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete item')
      }

      onItemDeleted(item._id)
      onClose()
    } catch (error) {
      console.error('Error deleting item:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete item')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Delete Item</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Warning Icon and Message */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Are you sure you want to delete this item?
              </h3>
              <p className="text-gray-600">
                This will permanently delete <strong>&quot;{item.name}&quot;</strong> and all its associated audit history. This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Item Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Current Stock:</span>
                <p className="font-medium">{item.quantity} {item.unit}</p>
              </div>
              <div>
                <span className="text-gray-600">Category:</span>
                <p className="font-medium capitalize">{item.category}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1 flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Item
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}