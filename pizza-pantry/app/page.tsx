import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900">Pizza Pantry</span>
          </div>
          
          <SignedIn>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
              <UserButton />
            </div>
          </SignedIn>
          
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn btn-primary">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Pizza Pantry
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Streamline your pizza shop inventory management with our intuitive web app. 
            Track ingredients, manage stock levels, and never run out of dough again.
          </p>
          
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn btn-primary text-lg px-8 py-3">
                Get Started - It&apos;s Free
              </button>
            </SignInButton>
          </SignedOut>
          
          <SignedIn>
            <Link href="/dashboard" className="btn btn-primary text-lg px-8 py-3">
              Go to Dashboard
            </Link>
          </SignedIn>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto">
          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Inventory Tracking</h3>
            <p className="text-gray-600">Real-time tracking of all your ingredients and supplies</p>
          </div>
          
          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Smart Alerts</h3>
            <p className="text-gray-600">Get notified when items are running low</p>
          </div>
          
          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Team Collaboration</h3>
            <p className="text-gray-600">Multiple staff members can manage inventory together</p>
          </div>
        </div>
      </main>
    </div>
  )
}