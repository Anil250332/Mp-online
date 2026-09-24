import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
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
  RotateCcw,
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
  status: 'pending' | 'assigned' | 'processing' | 'completed' | 'verified' | 'rejected';
  govtAckNo?: string;
  rejectionReason?: string;
  createdAt: string;
  completedAt?: string;
  shopName?: string;
  documents?: ApplicationDoc[];
  completionOutputData?: string | { note?: string; files?: ApplicationDoc[] };
}

export default function AgentServiceRequests() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/applications/my-requests');
      if (res.data.status === 'success') {
        setApplications(res.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch applications:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

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

  const filteredApps = applications.filter(app => {
    const s = (app.status || '').toLowerCase();
    const matchesTab =
      activeTab === 'ALL'
        ? true
        : activeTab === 'PENDING'
        ? s === 'pending' || s === 'assigned' || s === 'processing'
        : activeTab === 'COMPLETED'
        ? s === 'completed' || s === 'verified'
        : s === 'rejected';

    const matchesSearch =
      app.applicationNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.govtAckNo && app.govtAckNo.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const getTabCount = (tab: 'ALL' | 'PENDING' | 'COMPLETED' | 'REJECTED') => {
    if (tab === 'ALL') return applications.length;
    if (tab === 'PENDING') return applications.filter(a => ['pending', 'assigned', 'processing'].includes(a.status?.toLowerCase())).length;
    if (tab === 'COMPLETED') return applications.filter(a => ['completed', 'verified'].includes(a.status?.toLowerCase())).length;
    return applications.filter(a => a.status?.toLowerCase() === 'rejected').length;
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
              Live status from MySQL database, official operator outputs & verified certificates.
            </p>
          </div>

          <button
            onClick={fetchApplications}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center gap-2">
          {(['ALL', 'PENDING', 'COMPLETED', 'REJECTED'] as const).map((tab) => (
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
              placeholder="Search by Application No (e.g. APP-2026-1001), Service Name, or Ref No..."
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
              Service Applications ({filteredApps.length})
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Shop: {user?.shop_name || 'My Kiosk Center'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                  <th className="py-3.5 px-4">Application No & Service</th>
                  <th className="py-3.5 px-4">Fee Deducted</th>
                  <th className="py-3.5 px-4">Applied Date</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Govt Ack / Deliverable</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      No service requests found in this filter.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => {
                    const isRej = app.status === 'rejected';

                    return (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs font-bold text-blue-700 block">{app.applicationNo}</span>
                          <span className="font-bold text-slate-900 block">
                            {app.subServiceName && app.subServiceName !== app.serviceName ? `${app.serviceName} (${app.subServiceName})` : app.serviceName}
                          </span>
                          <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.2 rounded mt-0.5">
                            {app.serviceCode}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          ₹ {Number(app.feeDeducted || 0).toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">
                          {new Date(app.createdAt).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit', hour12: true
                          })}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            app.status === 'verified'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : app.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isRej
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {app.status === 'verified' ? (
                              <ShieldCheck className="h-3 w-3 text-blue-600" />
                            ) : app.status === 'completed' ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            ) : isRej ? (
                              <XCircle className="h-3 w-3 text-red-600" />
                            ) : (
                              <Clock className="h-3 w-3 text-amber-600" />
                            )}
                            {app.status?.toUpperCase()}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {isRej ? (
                            <div className="bg-red-50/90 p-2 rounded-xl border border-red-200 text-left max-w-xs mx-auto">
                              <span className="text-[10px] font-bold text-red-800 uppercase block">Rejection Reason:</span>
                              <span className="text-xs text-red-900 font-semibold break-words">
                                {app.rejectionReason || 'Application rejected.'}
                              </span>
                            </div>
                          ) : app.govtAckNo ? (
                            <div className="space-y-0.5">
                              <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                                Ref: {app.govtAckNo}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic font-medium">Processing request...</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {isRej ? (
                            <Link
                              to="/agent/services"
                              className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              <span>Re-Apply</span>
                            </Link>
                          ) : (
                            <button
                              onClick={() => setSelectedApp(app)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5 text-slate-500" />
                              <span>View Details</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Response Modal */}
        {selectedApp && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 relative animate-in fade-in zoom-in-95 my-auto">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Application Details & Documents</span>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Application Number:</span>
                  <span className="font-mono font-bold text-blue-700 text-sm">{selectedApp.applicationNo}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-bold text-slate-900">{selectedApp.serviceName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold uppercase text-slate-900">{selectedApp.status}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Fee Deducted:</span>
                  <span className="font-mono font-bold text-slate-900">₹ {Number(selectedApp.feeDeducted || 0).toFixed(2)}</span>
                </div>

                {selectedApp.govtAckNo && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Govt Ack / Ref No:</span>
                    <span className="font-mono font-bold text-emerald-700">{selectedApp.govtAckNo}</span>
                  </div>
                )}

                {/* Uploaded Documents List */}
                {selectedApp.documents && selectedApp.documents.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      📁 Attached Documents ({selectedApp.documents.length})
                    </span>
                    <div className="space-y-1.5">
                      {selectedApp.documents.map((doc, idx) => (
                        <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">{doc.label}</span>
                            <span className="font-mono text-xs font-semibold text-slate-800">{doc.fileName}</span>
                          </div>
                          <button
                            onClick={() => handleDownloadFile(doc.filePath, doc.fileName)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="h-3 w-3" />
                            <span>Download</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Receipt</span>
                </button>

                <button
                  onClick={() => setSelectedApp(null)}
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
