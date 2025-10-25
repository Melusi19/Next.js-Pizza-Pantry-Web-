import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { adjustQuantitySchema } from '@/lib/validations'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 })
    }

    const body = await req.json()
    const validation = adjustQuantitySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid data' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('pizza-pantry')
    const session = client.startSession()

    try {
      let result

      await session.withTransaction(async () => {
        // Get current item with session
        const item = await db.collection('items').findOne(
          { _id: new ObjectId(params.id), createdBy: userId },
          { session }
        )

        if (!item) {
          throw new Error('Item not found')
        }

        const newQuantity = item.quantity + validation.data.change
        
        if (newQuantity < 0) {
          throw new Error('Insufficient quantity')
        }

        // Update item quantity
        result = await db.collection('items').updateOne(
          { _id: new ObjectId(params.id) },
          { 
            $set: { 
              quantity: newQuantity,
              updatedAt: new Date()
            }
          },
          { session }
        )

        if (result.matchedCount === 0) {
          throw new Error('Item not found')
        }

   
        await db.collection('audit_logs').insertOne({
          itemId: new ObjectId(params.id),
          userId,
          change: validation.data.change,
          previousQuantity: item.quantity,
          newQuantity,
          reason: validation.data.reason || 'Quantity adjustment',
          createdAt: new Date(),
        }, { session })
      })

      const updatedItem = await db.collection('items').findOne({
        _id: new ObjectId(params.id)
      })

      return NextResponse.json(updatedItem)
    } finally {
      await session.endSession()
    }
  } catch (error) {
    console.error('Error adjusting quantity:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}