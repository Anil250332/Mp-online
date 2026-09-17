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
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  userName?: string;
  shopName?: string;
  userMobile?: string;
  userRole?: string;
  createdAt: string;
}

const STORAGE_KEY = 'v2online_wallet_txns';
const BALANCE_KEY = 'v2online_wallet_balance';

class WalletStoreService {
  private balance: number = 500.00;
  private transactions: WalletTransaction[] = [
    {
      id: '1',
      txnNo: 'TXN-2026-1001',
      type: 'CREDIT',
      category: 'topup',
      amount: 500.00,
      openingBalance: 0.00,
      closingBalance: 500.00,
      remarks: 'Initial Wallet Welcome Bonus',
      status: 'SUCCESS',
      userName: 'Rajesh Sharma',
      shopName: 'Sharma MP Online & CSC Center',
      userMobile: '9876543210',
      userRole: 'agent',
      createdAt: '16 Sep 2026, 10:30 AM'
    }
  ];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
    this.syncBackend();
  }

  public async syncBackend() {
    try {
      const response = await apiClient.get('/wallet/transactions');
      if (response.data.status === 'success') {
        if (typeof response.data.balance === 'number') {
          this.balance = response.data.balance;
        }
        if (Array.isArray(response.data.data)) {
          this.transactions = response.data.data;
        }
        this.saveToStorage();
      }
    } catch {
      // Offline fallback
    }
  }

  private loadFromStorage() {
    try {
      const savedBal = localStorage.getItem(BALANCE_KEY);
      if (savedBal) this.balance = parseFloat(savedBal);

      const savedTxns = localStorage.getItem(STORAGE_KEY);
      if (savedTxns) this.transactions = JSON.parse(savedTxns);
    } catch {
      // Fallback
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(BALANCE_KEY, this.balance.toString());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.transactions));
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

  // Add Money / Recharge Wallet
  public async rechargeWallet(amount: number, remarks?: string): Promise<{ success: boolean; message: string }> {
    const rechargeAmt = parseFloat(amount.toString());
    if (isNaN(rechargeAmt) || rechargeAmt <= 0) {
      return { success: false, message: 'Kripya sahi recharge amount select/enter karein.' };
    }

    const openingBalance = this.balance;
    const closingBalance = openingBalance + rechargeAmt;
    this.balance = closingBalance;

    const year = new Date().getFullYear();
    const newTxn: WalletTransaction = {
      id: Date.now().toString(),
      txnNo: `TXN-${year}-${1000 + this.transactions.length + 1}`,
      type: 'CREDIT',
      category: 'topup',
      amount: rechargeAmt,
      openingBalance,
      closingBalance,
      remarks: remarks || 'Wallet Topup via Instant Auto UPI',
      status: 'SUCCESS',
      createdAt: new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      })
    };

    this.transactions.unshift(newTxn);
    this.saveToStorage();

    // Async sync to backend
    try {
      await apiClient.post('/wallet/recharge', { amount: rechargeAmt, remarks });
      this.syncBackend();
    } catch {
      // Offline fallback
    }

    return {
      success: true,
      message: `₹${rechargeAmt.toFixed(2)} aapke wallet me add ho gaye hain! Current balance: ₹${closingBalance.toFixed(2)}`
    };
  }

  // Deduct Wallet Fee for Service
  public async deductWallet(amount: number, serviceName: string): Promise<{ success: boolean; message: string }> {
    const deductAmt = parseFloat(amount.toString());
    if (this.balance < deductAmt) {
      return {
        success: false,
        message: `Insufficient wallet balance! Available: ₹${this.balance.toFixed(2)}, Required: ₹${deductAmt.toFixed(2)}. Kripya wallet recharge karein.`
      };
    }

    const openingBalance = this.balance;
    const closingBalance = openingBalance - deductAmt;
    this.balance = closingBalance;

    const year = new Date().getFullYear();
    const newTxn: WalletTransaction = {
      id: Date.now().toString(),
      txnNo: `TXN-${year}-${1000 + this.transactions.length + 1}`,
      type: 'DEBIT',
      category: 'service_fee',
      amount: deductAmt,
      openingBalance,
      closingBalance,
      remarks: `Service Fee for ${serviceName}`,
      status: 'SUCCESS',
      createdAt: new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      })
    };

    this.transactions.unshift(newTxn);
    this.saveToStorage();

    // Async sync to backend
    try {
      await apiClient.post('/wallet/deduct', { amount: deductAmt, serviceName });
      this.syncBackend();
    } catch {
      // Offline fallback
    }

    return {
      success: true,
      message: `₹${deductAmt.toFixed(2)} service fee deduct kar li gayi hai! Remaining balance: ₹${closingBalance.toFixed(2)}`
    };
  }
}

export const walletStore = new WalletStoreService();
