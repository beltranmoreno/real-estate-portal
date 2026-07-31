import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-stone-50">
      <div className="w-full max-w-md">
        <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-3 text-center">
          Casa de Campo
        </p>
        <h1 className="text-3xl font-light text-stone-900 tracking-tight text-center mb-8">
          Welcome.
        </h1>

        <SignUp
          routing="path"
          path="/portal/sign-up"
          signInUrl="/portal/sign-in"
          fallbackRedirectUrl="/portal"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-white border border-stone-200 rounded-xs shadow-none',
              headerTitle: 'font-light text-stone-900',
              headerSubtitle: 'text-stone-600 font-light',
              formButtonPrimary:
                'bg-stone-800 hover:bg-stone-900 text-white text-sm font-light tracking-wide rounded-sm',
              footerActionLink: 'text-stone-700 hover:text-stone-900',
            },
          }}
        />
      </div>
    </div>
  )
}
