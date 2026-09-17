import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { shopStore } from '../../services/shopStore';
import type { Shop } from '../../services/shopStore';
import {
  UserX,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle2,
  Phone
} from 'lucide-react';

export default function ShopDeleteRequest() {
  const [activeShops, setActiveShops] = useState<Shop[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState('');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const updateShops = () => {
      const all = shopStore.getShops();
      setActiveShops(all.filter(s => s.status === 'ACTIVE'));
    };

    updateShops();
    const unsubscribe = shopStore.subscribe(updateShops);
    return unsubscribe;
  }, []);

  const handleOpenDialog = (shopId?: string) => {
    setErrorMsg('');
    setReason('');
    setSelectedShopId(shopId || (activeShops.length > 0 ? activeShops[0].id : ''));
    setIsDialogOpen(true);
  };

  const handleSubmitDeleteRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedShopId) {
      setErrorMsg('Please select a shop to delete.');
      return;
    }

    if (!reason.trim()) {
      setErrorMsg('Please enter a mandatory reason for requesting deletion.');
      return;
    }

    const shop = activeShops.find(s => s.id === selectedShopId);
    shopStore.requestDeletion(selectedShopId, reason);

    setSuccessMsg(`Deletion request for "${shop?.shopName || 'Shop'}" submitted successfully to Admin!`);
    setIsDialogOpen(false);
    setReason('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <UserX className="h-6 w-6 text-red-600" />
              <span>Delete Shop Request</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Submit a formal request to Super Admin for deactivating or removing a non-performing shop.
            </p>
          </div>

          <button
            onClick={() => handleOpenDialog()}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Submit Delete Request</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Active Shops Directory Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-800">Your Active Network Shops ({activeShops.length})</h2>
            <p className="text-xs text-slate-500">Select any active shop to request deletion from Admin</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Shop Details</th>
                  <th className="py-3 px-4">Owner Name</th>
                  <th className="py-3 px-4">Mobile Number</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {activeShops.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                      No active shops available for deletion request.
                    </td>
                  </tr>
                ) : (
                  activeShops.map((shop) => (
                    <tr key={shop.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{shop.shopName}</div>
                        <div className="text-[11px] text-blue-700 font-mono">{shop.shopCode}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {shop.ownerName}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{shop.mobile}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {shop.address}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenDialog(shop.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 justify-end ml-auto"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Request Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Request Dialog / Modal */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 relative animate-in fade-in zoom-in-95">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  <span>Request Shop Deletion</span>
                </div>
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitDeleteRequest} className="space-y-4">
                
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Shop Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Shop to Request Deletion *
                  </label>
                  <select
                    value={selectedShopId}
                    onChange={(e) => setSelectedShopId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  >
                    {activeShops.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.shopName} ({shop.ownerName} - {shop.mobile})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reason Textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mandatory Reason for Deletion *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide detailed explanation for requesting shop removal..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDialogOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                  >
                    Submit Request to Admin
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
