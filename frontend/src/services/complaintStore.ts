import apiClient from '../api/client';

export interface ComplaintTicket {
  id: string;
  ticketNo: string;
  raisedByUserId?: number | string;
  raisedByName: string;
  raisedByRole: 'agent' | 'operator' | 'distributor' | 'manager' | 'super_admin';
  subject: string;
  category: string;
  description: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';
  resolutionNote?: string;
  resolvedBy?: string;
  createdAt: string;
}

const STORAGE_KEY = 'v2online_complaints_db';

const defaultComplaints: ComplaintTicket[] = [
  {
    id: '1',
    ticketNo: 'TKT-2026-9041',
    raisedByUserId: '8888888888',
    raisedByName: 'Rajesh Sharma Distributor',
    raisedByRole: 'distributor',
    subject: 'PAN Card Service Portal Delay in District Huzur',
    category: 'Service Delay',
    description: 'PAN card application processing is taking more than 48 hours for 3 agents in Huzur block.',
    status: 'IN_REVIEW',
    resolutionNote: 'Technical team is reviewing the server response times.',
    createdAt: '15 Sep 2026'
  },
  {
    id: '2',
    ticketNo: 'TKT-2026-8812',
    raisedByUserId: '9876543210',
    raisedByName: 'Sharma MP Online & CSC Center',
    raisedByRole: 'agent',
    subject: 'Kiosk Document Upload Verification Issue',
    category: 'Technical Glitch',
    description: 'PDF upload for Samagra ID modification was failing with 500 status code.',
    status: 'RESOLVED',
    resolutionNote: 'Issue resolved by technical team. File size limit raised to 5MB.',
    resolvedBy: 'Super Admin Master',
    createdAt: '10 Sep 2026'
  }
];

class ComplaintStoreService {
  private complaints: ComplaintTicket[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
    this.syncBackend();
  }

  public async syncBackend() {
    try {
      const response = await apiClient.get('/complaints');
      if (response.data.status === 'success' && Array.isArray(response.data.data) && response.data.data.length > 0) {
        this.complaints = response.data.data;
        this.saveToStorage();
      }
    } catch {
      // Offline fallback
    }
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.complaints = JSON.parse(saved);
      } else {
        this.complaints = [...defaultComplaints];
        this.saveToStorage();
      }
    } catch {
      this.complaints = [...defaultComplaints];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.complaints));
    } catch (e) {
      console.error('Failed to save complaints to storage', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  private sortComplaints(list: ComplaintTicket[]): ComplaintTicket[] {
    const priorityMap: Record<string, number> = {
      OPEN: 1,
      IN_REVIEW: 2,
      RESOLVED: 3,
      CLOSED: 4
    };

    return [...list].sort((a, b) => {
      const pA = priorityMap[a.status?.toUpperCase() || ''] || 5;
      const pB = priorityMap[b.status?.toUpperCase() || ''] || 5;
      if (pA !== pB) {
        return pA - pB;
      }
      return (b.id || '').localeCompare(a.id || '');
    });
  }

  public getComplaints(): ComplaintTicket[] {
    return this.sortComplaints(this.complaints);
  }

  public getComplaintsForUser(userId?: string | number, mobile?: string): ComplaintTicket[] {
    const filtered = this.complaints.filter(c => 
      c.raisedByUserId === userId || 
      c.raisedByUserId === mobile ||
      (mobile && c.raisedByUserId?.toString() === mobile)
    );
    return this.sortComplaints(filtered);
  }

  // Raise new complaint
  public addComplaint(data: {
    raisedByUserId?: number | string;
    raisedByName: string;
    raisedByRole: 'agent' | 'operator' | 'distributor' | 'manager' | 'super_admin';
    subject: string;
    category: string;
    description: string;
  }): ComplaintTicket {
    const year = new Date().getFullYear();
    const newTicket: ComplaintTicket = {
      id: Date.now().toString(),
      ticketNo: `TKT-${year}-${1000 + this.complaints.length + 1}`,
      raisedByUserId: data.raisedByUserId,
      raisedByName: data.raisedByName,
      raisedByRole: data.raisedByRole,
      subject: data.subject,
      category: data.category,
      description: data.description,
      status: 'OPEN',
      createdAt: 'Just Now'
    };

    this.complaints.unshift(newTicket);
    this.saveToStorage();

    // Async sync to backend
    apiClient.post('/complaints', {
      subject: data.subject,
      category: data.category,
      description: data.description,
      raisedByUserId: data.raisedByUserId,
      raisedByMobile: data.raisedByUserId
    }).then(() => {
      this.syncBackend();
    }).catch(() => {});

    return newTicket;
  }

  // Admin / Manager Update Complaint Status & Resolution
  public updateStatus(ticketId: string, status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED', resolutionNote?: string, resolvedBy?: string) {
    this.complaints = this.complaints.map(c => {
      if (c.id === ticketId) {
        return {
          ...c,
          status,
          resolutionNote: resolutionNote !== undefined ? resolutionNote : c.resolutionNote,
          resolvedBy: resolvedBy || c.resolvedBy || 'Admin'
        };
      }
      return c;
    });
    this.saveToStorage();

    // Async sync to backend
    apiClient.patch(`/complaints/${ticketId}/status`, {
      status,
      resolutionNote
    }).catch(() => {});
  }
}

export const complaintStore = new ComplaintStoreService();
