'use client'

import { Facebook, Twitter, Instagram, Youtube, Mail, Phone } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-20">
      {/* Top Divider */}
      <div className="flex justify-center">
        <div className="w-2/3 h-px bg-amber-500/10"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-amber-200">Medizea</h3>
            <p className="text-amber-100/70 text-sm">
              Transform your meditation practice with AI-powered personalization and guidance.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-amber-400 hover:text-amber-300 transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-amber-400 hover:text-amber-300 transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-amber-400 hover:text-amber-300 transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-amber-400 hover:text-amber-300 transition-colors">
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-medium text-amber-200 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-amber-100/70 hover:text-amber-200 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-amber-100/70 hover:text-amber-200 transition-colors text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-amber-100/70 hover:text-amber-200 transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-amber-100/70 hover:text-amber-200 transition-colors text-sm">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-medium text-amber-200 mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-amber-100/70 hover:text-amber-200 transition-colors text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-amber-100/70 hover:text-amber-200 transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-amber-100/70 hover:text-amber-200 transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-amber-100/70 hover:text-amber-200 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-amber-100/70 hover:text-amber-200 transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-medium text-amber-200 mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-amber-100/70">
                <Mail className="w-5 h-5 text-amber-400" />
                <span className="text-sm">support@medizea.com</span>
              </div>
              <div className="flex items-center space-x-3 text-amber-100/70">
                <Phone className="w-5 h-5 text-amber-400" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <p className="text-amber-100/70 text-sm">
              {new Date().getFullYear()} Medizea. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-6">
                <li>
                  <Link href="/privacy" className="text-amber-100/70 hover:text-amber-200 transition-colors text-sm">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-amber-100/70 hover:text-amber-200 transition-colors text-sm">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-amber-100/70 hover:text-amber-200 transition-colors text-sm">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
