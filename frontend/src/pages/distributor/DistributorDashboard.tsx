import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  Users,
  Store,
  DollarSign,
  UserPlus
} from 'lucide-react';

export const DistributorDashboard: React.FC = () => {
  return (
    <DashboardLayout
      title="Distributor Network Control"
      subtitle="Onboard MP Online shop agents in your district and track network commission"
      roleBadge="Area Distributor"
      badgeColor="bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
    >
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Onboarded Agents</span>
            <Store className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-cyan-400">0</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Agents Today</span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">0</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Network Applications</span>
            <Users className="h-4 w-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-sky-400">0</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Commission Balance</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">₹ 0.00</p>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-800/40 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white mb-1">Onboard New MP Online Agent</h4>
          <p className="text-xs text-slate-300">Apne area ke naye kiosk/cyber cafe ko direct register karein.</p>
        </div>
        <button className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-lg shadow-cyan-500/20">
          <UserPlus className="h-4 w-4" />
          <span>New Agent Create</span>
        </button>
      </div>
    </DashboardLayout>
  );
};

export default DistributorDashboard;
