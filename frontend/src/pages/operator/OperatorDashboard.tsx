import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  Inbox,
  CheckCircle2,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

export const OperatorDashboard: React.FC = () => {
  return (
    <DashboardLayout
      title="Processing Officer Work Queue"
      subtitle="Auto-assigned citizen applications based on your designated district & services"
      roleBadge="Officer (Operator)"
      badgeColor="bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
    >
      {/* Operator Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">In-Processing Queue</span>
            <Inbox className="h-4 w-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-sky-400">0</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Pending Correction</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">0</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Completed Today</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">0</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Today's Earnings</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">₹ 0.00</p>
        </div>
      </div>

      {/* Live Work Queue Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Applications Queue</h3>
          </div>
          <span className="text-xs text-slate-400">0 active requests</span>
        </div>

        <div className="p-8 text-center text-slate-500">
          <Inbox className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No pending applications in your queue right now.</p>
          <p className="text-xs text-slate-600 mt-1">Jab koi Agent nayi request daalega, wo auto-assign hokar yahan dikhegi.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OperatorDashboard;
