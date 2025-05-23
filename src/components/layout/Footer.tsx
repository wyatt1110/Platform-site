'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and company info */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image 
                src="/images/logo.png" 
                alt="OddsVantage Logo" 
                width={150} 
                height={35}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-gray-600 text-sm mb-4">
              Revolutionizing sports betting with smart analytics and data-driven insights.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500">
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600">
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700">
                <Linkedin size={20} />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-600 text-sm hover:text-blue-600">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-gray-600 text-sm hover:text-blue-600">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-600 text-sm hover:text-blue-600">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 text-sm hover:text-blue-600">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 text-sm hover:text-blue-600">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/guides" className="text-gray-600 text-sm hover:text-blue-600">
                  Betting Guides
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 text-sm hover:text-blue-600">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-600 text-sm hover:text-blue-600">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-gray-600 text-sm hover:text-blue-600">
                  API Documentation
                </Link>
              </li>
              <li>
                <Link href="/tutorials" className="text-gray-600 text-sm hover:text-blue-600">
                  Video Tutorials
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-gray-600 text-sm hover:text-blue-600">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 text-sm hover:text-blue-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-600 text-sm hover:text-blue-600">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-gray-600 text-sm hover:text-blue-600">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © {currentYear} OddsVantage. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <p className="text-gray-500 text-sm">
                Designed with ♥ for sports bettors worldwide
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 