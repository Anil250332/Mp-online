import apiClient from '../api/client';

export interface WalletTransaction {
  id: string;
  txnNo: string;
  type: 'CREDIT' | 'DEBIT';
  category: 'topup' | 'service_fee' | 'operator_earning' | 'distributor_commission' | 'refund' | 'withdrawal' | 'admin_adjustment';
  amount: number;
  openingBalance: number;
  closingBalance: number;
  remarks: string;
  appId?: string; // Application / Task ID (e.g., TSK-2026-8004 or APP-2026-1001)
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  userName?: string;
  shopName?: string;
  userMobile?: string;
  userRole?: string;
  createdAt: string;
}

class WalletStoreService {
  private balance: number = 0;
  private transactions: WalletTransaction[] = [];
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
      this.balance = 0;
      this.transactions = [];
      this.loadFromStorage();
    }
    this.syncBackend();
  }

  public clearUser() {
    this.currentUserId = '';
    this.balance = 0;
    this.transactions = [];
    this.notify();
  }

  private getStorageKey(suffix: string): string {
    return `v2online_wallet_${suffix}_${this.currentUserId}`;
  }

  public async syncBackend() {
    try {
      const response = await apiClient.get('/wallet/transactions');
      if (response.data.status === 'success') {
        if (typeof response.data.balance === 'number') {
          this.balance = response.data.balance;
        }
        if (Array.isArray(response.data.data)) {
          this.transactions = response.data.data.map((t: any) => {
            let extractedAppId = t.appId || t.app_id || null;
            if (!extractedAppId && t.remarks) {
              const match = t.remarks.match(/\[(?:App|Task)\s*ID:\s*([^\]]+)\]/i) || t.remarks.match(/(TSK-\d{4}-\d{4})/i);
              if (match) extractedAppId = match[1];
            }
            return {
              ...t,
              appId: extractedAppId || undefined
            };
          });
        }
        this.saveToStorage();
      }
    } catch {
      // Offline fallback
    }
  }

  private loadFromStorage() {
    if (!this.currentUserId) return;
    try {
      const savedBal = localStorage.getItem(this.getStorageKey('balance'));
      if (savedBal) this.balance = parseFloat(savedBal);

      const savedTxns = localStorage.getItem(this.getStorageKey('txns'));
      if (savedTxns) {
        const parsed = JSON.parse(savedTxns);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.transactions = parsed;
        } else {
          this.populateDefaults();
        }
      } else {
        this.populateDefaults();
      }
    } catch {
      this.populateDefaults();
    }
  }

  private populateDefaults() {
    this.balance = 2100.00;
    this.transactions = [
      {
        id: 'txn-1004',
        txnNo: 'TXN-2026-1004',
        type: 'DEBIT',
        category: 'service_fee',
        amount: 400.00,
        openingBalance: 2500.00,
        closingBalance: 2100.00,
        remarks: 'Service Fee for MP Samagra ID Services',
        appId: 'TSK-2026-1004',
        status: 'SUCCESS',
        createdAt: '19 Sept 2026, 01:06 am'
      },
      {
        id: 'txn-1003',
        txnNo: 'TXN-2026-1003',
        type: 'CREDIT',
        category: 'topup',
        amount: 2000.00,
        openingBalance: 500.00,
        closingBalance: 2500.00,
        remarks: 'Wallet Auto UPI Topup',
        status: 'SUCCESS',
        createdAt: '19 Sept 2026, 12:35 am'
      }
    ];
  }

  private saveToStorage() {
    if (!this.currentUserId) return;
    try {
      localStorage.setItem(this.getStorageKey('balance'), this.balance.toString());
      localStorage.setItem(this.getStorageKey('txns'), JSON.stringify(this.transactions));
    } catch (e) {
      console.error('Failed to save wallet data to storage', e);
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

  public getBalance(): number {
    return this.balance;
  }

  public getTransactions(): WalletTransaction[] {
    return [...this.transactions];
  }

  // Recharge Wallet (Add Money)
  public async rechargeWallet(amount: number, remarks?: string): Promise<{ success: boolean; message: string }> {
    const rechargeAmt = parseFloat(amount.toString());
    if (isNaN(rechargeAmt) || rechargeAmt <= 0) {
      return { success: false, message: 'Kripya sahi recharge amount enter/select karein.' };
    }

    try {
      const response = await apiClient.post('/wallet/recharge', { amount: rechargeAmt, remarks });
      if (response.data.status === 'success') {
        await this.syncBackend();
        return {
          success: true,
          message: response.data.message || `₹${rechargeAmt.toFixed(2)} aapke wallet me add ho gaye hain!`
        };
      }
    } catch {
      // Offline fallback below
    }

    const opening = this.balance;
    const closing = opening + rechargeAmt;
    this.balance = closing;

    const newTxn: WalletTransaction = {
      id: Date.now().toString(),
      txnNo: `TXN-2026-${1000 + this.transactions.length + 1}`,
      type: 'CREDIT',
      category: 'topup',
      amount: rechargeAmt,
      openingBalance: opening,
      closingBalance: closing,
      remarks: remarks || 'Wallet Auto UPI Topup',
      status: 'SUCCESS',
      createdAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    };

    this.transactions.unshift(newTxn);
    this.saveToStorage();
    return { success: true, message: `₹${rechargeAmt.toFixed(2)} wallet me add kar diye gaye hain!` };
  }

  // Deduct Wallet Balance for Service Application
  public async deductWallet(amount: number, serviceName: string, appId?: string): Promise<{ success: boolean; message: string }> {
    const deductAmt = parseFloat(amount.toString());
    if (isNaN(deductAmt) || deductAmt <= 0) {
      return { success: false, message: 'Invalid deduction amount.' };
    }

    if (this.balance < deductAmt) {
      return { success: false, message: `Insufficient wallet balance! Available ₹${this.balance.toFixed(2)}, required ₹${deductAmt.toFixed(2)}.` };
    }

    try {
      const response = await apiClient.post('/wallet/deduct', { amount: deductAmt, serviceName, appId });
      if (response.data.status === 'success') {
        await this.syncBackend();
        return {
          success: true,
          message: response.data.message || `₹${deductAmt.toFixed(2)} deducted for ${serviceName}.`
        };
      }
    } catch {
      // Offline fallback below
    }

    const opening = this.balance;
    const closing = opening - deductAmt;
    this.balance = closing;

    const newTxn: WalletTransaction = {
      id: Date.now().toString(),
      txnNo: `TXN-2026-${1000 + this.transactions.length + 1}`,
      type: 'DEBIT',
      category: 'service_fee',
      amount: deductAmt,
      openingBalance: opening,
      closingBalance: closing,
      remarks: `Service Fee for ${serviceName}`,
      appId: appId || undefined,
      status: 'SUCCESS',
      createdAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    };

    this.transactions.unshift(newTxn);
    this.saveToStorage();
    return { success: true, message: `₹${deductAmt.toFixed(2)} service fee deduct kar li gayi hai!` };
  }

  // Auto-Refund Wallet for Rejected Service Application
  public async addRefund(data: {
    amount: number;
    serviceName: string;
    appId?: string;
    remarks?: string;
  }): Promise<{ success: boolean; message: string }> {
    const refundAmt = parseFloat(data.amount.toString());
    if (isNaN(refundAmt) || refundAmt <= 0) {
      return { success: false, message: 'Invalid refund amount.' };
    }

    try {
      const response = await apiClient.post('/wallet/refund', {
        amount: refundAmt,
        serviceName: data.serviceName,
        appId: data.appId,
        remarks: data.remarks
      });
      if (response.data.status === 'success') {
        await this.syncBackend();
        return { success: true, message: response.data.message };
      }
    } catch {
      // Offline fallback below
    }

    const opening = this.balance;
    const closing = opening + refundAmt;
    this.balance = closing;

    const newTxn: WalletTransaction = {
      id: Date.now().toString(),
      txnNo: `TXN-2026-${1000 + this.transactions.length + 1}`,
      type: 'CREDIT',
      category: 'refund',
      amount: refundAmt,
      openingBalance: opening,
      closingBalance: closing,
      remarks: `Refund: ${data.serviceName} ${data.remarks ? `(${data.remarks})` : 'Application Rejected'}`,
      appId: data.appId || undefined,
      status: 'SUCCESS',
      createdAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    };

    this.transactions.unshift(newTxn);
    this.saveToStorage();
    return { success: true, message: `₹${refundAmt.toFixed(2)} application refund credited to shop wallet.` };
  }
}

export const walletStore = new WalletStoreService();
