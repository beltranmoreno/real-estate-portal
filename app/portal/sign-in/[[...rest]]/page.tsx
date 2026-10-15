import Link from 'next/link'
import Image from 'next/image'
import { SignIn } from '@clerk/nextjs'

const LOGO_URL = '/Logo_LCS_Real_Estate.png'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-canvas">
      <div className="w-full max-w-md flex flex-col items-center">
        <Link href="/" className="flex items-center mb-6" aria-label="Leticia Coudray — Home">
          <Image
            src={LOGO_URL}
            alt="Leticia Coudray - Real Estate & Services"
            width={743}
            height={200}
            className="w-auto h-16"
            priority
          />
        </Link>
        <h1 className="font-title text-3xl text-ink text-center mb-8">
          Welcome back.
        </h1>

        <SignIn
          routing="path"
          path="/portal/sign-in"
          signUpUrl="/portal/sign-up"
          fallbackRedirectUrl="/portal"
          appearance={{
            elements: {
              card: 'bg-white border border-line rounded-xs shadow-none',
              headerTitle: 'font-light text-ink',
              headerSubtitle: 'text-muted font-light',
              formButtonPrimary:
                'bg-ink hover:bg-brand text-white text-sm font-light tracking-wide rounded-sm',
              footerActionLink: 'text-body-strong hover:text-ink',
            },
          }}
        />
      </div>
    </div>
  )
}
