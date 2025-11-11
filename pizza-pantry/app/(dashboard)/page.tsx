import { Suspense } from 'react'
import { InventoryList } from '@/components/inventory/inventory-list'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { AddItemModal } from '@/components/inventory/add-item-modal'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

async function getInventoryItems(userId: string) {
  try {
    const client = await clientPromise
    const db = client.db('pizza-pantry')
    
    const items = await db.collection('items')
      .find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .toArray()

    return items.map(item => ({
      _id: item._id.toString(),
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      reorderThreshold: item.reorderThreshold,
      costPrice: item.costPrice,
      createdBy: item.createdBy,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    }))
  } catch (error) {
    console.error('Error fetching inventory items:', error)
    return []
  }
}

export default async function DashboardPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/')
  }

  const items = await getInventoryItems(userId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600">
            Manage your pizza shop ingredients and supplies
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      }>
        <InventoryList initialItems={items} />
      </Suspense>
    </div>
  )
}
