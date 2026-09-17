import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { shopStore } from '../../services/shopStore';
import type { Shop } from '../../services/shopStore';
import {
  Store,
  CheckCircle2,
  Clock,
  Trash2,
  Search,
  Phone,
  Mail
} from 'lucide-react';

export default function AdminShops() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'DELETE_REQUESTS'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const updateShops = () => {
      setShops(shopStore.getShops());
    };

    updateShops();
    const unsubscribe = shopStore.subscribe(updateShops);
    return unsubscribe;
  }, []);

  // Filtered Shops per Tab
  const getTabShops = () => {
    switch (activeTab) {
      case 'APPROVED':
        return shops.filter(s => s.status === 'ACTIVE');
      case 'PENDING':
        return shops.filter(s => s.status === 'PENDING');
      case 'DELETE_REQUESTS':
        return shops.filter(s => s.status === 'DELETE_REQUESTED');
      case 'ALL':
      default:
        return shops;
    }
  };

  const filteredShops = getTabShops().filter(s =>
    s.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.mobile.includes(searchTerm) ||
    s.shopCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleApprovePending = (shop: Shop) => {
    shopStore.approveShop(shop.id);
    setSuccessMsg(`Shop "${shop.shopName}" approved & activated!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleApproveDeletion = (shop: Shop) => {
    shopStore.approveDeletion(shop.id);
    setSuccessMsg(`Deletion approved for "${shop.shopName}". Shop deactivated & login blocked!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleRejectPending = (shop: Shop) => {
    shopStore.rejectShop(shop.id);
    setSuccessMsg(`Registration request for "${shop.shopName}" rejected.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Store className="h-6 w-6 text-blue-600" />
              <span>Super Admin - Master Shop Management</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Control shop registrations, partner verification requests, and distributor deletion requests.
            </p>
          </div>
        </div>

        {/* Action Message Banner */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 4 Tabs Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center gap-2">
          
          <button
            onClick={() => setActiveTab('ALL')}
            className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Store className="h-4 w-4" />
            <span>All Shops ({shops.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('APPROVED')}
            className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'APPROVED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Approved Shops ({shops.filter(s => s.status === 'ACTIVE').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PENDING')}
            className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'PENDING'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Pending Shops ({shops.filter(s => s.status === 'PENDING').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('DELETE_REQUESTS')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'DELETE_REQUESTS'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Shop Requests ({shops.filter(s => s.status === 'DELETE_REQUESTED').length})</span>
          </button>

        </div>

        {/* Search Input */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="relative w-full">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search shops by Name, Owner, Mobile, or Code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Tab Content Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                  <th className="py-3.5 px-4">Shop Details</th>
                  <th className="py-3.5 px-4">Owner Name</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Address</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredShops.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      No shops found in this category.
                    </td>
                  </tr>
                ) : (
                  filteredShops.map((shop) => (
                    <tr key={shop.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-blue-700 text-xs block">{shop.shopCode}</span>
                        <span className="font-bold text-slate-900 text-sm">{shop.shopName}</span>
                        {shop.deleteReason && (
                          <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded-lg text-red-800 text-[11px]">
                            <strong>Reason:</strong> {shop.deleteReason}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {shop.ownerName}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-700 flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{shop.mobile}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3 text-slate-400" />
                          <span>{shop.email}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate font-medium">
                        {shop.address}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          shop.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : shop.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : shop.status === 'DELETE_REQUESTED'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {shop.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        {/* Actions for PENDING Tab */}
                        {shop.status === 'PENDING' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleRejectPending(shop)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApprovePending(shop)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-xs"
                            >
                              Approve & Activate
                            </button>
                          </div>
                        )}

                        {/* Actions for DELETE_REQUESTED Tab */}
                        {shop.status === 'DELETE_REQUESTED' && (
                          <button
                            onClick={() => handleApproveDeletion(shop)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 justify-end ml-auto"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Approve Deletion (Deactivate Shop)</span>
                          </button>
                        )}

                        {/* Status label & actions for ACTIVE */}
                        {shop.status === 'ACTIVE' && (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[11px] font-semibold text-emerald-600">Operational</span>
                            <button
                              onClick={() => handleRejectPending(shop)}
                              className="bg-red-50 hover:bg-red-100 text-red-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-red-200 transition-colors"
                            >
                              Deactivate
                            </button>
                          </div>
                        )}

                        {/* Status label & action button for INACTIVE */}
                        {shop.status === 'INACTIVE' && (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[11px] font-semibold text-slate-400">Login Blocked</span>
                            <button
                              onClick={() => handleApprovePending(shop)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-xs transition-colors"
                            >
                              Activate Shop
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
