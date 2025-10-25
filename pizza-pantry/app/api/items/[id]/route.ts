import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { updateItemSchema } from '@/lib/validations'

export async function GET(
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

    const client = await clientPromise
    const db = client.db('pizza-pantry')
    const item = await db.collection('items').findOne({
      _id: new ObjectId(params.id),
      createdBy: userId
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const validation = updateItemSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid data' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('pizza-pantry')

    // Check if item exists and belongs to user
    const existingItem = await db.collection('items').findOne({
      _id: new ObjectId(params.id),
      createdBy: userId
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Check for duplicate name if name is being updated
    if (validation.data.name && validation.data.name !== existingItem.name) {
      const duplicateItem = await db.collection('items').findOne({
        name: validation.data.name,
        createdBy: userId,
        _id: { $ne: new ObjectId(params.id) }
      })

      if (duplicateItem) {
        return NextResponse.json(
          { error: 'An item with this name already exists' },
          { status: 409 }
        )
      }
    }

    const updateData = {
      ...validation.data,
      updatedAt: new Date()
    }

    const result = await db.collection('items').updateOne(
      { _id: new ObjectId(params.id), createdBy: userId },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const updatedItem = await db.collection('items').findOne({
      _id: new ObjectId(params.id)
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const client = await clientPromise
    const db = client.db('pizza-pantry')

    // Check if item exists and belongs to user
    const existingItem = await db.collection('items').findOne({
      _id: new ObjectId(params.id),
      createdBy: userId
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const session = client.startSession()

    try {
      await session.withTransaction(async () => {
        // Delete the item
        await db.collection('items').deleteOne(
          { _id: new ObjectId(params.id), createdBy: userId },
          { session }
        )

        // Delete associated audit logs
        await db.collection('audit_logs').deleteMany(
          { itemId: new ObjectId(params.id) },
          { session }
        )
      })
    } finally {
      await session.endSession()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}