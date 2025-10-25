'use client'

import { useState, useMemo } from 'react'
import { InventoryItem, CATEGORIES, UNITS } from '@/types/inventory'
import { InventoryItemCard } from './inventory-item-card'
import { SearchFilter } from './search-filter'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { AddItemModal } from './add-item-modal'

interface InventoryListProps {
  initialItems: InventoryItem[]
}

export function InventoryList({ initialItems }: InventoryListProps) {
  const [items, setItems] = useState<InventoryItem[]>(initialItems)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const filteredItems = useMemo(() => {
    return items
      .filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) &&
        (category === 'all' || item.category === category)
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'name': 
            return a.name.localeCompare(b.name)
          case 'quantity': 
            return a.quantity - b.quantity
          case 'category': 
            return a.category.localeCompare(b.category)
          case 'cost': 
            return a.costPrice - b.costPrice
          default: 
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        }
      })
  }, [items, search, category, sortBy])

  const handleAddItem = (newItem: InventoryItem) => {
    setItems(prev => [newItem, ...prev])
  }

  const handleUpdateItem = (updatedItem: InventoryItem) => {
    setItems(prev => prev.map(item => 
      item._id === updatedItem._id ? updatedItem : item
    ))
  }

  const handleDeleteItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item._id !== itemId))
  }

  const lowStockItems = items.filter(item => item.quantity <= item.reorderThreshold)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600">
            Manage your pizza shop ingredients and supplies
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Low Stock Alert
              </h3>
              <div className="mt-1 text-sm text-yellow-700">
                <p>
                  {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} need{lowStockItems.length === 1 ? 's' : ''} restocking
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map(item => (
          <InventoryItemCard
            key={item._id}
            item={item}
            onUpdate={handleUpdateItem}
            onDelete={handleDeleteItem}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📦</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-500 mb-4">
            {items.length === 0 
              ? "Get started by adding your first inventory item."
              : "Try adjusting your search or filter criteria."
            }
          </p>
          {items.length === 0 && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Item
            </Button>
          )}
        </div>
      )}

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onItemAdded={handleAddItem}
      />
    </div>
  )
}