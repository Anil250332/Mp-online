import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { serviceTaskStore, formatServiceCode, type ServiceTask } from '../../services/serviceTaskStore';
import {
  FileCheck,
  Search,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  X,
  FileText,
  Printer,
  ShieldCheck,
  ArrowLeft,
  XCircle,
  RotateCcw
} from 'lucide-react';

export default function AgentServiceRequests() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ServiceTask[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected task modal for previewing / downloading response
  const [selectedTask, setSelectedTask] = useState<ServiceTask | null>(null);

  useEffect(() => {
    const sync = () => {
      setTasks(serviceTaskStore.getTasksForShop());
    };

    sync();
    const unsubscribe = serviceTaskStore.subscribe(sync);
    return unsubscribe;
  }, []);

  const handleDownloadDocument = (task: ServiceTask) => {
    // Generate a downloadable text/certificate file simulating official output
    const content = `===========================================================
               V2 ONLINE SERVICES PORTAL - OFFICIAL CERTIFICATE / OUTPUT
===========================================================
Request No    : ${task.taskNo}
Service Name  : ${task.serviceName}
Category      : ${task.category}
Applied Date  : ${task.requestedAt}
-----------------------------------------------------------
SHOP DETAILS:
Shop Name     : ${task.shopName}
Owner Name    : ${task.ownerName}
Shop Code     : ${task.shopCode}
-----------------------------------------------------------
PORTAL SERVICE DISPATCH & COMPLETION RESPONSE:
Processed By   : Official Portal Service Desk
Output Ref No : ${task.outputRefNo || 'MP-CERT-2026-X99'}
Status        : ${task.status}
Completed At  : ${task.completedAt || 'N/A'}
Operator Note : ${task.outputNote || 'Document verified & generated successfully.'}
===========================================================
This is an electronically generated official document from V2Online Services Portal.
===========================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${task.serviceName.replace(/\s+/g, '_')}_${task.taskNo}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredTasks = tasks.filter(t => {
    const matchesTab =
      activeTab === 'ALL'
        ? true
        : activeTab === 'COMPLETED'
        ? t.status === 'COMPLETED' || t.status === 'VERIFIED'
        : t.status === activeTab;

    const matchesSearch =
      t.taskNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.outputRefNo && t.outputRefNo.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const getTabCount = (tab: 'ALL' | 'PENDING' | 'COMPLETED' | 'VERIFIED' | 'REJECTED') => {
    if (tab === 'ALL') return tasks.length;
    if (tab === 'COMPLETED') return tasks.filter(t => t.status === 'COMPLETED' || t.status === 'VERIFIED').length;
    return tasks.filter(t => t.status === tab).length;
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/agent/services" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Services</span>
              </Link>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-blue-600" />
              <span>Applied Service Requests & Track Status</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              View all services applied by your shop, check real-time operator progress, and download completed documents/certificates.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center gap-2">
          {(['ALL', 'PENDING', 'COMPLETED', 'VERIFIED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[100px] py-2 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab === 'ALL' ? 'All Requests' : tab} ({getTabCount(tab)})
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="relative w-full">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Request No (e.g. TSK-2026-8001), Service Name, Category, or Ref No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Applied Requests Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">
              Shop Service Applications ({filteredTasks.length})
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Shop: {user?.shop_name || 'Sharma MP Online & CSC Center'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                  <th className="py-3.5 px-4">Request No & Service</th>
                  <th className="py-3.5 px-4">Fee Paid</th>
                  <th className="py-3.5 px-4">Applied Date & Time</th>
                  <th className="py-3.5 px-4 text-center">Status & Response</th>
                  <th className="py-3.5 px-4 text-center">Deliverable / Rejection Remarks</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      No service requests found in this filter.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold text-blue-700 block">{task.taskNo}</span>
                        <span className="font-bold text-slate-900 block">{task.serviceName}</span>
                        <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.2 rounded mt-0.5">
                          {task.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        ₹ {task.amount.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">
                        {task.requestedAt}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          task.status === 'VERIFIED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : task.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : task.status === 'REJECTED'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {task.status === 'VERIFIED' ? (
                            <ShieldCheck className="h-3 w-3 text-blue-600" />
                          ) : task.status === 'COMPLETED' ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          ) : task.status === 'REJECTED' ? (
                            <XCircle className="h-3 w-3 text-red-600" />
                          ) : (
                            <Clock className="h-3 w-3 text-amber-600" />
                          )}
                          {task.status === 'PENDING' ? 'Processing' : task.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {task.status === 'REJECTED' ? (
                          <div className="bg-red-50/90 p-2 rounded-xl border border-red-200 text-left max-w-xs mx-auto">
                            <span className="text-[10px] font-bold text-red-800 uppercase block">Operator Rejection Remark:</span>
                            <span className="text-xs text-red-900 font-semibold break-words">
                              {task.outputNote || task.rejectReason || 'Application rejected by operator.'}
                            </span>
                          </div>
                        ) : task.outputRefNo ? (
                          <div className="space-y-0.5">
                            <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                              Ref: {task.outputRefNo}
                            </span>
                            {task.completedAt && (
                              <span className="text-[10px] text-slate-400 block">{task.completedAt}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic font-medium">Processing request...</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {task.status === 'REJECTED' ? (
                          <Link
                            to="/agent/services"
                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Re-Apply</span>
                          </Link>
                        ) : task.status === 'COMPLETED' || task.status === 'VERIFIED' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedTask(task)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="h-3.5 w-3.5 text-slate-500" />
                              <span className="hidden sm:inline">View</span>
                            </button>
                            <button
                              onClick={() => handleDownloadDocument(task)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>Download</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                            Awaiting Output
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Response Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 relative animate-in fade-in zoom-in-95">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Service Application Deliverable Response</span>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Request Number:</span>
                  <span className="font-mono font-bold text-blue-700 text-sm">{selectedTask.taskNo}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Service Name:</span>
                  <span className="font-bold text-slate-900">{selectedTask.serviceName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-semibold text-slate-700">{selectedTask.category}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Service Fee Paid:</span>
                  <span className="font-mono font-bold text-slate-900">₹ {selectedTask.amount.toFixed(2)}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Output Reference No:</span>
                    <span className="font-mono font-bold text-emerald-700">{selectedTask.outputRefNo || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Completed On:</span>
                    <span className="font-medium text-slate-800">{selectedTask.completedAt || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Completion Notes / Output Remarks:</span>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-800 font-medium italic">
                      "{selectedTask.outputNote || 'Document generated and attached.'}"
                    </div>
                  </div>

                  {/* Render Operator Uploaded Output Deliverable Documents */}
                  {selectedTask.outputFiles && Object.keys(selectedTask.outputFiles).length > 0 && (
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                        📄 Operator Deliverable Output Documents ({Object.keys(selectedTask.outputFiles).length})
                      </span>
                      <div className="space-y-2">
                        {Object.entries(selectedTask.outputFiles).map(([label, fileName]) => (
                          <div key={label} className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-emerald-800 uppercase block">{label}</span>
                              <span className="font-mono text-xs font-bold text-slate-800">{fileName}</span>
                            </div>
                            <button
                              onClick={() => handleDownloadDocument(selectedTask)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>Download</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Receipt</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleDownloadDocument(selectedTask);
                      setSelectedTask(null);
                    }}
                    className="px-4.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Certificate</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
