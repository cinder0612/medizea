import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from "@/components/ui/toaster"
import { AuthRedirectHandler } from '@/components/auth/auth-redirect-handler'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ErrorBoundary } from '@/components/error-boundary'
import { ParticleBackground } from '@/components/particle-background'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Calm - Personalized AI Meditation Journeys',
  description: 'Experience AI-powered, personalized meditation sessions tailored to your needs with Calm.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black`}>
        <ErrorBoundary>
          <AuthProvider initialSession={session}>
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
