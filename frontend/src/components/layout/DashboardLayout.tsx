import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Home,
  Wallet,
  User,
  Headphones,
  Shield,
  LogOut,
  Moon,
  Sun,
  ChevronRight,
  UserCheck,
  UserX,
  Store,
  PlusCircle,
  MessageCircle,
  Layers,
  X
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  roleBadge?: string;
  badgeColor?: string;
  activeMenu?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showWhatsAppFloat, setShowWhatsAppFloat] = useState(true);

  const getRoleDisplayName = () => {
    switch (user?.role) {
      case 'super_admin':
        return 'Admin';
      case 'manager':
        return 'Manager';
      case 'distributor':
        return 'Distributor';
      case 'operator':
        return 'Operator';
      case 'agent':
      default:
        return 'Retailer';
    }
  };

  interface MenuItem {
    name: string;
    icon: React.ElementType;
    path: string;
    color: string;
    badge?: string;
    hasSub?: boolean;
  }

  const getMenuItems = (): MenuItem[] => {
    if (user?.role === 'distributor') {
      return [
        { name: 'Dashboard', icon: Home, path: '/distributor/dashboard', color: 'text-blue-600' },
        { name: 'Shop List', icon: Store, path: '/distributor/shop-list', color: 'text-blue-500' },
        { name: 'Verify Shops', icon: UserCheck, path: '/distributor/verify-shops', color: 'text-amber-600' },
        { name: 'Delete Shop Requests', icon: UserX, path: '/distributor/delete-shop-requests', color: 'text-red-500' },
        { name: 'Complaint', icon: Headphones, path: '/distributor/complaint', color: 'text-red-600' },
        { name: 'My Profile', icon: User, path: '/distributor/profile', color: 'text-purple-600' }
      ];
    }

    if (user?.role === 'super_admin' || user?.role === 'manager') {
      const basePath = user?.role === 'super_admin' ? '/admin' : '/manager';
      return [
        { name: 'Dashboard', icon: Home, path: `${basePath}/dashboard`, color: 'text-blue-600' },
        { name: 'Shop Management', icon: Store, path: '/admin/shops', color: 'text-blue-600' },
        { name: 'Services Management', icon: Layers, path: '/admin/services', color: 'text-indigo-600' },
        { name: 'Wallet Management', icon: Wallet, path: '/admin/wallet', color: 'text-emerald-600' },
        { name: 'Complaint', icon: Headphones, path: `${basePath}/complaints`, color: 'text-red-600' }
      ];
    }

    return [
      { name: 'Dashboard', icon: Home, path: '/agent/dashboard', color: 'text-blue-600' },
      { name: 'Services', icon: Layers, path: '/agent/services', color: 'text-indigo-600' },
      { name: 'Wallet Manage', icon: Wallet, path: '/agent/wallet', color: 'text-emerald-600' },
      { name: 'Complaint', icon: Headphones, path: '/agent/complaint', color: 'text-red-600' },
      { name: 'My Profile', icon: User, path: '/agent/profile', color: 'text-purple-600' },
      { name: 'Terms & Policies', icon: Shield, path: '/agent/terms', color: 'text-blue-500' }
    ];
  };

  const menuItems = getMenuItems();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f4f6f9] text-slate-800'} font-sans flex flex-col`}>
      {/* 1. Top Blue Brand Header Navbar (Exact Citizen Center Online Blue) */}
      <header className="sticky top-0 z-40 bg-[#1565c0] text-white shadow-sm px-3 sm:px-5 py-2 flex items-center justify-between">
        {/* Left: Hamburger & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded text-white hover:bg-blue-700/60 transition-colors focus:outline-none"
            title="Toggle Menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link to="/" className="flex items-center gap-2.5">
            {/* Citizen Center Round Logo */}
            <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center p-1 shadow-sm border border-blue-200 shrink-0">
              <div className="h-full w-full rounded-full bg-gradient-to-tr from-orange-500 via-amber-400 to-emerald-500 flex items-center justify-center">
                <span className="text-[10px] font-black tracking-tighter text-blue-950">CC</span>
              </div>
            </div>
            
            <div className="leading-tight select-none">
              <div className="text-[17px] font-black tracking-wide text-[#ff9800] uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                CITIZEN <span className="text-[#ffb74d]">CENTER</span>
              </div>
              <div className="inline-block bg-[#e53935] text-white text-[9px] font-extrabold tracking-widest px-2 py-0.2 rounded-xs uppercase">
                ONLINE
              </div>
            </div>
          </Link>
        </div>

        {/* Right: User Profile Avatar & Retailer Wallet */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Black Wallet Box & Upgrade ID Pill (Only for Retailer / Agent role) */}
          {(!user?.role || user?.role === 'agent') && (
            <>
              <div className="flex items-center gap-1.5 bg-[#212529] px-2.5 py-1.5 rounded text-xs font-bold text-white shadow-inner">
                <Wallet className="h-3.5 w-3.5 text-slate-200" />
                <span>{(user?.wallet_balance || 0).toFixed(0)}</span>
              </div>

              <button className="flex items-center gap-1.5 bg-[#e91e63] hover:bg-[#d81b60] text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow transition-transform hover:scale-105">
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Upgrade ID</span>
              </button>
            </>
          )}

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold border border-white/40">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block text-left leading-none">
              <p className="text-xs font-bold text-white">{user?.full_name || 'vijay'}</p>
              <p className="text-[10px] text-blue-100 font-medium mt-0.5">{getRoleDisplayName()}</p>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Body with Sidebar & Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left White Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-56' : 'w-0 -translate-x-full md:w-14 md:translate-x-0'
          } ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          } border-r transition-all duration-200 flex flex-col shrink-0 z-30 overflow-y-auto select-none`}
        >
          <div className="py-2 flex-1">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path || (index === 0 && location.pathname.includes('dashboard'));
              const Icon = item.icon;
              const isHashLink = item.path.startsWith('#');

              if (isHashLink) {
                return (
                  <button
                    key={item.name}
                    onClick={(e) => e.preventDefault()}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer text-left ${
                      isDarkMode
                        ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${item.color}`} />
                      {sidebarOpen && <span className="truncate">{item.name}</span>}
                    </div>

                    {sidebarOpen && item.badge && (
                      <div className="flex items-center gap-1">
                        <span className="bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] text-[10px] font-bold px-1.5 py-0.2 rounded">
                          {item.badge}
                        </span>
                        {item.hasSub && <ChevronRight className="h-3 w-3 text-slate-400" />}
                      </div>
                    )}

                    {sidebarOpen && item.hasSub && !item.badge && (
                      <ChevronRight className="h-3 w-3 text-slate-400" />
                    )}
                  </button>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-[#1565c0] font-bold bg-blue-50/70 border-l-4 border-[#1565c0]'
                      : isDarkMode
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-[#1565c0]' : item.color}`} />
                    {sidebarOpen && <span className="truncate">{item.name}</span>}
                  </div>

                  {sidebarOpen && item.badge && (
                    <div className="flex items-center gap-1">
                      <span className="bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] text-[10px] font-bold px-1.5 py-0.2 rounded">
                        {item.badge}
                      </span>
                      {item.hasSub && <ChevronRight className="h-3 w-3 text-slate-400" />}
                    </div>
                  )}

                  {sidebarOpen && item.hasSub && !item.badge && (
                    <ChevronRight className="h-3 w-3 text-slate-400" />
                  )}
                </Link>
              );
            })}

            {/* Logout Item */}
            <button
              onClick={logout}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors text-left`}
            >
              <LogOut className="h-4 w-4 text-slate-400 group-hover:text-red-600" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>

          {/* Bottom Dark Mode Switch */}
          {sidebarOpen && (
            <div className="p-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-full flex items-center justify-between text-xs font-semibold text-blue-700 hover:text-blue-800 p-1.5 rounded transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>Night mode</span>
                  {isDarkMode ? <Sun className="h-3.5 w-3.5 text-amber-500" /> : <Moon className="h-3.5 w-3.5 text-blue-600 fill-blue-600" />}
                </div>
              </button>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
          {children}
        </main>
      </div>

      {/* 3. Floating Bottom-Right WhatsApp Channel Widget (Exact as in Screenshot) */}
      {showWhatsAppFloat && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#25d366] text-white rounded-xl p-3 shadow-2xl flex items-center gap-2.5 max-w-xs animate-in fade-in duration-300">
          <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#25d366] shrink-0 shadow">
            <MessageCircle className="h-5 w-5 fill-current" />
          </div>
          <div className="text-left leading-tight">
            <div className="flex items-center gap-1 font-bold text-xs">
              <span>📢 Join Our Channel</span>
            </div>
            <p className="text-[10px] text-white/90 mt-0.5">Instant updates & offers</p>
            <a
              href="https://whatsapp.com"
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 bg-white text-[#25d366] font-bold text-[10px] px-3 py-0.5 rounded-full shadow-sm hover:bg-slate-50"
            >
              <MessageCircle className="h-3 w-3 fill-current" />
              <span>Join</span>
            </a>
          </div>
          <button
            onClick={() => setShowWhatsAppFloat(false)}
            className="text-white/80 hover:text-white ml-1 p-0.5 self-start"
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
