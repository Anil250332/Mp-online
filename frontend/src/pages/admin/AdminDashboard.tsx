import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  TrendingUp,
  CreditCard,
  Users,
  Settings,
  CheckCircle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  return (
    <DashboardLayout
      title="Master Super Admin Control Room"
      subtitle="Financial settlement ledger, platform margin, master applications & dynamic service engine"
      roleBadge="Super Admin (Owner)"
      badgeColor="bg-rose-500/20 text-rose-300 border-rose-500/30"
    >
      {/* Financial Master KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Platform Inflow</span>
            <CreditCard className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">₹ 0.00</p>
          <p className="text-[11px] text-slate-500 mt-1">Cashfree Auto UPI Recharges</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Platform Margin</span>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-indigo-400">₹ 0.00</p>
          <p className="text-[11px] text-slate-500 mt-1">Real-time Platform Revenue</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Payouts</span>
            <CreditCard className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">0</p>
          <p className="text-[11px] text-slate-500 mt-1">Operator/Distributor Payout Desk</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Onboarded Users</span>
            <Users className="h-4 w-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-sky-400">1</p>
          <p className="text-[11px] text-slate-500 mt-1">Agents, Operators, Managers</p>
        </div>
      </div>

      {/* Super Admin Control Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all">
          <CreditCard className="h-6 w-6 text-emerald-400 mb-3" />
          <h4 className="text-sm font-bold text-white mb-1">Amount Transaction Ledger</h4>
          <p className="text-xs text-slate-400 mb-3">Global platform audit of all monetary inflows, outflows, and wallet debits.</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all">
          <CheckCircle className="h-6 w-6 text-amber-400 mb-3" />
          <h4 className="text-sm font-bold text-white mb-1">Final Payout Release</h4>
          <p className="text-xs text-slate-400 mb-3">Approve Manager-verified Operator withdrawals and log UTR numbers.</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 transition-all">
          <Users className="h-6 w-6 text-sky-400 mb-3" />
          <h4 className="text-sm font-bold text-white mb-1">Total User Management</h4>
          <p className="text-xs text-slate-400 mb-3">Master CRUD, Direct User Add, Instant Block/Unblock across all 5 roles.</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 transition-all">
          <Settings className="h-6 w-6 text-rose-400 mb-3" />
          <h4 className="text-sm font-bold text-white mb-1">WhatsApp & Gateway Config</h4>
          <p className="text-xs text-slate-400 mb-3">Meta Cloud API credentials and Cashfree Auto UPI keys & webhooks.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
