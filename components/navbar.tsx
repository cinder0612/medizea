import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Menu } from 'lucide-react'
import { AuthButtons } from './auth-buttons'
import { NavLinks } from './nav-links'

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/meditlogo-CPfXA8nC5aOOBE0lFLXseqGp1o4If1.png"
                alt="MindfulAI Logo"
                className="h-8 w-auto"
              />
            </Link>
            
            <NavLinks />
          </div>

          <AuthButtons />

          <div className="md:hidden">
            <Button variant="ghost" className="text-amber-100/70 hover:text-amber-200">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
