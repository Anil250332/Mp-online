import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  IdCard,
  Award,
  Plus
} from 'lucide-react';

export const AgentDashboard: React.FC = () => {
  return (
    <DashboardLayout
      title="MP Online Kiosk Dashboard"
      subtitle="Quick service application, live tracking, and instant delivery"
      roleBadge="MP Online Agent"
      badgeColor="bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
    >
      {/* Announcement Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-emerald-950/80 border border-indigo-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400">
            <IdCard className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Fast Service Alert</h4>
            <p className="text-xs text-slate-300">Samagra ID Member Add & MP e-District certificates live hain. Avg turnaround time: 2-4 hours.</p>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Today's Apps</span>
            <FileText className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white">0</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Processing</span>
            <Clock className="h-4 w-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-sky-400">0</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Correction Needed</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">0</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">0</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Rejected</span>
            <XCircle className="h-4 w-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400">0</p>
        </div>
      </div>

      {/* Quick Services Grid */}
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
        Popular Citizen Services
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Samagra Service Card */}
        <div className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 p-5 rounded-2xl transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
              <IdCard className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md">
              From ₹ 50
            </span>
          </div>
          <h4 className="text-base font-bold text-white mb-1">Samagra ID Services</h4>
          <p className="text-xs text-slate-400 mb-4">Member Add, e-KYC Name/DOB update, Split Family ID.</p>
          <button className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
            <Plus className="h-3.5 w-3.5" />
            <span>Apply Request</span>
          </button>
        </div>

        {/* e-District Service Card */}
        <div className="bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 p-5 rounded-2xl transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-105 transition-transform">
              <FileText className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md">
              From ₹ 80
            </span>
          </div>
          <h4 className="text-base font-bold text-white mb-1">MP e-District Certificates</h4>
          <p className="text-xs text-slate-400 mb-4">Income (Aay), Domicile (Moolniwasi), Caste (Jati) certificate.</p>
          <button className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors">
            <Plus className="h-3.5 w-3.5" />
            <span>Apply Request</span>
          </button>
        </div>

        {/* Sambal Card Service */}
        <div className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 p-5 rounded-2xl transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <Award className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md">
              From ₹ 60
            </span>
          </div>
          <h4 className="text-base font-bold text-white mb-1">Sambal 2.0 Card</h4>
          <p className="text-xs text-slate-400 mb-4">New Sambal Registration & Download card.</p>
          <button className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">
            <Plus className="h-3.5 w-3.5" />
            <span>Apply Request</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentDashboard;
