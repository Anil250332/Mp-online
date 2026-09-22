import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { serviceTaskStore, type OperatorWithdrawalReq } from '../../services/serviceTaskStore';
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Building,
  User,
  Phone
} from 'lucide-react';

export default function AdminWithdrawalRequests() {
  const [requests, setRequests] = useState<OperatorWithdrawalReq[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'PAID' | 'REJECTED'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const sync = () => {
      setRequests(serviceTaskStore.getWithdrawalRequests());
    };

    sync();
    const unsubscribe = serviceTaskStore.subscribe(sync);
    return unsubscribe;
  }, []);

  const handleApprove = (req: OperatorWithdrawalReq) => {
    serviceTaskStore.approveWithdrawal(req.id);
    setSuccessMsg(`Payout of ₹ ${req.amount.toLocaleString()} for operator "${req.operatorName}" approved and marked as PAID!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleReject = (req: OperatorWithdrawalReq) => {
    serviceTaskStore.rejectWithdrawal(req.id);
    setSuccessMsg(`Withdrawal request "${req.reqNo}" rejected and funds refunded to operator's wallet.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const filtered = requests.filter(r => {
    const matchesTab = activeTab === 'ALL' || r.status === activeTab;
    const matchesSearch =
      r.reqNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.mobile.includes(searchTerm) ||
      r.bankName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Wallet className="h-6 w-6 text-emerald-600" />
              <span>Operator Withdrawal Requests (Admin & Manager)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Process wallet payout requests submitted by operators, verify bank accounts, and approve payouts.
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center gap-2">
          {(['PENDING', 'PAID', 'REJECTED', 'ALL'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[100px] py-2 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                activeTab === tab
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab} ({tab === 'ALL' ? requests.length : requests.filter(r => r.status === tab).length})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="relative w-full">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Request No, Operator Name, Mobile, or Bank Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Operator Bank Payout Queue ({filtered.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                  <th className="py-3.5 px-4">Request No & Amount</th>
                  <th className="py-3.5 px-4">Operator Details</th>
                  <th className="py-3.5 px-4">Bank Account Info</th>
                  <th className="py-3.5 px-4">Timestamps</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      No withdrawal requests found in this filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold text-emerald-700 block">{r.reqNo}</span>
                        <span className="text-base font-black text-slate-900">₹ {r.amount.toLocaleString()}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span>{r.operatorName}</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{r.mobile}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-slate-400" />
                          <span>{r.bankName}</span>
                        </div>
                        <div className="text-[11px] text-slate-700 font-medium mt-0.5">
                          A/C Holder: <strong className="text-slate-900">{r.accountHolderName || r.operatorName}</strong>
                        </div>
                        <div className="text-[11px] text-slate-600 font-mono mt-0.5 flex flex-wrap items-center gap-2">
                          <span>A/C: <strong>{r.accountNo}</strong></span>
                          <span>•</span>
                          <span>IFSC: <strong>{r.ifsc}</strong></span>
                          {r.upiId && (
                            <>
                              <span>•</span>
                              <span className="text-purple-700 font-semibold">UPI: {r.upiId}</span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-slate-600 space-y-0.5">
                        <div>Req: <strong className="text-slate-800">{r.requestedAt}</strong></div>
                        {r.paidAt && (
                          <div className="text-emerald-700 font-medium">Paid: <strong>{r.paidAt}</strong></div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          r.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : r.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {r.status === 'PAID' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {r.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {r.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleReject(r)}
                              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Reject</span>
                            </button>
                            <button
                              onClick={() => handleApprove(r)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Approve & Pay</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Completed</span>
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
