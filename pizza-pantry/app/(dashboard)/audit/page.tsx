import { Suspense } from 'react'
import { AuditLogList } from '@/components/audit/audit-log-list'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

interface AuditLogWithItem {
  _id: string;
  itemId: string;
  userId: string;
  change: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  createdAt: string;
  item?: {
    name: string;
    category: string;
  };
}

async function getAuditLogs(userId: string): Promise<AuditLogWithItem[]> {
  try {
    const client = await clientPromise
    const db = client.db('pizza-pantry')
    
    const auditLogs = await db.collection('audit_logs')
      .aggregate([
        { $match: { userId } },
        { $sort: { createdAt: -1 } },
        { $limit: 100 },
        {
          $lookup: {
            from: 'items',
            localField: 'itemId',
            foreignField: '_id',
            as: 'item'
          }
        },
        {
          $unwind: {
            path: '$item',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            itemId: 1,
            change: 1,
            previousQuantity: 1,
            newQuantity: 1,
            reason: 1,
            createdAt: 1,
            userId: 1,
            'item.name': 1,
            'item.category': 1
          }
        }
      ])
      .toArray()

    return auditLogs.map(log => ({
      _id: log._id.toString(),
      itemId: log.itemId?.toString() || '',
      userId: log.userId,
      change: log.change,
      previousQuantity: log.previousQuantity,
      newQuantity: log.newQuantity,
      reason: log.reason,
      createdAt: log.createdAt.toISOString(),
      item: log.item ? {
        name: log.item.name,
        category: log.item.category
      } : undefined
    }))
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return []
  }
}

export default async function AuditPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/')
  }

  const auditLogs = await getAuditLogs(userId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-gray-600">
          Track all inventory changes and adjustments
        </p>
      </div>

      <Suspense fallback={
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      }>
        <AuditLogList initialLogs={auditLogs} />
      </Suspense>
    </div>
  )
}
