import { ClerkLoaded, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-500 rounded-lg"></div>
                <span className="text-xl font-bold text-gray-900">Pizza Pantry</span>
              </Link>
              
              <div className="hidden md:flex space-x-6">
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  Inventory
                </Link>
                <Link 
                  href="/dashboard/audit" 
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  Audit Log
                </Link>
              </div>
            </div>
            
            <ClerkLoaded>
              <UserButton />
            </ClerkLoaded>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}