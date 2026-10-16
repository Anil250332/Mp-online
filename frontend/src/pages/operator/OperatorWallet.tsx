import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import { useAppDispatch, useAppSelector, selectWalletBalance, selectWalletTransactions, selectWalletStatus, isInitialLoading } from '../../store/hooks';
import { fetchWallet } from '../../store/slices/walletSlice';
import { getApiErrorMessage } from '../../store/apiError';
import { ActionButton } from '../../components/ui/ActionButton';
import { Skeleton, SkeletonTableRows } from '../../components/ui/Skeleton';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  CheckCircle2,
  X,
  AlertTriangle,
  Building,
  CreditCard,
  Hash,
  User,
  RefreshCw,
  Clock,
  ShieldCheck,
  XCircle
} from 'lucide-react';

interface MyWithdrawal {
  id: string;
  reqNo: string;
  amount: number;
  paymentMode: string;
  status: string;
  utrNo?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
}

// 2-tier payout status ka operator-friendly label
const withdrawalBadge = (status: string) => {
  const s = (status || '').toUpperCase();
  if (s === 'PROCESSED' || s === 'APPROVED') return { label: 'PAID', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="h-3 w-3" /> };
  if (s === 'MANAGER_VERIFIED') return { label: 'VERIFIED - AWAITING PAYOUT', cls: 'bg-blue-50 text-blue-700 border-blue-200', icon: <ShieldCheck className="h-3 w-3" /> };
  if (s === 'PENDING') return { label: 'PENDING VERIFICATION', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock className="h-3 w-3" /> };
  return { label: 'REJECTED (REFUNDED)', cls: 'bg-red-50 text-red-700 border-red-200', icon: <XCircle className="h-3 w-3" /> };
};

export default function OperatorWallet() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  // Wallet balance & ledger Redux se (header balance bhi same source)
  const balance = useAppSelector(selectWalletBalance);
  const txns = useAppSelector(selectWalletTransactions);
  const walletStatus = useAppSelector(selectWalletStatus);
  const isWalletLoading = isInitialLoading(walletStatus, txns.length);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const submitAction = useAsyncAction();

  // Meri withdrawal requests (2-tier status tracking)
  const [myRequests, setMyRequests] = useState<MyWithdrawal[]>([]);
  const [isRequestsLoading, setIsRequestsLoading] = useState(true);

  // Withdrawal Form State
  const [paymentMode, setPaymentMode] = useState<'bank_transfer' | 'upi'>('bank_transfer');
  const [amount, setAmount] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('State Bank of India');
  const [accountNo, setAccountNo] = useState('');
  const [confirmAccountNo, setConfirmAccountNo] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [upiId, setUpiId] = useState('');

  interface FieldErrors {
    amount?: string;
    accountHolderName?: string;
    bankName?: string;
    accountNo?: string;
    confirmAccountNo?: string;
    ifsc?: string;
    upiId?: string;
  }

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const fetchMyRequests = useCallback(async () => {
    try {
      const res = await apiClient.get('/wallet/withdrawals');
      if (res.data.status === 'success' && Array.isArray(res.data.data)) setMyRequests(res.data.data);
    } catch (e) {
      console.error('Failed to fetch withdrawal requests:', e);
    } finally {
      setIsRequestsLoading(false);
    }
  }, []);

  const syncWallet = useCallback(async () => {
    await Promise.all([dispatch(fetchWallet()), fetchMyRequests()]);
  }, [dispatch, fetchMyRequests]);

  useEffect(() => {
    syncWallet();
  }, [syncWallet]);

  const handleOpenWithdrawalModal = () => {
    setErrorMsg('');
    setFieldErrors({});
    setAmount('');
    setAccountHolderName(user?.full_name || '');
    setPaymentMode('bank_transfer');
    setAccountNo('');
    setConfirmAccountNo('');
    setIfsc('');
    setUpiId('');
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    const val = parseFloat(amount);

    if (!amount || isNaN(val) || val <= 0) {
      errors.amount = 'Valid withdrawal amount enter karein.';
    } else if (val > balance) {
      errors.amount = `Insufficient wallet balance! Maximum available: ₹ ${balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    } else if (val < 10) {
      errors.amount = 'Minimum withdrawal amount ₹ 10.00 hai.';
    }

    if (!accountHolderName.trim()) {
      errors.accountHolderName = 'Account holder name required hai.';
    } else if (accountHolderName.trim().length < 3) {
      errors.accountHolderName = 'Account holder name kam se kam 3 letters ka hona chahiye.';
    } else if (!/^[\p{L}\p{M}\s.]+$/u.test(accountHolderName.trim())) {
      errors.accountHolderName = 'Name me sirf alphabets aur spaces allowed hain.';
    }

    const cleanUpi = upiId.trim();
    const upiValid = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(cleanUpi);

    // UPI mode me bank details zaroori nahi
    if (paymentMode === 'upi') {
      if (!cleanUpi) errors.upiId = 'UPI ID required hai.';
      else if (!upiValid) errors.upiId = 'Invalid UPI ID format! Example: 9876543210@paytm';
      setFieldErrors(errors);
      return Object.keys(errors).length === 0;
    }

    if (!bankName.trim()) {
      errors.bankName = 'Bank name required hai.';
    }

    const cleanAccNo = accountNo.trim();
    if (!cleanAccNo) {
      errors.accountNo = 'Account number required hai.';
    } else if (!/^\d{9,18}$/.test(cleanAccNo)) {
      errors.accountNo = 'Sahi Bank Account number (9-18 digits) enter karein.';
    }

    const cleanConfirmAccNo = confirmAccountNo.trim();
    if (!cleanConfirmAccNo) {
      errors.confirmAccountNo = 'Confirm account number required hai.';
    } else if (cleanAccNo && cleanConfirmAccNo !== cleanAccNo) {
      errors.confirmAccountNo = 'Account number aur Confirm account number match nahi kar rahe hain!';
    }

    const cleanIfsc = ifsc.trim().toUpperCase();
    if (!cleanIfsc) {
      errors.ifsc = 'IFSC code required hai.';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
      errors.ifsc = 'Invalid IFSC code! Example: SBIN0001234 (11 chars, 5th char 0).';
    }

    if (cleanUpi && !upiValid) {
      errors.upiId = 'Invalid UPI ID format! Example: 9876543210@paytm';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateForm()) {
      setErrorMsg('Kripya form ki sabhi validation errors ko fix karein.');
      return;
    }

    const val = parseFloat(amount);
    const isUpi = paymentMode === 'upi';
    submitAction.run(async () => {
      try {
        const res = await apiClient.post('/wallet/withdraw', {
          amount: val,
          accountHolderName: accountHolderName.trim(),
          bankName: isUpi ? undefined : bankName.trim(),
          accountNo: isUpi ? undefined : accountNo.trim(),
          ifscCode: isUpi ? undefined : ifsc.trim().toUpperCase(),
          upiId: upiId.trim() || undefined,
          paymentMode
        });

        if (res.data.status !== 'success') {
          setErrorMsg(res.data.message || 'Failed to submit withdrawal request.');
          return false;
        }
        const reqNo = res.data.data?.reqNo || 'WDR-REQ';
        setSuccessMsg(`Withdrawal Request "${reqNo}" for ₹ ${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })} submitted! Manager verification ke baad Admin payout release karega.`);
        setIsModalOpen(false);
        await syncWallet();
        setTimeout(() => setSuccessMsg(''), 6000);
      } catch (err) {
        setErrorMsg(getApiErrorMessage(err, 'Server error while submitting withdrawal.'));
        throw err;
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Wallet className="h-6 w-6 text-emerald-600" />
              <span>Operator Wallet & Earnings Desk</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track earnings accumulated from service executions and request payouts to your bank account.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={syncWallet}
              disabled={walletStatus === 'loading'}
              className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 text-emerald-600 ${walletStatus === 'loading' ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleOpenWithdrawalModal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Submit Withdrawal Request</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Balance Card Widget */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 relative z-10">
            <span className="text-xs text-emerald-200 uppercase font-bold tracking-widest block">
              Available Operator Wallet Balance
            </span>
            {isWalletLoading ? (
              <Skeleton className="h-10 w-48 bg-white/20!" />
            ) : (
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight">
                ₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
            <p className="text-xs text-emerald-300">
              Earnings credited instantly upon task verification by Admin/Manager.
            </p>
          </div>

          <button
            onClick={handleOpenWithdrawalModal}
            className="relative z-10 bg-white text-emerald-900 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md hover:bg-emerald-50 transition-all cursor-pointer"
          >
            Request Payout
          </button>

          <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
        </div>

        {/* My Withdrawal Requests (2-tier status) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-800">
              My Withdrawal Requests ({isRequestsLoading ? '…' : myRequests.length})
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Pending → Manager Verified → Paid (UTR ke saath)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Request No</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {isRequestsLoading ? (
                  <SkeletonTableRows rows={3} cols={5} />
                ) : myRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">Abhi tak koi withdrawal request nahi.</td>
                  </tr>
                ) : (
                  myRequests.map(r => {
                    const badge = withdrawalBadge(r.status);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono text-xs font-bold text-emerald-700">
                          {r.reqNo}
                          {r.utrNo && <span className="block text-[10px] text-slate-500 font-medium">UTR: {r.utrNo}</span>}
                          {r.rejectionReason && <span className="block text-[10px] text-red-600 font-medium font-sans">Reason: {r.rejectionReason}</span>}
                        </td>
                        <td className="py-3 px-4 text-xs uppercase text-slate-600">{r.paymentMode === 'upi' ? 'UPI' : 'Bank'}</td>
                        <td className="py-3 px-4 text-xs text-slate-500">{r.createdAt}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.cls}`}>
                            {badge.icon}
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          ₹ {Number(r.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction History Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">
              Wallet Transaction History ({isWalletLoading ? '…' : txns.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {isWalletLoading ? (
                  <SkeletonTableRows rows={5} cols={4} />
                ) : txns.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 text-xs">
                      No wallet transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  txns.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          t.type === 'CREDIT'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {t.type === 'CREDIT' ? <ArrowDownLeft className="h-3 w-3 text-emerald-600" /> : <ArrowUpRight className="h-3 w-3 text-amber-600" />}
                          {t.type}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {t.remarks || t.category}
                        {t.txnNo && <span className="text-[11px] text-blue-700 font-mono block mt-0.5">{t.txnNo}</span>}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {t.createdAt}
                      </td>

                      <td className={`py-3.5 px-4 text-right font-mono font-bold text-sm ${
                        t.type === 'CREDIT' ? 'text-emerald-700' : 'text-slate-900'
                      }`}>
                        {t.type === 'CREDIT' ? '+' : '-'} ₹ {Number(t.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Withdrawal Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 relative animate-in fade-in zoom-in-95 my-auto">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                  <Wallet className="h-5 w-5 text-emerald-600" />
                  <span>Request Bank Payout</span>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleWithdrawalSubmit} className="space-y-3.5">
                
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Withdrawal Amount (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder={`Available: ₹ ${balance.toFixed(2)}`}
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (fieldErrors.amount) setFieldErrors(prev => ({ ...prev, amount: undefined }));
                    }}
                    className={`w-full border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono font-bold ${
                      fieldErrors.amount ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 bg-slate-50'
                    }`}
                  />
                  {fieldErrors.amount && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />
                      <span>{fieldErrors.amount}</span>
                    </p>
                  )}
                </div>

                {/* Payment Mode: Bank Transfer ya UPI (UPI me bank details zaroori nahi) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Payout Mode *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['bank_transfer', 'upi'] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setPaymentMode(m);
                          setFieldErrors({});
                        }}
                        className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          paymentMode === m ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {m === 'upi' ? 'UPI Transfer' : 'Bank Transfer'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Account Holder Name (As per Bank) *
                  </label>
                  <div className="relative">
                    <User className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar Verma"
                      value={accountHolderName}
                      onChange={(e) => {
                        setAccountHolderName(e.target.value);
                        if (fieldErrors.accountHolderName) setFieldErrors(prev => ({ ...prev, accountHolderName: undefined }));
                      }}
                      className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                        fieldErrors.accountHolderName ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 bg-slate-50'
                      }`}
                    />
                  </div>
                  {fieldErrors.accountHolderName && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />
                      <span>{fieldErrors.accountHolderName}</span>
                    </p>
                  )}
                </div>

                {paymentMode === 'bank_transfer' && (
                <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Bank Name *
                  </label>
                  <div className="relative">
                    <Building className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. State Bank of India / HDFC Bank / ICICI Bank"
                      value={bankName}
                      onChange={(e) => {
                        setBankName(e.target.value);
                        if (fieldErrors.bankName) setFieldErrors(prev => ({ ...prev, bankName: undefined }));
                      }}
                      className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                        fieldErrors.bankName ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 bg-slate-50'
                      }`}
                    />
                  </div>
                  {fieldErrors.bankName && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />
                      <span>{fieldErrors.bankName}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Account Number *
                    </label>
                    <div className="relative">
                      <CreditCard className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. 38192019489"
                        value={accountNo}
                        onChange={(e) => {
                          setAccountNo(e.target.value);
                          if (fieldErrors.accountNo) setFieldErrors(prev => ({ ...prev, accountNo: undefined }));
                        }}
                        className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono ${
                          fieldErrors.accountNo ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 bg-slate-50'
                        }`}
                      />
                    </div>
                    {fieldErrors.accountNo && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />
                        <span>{fieldErrors.accountNo}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Confirm Account Number *
                    </label>
                    <div className="relative">
                      <CreditCard className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Re-enter Account No"
                        value={confirmAccountNo}
                        onChange={(e) => {
                          setConfirmAccountNo(e.target.value);
                          if (fieldErrors.confirmAccountNo) setFieldErrors(prev => ({ ...prev, confirmAccountNo: undefined }));
                        }}
                        className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono ${
                          fieldErrors.confirmAccountNo ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 bg-slate-50'
                        }`}
                      />
                    </div>
                    {fieldErrors.confirmAccountNo && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />
                        <span>{fieldErrors.confirmAccountNo}</span>
                      </p>
                    )}
                  </div>
                </div>

                </>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paymentMode === 'bank_transfer' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      IFSC Code *
                    </label>
                    <div className="relative">
                      <Hash className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. SBIN0001234"
                        value={ifsc}
                        onChange={(e) => {
                          setIfsc(e.target.value.toUpperCase());
                          if (fieldErrors.ifsc) setFieldErrors(prev => ({ ...prev, ifsc: undefined }));
                        }}
                        className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono uppercase ${
                          fieldErrors.ifsc ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 bg-slate-50'
                        }`}
                      />
                    </div>
                    {fieldErrors.ifsc && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />
                        <span>{fieldErrors.ifsc}</span>
                      </p>
                    )}
                  </div>
                  )}

                  <div className={paymentMode === 'upi' ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {paymentMode === 'upi' ? 'UPI ID *' : 'UPI ID (Optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 9876543210@paytm"
                      value={upiId}
                      onChange={(e) => {
                        setUpiId(e.target.value);
                        if (fieldErrors.upiId) setFieldErrors(prev => ({ ...prev, upiId: undefined }));
                      }}
                      className={`w-full border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono ${
                        fieldErrors.upiId ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 bg-slate-50'
                      }`}
                    />
                    {fieldErrors.upiId && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />
                        <span>{fieldErrors.upiId}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <ActionButton
                    type="submit"
                    state={submitAction.state}
                    loadingText="Submitting..."
                    successText="Submitted!"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md min-w-35"
                  >
                    <span>Submit Withdrawal Request</span>
                  </ActionButton>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
