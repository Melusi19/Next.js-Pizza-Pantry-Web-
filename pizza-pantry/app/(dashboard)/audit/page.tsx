import { Suspense } from 'react'
import { AuditLogList } from '@/components/audit/audit-log-list'
import { getAuth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import clientPromise from '@/lib/mongodb'

async function getAuditLogs(userId: string) {
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
            change: 1,
            previousQuantity: 1,
            newQuantity: 1,
            reason: 1,
            createdAt: 1,
            'item.name': 1,
            'item.category': 1
          }
        }
      ])
      .toArray()

    return auditLogs.map(log => ({
      ...log,
      _id: log._id.toString(),
      createdAt: log.createdAt.toISOString(),
      itemId: log.itemId?.toString()
    }))
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return []
  }
}

export default async function AuditPage() {
  const { userId } = getAuth()
  
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