'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { InventoryItem } from '@/types/inventory'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, Save } from 'lucide-react'
import { ItemForm } from '@/components/forms/item-form'

interface EditItemModalProps {
  item: InventoryItem
  isOpen: boolean
  onClose: () => void
  onItemUpdated: (item: InventoryItem) => void
}

export function EditItemModal({ item, isOpen, onClose, onItemUpdated }: EditItemModalProps) {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: any) => {
    if (!user) return

    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/items/${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update item')
      }

      const updatedItem = await response.json()
      onItemUpdated(updatedItem)
      onClose()
    } catch (error) {
      console.error('Error updating item:', error)
      alert(error instanceof Error ? error.message : 'Failed to update item')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Edit Item</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Form */}
          <ItemForm
            initialData={item}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitButton={
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            }
          />
        </div>
      </Card>
    </div>
  )
}