import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { serviceStore, type ServiceItem } from '../../services/serviceStore';
import { walletStore } from '../../services/walletStore';
import {
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  UserCheck,
  Car,
  ShoppingBag,
  Vote,
  Tractor,
  FileText,
  Printer,
  Shield,
  HeartPulse,
  Building,
  Store,
  Award,
  Receipt
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  UserCheck,
  CreditCard,
  Car,
  ShoppingBag,
  Vote,
  Tractor,
  FileText,
  Printer,
  Shield,
  HeartPulse,
  Building,
  Store,
  Award,
  Receipt
};

export default function AgentServices() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [walletBalance, setWalletBalance] = useState<number>(500);

  // Modal State for Applying Service
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const update = () => {
      setServices(serviceStore.getActiveServices());
      setWalletBalance(walletStore.getBalance());
    };
    update();
    const unsub1 = serviceStore.subscribe(update);
    const unsub2 = walletStore.subscribe(update);
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const handleApplyService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    setErrorMsg('');
    setIsProcessing(true);

    const res = await walletStore.deductWallet(selectedService.fee, selectedService.name);
    setIsProcessing(false);

    if (res.success) {
      setSuccessMsg(`Service "${selectedService.name}" application submitted! ${res.message}`);
      setSelectedService(null);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(res.message);
    }
  };

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-6 w-6 text-blue-600" />
              <span>MP Online & Citizen Services Portal</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select and apply for government services. Service fee is automatically deducted from your shop wallet.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl text-center shrink-0">
            <span className="text-[10px] font-bold text-blue-700 uppercase block">Shop Wallet Balance</span>
            <span className="text-lg font-black text-blue-900">₹{walletBalance.toFixed(2)}</span>
          </div>
        </div>

        {/* Global Action Banner */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Search Input */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="relative w-full">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search services by Name, Category, or Description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
              No services found matching your search.
            </div>
          ) : (
            filteredServices.map((service) => {
              const IconComponent = (service.iconName && iconMap[service.iconName]) || Layers;

              return (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <IconComponent className="h-5 w-5" />
                      </div>

                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        Fee: ₹{service.fee.toFixed(2)}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {service.name}
                      </h3>
                      <span className="inline-block bg-slate-50 text-slate-600 border border-slate-200 text-[9px] font-bold px-2 py-0.2 rounded mt-1">
                        {service.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {service.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedService(service);
                      setErrorMsg('');
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Apply Service</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Apply Service Modal */}
        {selectedService && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 relative animate-in fade-in zoom-in-95">

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                  <Layers className="h-5 w-5 text-blue-600" />
                  <span>Apply - {selectedService.name}</span>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service Fee:</span>
                  <span className="font-bold text-slate-900">₹{selectedService.fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Your Current Wallet:</span>
                  <span className="font-bold text-blue-700">₹{walletBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-800">Remaining After Deduction:</span>
                  <span className={`font-bold ${walletBalance < selectedService.fee ? 'text-red-600' : 'text-emerald-600'}`}>
                    ₹{(walletBalance - selectedService.fee).toFixed(2)}
                  </span>
                </div>
              </div>

              <form onSubmit={handleApplyService} className="space-y-4">
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedService(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Deducting...' : `Pay ₹${selectedService.fee.toFixed(2)} & Submit`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
