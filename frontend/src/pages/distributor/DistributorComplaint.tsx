import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { complaintStore, type ComplaintTicket } from '../../services/complaintStore';
import {
  Headphones,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  X
} from 'lucide-react';

export default function DistributorComplaint() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintTicket[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Technical Issue');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync with central store
  useEffect(() => {
    const syncTickets = () => {
      setComplaints(complaintStore.getComplaints());
    };
    syncTickets();
    const unsubscribe = complaintStore.subscribe(syncTickets);
    return unsubscribe;
  }, []);

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!subject.trim() || !description.trim()) {
      setErrorMsg('Please enter both Subject and Description for your complaint ticket.');
      return;
    }

    const newTicket = complaintStore.addComplaint({
      raisedByUserId: user?.mobile || user?.id || '8888888888',
      raisedByName: user?.full_name || 'Distributor User',
      raisedByRole: (user?.role as any) || 'distributor',
      subject,
      category,
      description
    });

    setSuccessMsg(`Complaint Ticket "${newTicket.ticketNo}" raised successfully! Our support team will review it.`);
    setSubject('');
    setDescription('');
    setTimeout(() => {
      setIsModalOpen(false);
      setSuccessMsg('');
    }, 2500);
  };

  const priorityMap: Record<string, number> = {
    OPEN: 1,
    IN_REVIEW: 2,
    RESOLVED: 3,
    CLOSED: 4
  };

  const filteredComplaints = complaints.filter(c =>
    c.ticketNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const pA = priorityMap[a.status?.toUpperCase() || ''] || 5;
    const pB = priorityMap[b.status?.toUpperCase() || ''] || 5;
    if (pA !== pB) return pA - pB;
    return (b.id || '').localeCompare(a.id || '');
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Headphones className="h-6 w-6 text-red-600" />
              <span>Distributor Helpdesk & Complaint Portal</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Raise support tickets for technical glitches, portal issues, or manager assistance.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Raise New Ticket</span>
          </button>
        </div>

        {/* Global Action Banner */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="relative w-full">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Ticket No, Subject, or Category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-800">Your Support Tickets ({filteredComplaints.length})</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredComplaints.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No support tickets found matching your search.
              </div>
            ) : (
              filteredComplaints.map((item) => (
                <div key={item.id} className="p-5 hover:bg-slate-50/70 transition-colors space-y-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                        {item.ticketNo}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{item.subject}</h3>
                    </div>

                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      item.status === 'RESOLVED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : item.status === 'IN_REVIEW'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {item.status === 'RESOLVED' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 pl-1">{item.description}</p>

                  {item.resolutionNote && (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Resolution Note:</strong> {item.resolutionNote}
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                    <span>Category: <strong>{item.category}</strong></span>
                    <span>Created: {item.createdAt}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Raise Ticket Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 relative animate-in fade-in zoom-in-95">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                  <Headphones className="h-5 w-5 text-red-600" />
                  <span>Raise Support Ticket</span>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitComplaint} className="space-y-4">
                
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Complaint Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="Technical Issue">Technical Glitch / Portal Bug</option>
                    <option value="Service Delay">Service Processing Delay</option>
                    <option value="Operator Issue">Operator Assistance</option>
                    <option value="Account & Login">Account & Password Problem</option>
                    <option value="Other">Other General Query</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Subject / Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Brief title of the issue..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Detailed Description *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Explain the problem in detail with shop name or application reference number..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                  >
                    Submit Ticket
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
