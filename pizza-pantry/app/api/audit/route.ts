import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const itemId = searchParams.get('itemId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const client = await clientPromise
    const db = client.db('pizza-pantry')

    let matchCondition: any = { userId }
    
    if (itemId && ObjectId.isValid(itemId)) {
      matchCondition.itemId = new ObjectId(itemId)
    }

    const auditLogs = await db.collection('audit_logs')
      .aggregate([
        { $match: matchCondition },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
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

    const total = await db.collection('audit_logs').countDocuments(matchCondition)

    return NextResponse.json({
      auditLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}