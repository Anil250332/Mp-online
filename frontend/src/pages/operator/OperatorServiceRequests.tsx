import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { serviceTaskStore, formatServiceCode, type ServiceTask } from '../../services/serviceTaskStore';
import { serviceStore } from '../../services/serviceStore';
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
  ClipboardList,
  Wallet,
  Eye,
  Download
} from 'lucide-react';

export default function OperatorServiceRequests() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ServiceTask[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'VERIFIED' | 'REJECTED'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // View Client Form Modal State
  const [viewClientModalTask, setViewClientModalTask] = useState<ServiceTask | null>(null);

  // Document Viewer Modal State
  const [previewDoc, setPreviewDoc] = useState<{ title: string; filename: string } | null>(null);

  // Complete Work Modal State
  const [selectedTask, setSelectedTask] = useState<ServiceTask | null>(null);
  const [outputRefNo, setOutputRefNo] = useState('');
  const [outputNote, setOutputNote] = useState('');
  const [outputDeliverableFiles, setOutputDeliverableFiles] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState('');

  // Reject Modal State
  const [rejectModalTask, setRejectModalTask] = useState<ServiceTask | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Helper to extract operator deliverable fields for a service task
  const getOperatorDeliverableFields = (task: ServiceTask): string[] => {
    const result: string[] = [];
    if (task.formData) {
      Object.keys(task.formData).forEach(key => {
        if (key.includes('[Operator Deliverable Required]')) {
          result.push(key.replace('[Operator Deliverable Required]:', '').trim());
        }
      });
    }

    if (result.length === 0) {
      const allServices = serviceStore.getServices();
      for (const s of allServices) {
        if (s.hasSubServices && s.subServices) {
          for (const sub of s.subServices) {
            if (sub.name === task.serviceName || `${s.name} (${sub.name})` === task.serviceName) {
              sub.formFields?.forEach(f => {
                if (f.docUploader === 'operator') result.push(f.label);
              });
            }
          }
        } else if (s.name === task.serviceName) {
          s.formFields?.forEach(f => {
            if (f.docUploader === 'operator') result.push(f.label);
          });
        }
      }
    }

    if (result.length === 0) {
      result.push(`${task.serviceName} Output Certificate / Document Slip`);
    }

    return Array.from(new Set(result));
  };

  // Helper to extract client name from form data or task owner
  const getClientName = (item: ServiceTask) => {
    if (item.formData) {
      for (const key of Object.keys(item.formData)) {
        if (/name/i.test(key) && !/father|husband|mother/i.test(key)) {
          return String(item.formData[key]);
        }
      }
      const values = Object.values(item.formData).map(String);
      const nonDocVal = values.find(v => !v.includes('.pdf') && !v.includes('.jpg') && !v.includes('.png'));
      if (nonDocVal) return nonDocVal;
    }
    return item.ownerName || 'Client Applicant';
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalTask) return;

    serviceTaskStore.rejectTask(rejectModalTask.id, rejectReason);
    setSuccessMsg(`Task "${rejectModalTask.taskNo}" REJECTED & ₹ ${rejectModalTask.amount.toFixed(2)} refunded back to shop wallet.`);
    setRejectModalTask(null);
    setRejectReason('');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  useEffect(() => {
    const sync = () => {
      setTasks(serviceTaskStore.getTasksForOperator(user?.id));
    };

    sync();
    const unsubscribe = serviceTaskStore.subscribe(sync);
    return unsubscribe;
  }, [user?.id]);

  const handleOpenCompleteModal = (t: ServiceTask) => {
    setSelectedTask(t);
    setOutputRefNo(`REF-${Date.now().toString().slice(-6)}`);
    setOutputNote('');
    setOutputDeliverableFiles(t.outputFiles || {});
    setErrorMsg('');
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedTask) return;
    if (!outputRefNo.trim()) {
      setErrorMsg('Please enter a valid Output Certificate Reference No / Application ID.');
      return;
    }

    serviceTaskStore.completeTask(
      selectedTask.id,
      outputRefNo,
      outputNote,
      user?.full_name || (user as any)?.name || (user as any)?.username || 'Operator',
      outputDeliverableFiles
    );

    setSuccessMsg(`Task "${selectedTask.taskNo}" marked as COMPLETED! Submitted to Admin/Manager for Verification.`);
    setSelectedTask(null);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleDownloadDoc = (filename: string) => {
    const element = document.createElement('a');
    const file = new Blob([`Official MP Government Portal Document: ${filename}\nApplication ID: TSK-2026-8001\nVerified Client Copy`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filtered = tasks.filter(t => {
    const matchesTab = activeTab === 'ALL' || t.status === activeTab;
    const matchesSearch =
      t.taskNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.formData && Object.values(t.formData).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase())));
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
              Review client applicant details, inspect uploaded documents, process tasks, and submit for Admin/Manager verification.
            </p>
          </div>
        </div>

        {/* Global Action Banner */}
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
              {tab.replace('_', ' ')} ({tab === 'ALL' ? tasks.length : tasks.filter(t => t.status === tab).length})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="relative w-full">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Task No, Applicant Name, Mobile, Aadhaar, Service Name, or Document details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Work Cards / Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Assigned Service Work Queue ({filtered.length})</h2>
          </div>

          <div className="p-4 sm:p-6 space-y-4 bg-slate-50/60">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs sm:text-sm bg-white rounded-2xl border border-dashed border-slate-200">
                No service work requests found in this category.
              </div>
            ) : (
              filtered.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-4 sm:p-5 space-y-3.5 relative overflow-hidden">
                  
                  {/* Top Bar: Task ID, Category, Shop & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-teal-800 bg-teal-50 px-3 py-1 rounded-lg border border-teal-200">
                        {item.taskNo}
                      </span>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1 rounded-full border shadow-2xs ${
                      item.status === 'VERIFIED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : item.status === 'COMPLETED'
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : item.status === 'REJECTED'
                        ? 'bg-red-50 text-red-700 border-red-300'
                        : 'bg-amber-50 text-amber-700 border-amber-300'
                    }`}>
                      {item.status === 'VERIFIED' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : item.status === 'REJECTED' ? <XCircle className="h-3.5 w-3.5 text-red-600" /> : <Clock className="h-3.5 w-3.5 text-amber-600" />}
                      <span>{item.status === 'VERIFIED' ? 'VERIFIED & AUDITED' : item.status === 'COMPLETED' ? 'COMPLETED' : item.status}</span>
                    </span>
                  </div>

                  {/* Simple Main Details: Service Name & ID, Client Name, Requested Time (No Amounts) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/80 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Service Requested</span>
                      <div className="font-bold text-slate-900 text-sm">{item.serviceName}</div>
                      <div className="text-teal-700 text-xs font-mono font-semibold mt-0.5">Service ID: {formatServiceCode(item.serviceCode)}</div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Client Name</span>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <UserCheck className="h-4 w-4 text-teal-600 shrink-0" />
                        <span>{getClientName(item)}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Requested Time</span>
                      <div className="text-slate-700 font-semibold mt-0.5 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{item.requestedAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Banner for Verified / Completed / Rejected if applicable */}
                  {item.status === 'VERIFIED' && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between gap-2 text-emerald-900">
                      <div className="flex items-center gap-2 font-bold">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Task Verified & Audited! Wallet credited.</span>
                      </div>
                    </div>
                  )}

                  {item.status === 'COMPLETED' && (
                    <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs space-y-1 text-blue-900">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-blue-950 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                          <span>Task Completed & Sent for Audit</span>
                        </span>
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          Awaiting Verification
                        </span>
                      </div>
                      {item.outputNote && (
                        <p className="text-blue-800 text-xs pl-5 font-medium">Remarks: {item.outputNote}</p>
                      )}
                    </div>
                  )}

                  {item.status === 'REJECTED' && item.rejectReason && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
                      <div className="font-bold text-red-900">Rejected Reason: {item.rejectReason}</div>
                    </div>
                  )}

                  {/* Bottom Action Row: View Button, Complete Task Button, Reject Button */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="text-slate-400 text-[11px] font-mono">
                      Task ID: <strong className="text-slate-700">{item.taskNo}</strong>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* 1. View Button */}
                      <button
                        onClick={() => setViewClientModalTask(item)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-xl text-xs border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Eye className="h-4 w-4 text-slate-600" />
                        <span>View</span>
                      </button>

                      {/* 2. Complete Task Button & 3. Reject Button (to the right of View) */}
                      {item.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleOpenCompleteModal(item)}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4.5 py-2 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Complete Task</span>
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
              ))
            )}
          </div>
        </div>

        {/* Complete Task Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 relative animate-in fade-in zoom-in-95">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                  <CheckCircle2 className="h-5 w-5 text-teal-600" />
                  <span>Complete Service Task #{selectedTask.taskNo}</span>
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
                  Your Earnings: + ₹ {selectedTask.operatorShare}
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
                    Output Certificate Ref / Application ID *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MP-INC-2026-9921"
                    value={outputRefNo}
                    onChange={(e) => setOutputRefNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
                    required
                  />
                </div>

                {/* Dynamic Operator Deliverable Document Upload Slots */}
                {selectedTask && (
                  <div className="space-y-3 pt-1">
                    <label className="block text-xs font-bold text-teal-800 uppercase tracking-wider">
                      Upload Required Deliverable Documents ({getOperatorDeliverableFields(selectedTask).length})
                    </label>
                    {getOperatorDeliverableFields(selectedTask).map((deliverableLabel) => (
                      <div key={deliverableLabel} className="space-y-1">
                        <span className="block text-[11px] font-bold text-slate-700">
                          📄 {deliverableLabel} <span className="text-rose-500">*</span>
                        </span>
                        <div className="border border-dashed border-teal-300 bg-teal-50/60 p-3 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-teal-600 shrink-0" />
                            <span className="text-xs font-medium text-slate-800 truncate max-w-[200px]">
                              {outputDeliverableFiles[deliverableLabel] || 'Choose document (PDF / Image / Zip)'}
                            </span>
                          </div>
                          <label className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shrink-0">
                            Upload File
                            <input
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setOutputDeliverableFiles(prev => ({ ...prev, [deliverableLabel]: file.name }));
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Completion Remarks / Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter completion remarks or instructions for the shop owner..."
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
                    className="px-4.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Complete Task</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* Reject Task Modal */}
        {rejectModalTask && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 relative animate-in fade-in zoom-in-95">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span>Reject Task & Refund Shop</span>
                </div>
                <button
                  onClick={() => setRejectModalTask(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="bg-red-50 p-3.5 rounded-xl border border-red-200 space-y-1.5 text-xs text-red-900">
                <div className="font-bold text-sm">{rejectModalTask.serviceName}</div>
                <div>Application / Task ID: <strong className="font-mono text-slate-800">{rejectModalTask.taskNo}</strong></div>
                <div className="font-bold text-red-700 pt-1">
                  Amount to be refunded: ₹ {rejectModalTask.amount.toFixed(2)}
                </div>
              </div>

              <form onSubmit={handleRejectSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Rejection Reason *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Specify why this service request cannot be fulfilled (e.g., incomplete documents, invalid details)..."
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
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Confirm Rejection & Refund</span>
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* View Full Client Dossier Modal */}
        {viewClientModalTask && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 relative overflow-hidden animate-in zoom-in-95 duration-200">
              
              {/* Modal Header (Fixed Top Bar) */}
              <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-50 border border-teal-200/60 rounded-xl text-teal-600">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <span>Client & Service Dossier</span>
                      <span className="font-mono text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                        #{viewClientModalTask.taskNo}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Review submitted applicant info & uploaded document proofs</p>
                  </div>
                </div>

                <button
                  onClick={() => setViewClientModalTask(null)}
                  className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Close Modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body (Scrollable Content Area) */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">

                {/* Service & Shop Summary Card */}
                <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-4 sm:p-5 rounded-2xl text-white space-y-3 shadow-md border border-teal-800/40 relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
                    <div>
                      <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block mb-0.5">Service Requested</span>
                      <h4 className="text-base sm:text-lg font-bold text-white">{viewClientModalTask.serviceName}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-300 font-mono mt-1">
                        <span className="bg-teal-900/80 px-2 py-0.5 rounded border border-teal-700/60">ID: {formatServiceCode(viewClientModalTask.serviceCode)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-300 relative z-10 gap-2">
                    <div>Requested Date: <strong className="text-white font-mono">{viewClientModalTask.requestedAt}</strong></div>
                  </div>
                </div>

                {/* Client Submitted Form Fields & Uploaded Documents */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <ClipboardList className="h-4.5 w-4.5 text-teal-600" />
                    <span>Applicant Information & Attachments (Kaam Ki Information)</span>
                  </div>

                  {viewClientModalTask.formData && Object.keys(viewClientModalTask.formData).length > 0 ? (
                    <div className="space-y-4">
                      {/* Text Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(viewClientModalTask.formData).map(([label, value]) => {
                          const valStr = String(value);
                          const isDocument = valStr.includes('Uploaded Document') || valStr.includes('.pdf') || valStr.includes('.png') || valStr.includes('.jpg');
                          if (isDocument) return null; // handle documents separately below

                          return (
                            <div key={label} className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1 hover:border-slate-300 transition-colors">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{label}</span>
                              <span className="text-xs sm:text-sm font-semibold text-slate-900 break-words">{valStr}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Documents Section */}
                      {Object.entries(viewClientModalTask.formData).some(([_, value]) => {
                        const valStr = String(value);
                        return valStr.includes('Uploaded Document') || valStr.includes('.pdf') || valStr.includes('.png') || valStr.includes('.jpg');
                      }) && (
                        <div className="space-y-3 pt-2">
                          <div className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-teal-600" />
                            <span>Uploaded Client Documents ({Object.entries(viewClientModalTask.formData).filter(([_, v]) => String(v).includes('Uploaded Document') || String(v).includes('.pdf') || String(v).includes('.png') || String(v).includes('.jpg')).length})</span>
                          </div>

                          <div className="space-y-2.5">
                            {Object.entries(viewClientModalTask.formData).map(([label, value]) => {
                              const valStr = String(value);
                              const isDocument = valStr.includes('Uploaded Document') || valStr.includes('.pdf') || valStr.includes('.png') || valStr.includes('.jpg');
                              if (!isDocument) return null;

                              const cleanDocName = valStr.replace(/\s*\(Uploaded Document\)/gi, '').trim();
                              return (
                                <div key={label} className="bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-white p-3.5 rounded-2xl border border-emerald-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-emerald-100/80 text-emerald-700 rounded-xl shrink-0">
                                      <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-0.5 min-w-0">
                                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">{label}</span>
                                      <div className="font-mono text-xs font-bold text-slate-900 truncate" title={cleanDocName}>
                                        {cleanDocName}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-100">
                                    <button
                                      onClick={() => setPreviewDoc({ title: label, filename: cleanDocName })}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                      <span>View File</span>
                                    </button>
                                    <button
                                      onClick={() => handleDownloadDoc(cleanDocName)}
                                      className="bg-white hover:bg-slate-100 text-emerald-800 font-bold border border-emerald-300 text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                      <span>Download</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-teal-600 shrink-0" />
                      <span>No custom client fields attached. Standard government portal procedures apply.</span>
                    </div>
                  )}
                </div>
                {viewClientModalTask && (
                  <div className="space-y-2.5 pt-3 border-t border-slate-200">
                    <div className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span>Operator Output Response Deliverable Slots ({getOperatorDeliverableFields(viewClientModalTask).length})</span>
                    </div>

                    <div className="space-y-2">
                      {getOperatorDeliverableFields(viewClientModalTask).map(label => {
                        const uploadedFile = viewClientModalTask.outputFiles?.[label];
                        return (
                          <div key={label} className="bg-gradient-to-r from-blue-50/80 to-slate-50 p-3 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 bg-blue-100 text-blue-700 rounded-xl shrink-0">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">{label}</span>
                                <div className="font-mono text-xs font-bold text-slate-800">
                                  {uploadedFile || 'Awaiting Operator Output Upload'}
                                </div>
                              </div>
                            </div>
                            {uploadedFile ? (
                              <button
                                onClick={() => setPreviewDoc({ title: label, filename: uploadedFile })}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer shrink-0"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>View Output</span>
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 shrink-0">
                                Required on Task Completion
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Operator Earning Share Display (Only Operator Share Shown) */}
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between text-emerald-900 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100/90 rounded-xl text-emerald-700 shrink-0">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Operator Earning Share</span>
                      <span className="text-xs text-emerald-700 font-medium">Amount to be credited to your operator wallet</span>
                    </div>
                  </div>
                  <div className="text-xl font-black text-emerald-700 font-mono">
                    + ₹ {viewClientModalTask.operatorShare}.00
                  </div>
                </div>

              </div>

              {/* Modal Footer (Fixed Bottom Toolbar) */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0 z-10">
                <button
                  type="button"
                  onClick={() => setViewClientModalTask(null)}
                  className="px-4.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Close
                </button>

                {viewClientModalTask.status === 'PENDING' && (
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => {
                        const t = viewClientModalTask;
                        setViewClientModalTask(null);
                        setRejectModalTask(t);
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => {
                        const t = viewClientModalTask;
                        setViewClientModalTask(null);
                        handleOpenCompleteModal(t);
                      }}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Complete Task</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Document Viewer Modal */}
        {previewDoc && (
          <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 relative animate-in fade-in zoom-in-95">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  <span>Document Preview: {previewDoc.title}</span>
                </div>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Simulated Document Reader Container */}
              <div className="bg-slate-900 text-slate-100 rounded-xl p-6 min-h-[220px] flex flex-col items-center justify-center text-center space-y-3 border border-slate-800 relative overflow-hidden shadow-inner">
                <div className="absolute top-2 right-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded">
                  VERIFIED ATTACHMENT
                </div>
                
                <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 text-emerald-400">
                  <FileText className="h-10 w-10 animate-bounce" />
                </div>
                
                <div>
                  <h4 className="font-mono font-bold text-sm text-white">{previewDoc.filename}</h4>
                  <p className="text-xs text-slate-400 mt-1">Authentic Client File Uploaded via Shop Portal</p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleDownloadDoc(previewDoc.filename)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Original File</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Close Document Viewer
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
