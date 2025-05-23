import React, { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-gray-100">
    <header className="bg-blue-700 text-white p-4 font-bold text-xl">Sports Betting Solutions</header>
    <main className="flex-1 p-6">{children}</main>
    <footer className="bg-gray-200 text-center p-2 text-sm text-gray-600">&copy; {new Date().getFullYear()} Sports Betting Solutions</footer>
  </div>
);

export default DashboardLayout; 