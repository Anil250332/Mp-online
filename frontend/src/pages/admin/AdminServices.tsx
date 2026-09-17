import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { serviceStore, type ServiceItem } from '../../services/serviceStore';
import {
  Layers,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export default function AdminServices() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add Service Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [fee, setFee] = useState('50');
  const [category, setCategory] = useState('Citizen Services');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const update = () => {
      setServices(serviceStore.getServices());
    };
    update();
    const unsubscribe = serviceStore.subscribe(update);
    return unsubscribe;
  }, []);

  const handleAddServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !description.trim()) {
      setErrorMsg('Please enter Service Name and Description.');
      return;
    }

    const feeAmt = parseFloat(fee);
    if (isNaN(feeAmt) || feeAmt <= 0) {
      setErrorMsg('Please enter a valid positive service fee.');
      return;
    }

    serviceStore.addService({
      name,
      fee: feeAmt,
      description,
      category
    });

    setSuccessMsg(`New Service "${name}" created & published successfully!`);
    setName('');
    setDescription('');
    setTimeout(() => {
      setIsModalOpen(false);
      setSuccessMsg('');
    }, 2500);
  };

  const handleToggleStatus = (service: ServiceItem) => {
    serviceStore.toggleService(service.id);
    setSuccessMsg(`Service "${service.name}" status toggled!`);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Layers className="h-6 w-6 text-blue-600" />
              <span>Master Services Catalog Management (Admin / Manager)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Create, edit, set agent service fees, and toggle availability of MP Online & Citizen Services.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 shrink-0"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create New Service</span>
          </button>
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
              placeholder="Search services by Code, Name, or Category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Services Master Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                  <th className="py-3.5 px-4">Service Code & Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-right">Service Fee (₹)</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      No services found matching search query.
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((service) => (
                    <tr key={service.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-blue-700 text-xs block">{service.code}</span>
                        <span className="font-bold text-slate-900">{service.name}</span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {service.category}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate text-xs">
                        {service.description}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        ₹{service.fee.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          service.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {service.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(service)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 ${
                            service.isActive
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          {service.isActive ? (
                            <>
                              <ToggleLeft className="h-4 w-4 text-slate-500" />
                              <span>Disable</span>
                            </>
                          ) : (
                            <>
                              <ToggleRight className="h-4 w-4" />
                              <span>Enable</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Service Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 relative animate-in fade-in zoom-in-95">

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                  <Layers className="h-5 w-5 text-blue-600" />
                  <span>Create New Service</span>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
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

              <form onSubmit={handleAddServiceSubmit} className="space-y-4">

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Samagra E-KYC Service"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Service Fee (₹) *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Category *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Identity Services"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Detailed Description *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief summary of what this service offers..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                  >
                    Create & Publish Service
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
