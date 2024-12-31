'use client'
 
import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
 
export default function NotFound() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to home page after 5 seconds
    const timeout = setTimeout(() => {
      router.push('/')
    }, 5000)
    
    return () => clearTimeout(timeout)
  }, [router])
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-4xl font-light text-amber-200 mb-4">Page Not Found</h2>
      <p className="text-amber-100/70 mb-8">Could not find requested resource</p>
      <Link 
        href="/"
        className="text-amber-200 hover:text-amber-300 underline transition-colors"
      >
        Return Home
      </Link>
    </div>
  )
}
