'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Home,
  HelpCircle,
  Settings,
  LogOut,
  ClipboardList,
  Clock,
  UserCircle,
  LineChart,
  CircleDollarSign,
  BarChart2,
  ChevronDown,
  Wrench,
  Trophy
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/providers';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [proToolsDropdownOpen, setProToolsDropdownOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Determine theme-specific styles
  const getActiveStyle = (isItemActive: boolean) => {
    if (isItemActive) {
      if (theme === 'racing') {
        return 'bg-racing-100 text-racing-800';
      } else if (theme === 'dark') {
        return 'bg-gray-800 text-green-400';
      } else {
        return 'bg-green-50 text-green-800';
      }
    } else {
      if (theme === 'racing') {
        return 'text-gray-200 hover:bg-charcoal-700';
      } else if (theme === 'dark') {
        return 'text-gray-100 hover:bg-gray-700';
      } else {
        return 'text-gray-800 hover:bg-gray-100';
      }
    }
  };

  // Get navbar background based on theme
  const getNavbarBackground = () => {
    if (theme === 'racing') {
      return 'bg-charcoal-800 border-charcoal-700';
    } else if (theme === 'dark') {
      return 'bg-gray-900 border-gray-800';
    } else {
      return 'bg-white border-gray-200';
    }
  };
  
  // Get dropdown background based on theme
  const getDropdownBackground = () => {
    if (theme === 'racing') {
      return 'bg-charcoal-800 border-charcoal-700';
    } else if (theme === 'dark') {
      return 'bg-gray-900 border-gray-800';
    } else {
      return 'bg-white border-gray-200';
    }
  };
  
  // Get heading text color based on theme
  const getHeaderTextColor = () => {
    if (theme === 'racing') {
      return 'text-white';
    } else if (theme === 'dark') {
      return 'text-gray-100';
    } else {
      return 'text-gray-900';
    }
  };

  // Get subtext color based on theme
  const getSubtextColor = () => {
    if (theme === 'racing') {
      return 'text-gray-300';
    } else if (theme === 'dark') {
      return 'text-gray-400';
    } else {
      return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <header className={`${getNavbarBackground()} border-b sticky top-0 z-50`}>
        <div className="flex items-center justify-between px-4 max-w-7xl mx-auto">
          {/* Logo and Title */}
          <div className="py-4 px-4 flex items-center">
            <div className={`w-9 h-9 flex items-center justify-center rounded-full bg-green-600 text-white mr-3`}>
              <Trophy className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className={`font-bold text-xl ${getHeaderTextColor()}`}><span className="text-green-600">T</span>urf <span className="text-green-600">T</span>racker</h1>
            </div>
          </div>
          
          {/* Main Navigation */}
          <nav className="flex items-center space-x-4 mx-auto">
            <Link 
              href="/betting-dashboard"
              className={`flex items-center py-3 px-5 text-base rounded-md font-bold tracking-wide ${
                getActiveStyle(isActive('/betting-dashboard'))
              }`}
            >
              Dashboard
            </Link>
            
            <Link 
              href="/analytics"
              className={`flex items-center py-3 px-5 text-base rounded-md font-bold tracking-wide ${
                getActiveStyle(isActive('/analytics'))
              }`}
            >
              Analytics
            </Link>
            
            <Link 
              href="/all-bets"
              className={`flex items-center py-3 px-5 text-base rounded-md font-bold tracking-wide ${
                getActiveStyle(isActive('/all-bets'))
              }`}
            >
              All Bets
            </Link>
            
            {/* Account Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setAccountDropdownOpen(!accountDropdownOpen);
                  if (proToolsDropdownOpen) setProToolsDropdownOpen(false);
                }}
                className={`flex items-center gap-x-2 py-3 px-5 text-base rounded-md font-bold tracking-wide ${
                  isActive('/account') || isActive('/settings') || isActive('/help') ? 
                  (theme === 'racing' ? 'bg-racing-100 text-racing-800' : 
                   theme === 'dark' ? 'bg-gray-800 text-green-400' : 
                   'bg-green-50 text-green-800') : 
                  (theme === 'racing' ? 'text-gray-200 hover:bg-charcoal-700' : 
                   theme === 'dark' ? 'text-gray-100 hover:bg-gray-700' : 
                   'text-gray-800 hover:bg-gray-100')
                }`}
              >
                Account
                <ChevronDown className={`w-4 h-4 transition-transform ${accountDropdownOpen ? 'transform rotate-180' : ''}`} />
              </button>
              
              {accountDropdownOpen && (
                <div className={`absolute right-0 mt-1 w-48 rounded-md shadow-lg ${getDropdownBackground()} border`}>
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <Link 
                      href="/account"
                      className={`block px-4 py-2 text-base font-medium ${getActiveStyle(isActive('/account'))}`}
                      role="menuitem"
                    >
                      Profile
                    </Link>
                    <Link 
                      href="/settings"
                      className={`block px-4 py-2 text-base font-medium ${getActiveStyle(isActive('/settings'))}`}
                      role="menuitem"
                    >
                      Settings
                    </Link>
                    <Link 
                      href="/help"
                      className={`block px-4 py-2 text-base font-medium ${getActiveStyle(isActive('/help'))}`}
                      role="menuitem"
                    >
                      Help & Support
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className={`block w-full text-left px-4 py-2 text-base font-medium ${
                        theme === 'racing' ? 'text-gray-200 hover:bg-charcoal-700' : 
                        theme === 'dark' ? 'text-gray-100 hover:bg-gray-700' : 
                        'text-gray-800 hover:bg-gray-100'
                      }`}
                      role="menuitem"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Pro Tools Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setProToolsDropdownOpen(!proToolsDropdownOpen);
                  if (accountDropdownOpen) setAccountDropdownOpen(false);
                }}
                className={`flex items-center gap-x-2 py-3 px-5 text-base rounded-md font-bold tracking-wide ${
                  theme === 'racing' ? 'text-gray-200 hover:bg-charcoal-700' : 
                  theme === 'dark' ? 'text-gray-100 hover:bg-gray-700' : 
                  'text-gray-800 hover:bg-gray-100'
                }`}
              >
                Pro Tools
                <ChevronDown className={`w-4 h-4 transition-transform ${proToolsDropdownOpen ? 'transform rotate-180' : ''}`} />
              </button>
              
              {proToolsDropdownOpen && (
                <div className={`absolute right-0 mt-1 w-48 rounded-md shadow-lg ${getDropdownBackground()} border`}>
                  <div className="py-2 px-4 text-center" role="menu" aria-orientation="vertical">
                    <p className={`text-base font-medium ${getSubtextColor()}`}>
                      Pro tools coming soon
                    </p>
                  </div>
                </div>
              )}
            </div>
          </nav>
          
          {/* Empty div to balance the flex layout */}
          <div className="w-[200px]"></div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
} 