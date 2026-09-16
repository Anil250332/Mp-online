import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  Users,
  Activity,
  Layers,
  UserCheck,
  Headphones,
  ArrowUpRight
} from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  return (
    <DashboardLayout
      title="Operations & Dispatch Control Room"
      subtitle="Monitor applications, approve self-registered agents, and manage services"
      roleBadge="Operations Manager"
      badgeColor="bg-amber-500/20 text-amber-300 border-amber-500/30"
    >
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Pending Approvals</span>
            <UserCheck className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">0</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Live Applications</span>
            <Activity className="h-4 w-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-sky-400">0</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Operators</span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">0</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Open Complaints</span>
            <Headphones className="h-4 w-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400">0</p>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all">
          <UserCheck className="h-6 w-6 text-amber-400 mb-3" />
          <h4 className="text-sm font-bold text-white mb-1">Verifying Requests Desk</h4>
          <p className="text-xs text-slate-400 mb-3">Self-registered Agents & Operators approval queue.</p>
          <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
            Review Queue <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all">
          <Layers className="h-6 w-6 text-indigo-400 mb-3" />
          <h4 className="text-sm font-bold text-white mb-1">Service & Form Builder</h4>
          <p className="text-xs text-slate-400 mb-3">Create services, set percentage shares, and edit dynamic fields.</p>
          <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
            Manage Services <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all">
          <Users className="h-6 w-6 text-emerald-400 mb-3" />
          <h4 className="text-sm font-bold text-white mb-1">Operator Add & Mapping</h4>
          <p className="text-xs text-slate-400 mb-3">Assign officers to specific district and ward jurisdictions.</p>
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
            Configure Mapping <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
