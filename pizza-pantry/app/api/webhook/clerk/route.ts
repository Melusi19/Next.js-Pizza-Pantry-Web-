import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'
import clientPromise from '@/lib/mongodb'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', {
      status: 400
    })
  }

  // Get the ID and type
  const eventType = evt.type

  console.log(`Webhook with and ID of ${evt.data.id} and type of ${eventType}`)
  console.log('Webhook body:', body)

  // Handle the webhook
  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data)
        break
      case 'user.updated':
        await handleUserUpdated(evt.data)
        break
      case 'user.deleted':
        await handleUserDeleted(evt.data)
        break
      case 'session.ended':
        await handleSessionEnded(evt.data)
        break
      default:
        console.log(`Unhandled event type: ${eventType}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleUserCreated(userData: any) {
  const client = await clientPromise
  const db = client.db('pizza-pantry')
  
  console.log('User created:', userData.id)
  
  try {
    await db.collection('user_profiles').insertOne({
      clerkUserId: userData.id,
      email: userData.email_addresses?.[0]?.email_address,
      firstName: userData.first_name,
      lastName: userData.last_name,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    
    console.log('User profile created for:', userData.id)
  } catch (error) {
    console.error('Error creating user profile:', error)
    // Don't throw error here to avoid breaking the webhook
  }
}

async function handleUserUpdated(userData: any) {
  const client = await clientPromise
  const db = client.db('pizza-pantry')
  
  console.log('User updated:', userData.id)
  
  // Update user profile in database
  try {
    await db.collection('user_profiles').updateOne(
      { clerkUserId: userData.id },
      {
        $set: {
          email: userData.email_addresses?.[0]?.email_address,
          firstName: userData.first_name,
          lastName: userData.last_name,
          updatedAt: new Date(),
        }
      },
      { upsert: true } // Create if doesn't exist
    )
    
    console.log('User profile updated for:', userData.id)
  } catch (error) {
    console.error('Error updating user profile:', error)
  }
}

async function handleUserDeleted(userData: any) {
  const client = await clientPromise
  const db = client.db('pizza-pantry')
  
  console.log('User deleted:', userData.id)
  
  const session = client.startSession()
  
  try {
    await session.withTransaction(async () => {
      // Delete user profile
      await db.collection('user_profiles').deleteOne(
        { clerkUserId: userData.id },
        { session }
      )
      
      console.log('User profile deleted for:', userData.id)
    })
  } catch (error) {
    console.error('Error deleting user data:', error)
  } finally {
    await session.endSession()
  }
}

async function handleSessionEnded(sessionData: any) {
  console.log('Session ended for user:', sessionData.user_id)
  
  const client = await clientPromise
  const db = client.db('pizza-pantry')
  
  try {
    await db.collection('session_logs').insertOne({
      userId: sessionData.user_id,
      sessionId: sessionData.id,
      event: 'session_ended',
      timestamp: new Date(),
    })
    
    console.log('Session end logged for user:', sessionData.user_id)
  } catch (error) {
    console.error('Error logging session end:', error)
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Clerk webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}