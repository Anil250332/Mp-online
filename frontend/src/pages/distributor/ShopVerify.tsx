import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { shopStore } from '../../services/shopStore';
import type { Shop } from '../../services/shopStore';
import { useAppDispatch, useAppSelector, selectShops, selectShopsStatus, isInitialLoading } from '../../store/hooks';
import { fetchShops } from '../../store/slices/shopsSlice';
import { ActionButton } from '../../components/ui/ActionButton';
import { SkeletonCards } from '../../components/ui/Skeleton';
import { useKeyedAsyncAction } from '../../hooks/useAsyncAction';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Store,
  User,
  Phone,
  Mail,
  CreditCard,
  AlertTriangle,
  X
} from 'lucide-react';

export default function ShopVerify() {
  const dispatch = useAppDispatch();
  const allShops = useAppSelector(selectShops);
  const shopsStatus = useAppSelector(selectShopsStatus);
  // Redux state frozen hai — filter naya array deta hai, objects mutate nahi karte
  const pendingShops = useMemo(() => allShops.filter(s => s.status === 'PENDING'), [allShops]);
  const isShopsLoading = isInitialLoading(shopsStatus, allShops.length);
  const [selectedRejectShop, setSelectedRejectShop] = useState<Shop | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [actionErrorMsg, setActionErrorMsg] = useState('');
  const [rejectErrorMsg, setRejectErrorMsg] = useState('');
  // Har shop row ke approve / reject ka alag 3-stage state
  const rowAction = useKeyedAsyncAction();

  useEffect(() => {
    dispatch(fetchShops());
  }, [dispatch]);

  // Distributor apne network ke self-registered (agent) shops ko seedha approve / reject kar sakta hai
  const handleApprove = (shop: Shop) => {
    setActionErrorMsg('');
    rowAction.run(`approve-${shop.id}`, async () => {
      try {
        await shopStore.approveShop(shop.id);
        setActionSuccessMsg(`Shop "${shop.shopName}" verified & activated successfully!`);
        setTimeout(() => setActionSuccessMsg(''), 3000);
      } catch (err: any) {
        setActionErrorMsg(err.message || 'Failed to verify shop.');
        throw err;
      }
    });
  };

  const openRejectModal = (shop: Shop) => {
    setRejectErrorMsg('');
    setSelectedRejectShop(shop);
  };

  const handleConfirmReject = () => {
    if (!selectedRejectShop) return;
    const shop = selectedRejectShop;
    setRejectErrorMsg('');
    rowAction.run(`reject-${shop.id}`, async () => {
      try {
        await shopStore.rejectShop(shop.id);
        setActionSuccessMsg(`Registration request for "${shop.shopName}" rejected.`);
        setSelectedRejectShop(null);
        setTimeout(() => setActionSuccessMsg(''), 3000);
      } catch (err: any) {
        setRejectErrorMsg(err.message || 'Failed to reject shop.');
        throw err;
      }
    });
  };

  const isRowBusy = (id: string) =>
    rowAction.stateOf(`approve-${id}`) === 'loading' || rowAction.stateOf(`reject-${id}`) === 'loading';

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-amber-600" />
              <span>Verify Shop Registrations</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Verify self-registered partner shop applications and approve / reject them directly.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-center">
            <span className="text-xs font-semibold text-amber-700 block">Pending Verification</span>
            <span className="text-lg font-black text-amber-900">{isShopsLoading ? '—' : pendingShops.length} Requests</span>
          </div>
        </div>

        {/* Global Action Message Banner */}
        {actionSuccessMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {actionErrorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
            <span>{actionErrorMsg}</span>
          </div>
        )}

        {/* Pending Requests List */}
        {isShopsLoading ? (
          <SkeletonCards count={3} />
        ) : pendingShops.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
            <div className="h-14 w-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">All Registration Requests Verified!</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are currently no pending self-registration shop applications in your district queue.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingShops.map((shop) => (
              <div key={shop.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-blue-300 transition-all">
                
                {/* Top Title & Badge */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
                      <Store className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">{shop.shopName}</h2>
                      <span className="text-xs text-slate-400 font-mono">Ref: {shop.shopCode} • Submitted {shop.createdAt}</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    <Clock className="h-3 w-3" /> PENDING VERIFICATION
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-400 text-xs font-medium block">Owner Full Name</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 mt-0.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>{shop.ownerName}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-xs font-medium block">WhatsApp Mobile</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 mt-0.5 font-mono">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{shop.mobile}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-xs font-medium block">Email Address</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 mt-0.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>{shop.email}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-xs font-medium block">Aadhaar Number</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 mt-0.5 font-mono">
                      <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                      <span>{shop.aadhaar}</span>
                    </div>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-4 pt-2 border-t border-slate-200/60">
                    <span className="text-slate-400 text-xs font-medium block">Full Address</span>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{shop.address}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => openRejectModal(shop)}
                    disabled={isRowBusy(shop.id)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>Reject</span>
                  </button>

                  <ActionButton
                    state={rowAction.stateOf(`approve-${shop.id}`)}
                    onClick={() => handleApprove(shop)}
                    disabled={rowAction.stateOf(`reject-${shop.id}`) === 'loading'}
                    loadingText="Verifying..."
                    successText="Approved!"
                    errorText="Failed"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Verify & Approve Shop</span>
                  </ActionButton>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Reject Confirmation Modal */}
        {selectedRejectShop && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 relative animate-in fade-in zoom-in-95">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span>Reject Registration Request</span>
                </div>
                <button
                  onClick={() => setSelectedRejectShop(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600">
                Are you sure you want to reject the self-registration request for <strong>"{selectedRejectShop.shopName}"</strong>?
              </p>

              {rejectErrorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                  <span>{rejectErrorMsg}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRejectShop(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <ActionButton
                  state={rowAction.stateOf(`reject-${selectedRejectShop.id}`)}
                  onClick={handleConfirmReject}
                  loadingText="Rejecting..."
                  successText="Rejected"
                  errorText="Failed"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  Confirm Reject
                </ActionButton>
              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
