'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { useAuth } from '@/components/providers/AuthProvider'

export function AuthButtons() {
  const { user } = useAuth()

  return (
    <div className="hidden md:flex items-center space-x-4">
      {user ? (
        <Link href="/dashboard">
          <Button variant="ghost" className="text-amber-100/70 hover:text-amber-200">
            Dashboard
          </Button>
        </Link>
      ) : (
        <>
          <Link href="/auth">
            <Button variant="ghost" className="text-amber-100/70 hover:text-amber-200">
              Sign In
            </Button>
          </Link>
          <Link href="/pricing">
            <Button className="bg-amber-500 text-black hover:bg-amber-400">
              Get Started
            </Button>
          </Link>
        </>
      )}
    </div>
  )
}
