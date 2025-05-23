'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { useSession } from '@/lib/auth/useSession';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className={`w-full fixed top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
    }`}>
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image 
            src="/images/logo.png" 
            alt="OddsVantage Logo" 
            width={180} 
            height={40}
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-8">
          <Link href="/" className={`text-sm font-medium transition-colors ${
            isActive('/') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
          }`}>
            Home
          </Link>
          
          <Link href="/features" className={`text-sm font-medium transition-colors ${
            isActive('/features') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
          }`}>
            Features
          </Link>
          
          <Link href="/pricing" className={`text-sm font-medium transition-colors ${
            isActive('/pricing') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
          }`}>
            Pricing
          </Link>
          
          <div className="relative group">
            <button className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              Resources <ChevronDown className="ml-1 h-4 w-4" />
            </button>
            <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <Link href="/blog" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Blog
              </Link>
              <Link href="/guides" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Guides
              </Link>
              <Link href="/faq" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                FAQ
              </Link>
            </div>
          </div>
          
          <Link href="/contact" className={`text-sm font-medium transition-colors ${
            isActive('/contact') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
          }`}>
            Contact
          </Link>
        </div>

        {/* Auth Buttons / Dashboard Link */}
        <div className="hidden lg:flex items-center space-x-4">
          {session ? (
            <Link href="/betting-dashboard">
              <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          className="lg:hidden focus:outline-none" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 text-gray-700" />
          ) : (
            <Menu className="h-6 w-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white py-4 px-6 shadow-md">
          <div className="flex flex-col space-y-4">
            <Link 
              href="/" 
              className={`text-sm font-medium ${isActive('/') ? 'text-blue-600' : 'text-gray-700'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/features" 
              className={`text-sm font-medium ${isActive('/features') ? 'text-blue-600' : 'text-gray-700'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="/pricing" 
              className={`text-sm font-medium ${isActive('/pricing') ? 'text-blue-600' : 'text-gray-700'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            
            <div className="py-2">
              <button className="flex items-center justify-between w-full text-sm font-medium text-gray-700">
                Resources <ChevronDown className="h-4 w-4" />
              </button>
              <div className="ml-4 mt-2 space-y-2">
                <Link 
                  href="/blog" 
                  className="block text-sm text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link 
                  href="/guides" 
                  className="block text-sm text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Guides
                </Link>
                <Link 
                  href="/faq" 
                  className="block text-sm text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  FAQ
                </Link>
              </div>
            </div>
            
            <Link 
              href="/contact" 
              className={`text-sm font-medium ${isActive('/contact') ? 'text-blue-600' : 'text-gray-700'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            
            <div className="pt-4 border-t border-gray-100">
              {session ? (
                <Link 
                  href="/betting-dashboard"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link 
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link 
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 