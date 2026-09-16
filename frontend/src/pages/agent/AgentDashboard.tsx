import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import {
  Wallet,
  CreditCard,
  FileText,
  Car,
  ShoppingBag,
  CheckSquare,
  Tractor,
  Layers,
  Award,
  HeartPulse,
  Landmark,
  BookOpen,
  Building2,
  BadgeCheck,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const AgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const services = [
    {
      id: 'wallet',
      title: 'Add Wallet',
      iconEmoji: '👛',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      icon: Wallet
    },
    {
      id: 'aadhaar',
      title: 'Aadhaar Services',
      iconEmoji: '🪪',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      icon: CreditCard
    },
    {
      id: 'pan',
      title: 'Pan Card Services',
      iconEmoji: '💳',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      icon: CreditCard
    },
    {
      id: 'driving',
      title: 'LL / DL / Vehical Services',
      iconEmoji: '🏍️',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: Car
    },
    {
      id: 'ration',
      title: 'Ration Services',
      iconEmoji: '🌾',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      icon: ShoppingBag
    },
    {
      id: 'voter',
      title: 'Voter Services',
      iconEmoji: '👆',
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      icon: CheckSquare
    },
    {
      id: 'farmer',
      title: 'Farmer Services',
      iconEmoji: '👨‍🌾',
      color: 'text-lime-600',
      bgColor: 'bg-lime-50',
      icon: Tractor
    },
    {
      id: 'samagra',
      title: 'MP Samagra Services',
      iconEmoji: '🇮🇳',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: Layers
    },
    {
      id: 'ration_parchi',
      title: 'MP Ration Parchi Services',
      iconEmoji: '📜',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      icon: FileText
    },
    {
      id: 'sambal',
      title: 'MP Sambal Services',
      iconEmoji: '🏆',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      icon: Award
    },
    {
      id: 'ayushman',
      title: 'Ayushman Services',
      iconEmoji: '🏥',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      icon: HeartPulse
    },
    {
      id: 'edistrict',
      title: 'MP eDistrict Services',
      iconEmoji: '🏛️',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      icon: Landmark
    },
    {
      id: 'passbook',
      title: 'Passbook Print Services',
      iconEmoji: '📖',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      icon: BookOpen
    },
    {
      id: 'gumasta',
      title: 'Gumasta License',
      iconEmoji: '🏢',
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      icon: Building2
    },
    {
      id: 'lms',
      title: 'LMS Certificate',
      iconEmoji: '📜',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      icon: Award
    },
    {
      id: 'udyam',
      title: 'Apply Udyam Certificate',
      iconEmoji: '⚙️',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      icon: BadgeCheck
    },
    {
      id: 'nseit',
      title: 'NSEIT RO Approve',
      iconEmoji: '🎯',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      icon: ShieldCheck
    },
    {
      id: 'gst',
      title: 'GST Registration',
      iconEmoji: '📑',
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      icon: Zap
    }
  ];

  return (
    <DashboardLayout>
      {/* 1. Greeting Title Bar */}
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-slate-800">
          Hi, <span className="text-slate-900 font-bold">{user?.full_name || 'vijay'}</span>
        </h2>
      </div>

      {/* 2. Hero Promotional Banner (Matching reference image) */}
      <div className="mb-5 rounded-lg bg-gradient-to-r from-[#d9f99d]/60 via-[#bbf7d0]/60 to-[#bae6fd]/60 border border-[#86efac]/80 p-4 sm:p-5 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-base sm:text-xl font-black text-[#0f5132] tracking-tight">
            WE HELP YOU – <span className="text-[#198754]">NO GOVT TROUBLES!</span>
          </h1>
          <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
            Safe, Secure & Affordable Services at Minimal Cost
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-700 mt-2">
            <span className="flex items-center gap-1 text-[#0f5132]">
              <span className="text-[#198754] font-bold">✔</span> No Govt Complications
            </span>
            <span className="flex items-center gap-1 text-[#0f5132]">
              <span className="text-[#198754] font-bold">✔</span> Only Minimal Charges
            </span>
            <span className="flex items-center gap-1 text-[#0f5132]">
              <span className="text-[#198754] font-bold">✔</span> Reliable Customer Assistance
            </span>
            <span className="text-[#198754] font-bold">& MORE...</span>
          </div>
        </div>

        {/* Right Badge */}
        <div className="bg-[#15803d] text-white px-3 py-1.5 rounded text-[11px] font-black uppercase tracking-wider shadow shrink-0 self-start md:self-center">
          FAST SUPPORT | MINIMAL CHARGES
        </div>
      </div>

      {/* 3. 18 Citizen Services Grid (Matching Screenshot White Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
        {services.map((service) => {
          return (
            <div
              key={service.id}
              onClick={() => setSelectedService(service.title)}
              className="bg-white rounded-lg p-4 text-center border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-150 cursor-pointer flex flex-col items-center justify-between min-h-[125px] group"
            >
              {/* Service Icon Area */}
              <div className="h-12 w-12 flex items-center justify-center text-3xl mb-2 group-hover:scale-110 transition-transform">
                <span>{service.iconEmoji}</span>
              </div>

              {/* Service Title */}
              <h4 className="text-xs font-semibold text-slate-700 leading-snug group-hover:text-[#1565c0] transition-colors">
                {service.title}
              </h4>
            </div>
          );
        })}
      </div>

      {/* 5. Service Selection Modal / Toast Placeholder */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center animate-in fade-in zoom-in duration-150">
            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{selectedService}</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Is service ke dynamic form aur area routing ko open karein.
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2 mb-6 text-slate-700">
              <p className="flex justify-between font-medium">
                <span>Estimated Processing Time:</span>
                <strong className="text-emerald-700">2-4 Hours</strong>
              </p>
              <p className="flex justify-between font-medium">
                <span>Service Mode:</span>
                <strong>Auto-Assigned to Area Officer</strong>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedService(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Starting ${selectedService} application flow!`);
                  setSelectedService(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
              >
                Continue Application
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AgentDashboard;
