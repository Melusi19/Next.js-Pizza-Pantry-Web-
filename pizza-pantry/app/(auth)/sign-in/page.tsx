import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'

export default function SignInPage() {
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
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            href="/sign-up"
            className="font-medium text-orange-600 hover:text-orange-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      {/* Clerk SignIn Component */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignIn
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
            path="/sign-in"
            signUpUrl="/sign-up"
            redirectUrl="/dashboard"
          />
        </div>

        {/* Demo Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Demo Account Info
          </h3>
          <p className="text-xs text-blue-700">
            Use any email to sign in - Clerk will send you a magic link for authentication.
            No password required for demo purposes!
          </p>
        </div>
      </div>
    </div>
  )
}
