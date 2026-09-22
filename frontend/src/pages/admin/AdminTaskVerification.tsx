import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { serviceTaskStore, formatServiceCode, type ServiceTask } from '../../services/serviceTaskStore';
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
  ClipboardList,
  Download,
  RotateCcw
} from 'lucide-react';

export default function AdminTaskVerification() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ServiceTask[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'COMPLETED' | 'VERIFIED'>('COMPLETED');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [viewClientModalTask, setViewClientModalTask] = useState<ServiceTask | null>(null);

  useEffect(() => {
    const sync = () => {
      setTasks(serviceTaskStore.getTasks());
    };

    sync();
    const unsubscribe = serviceTaskStore.subscribe(sync);
    return unsubscribe;
  }, []);

  const handleVerify = (task: ServiceTask) => {
    serviceTaskStore.verifyTask(task.id, user?.full_name || 'Manager');
    setSuccessMsg(`Task "${task.taskNo}" verified & confirmed! ₹${task.operatorShare} credited to operator wallet.`);
    setViewClientModalTask(null);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleDownloadResult = (task: ServiceTask) => {
    const filename = `${task.outputRefNo || task.taskNo}_Deliverable_Result.pdf`;
    const content = `MP ONLINE SERVICE TASK OUTPUT DELIVERABLE\n==========================================\nTask No: ${task.taskNo}\nService Name: ${task.serviceName} (${task.serviceCode})\nOperator Name: ${task.operatorName}\nRequesting Outlet: ${task.shopName} (${task.shopCode})\nOutput Reference: ${task.outputRefNo || 'REF-GEN-9921'}\nOperator Remarks: ${task.outputNote || 'Document completed successfully.'}\nCompleted Date: ${task.completedAt || task.requestedAt}\nVerified Date: ${task.verifiedAt || 'Pending Audit'}\n`;

    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Correct tab filtering logic:
  // COMPLETED (Awaiting Verification) = status === 'COMPLETED'
  // VERIFIED = status === 'VERIFIED'
  // ALL = non-rejected tasks
  const filtered = tasks.filter(t => {
    if (t.status === 'REJECTED') return false;

    const matchesFilter =
      activeFilter === 'ALL'
        ? true
        : activeFilter === 'VERIFIED'
        ? t.status === 'VERIFIED'
        : t.status === 'COMPLETED';

    const term = searchTerm.trim().toLowerCase();
    if (!term) return matchesFilter;

    const matchesSearch =
      (t.taskNo && t.taskNo.toLowerCase().includes(term)) ||
      (t.operatorName && t.operatorName.toLowerCase().includes(term)) ||
      (t.shopName && t.shopName.toLowerCase().includes(term)) ||
      (t.serviceName && t.serviceName.toLowerCase().includes(term)) ||
      (t.outputRefNo && t.outputRefNo.toLowerCase().includes(term));

    return matchesFilter && matchesSearch;
  });

  const awaitingCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const verifiedCount = tasks.filter(t => t.status === 'VERIFIED').length;

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
              Verify operator service executions, review deliverables, and release earnings to operator wallet.
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
              placeholder="Search by Task No, Operator Name, Shop Name, or Service Name..."
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
                <div>
                  <button
                    onClick={() => serviceTaskStore.resetTasks()}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset Work Queue (Restore 3 Tasks to Verify)</span>
                  </button>
                </div>
              </div>
            ) : (
              filtered.map((item) => {
                const hasOutputDeliverable = Boolean(item.outputRefNo && item.outputRefNo.trim());

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all p-4 space-y-3"
                  >
                    {/* Top Row: Task ID & Service Name (Left) | Status Badge (Right) */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                          {item.taskNo}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm">
                          {item.serviceName}
                        </h3>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-0.5 rounded-full border ${
                          item.status === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-amber-50 text-amber-700 border-amber-300'
                        }`}
                      >
                        {item.status === 'VERIFIED' ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                        )}
                        <span>{item.status === 'VERIFIED' ? 'VERIFIED' : 'AWAITING VERIFICATION'}</span>
                      </span>
                    </div>

                    {/* Middle Info Row: Operator Name & Requesting Outlet */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400 shrink-0" />
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase block">Operator</span>
                          <span className="font-semibold text-slate-800">{item.operatorName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-slate-400 shrink-0" />
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase block">Requesting Outlet</span>
                          <span className="font-semibold text-slate-800">{item.shopName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Operator Remarks Block (only if operator entered a remark) */}
                    {item.outputNote && item.outputNote.trim() && (
                      <div className="text-xs text-slate-700 bg-blue-50/70 p-2.5 rounded-xl border border-blue-200/60 flex items-start gap-2">
                        <FileText className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-blue-900 block text-[11px] uppercase tracking-wider">Operator Remark:</span>
                          <span className="text-slate-800 font-medium break-words">{item.outputNote}</span>
                        </div>
                      </div>
                    )}

                    {/* Bottom Row: Timestamp (Left) | Download & View Buttons (Right) */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="text-slate-400 text-[11px]">
                        {item.completedAt || item.requestedAt}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Download Deliverable Result Button if output attached */}
                        {hasOutputDeliverable && (
                          <button
                            onClick={() => handleDownloadResult(item)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="Download Operator Uploaded Deliverable Result"
                          >
                            <Download className="h-3.5 w-3.5 text-slate-600" />
                            <span>Download</span>
                          </button>
                        )}

                        {/* View Button */}
                        <button
                          onClick={() => setViewClientModalTask(item)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
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
        {viewClientModalTask && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 relative overflow-hidden animate-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 border border-blue-200/60 rounded-xl text-blue-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <span>Task Audit & Verification</span>
                      <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                        #{viewClientModalTask.taskNo}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Inspect operator output certificate & applicant submitted details</p>
                  </div>
                </div>

                <button
                  onClick={() => setViewClientModalTask(null)}
                  className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar text-xs">
                
                {/* Service Details Banner */}
                <div className="bg-slate-900 p-4 rounded-2xl text-white space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider block">Service Executed</span>
                      <h4 className="text-base font-bold text-white">{viewClientModalTask.serviceName}</h4>
                      <div className="text-xs text-slate-300 font-mono mt-0.5">ID: {formatServiceCode(viewClientModalTask.serviceCode)}</div>
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-right">
                      <span className="text-[10px] font-bold text-emerald-300 uppercase block">Operator Share</span>
                      <div className="text-base font-black text-emerald-400 font-mono">+ ₹ {viewClientModalTask.operatorShare}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-slate-300 text-xs">
                    <div>Operator: <strong className="text-white">{viewClientModalTask.operatorName}</strong></div>
                    <div>Outlet: <strong className="text-white">{viewClientModalTask.shopName}</strong></div>
                  </div>
                </div>

                {/* Operator Output Deliverable */}
                {viewClientModalTask.outputRefNo ? (
                  <div className="bg-blue-50/90 border border-blue-200 p-4 rounded-2xl space-y-2 text-blue-900">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span>Operator Certificate Output Ref: <strong className="font-mono text-slate-900">{viewClientModalTask.outputRefNo}</strong></span>
                      </div>

                      <button
                        onClick={() => handleDownloadResult(viewClientModalTask)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download File</span>
                      </button>
                    </div>

                    {viewClientModalTask.outputNote && (
                      <p className="text-xs text-blue-800 pl-6">Remarks: {viewClientModalTask.outputNote}</p>
                    )}
                    <div className="text-[11px] text-blue-600 pl-6 font-mono">
                      Completed At: {viewClientModalTask.completedAt || viewClientModalTask.requestedAt}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>Output Certificate Deliverable: <em>Pending operator output upload.</em></span>
                  </div>
                )}

                {/* Applicant Submitted Data */}
                {viewClientModalTask.formData && Object.keys(viewClientModalTask.formData).length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      <ClipboardList className="h-4 w-4 text-blue-600" />
                      <span>Applicant Submitted Details & File Uploads</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {Object.entries(viewClientModalTask.formData).map(([label, value]) => (
                        <div key={label} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">{label}</span>
                          <span className="text-xs font-semibold text-slate-900 break-words">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewClientModalTask(null)}
                  className="px-4.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Close
                </button>

                {viewClientModalTask.status !== 'VERIFIED' && (
                  <button
                    onClick={() => handleVerify(viewClientModalTask)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Verify Task & Release Operator Wallet</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
