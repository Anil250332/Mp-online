import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import apiClient from '../../api/client';
import {
  UserCheck,
  CheckCircle2,
  Clock,
  Search,
  FileText,
  Upload,
  X,
  AlertTriangle,
  XCircle,
  Eye,
  Download,
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
  district?: string;
  tehsil?: string;
  wardNo?: string;
  formData?: string | Record<string, any>;
  createdAt: string;
  completedAt?: string;
  agentName?: string;
  shopName?: string;
  documents?: ApplicationDoc[];
  completionOutputData?: string | { note?: string; files?: ApplicationDoc[] };
}

export default function OperatorServiceRequests() {
  const [tasks, setTasks] = useState<ApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'COMPLETED' | 'VERIFIED' | 'REJECTED' | 'ALL'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // View Client Form Modal State
  const [viewClientModalTask, setViewClientModalTask] = useState<ApplicationItem | null>(null);

  // Complete Work Modal State
  const [selectedTask, setSelectedTask] = useState<ApplicationItem | null>(null);
  const [govtAckNo, setGovtAckNo] = useState('');
  const [outputNote, setOutputNote] = useState('');
  const [deliverableFiles, setDeliverableFiles] = useState<Record<string, File>>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reject Modal State
  const [rejectModalTask, setRejectModalTask] = useState<ApplicationItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/applications/operator-queue');
      if (res.data.status === 'success') {
        setTasks(res.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch operator queue:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

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

  const handleOpenCompleteModal = (t: ApplicationItem) => {
    setSelectedTask(t);
    setGovtAckNo(`MP-CERT-${Date.now().toString().slice(-6)}`);
    setOutputNote('');
    setDeliverableFiles({});
    setErrorMsg('');
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setErrorMsg('');

    if (!govtAckNo.trim()) {
      setErrorMsg('Please enter a valid Output Certificate Reference No / Application ID.');
      return;
    }

    setIsSubmitting(true);
    const formDataPayload = new FormData();
    formDataPayload.append('govtAckNo', govtAckNo.trim());
    formDataPayload.append('outputNote', outputNote.trim());

    Object.entries(deliverableFiles).forEach(([label, file]) => {
      formDataPayload.append(`deliverable_${label}`, file);
    });

    try {
      const res = await apiClient.post(`/applications/${selectedTask.id}/complete`, formDataPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.status === 'success') {
        setSuccessMsg(`Task "${selectedTask.applicationNo}" marked as COMPLETED! Submitted to Admin/Manager for Verification.`);
        setSelectedTask(null);
        await fetchQueue();
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        setErrorMsg(res.data.message || 'Failed to complete task.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Server error while completing task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalTask) return;

    try {
      const res = await apiClient.patch(`/applications/${rejectModalTask.id}/reject`, {
        reason: rejectReason || 'Application rejected by Operator'
      });

      if (res.data.status === 'success') {
        setSuccessMsg(`Task "${rejectModalTask.applicationNo}" REJECTED & fee refunded back to shop wallet.`);
        setRejectModalTask(null);
        setRejectReason('');
        await fetchQueue();
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject task.');
    }
  };

  const filtered = tasks.filter(t => {
    const s = (t.status || '').toLowerCase();
    const matchesTab =
      activeTab === 'ALL'
        ? true
        : activeTab === 'PENDING'
        ? s === 'pending' || s === 'assigned' || s === 'processing'
        : activeTab === 'COMPLETED'
        ? s === 'completed'
        : activeTab === 'VERIFIED'
        ? s === 'verified'
        : s === 'rejected';

    const matchesSearch =
      t.applicationNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.govtAckNo && t.govtAckNo.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-teal-600" />
              <span>Operator Service Requests & Work Queue</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live incoming citizen applications from MySQL database. Inspect applicant documents, upload deliverable certificates, and earn payouts.
            </p>
          </div>

          <button
            onClick={fetchQueue}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-teal-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* Action Banner */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center gap-2">
          {(['PENDING', 'COMPLETED', 'VERIFIED', 'REJECTED', 'ALL'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[110px] py-2 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                activeTab === tab
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab} (
                {tab === 'ALL'
                  ? tasks.length
                  : tab === 'PENDING'
                  ? tasks.filter(t => ['pending', 'assigned', 'processing'].includes(t.status?.toLowerCase())).length
                  : tab === 'COMPLETED'
                  ? tasks.filter(t => t.status?.toLowerCase() === 'completed').length
                  : tab === 'VERIFIED'
                  ? tasks.filter(t => t.status?.toLowerCase() === 'verified').length
                  : tasks.filter(t => t.status?.toLowerCase() === 'rejected').length}
              )
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="relative w-full">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Application No, Customer Name, Mobile, Service Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Work Cards */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Assigned Applications ({filtered.length})</h2>
          </div>

          <div className="p-4 sm:p-6 space-y-4 bg-slate-50/60">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs sm:text-sm bg-white rounded-2xl border border-dashed border-slate-200">
                No service applications found in this filter.
              </div>
            ) : (
              filtered.map((item) => {
                const s = (item.status || '').toLowerCase();
                const isPending = s === 'pending' || s === 'assigned' || s === 'processing';
                const isRej = s === 'rejected';

                return (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-4 sm:p-5 space-y-3.5 relative overflow-hidden">
                    
                    {/* Top Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-black text-teal-800 bg-teal-50 px-3 py-1 rounded-lg border border-teal-200">
                          {item.applicationNo}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          From: <strong className="text-slate-800">{item.shopName || item.agentName || 'MP Online Kiosk'}</strong>
                        </span>
                      </div>

                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1 rounded-full border shadow-2xs ${
                        s === 'verified'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : s === 'completed'
                          ? 'bg-blue-50 text-blue-700 border-blue-300'
                          : isRej
                          ? 'bg-red-50 text-red-700 border-red-300'
                          : 'bg-amber-50 text-amber-700 border-amber-300'
                      }`}>
                        {s === 'verified' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : isRej ? <XCircle className="h-3.5 w-3.5 text-red-600" /> : <Clock className="h-3.5 w-3.5 text-amber-600" />}
                        <span>{s.toUpperCase()}</span>
                      </span>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/80 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Service Requested</span>
                        <div className="font-bold text-slate-900 text-sm">{item.serviceName}</div>
                        <div className="text-teal-700 text-xs font-mono font-semibold mt-0.5">{item.serviceCode}</div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Applicant Name & Mobile</span>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <UserCheck className="h-4 w-4 text-teal-600 shrink-0" />
                          <span>{item.customerName || 'Citizen Applicant'}</span>
                        </div>
                        <div className="text-slate-600 font-mono mt-0.5">{item.customerMobile || 'N/A'}</div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Your Payout Earning</span>
                        <div className="text-emerald-700 font-mono font-black text-sm">
                          + ₹ {Number(item.operatorPayout || 0).toFixed(2)}
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">Credited on Admin verification</div>
                      </div>
                    </div>

                    {/* Attached Documents Count Indicator */}
                    {item.documents && item.documents.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-slate-600 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                        <FileText className="h-4 w-4 text-emerald-600" />
                        <span className="font-semibold">{item.documents.length} Client Proof Documents Attached (Available in View)</span>
                      </div>
                    )}

                    {/* Action Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="text-slate-400 text-[11px] font-mono">
                        Applied On: {new Date(item.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => setViewClientModalTask(item)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-xl text-xs border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Eye className="h-4 w-4 text-slate-600" />
                          <span>View Details & Docs</span>
                        </button>

                        {isPending && (
                          <>
                            <button
                              onClick={() => handleOpenCompleteModal(item)}
                              className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4.5 py-2 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Complete & Upload</span>
                            </button>

                            <button
                              onClick={() => setRejectModalTask(item)}
                              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Complete Task Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 relative animate-in fade-in zoom-in-95 my-auto">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                  <CheckCircle2 className="h-5 w-5 text-teal-600" />
                  <span>Complete Application #{selectedTask.applicationNo}</span>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
                <div className="font-bold text-slate-900 text-sm">{selectedTask.serviceName}</div>
                <div className="text-emerald-700 font-mono font-bold pt-1">
                  Your Payout: + ₹ {Number(selectedTask.operatorPayout || 0).toFixed(2)}
                </div>
              </div>

              <form onSubmit={handleCompleteSubmit} className="space-y-4">
                
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Govt Ack / Output Certificate Ref No *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MP-INC-2026-9921"
                    value={govtAckNo}
                    onChange={(e) => setGovtAckNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
                    required
                  />
                </div>

                {/* Real File Upload for Output Deliverable */}
                <div>
                  <label className="block text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">
                    Upload Output Certificate File (PDF / JPG)
                  </label>
                  <div className="border border-dashed border-teal-300 bg-teal-50/60 p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-teal-600 shrink-0" />
                      <span className="text-xs font-medium text-slate-800 truncate max-w-[200px]">
                        {deliverableFiles['certificate']?.name || 'Choose certificate file'}
                      </span>
                    </div>
                    <label className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shrink-0">
                      Browse File
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setDeliverableFiles(prev => ({ ...prev, certificate: file }));
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Completion Remarks / Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter completion remarks for shop owner..."
                    value={outputNote}
                    onChange={(e) => setOutputNote(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTask(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{isSubmitting ? 'Uploading...' : 'Submit & Complete'}</span>
                  </button>
                </div>

              </form>
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
                  <span>Reject Task & Refund Shop</span>
                </div>
                <button onClick={() => setRejectModalTask(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="bg-red-50 p-3.5 rounded-xl border border-red-200 space-y-1.5 text-xs text-red-900">
                <div className="font-bold text-sm">{rejectModalTask.serviceName}</div>
                <div>Application No: <strong className="font-mono text-slate-800">{rejectModalTask.applicationNo}</strong></div>
              </div>

              <form onSubmit={handleRejectSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Rejection Reason *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Specify why this request cannot be fulfilled (e.g. invalid document)..."
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

        {/* View Details Modal with Real Downloadable Files */}
        {viewClientModalTask && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 relative overflow-hidden">
              
              <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-50 border border-teal-200/60 rounded-xl text-teal-600">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Application Dossier #{viewClientModalTask.applicationNo}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Review submitted applicant info & uploaded document proofs</p>
                  </div>
                </div>
                <button onClick={() => setViewClientModalTask(null)} className="text-slate-400 hover:text-slate-700 p-2 rounded-xl">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
                {/* Text Form Data */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Applicant Form Fields</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(parsedFormData(viewClientModalTask.formData)).map(([label, value]) => {
                      if (String(value).includes('Uploaded Document')) return null;
                      return (
                        <div key={label} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">{label}</span>
                          <span className="text-xs font-bold text-slate-900">{String(value)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Real Attached Documents */}
                {viewClientModalTask.documents && viewClientModalTask.documents.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-slate-200">
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-emerald-600" />
                      <span>Attached Client Document Proofs ({viewClientModalTask.documents.length})</span>
                    </h4>
                    <div className="space-y-2">
                      {viewClientModalTask.documents.map((doc, idx) => (
                        <div key={idx} className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-800 uppercase block">{doc.label}</span>
                            <span className="font-mono text-xs font-bold text-slate-900">{doc.fileName}</span>
                          </div>
                          <button
                            onClick={() => handleDownloadFile(doc.filePath, doc.fileName)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download Document</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setViewClientModalTask(null)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
