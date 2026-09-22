import apiClient from '../api/client';

export interface ComplaintTicket {
  id: string;
  ticketNo: string;
  raisedByUserId?: number | string;
  raisedByName: string;
  raisedByRole: 'agent' | 'operator' | 'distributor' | 'manager' | 'super_admin' | 'sub_admin';
  subject: string;
  category: string;
  description: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';
  resolutionNote?: string;
  resolvedBy?: string;
  createdAt: string;
}

class ComplaintStoreService {
  private complaints: ComplaintTicket[] = [];
  private listeners: (() => void)[] = [];
  private currentUserId: string = '';

  constructor() {
    this.initFromLocalUser();
  }

  private initFromLocalUser() {
    try {
      const userStr = localStorage.getItem('v2online_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.currentUserId = user.id?.toString() || '';
        this.loadFromStorage();
        this.syncBackend();
      }
    } catch {
      // No user logged in yet
    }
  }

  public setUser(userId: string | number) {
    const newId = userId.toString();
    if (this.currentUserId !== newId) {
      this.currentUserId = newId;
      this.complaints = [];
      this.loadFromStorage();
    }
    this.syncBackend();
  }

  public clearUser() {
    this.currentUserId = '';
    this.complaints = [];
    this.notify();
  }

  private getStorageKey(): string {
    return `v2online_complaints_${this.currentUserId}`;
  }

  public async syncBackend() {
    try {
      const response = await apiClient.get('/complaints');
      if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        this.complaints = response.data.data;
        this.saveToStorage();
      }
    } catch {
      // Offline fallback
    }
  }

  private loadFromStorage() {
    if (!this.currentUserId) return;
    try {
      const saved = localStorage.getItem(this.getStorageKey());
      if (saved) {
        this.complaints = JSON.parse(saved);
      }
    } catch {
      this.complaints = [];
    }
  }

  private saveToStorage() {
    if (!this.currentUserId) return;
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(this.complaints));
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

  public getComplaintsForUser(userId?: string | number, mobile?: string, name?: string): ComplaintTicket[] {
    const uIdStr = userId?.toString();
    const mobStr = mobile?.toString();
    const filtered = this.complaints.filter(c => {
      const cUserId = c.raisedByUserId?.toString();
      if (uIdStr && cUserId === uIdStr) return true;
      if (mobStr && cUserId === mobStr) return true;
      if (name && c.raisedByName && c.raisedByName.toLowerCase() === name.toLowerCase()) return true;
      return false;
    });
    return this.sortComplaints(filtered);
  }

  // Raise new complaint — API-first
  public async addComplaint(data: {
    raisedByUserId?: number | string;
    raisedByName: string;
    raisedByRole: 'agent' | 'operator' | 'distributor' | 'manager' | 'super_admin' | 'sub_admin';
    subject: string;
    category: string;
    description: string;
  }): Promise<ComplaintTicket> {
    // Call API first
    try {
      const response = await apiClient.post('/complaints', {
        subject: data.subject,
        category: data.category,
        description: data.description,
        raisedByUserId: data.raisedByUserId,
        raisedByMobile: data.raisedByUserId
      });

      // Re-sync from backend to get real data
      await this.syncBackend();

      if (response.data.status === 'success') {
        return {
          id: response.data.data?.id || Date.now().toString(),
          ticketNo: response.data.data?.ticketNo || 'TKT-PENDING',
          raisedByUserId: data.raisedByUserId,
          raisedByName: data.raisedByName,
          raisedByRole: data.raisedByRole,
          subject: data.subject,
          category: data.category,
          description: data.description,
          status: 'OPEN',
          createdAt: 'Just Now'
        };
      }
    } catch {
      // Offline fallback
    }

    // Offline fallback: add locally
    const year = new Date().getFullYear();
    const newTicket: ComplaintTicket = {
      id: Date.now().toString(),
      ticketNo: `TKT-${year}-OFFLINE`,
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
