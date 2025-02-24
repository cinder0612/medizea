import Link from 'next/link'
import { Logo } from '@/components/shared/logo'

export function Footer() {
  return (
    <footer className="relative py-12 z-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-8">
          <Logo />
          <nav className="flex flex-wrap justify-center gap-8 text-amber-200/70">
            <Link href="/about" className="hover:text-amber-200 transition-colors">
              About
            </Link>
            <Link href="/pricing" className="hover:text-amber-200 transition-colors">
              Pricing
            </Link>
            <Link href="/privacy" className="hover:text-amber-200 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-amber-200 transition-colors">
              Terms
            </Link>
          </nav>
          <div className="text-amber-200/50 text-sm">
            © {new Date().getFullYear()} Calm AI. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
} 