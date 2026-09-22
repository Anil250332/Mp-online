import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { serviceTaskStore } from '../../services/serviceTaskStore';
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
  User
} from 'lucide-react';

export default function OperatorWallet() {
  const { user } = useAuth();
  const [walletData, setWalletData] = useState(serviceTaskStore.getOperatorWallet());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Withdrawal Form State
  const [amount, setAmount] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('State Bank of India');
  const [accountNo, setAccountNo] = useState('');
  const [confirmAccountNo, setConfirmAccountNo] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    const sync = () => {
      setWalletData(serviceTaskStore.getOperatorWallet());
    };

    sync();
    const unsubscribe = serviceTaskStore.subscribe(sync);
    return unsubscribe;
  }, []);

  const handleOpenWithdrawalModal = () => {
    setErrorMsg('');
    setAmount('');
    setAccountHolderName(user?.full_name || 'Ramesh Kumar Verma');
    setAccountNo('');
    setConfirmAccountNo('');
    setIfsc('');
    setUpiId('');
    setIsModalOpen(true);
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setErrorMsg('Please enter a valid withdrawal amount.');
      return;
    }

    if (val > walletData.balance) {
      setErrorMsg(`Insufficient wallet balance. Available: ₹ ${walletData.balance.toLocaleString()}`);
      return;
    }

    if (!accountHolderName.trim()) {
      setErrorMsg('Please enter Bank Account Holder Name.');
      return;
    }

    if (!accountNo.trim() || !ifsc.trim()) {
      setErrorMsg('Please enter complete Bank Account Number and IFSC Code.');
      return;
    }

    if (accountNo.trim() !== confirmAccountNo.trim()) {
      setErrorMsg('Account Number and Confirm Account Number do not match!');
      return;
    }

    const req = serviceTaskStore.submitWithdrawal({
      operatorName: user?.full_name || 'Ramesh Kumar Verma',
      accountHolderName: accountHolderName.trim(),
      mobile: user?.mobile || '9876543210',
      bankName,
      accountNo: accountNo.trim(),
      ifsc: ifsc.trim().toUpperCase(),
      upiId: upiId.trim() || undefined,
      amount: val
    });

    setSuccessMsg(`Withdrawal Request "${req.reqNo}" for ₹ ${val.toLocaleString()} submitted successfully!`);
    setIsModalOpen(false);
    setTimeout(() => setSuccessMsg(''), 4500);
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

          <button
            onClick={handleOpenWithdrawalModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Submit Withdrawal Request</span>
          </button>
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
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight">
              ₹ {walletData.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-emerald-300">
              Earnings credited instantly upon completing service tasks.
            </p>
          </div>

          <button
            onClick={handleOpenWithdrawalModal}
            className="relative z-10 bg-white text-emerald-900 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md hover:bg-emerald-50 transition-all cursor-pointer"
          >
            Request Payout
          </button>

          {/* Decorative Circle Background */}
          <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
        </div>

        {/* Transaction History Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">
              Wallet Transaction History ({walletData.txns.length})
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
                {walletData.txns.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 text-xs">
                      No wallet transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  walletData.txns.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          t.type === 'EARNING'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {t.type === 'EARNING' ? <ArrowDownLeft className="h-3 w-3 text-emerald-600" /> : <ArrowUpRight className="h-3 w-3 text-amber-600" />}
                          {t.type}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {t.description}
                        {t.refNo && <span className="text-[11px] text-blue-700 font-mono block mt-0.5">{t.refNo}</span>}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {t.dateTime}
                      </td>

                      <td className={`py-3.5 px-4 text-right font-mono font-bold text-sm ${
                        t.type === 'EARNING' ? 'text-emerald-700' : 'text-slate-900'
                      }`}>
                        {t.type === 'EARNING' ? '+' : '-'} ₹ {t.amount.toLocaleString()}
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
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 relative animate-in fade-in zoom-in-95">
              
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
                    placeholder={`Available: ₹ ${walletData.balance}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono font-bold"
                    required
                  />
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
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      required
                    />
                  </div>
                </div>

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
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      required
                    />
                  </div>
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
                        onChange={(e) => setAccountNo(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                        required
                      />
                    </div>
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
                        onChange={(e) => setConfirmAccountNo(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        onChange={(e) => setIfsc(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono uppercase"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      UPI ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 9876543210@paytm"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                    />
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
                  <button
                    type="submit"
                    className="px-4.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
                  >
                    Submit Withdrawal Request
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
