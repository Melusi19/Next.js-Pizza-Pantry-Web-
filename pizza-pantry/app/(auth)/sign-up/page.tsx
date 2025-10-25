import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center space-x-2">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">🍕</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">Pizza Pantry</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            href="/sign-in"
            className="font-medium text-orange-600 hover:text-orange-500"
          >
            sign in to your existing account
          </Link>
        </p>
      </div>

      {/* Clerk SignUp Component */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none bg-transparent w-full",
                header: "hidden",
                socialButtonsBlockButton: 
                  "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition-colors",
                socialButtonsBlockButtonText: "text-sm font-medium",
                formButtonPrimary:
                  "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 text-sm font-medium",
                formFieldInput:
                  "border border-gray-300 focus:ring-orange-500 focus:border-orange-500",
                footerActionLink:
                  "text-orange-600 hover:text-orange-500 font-medium",
                identityPreviewEditButton:
                  "text-orange-600 hover:text-orange-500",
                formResendCodeLink:
                  "text-orange-600 hover:text-orange-500",
              },
              layout: {
                socialButtonsPlacement: "bottom",
                socialButtonsVariant: "auto",
                showOptionalFields: false,
              },
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            redirectUrl="/dashboard"
          />
        </div>

        {/* Features List */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            What you&apos;ll get with Pizza Pantry:
          </h3>
          <ul className="text-xs text-gray-600 space-y-2">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Real-time inventory tracking
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Low stock alerts and notifications
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Complete audit trail of all changes
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Multi-user support for your team
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Mobile-friendly responsive design
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
