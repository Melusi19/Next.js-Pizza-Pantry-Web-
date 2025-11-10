import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { createItemSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db('pizza-pantry')
    const items = await db.collection('items')
      .find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validation = createItemSchema.safeParse(body)

    if (!validation.success) {

      const firstError = validation.error.issues[0]
      return NextResponse.json(
        { error: firstError?.message || 'Invalid data' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('pizza-pantry')
    
    const item = {
      ...validation.data,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Check if item with same name already exists
    const existingItem = await db.collection('items').findOne({
      name: validation.data.name,
      createdBy: userId
    })

    if (existingItem) {
      return NextResponse.json(
        { error: 'An item with this name already exists' },
        { status: 409 }
      )
    }

    const result = await db.collection('items').insertOne(item)

    return NextResponse.json(
      { ...item, _id: result.insertedId.toString() },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }

}
