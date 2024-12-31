'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from '@/contexts/AuthContext'
import { toast } from "@/components/hooks/use-toast"
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Navbar() {
  const { user, signIn, signUp, signOut, loading, subscriptionStatus } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password.",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)
    try {
      await signIn(email, password)
    } catch (error) {
      console.error('Sign in error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password.",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)
    try {
      await signUp(email, password)
      toast({
        title: "Sign Up Successful",
        description: "Please check your email to verify your account.",
      })
    } catch (error) {
      console.error('Sign up error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setMobileMenuOpen(false) // Close mobile menu if open
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: "Sign Out Error",
        description: "An error occurred while signing out. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="h-16 bg-black/80 backdrop-blur-sm">Loading...</div>
  }

  return (
    <nav className="sticky top-0 left-0 right-0 z-[1000] bg-black/95 border-b border-amber-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link 
            href="/" 
            className="flex items-center gap-3 transition-opacity duration-200 hover:opacity-80"
            aria-label="Go to homepage"
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/meditlogo-CPfXA8nC5aOOBE0lFLXseqGp1o4If1.png"
              alt="Calm Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/about" className="text-amber-200 hover:text-amber-100 transition-colors">
              About
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="text-amber-200 hover:text-amber-100 transition-colors">
                  Dashboard
                </Link>
                <Link href="/pricing" className="text-amber-200 hover:text-amber-100 transition-colors">
                  Pricing
                </Link>
                <Button 
                  onClick={handleSignOut}
                  variant="ghost" 
                  className="text-amber-200 hover:text-amber-100 hover:bg-amber-500/10"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/pricing" className="text-amber-200 hover:text-amber-100 transition-colors">
                  Pricing
                </Link>
                <Button 
                  onClick={() => router.push('/auth')}
                  className="bg-amber-400 text-black hover:bg-amber-300 transition-colors font-semibold px-6"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="p-0 md:hidden" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="h-6 w-6 text-amber-200" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-black/95 border-l border-amber-500/20 z-[200]">
              <div className="flex flex-col gap-6 mt-8">
                <Link href="/about" className="text-amber-200 hover:text-amber-100 transition-colors text-lg">
                  About
                </Link>
                {user ? (
                  <>
                    <Link href="/dashboard" className="text-amber-200 hover:text-amber-100 transition-colors text-lg">
                      Dashboard
                    </Link>
                    <Link href="/pricing" className="text-amber-200 hover:text-amber-100 transition-colors text-lg">
                      Pricing
                    </Link>
                    <Button 
                      onClick={handleSignOut}
                      variant="ghost" 
                      className="text-amber-200 hover:text-amber-100 hover:bg-amber-500/10 justify-start text-lg"
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/pricing" className="text-amber-200 hover:text-amber-100 transition-colors text-lg">
                      Pricing
                    </Link>
                    <Button 
                      onClick={() => {
                        router.push('/auth')
                        setMobileMenuOpen(false)
                      }}
                      className="bg-amber-400 text-black hover:bg-amber-300 transition-colors font-semibold text-lg"
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
