import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  LogOut,
  Wallet,
  PlusCircle
} from 'lucide-react';

interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  roleBadge: string;
  badgeColor?: string;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  subtitle,
  roleBadge,
  badgeColor = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  children
}) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white">V2ONLINE</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badgeColor}`}>
                {roleBadge}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {user?.shop_name ? user.shop_name : user?.full_name}
            </p>
          </div>
        </div>

        {/* Right Action Icons: Wallet, Notifications, Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Wallet Widget */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-inner">
            <Wallet className="h-4 w-4 text-emerald-400" />
            <div className="text-right">
              <p className="text-[10px] text-slate-400 leading-none">Wallet Balance</p>
              <p className="text-xs font-bold text-emerald-400 leading-tight">
                ₹ {(user?.wallet_balance || 0).toFixed(2)}
              </p>
            </div>
            {user?.role === 'agent' && (
              <button
                type="button"
                className="ml-1 p-1 rounded-md bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors"
                title="Add Money"
              >
                <PlusCircle className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Profile / Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 rounded-lg px-3 py-2 transition-all font-medium"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>

        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
