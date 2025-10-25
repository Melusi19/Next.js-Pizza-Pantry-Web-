'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { InventoryItem, CATEGORIES, UNITS } from '@/types/inventory'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { X, Plus } from 'lucide-react'
import { ItemForm } from '@/components/forms/item-form'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  onItemAdded: (item: InventoryItem) => void
}

export function AddItemModal({ isOpen, onClose, onItemAdded }: AddItemModalProps) {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: any) => {
    if (!user) return

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create item')
      }

      const newItem = await response.json()
      onItemAdded(newItem)
      onClose()
    } catch (error) {
      console.error('Error creating item:', error)
      alert(error instanceof Error ? error.message : 'Failed to create item')
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
            <h2 className="text-xl font-semibold text-gray-900">Add New Item</h2>
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
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitButton={
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
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