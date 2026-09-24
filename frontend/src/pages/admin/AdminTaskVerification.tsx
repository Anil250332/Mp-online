import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import apiClient from '../../api/client';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
  FileText,
  Store,
  User,
  Eye,
  X,
  Download,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface ApplicationDoc {
  label: string;
  fileName: string;
  filePath: string;
  mimeType?: string;
  fileSizeKb?: number;
}

interface ApplicationItem {
  id: string | number;
  applicationNo: string;
  serviceName: string;
  subServiceName?: string;
  serviceCode: string;
  category?: string;
  feeDeducted: number;
  operatorPayout: number;
  status: 'pending' | 'assigned' | 'processing' | 'completed' | 'verified' | 'rejected';
  govtAckNo?: string;
  rejectionReason?: string;
  customerName?: string;
  customerMobile?: string;
  formData?: string | Record<string, any>;
  createdAt: string;
  completedAt?: string;
  operatorName?: string;
  agentName?: string;
  shopName?: string;
  documents?: ApplicationDoc[];
  completionOutputData?: string | { note?: string; files?: ApplicationDoc[] };
}

export default function AdminTaskVerification() {
  const [tasks, setTasks] = useState<ApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'COMPLETED' | 'VERIFIED'>('COMPLETED');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [viewModalTask, setViewModalTask] = useState<ApplicationItem | null>(null);
  const [rejectModalTask, setRejectModalTask] = useState<ApplicationItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchVerificationQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/applications/verification-queue');
      if (res.data.status === 'success') {
        setTasks(res.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch verification queue:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVerificationQueue();
  }, [fetchVerificationQueue]);

  const getFileUrl = (filePath: string) => {
    if (!filePath) return '';
    if (filePath.startsWith('http') || filePath.startsWith('blob:')) return filePath;
    return `http://localhost:5000${filePath}`;
  };

  const handleDownloadFile = (filePath: string, fileName: string) => {
    const url = getFileUrl(filePath);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'document.pdf';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const parsedFormData = (data?: string | Record<string, any>): Record<string, any> => {
    if (!data) return {};
    if (typeof data === 'object') return data;
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  };

  const handleVerify = async (task: ApplicationItem) => {
    try {
      const res = await apiClient.patch(`/applications/${task.id}/verify`);
      if (res.data.status === 'success') {
        setSuccessMsg(`Task "${task.applicationNo}" verified & confirmed! ₹${Number(task.operatorPayout || 0).toFixed(2)} credited to operator wallet.`);
        setViewModalTask(null);
        await fetchVerificationQueue();
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to verify task.');
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalTask) return;

    try {
      const res = await apiClient.patch(`/applications/${rejectModalTask.id}/reject`, {
        reason: rejectReason || 'Rejected by Admin during verification'
      });

      if (res.data.status === 'success') {
        setSuccessMsg(`Task "${rejectModalTask.applicationNo}" REJECTED & fee refunded back to agent wallet.`);
        setRejectModalTask(null);
        setViewModalTask(null);
        setRejectReason('');
        await fetchVerificationQueue();
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject task.');
    }
  };

  const filtered = tasks.filter(t => {
    const s = (t.status || '').toLowerCase();
    if (s === 'rejected') return false;

    const matchesFilter =
      activeFilter === 'ALL'
        ? true
        : activeFilter === 'VERIFIED'
        ? s === 'verified'
        : s === 'completed';

    const term = searchTerm.trim().toLowerCase();
    if (!term) return matchesFilter;

    return (
      matchesFilter &&
      (t.applicationNo?.toLowerCase().includes(term) ||
        t.operatorName?.toLowerCase().includes(term) ||
        t.shopName?.toLowerCase().includes(term) ||
        t.serviceName?.toLowerCase().includes(term) ||
        (t.govtAckNo && t.govtAckNo.toLowerCase().includes(term)))
    );
  });

  const awaitingCount = tasks.filter(t => t.status?.toLowerCase() === 'completed').length;
  const verifiedCount = tasks.filter(t => t.status?.toLowerCase() === 'verified').length;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
              <span>Operator Task Verification & Audit</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Verify operator service executions from MySQL database, review deliverables, and release earnings to operator wallet.
            </p>
          </div>

          <button
            onClick={fetchVerificationQueue}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
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
          <button
            onClick={() => setActiveFilter('COMPLETED')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
              activeFilter === 'COMPLETED'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Awaiting Verification ({awaitingCount})
          </button>
          <button
            onClick={() => setActiveFilter('VERIFIED')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
              activeFilter === 'VERIFIED'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            VERIFIED ({verifiedCount})
          </button>
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
              activeFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ALL ({tasks.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <div className="relative w-full">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Application No, Operator Name, Shop Name, or Service Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Task Cards Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Operator Work Verification Desk ({filtered.length})</h2>
          </div>

          <div className="p-4 sm:p-5 space-y-3 bg-slate-50/50">
            {filtered.length === 0 ? (
              <div className="p-10 text-center space-y-3 bg-white rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-500 text-xs sm:text-sm font-medium">
                  {activeFilter === 'COMPLETED'
                    ? 'All operator tasks have been verified! (No tasks currently awaiting verification).'
                    : 'No operator tasks found in this section.'}
                </p>
              </div>
            ) : (
              filtered.map((item) => {
                const s = (item.status || '').toLowerCase();
                const isVerified = s === 'verified';

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all p-4 space-y-3"
                  >
                    {/* Top Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                          {item.applicationNo}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm">
                          {item.serviceName}
                        </h3>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-0.5 rounded-full border ${
                          isVerified
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-amber-50 text-amber-700 border-amber-300'
                        }`}
                      >
                        {isVerified ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                        )}
                        <span>{isVerified ? 'VERIFIED' : 'AWAITING VERIFICATION'}</span>
                      </span>
                    </div>

                    {/* Middle Info Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400 shrink-0" />
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase block">Operator</span>
                          <span className="font-semibold text-slate-800">{item.operatorName || 'Assigned Operator'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-slate-400 shrink-0" />
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase block">Requesting Kiosk</span>
                          <span className="font-semibold text-slate-800">{item.shopName || item.agentName || 'Agent'}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">Operator Share</span>
                        <span className="font-mono font-bold text-emerald-700">₹ {Number(item.operatorPayout || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Govt Ack Ref if available */}
                    {item.govtAckNo && (
                      <div className="text-xs text-slate-700 bg-blue-50/70 p-2.5 rounded-xl border border-blue-200/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                          <span>Govt Output Ref: <strong className="font-mono text-slate-900">{item.govtAckNo}</strong></span>
                        </div>
                      </div>
                    )}

                    {/* Bottom Row */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="text-slate-400 text-[11px]">
                        Applied: {new Date(item.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewModalTask(item)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Inspect & Verify</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal for Inspecting & Verifying Task Data */}
        {viewModalTask && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 relative overflow-hidden my-auto">
              
              <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 border border-blue-200/60 rounded-xl text-blue-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Audit Application #{viewModalTask.applicationNo}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Inspect operator output certificate & applicant submitted details</p>
                  </div>
                </div>

                <button onClick={() => setViewModalTask(null)} className="text-slate-400 hover:text-slate-700 p-2 rounded-xl">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
                
                {/* Service Details Banner */}
                <div className="bg-slate-900 p-4 rounded-2xl text-white space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider block">Service Executed</span>
                      <h4 className="text-base font-bold text-white">{viewModalTask.serviceName}</h4>
                      <div className="text-xs text-slate-300 font-mono mt-0.5">ID: {viewModalTask.serviceCode}</div>
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-right">
                      <span className="text-[10px] font-bold text-emerald-300 uppercase block">Operator Share</span>
                      <div className="text-base font-black text-emerald-400 font-mono">+ ₹ {Number(viewModalTask.operatorPayout || 0).toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-slate-300 text-xs">
                    <div>Operator: <strong className="text-white">{viewModalTask.operatorName || 'Operator'}</strong></div>
                    <div>Outlet: <strong className="text-white">{viewModalTask.shopName || viewModalTask.agentName}</strong></div>
                  </div>
                </div>

                {/* Attached Deliverables / Documents */}
                {viewModalTask.documents && viewModalTask.documents.length > 0 && (
                  <div className="space-y-2.5">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      📁 Documents & Deliverables ({viewModalTask.documents.length})
                    </span>
                    <div className="space-y-2">
                      {viewModalTask.documents.map((doc, idx) => (
                        <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">{doc.label}</span>
                            <span className="font-mono text-xs font-bold text-slate-900">{doc.fileName}</span>
                          </div>
                          <button
                            onClick={() => handleDownloadFile(doc.filePath, doc.fileName)}
                            className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Applicant Submitted Data */}
                {viewModalTask.formData && (
                  <div className="space-y-2.5">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Applicant Form Information
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {Object.entries(parsedFormData(viewModalTask.formData)).map(([label, value]) => {
                        if (String(value).includes('Uploaded Document')) return null;
                        return (
                          <div key={label} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">{label}</span>
                            <span className="text-xs font-semibold text-slate-900 break-words">{String(value)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewModalTask(null)}
                  className="px-4.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const t = viewModalTask;
                      setRejectModalTask(t);
                    }}
                    className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span>Reject & Refund Agent</span>
                  </button>

                  {viewModalTask.status?.toLowerCase() !== 'verified' && (
                    <button
                      onClick={() => handleVerify(viewModalTask)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Approve & Release Payout</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Reject Modal */}
        {rejectModalTask && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 relative animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span>Reject Task & Refund Agent Wallet</span>
                </div>
                <button onClick={() => setRejectModalTask(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="bg-red-50 p-3.5 rounded-xl border border-red-200 space-y-1 text-xs text-red-900">
                <div>App No: <strong className="font-mono text-slate-800">{rejectModalTask.applicationNo}</strong></div>
                <div>Refund Amount to Agent: <strong className="font-mono font-bold text-emerald-700">₹ {Number(rejectModalTask.feeDeducted || 0).toFixed(2)}</strong></div>
              </div>

              <form onSubmit={handleReject} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Rejection Reason *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Specify audit rejection reason..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRejectModalTask(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Confirm Rejection & Refund</span>
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
