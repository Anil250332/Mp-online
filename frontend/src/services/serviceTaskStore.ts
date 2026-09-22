import { walletStore } from './walletStore';

const STORAGE_TASKS_KEY = 'mponline_operator_tasks';
const STORAGE_WITHDRAWALS_KEY = 'mponline_operator_withdrawals';
const STORAGE_OP_WALLET_KEY = 'mponline_operator_wallet';

export const formatServiceCode = (code?: string): string => {
  if (!code) return 'SRV-001';
  const match = code.match(/^SRV-(\d+)(?:-(\d+))?$/i);
  if (match) {
    const parentId = match[1].padStart(3, '0');
    if (match[2]) {
      const subId = match[2].padStart(2, '0');
      return `SRV-${parentId}-${subId}`;
    }
    return `SRV-${parentId}`;
  }
  return code;
};

export interface ServiceTask {
  id: string;
  taskNo: string;
  shopName: string;
  shopCode: string;
  ownerName: string;
  serviceName: string;
  serviceCode: string;
  category: string;
  amount: number;
  operatorShare: number;
  operatorId: string;
  operatorName: string;
  status: 'PENDING' | 'COMPLETED' | 'VERIFIED' | 'REJECTED';
  outputRefNo?: string;
  outputNote?: string;
  outputFiles?: Record<string, string>;
  rejectReason?: string;
  formData?: Record<string, any>;
  requestedAt: string;
  completedAt?: string;
  verifiedAt?: string;
}

export interface OperatorWithdrawalReq {
  id: string;
  reqNo: string;
  operatorId: string;
  operatorName: string;
  accountHolderName: string;
  mobile: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  upiId?: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'REJECTED';
  requestedAt: string;
  paidAt?: string;
}

export interface OperatorWalletTxn {
  id: string;
  type: 'EARNING' | 'WITHDRAWAL';
  amount: number;
  description: string;
  dateTime: string;
  refNo?: string;
}

const DEFAULT_FORM_DATA_BY_SERVICE: Record<string, Record<string, string>> = {
  'Income & Domicile Certificate': {
    'Applicant Full Name': 'Suresh Kumar Verma',
    'Father / Husband Name': 'Harish Chandra Verma',
    'Aadhaar Card Number': '9812-4412-8891',
    'Mobile Number': '9826199882',
    'Annual Income (₹)': '₹ 1,20,000 / Year',
    'Tehsil & District': 'Huzur, Bhopal (MP)',
    'Full Address': 'Ward #14, Main Gram Panchayat Road, Bhopal',
    'Ration Card Proof': 'applicant_ration_card.pdf (Uploaded Document)',
    'Income Affidavit Doc': 'income_affidavit_signed.pdf (Uploaded Document)',
    'Applicant Passport Photo': 'applicant_photo.jpg (Uploaded Document)'
  },
  'MP Samagra ID Services': {
    'Applicant Head Name': 'Rajesh Sharma',
    'Samagra Family ID': '38910249',
    'Member Name for Correction': 'Anita Sharma',
    'Mobile Number': '9826199882',
    'Correction Type': 'Member Name & Date of Birth Correction',
    'Address': 'Ward #234, MP Nagar Zone 2, Bhopal',
    'Aadhaar Proof Document': 'samagra_aadhar_proof.pdf (Uploaded Document)'
  },
  'MP E-District Revenue Certificate': {
    'Applicant Name': 'Aman Gupta',
    'Father Name': 'Ramesh Gupta',
    'Aadhaar Number': '6666-6666-6666',
    'District / Tehsil': 'Indore, MP',
    'Khasra / Land Record No': 'Khasra #241/2, Block B',
    'Revenue Record Document': 'khasra_b1_copy.pdf (Uploaded Document)'
  },
  'Ayushman Card PVC Print': {
    'Beneficiary Name': 'Kailash Meena',
    'PMJAY Card ID': '1000-8891-2311',
    'Aadhaar Number': '4412-9901-2234',
    'Mobile Number': '9876543210',
    'Delivery Address': 'Ward 12, Main Road, Bhopal',
    'Ayushman E-Card Copy': 'ayushman_card_softcopy.pdf (Uploaded Document)'
  }
};

const ensureTaskFormData = (t: ServiceTask): ServiceTask => {
  if (t.formData && Object.keys(t.formData).length > 0) return t;

  let matchedData: Record<string, string> | undefined = undefined;
  for (const [srvName, data] of Object.entries(DEFAULT_FORM_DATA_BY_SERVICE)) {
    if (t.serviceName.toLowerCase().includes(srvName.toLowerCase())) {
      matchedData = data;
      break;
    }
  }

  if (!matchedData) {
    matchedData = {
      'Applicant Full Name': t.ownerName || 'Client Applicant',
      'Contact Mobile': '9826199882',
      'Aadhaar Number': '9812-4412-8891',
      'District / Address': 'Bhopal, Madhya Pradesh',
      'Identity Document': 'applicant_aadhaar_card.pdf (Uploaded Document)'
    };
  }

  return {
    ...t,
    formData: matchedData
  };
};

class ServiceTaskStoreService {
  private tasks: ServiceTask[] = [];

  private withdrawals: OperatorWithdrawalReq[] = [];

  private walletTxns: OperatorWalletTxn[] = [];

  private opBalance: number = 0;
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const tasksStr = localStorage.getItem(STORAGE_TASKS_KEY);
      if (tasksStr) {
        const parsed: ServiceTask[] = JSON.parse(tasksStr);
        // Clean out stale mock tasks from early testing
        this.tasks = parsed.filter(t => !t.serviceName?.toLowerCase().includes('licence'));
      }

      const wdrStr = localStorage.getItem(STORAGE_WITHDRAWALS_KEY);
      if (wdrStr) this.withdrawals = JSON.parse(wdrStr);

      const balStr = localStorage.getItem(STORAGE_OP_WALLET_KEY);
      if (balStr) this.opBalance = parseFloat(balStr);
    } catch {
      // keep defaults
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(this.tasks));
      localStorage.setItem(STORAGE_WITHDRAWALS_KEY, JSON.stringify(this.withdrawals));
      localStorage.setItem(STORAGE_OP_WALLET_KEY, this.opBalance.toString());
    } catch {
      // ignore
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
    this.listeners.forEach(l => l());
  }

  // Task methods
  public getTasks(): ServiceTask[] {
    return this.tasks.map(ensureTaskFormData);
  }

  public getTasksForShop(_shopCode?: string): ServiceTask[] {
    return this.tasks.map(ensureTaskFormData);
  }

  public createTask(data: {
    shopName: string;
    shopCode: string;
    ownerName: string;
    serviceName: string;
    serviceCode: string;
    category: string;
    amount: number;
    adminCommissionPercent?: number;
    operatorShare?: number;
    formData?: Record<string, any>;
    operatorId?: string;
    operatorName?: string;
  }): ServiceTask {
    const nowStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    
    // Calculate max task number to prevent ID collisions
    const maxNum = this.tasks.reduce((max, t) => {
      const match = t.taskNo ? t.taskNo.match(/TSK-2026-(\d+)/) : null;
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 8000);

    const taskNo = `TSK-2026-${maxNum + 1}`;

    const commPercent = data.adminCommissionPercent !== undefined ? data.adminCommissionPercent : 0;
    const computedShare = Number((data.amount - (data.amount * (commPercent / 100))).toFixed(2));
    const operatorShare = data.operatorShare !== undefined ? data.operatorShare : computedShare;

    const newTask: ServiceTask = {
      id: Date.now().toString(),
      taskNo,
      shopName: data.shopName,
      shopCode: data.shopCode,
      ownerName: data.ownerName,
      serviceName: data.serviceName,
      serviceCode: data.serviceCode,
      category: data.category,
      amount: data.amount,
      operatorShare,
      operatorId: data.operatorId || 'op_1',
      operatorName: data.operatorName || 'Processing Official',
      status: 'PENDING',
      formData: data.formData,
      requestedAt: nowStr
    };

    this.tasks.unshift(newTask);
    this.saveToStorage();
    return ensureTaskFormData(newTask);
  }

  public getTasksForOperator(operatorId?: string | number): ServiceTask[] {
    if (!operatorId) return this.tasks.map(ensureTaskFormData);
    const opIdStr = String(operatorId);
    const res = this.tasks.filter(t => String(t.operatorId) === opIdStr || t.operatorId === 'op_1' || t.operatorId === 'all');
    return res.map(ensureTaskFormData);
  }

  // Operator Marks Work Complete (Sends to Admin/Manager for Verification)
  public completeTask(
    taskId: string, 
    outputRefNo: string, 
    outputNote: string, 
    operatorName?: string,
    outputFiles?: Record<string, string>
  ) {
    const nowStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    this.tasks = this.tasks.map(t => {
      if (t.id === taskId || t.taskNo === taskId) {
        return {
          ...t,
          status: 'COMPLETED',
          outputRefNo: outputRefNo || `REF-${Date.now().toString().slice(-6)}`,
          outputNote: outputNote || 'Work completed successfully',
          outputFiles: outputFiles || t.outputFiles,
          operatorName: operatorName || t.operatorName || 'Operator',
          completedAt: nowStr
        };
      }
      return t;
    });

    this.saveToStorage();
  }

  // Admin/Manager Verifies Task Quality -> CREDITS OPERATOR WALLET HERE!
  public verifyTask(taskId: string, _verifierName?: string) {
    const nowStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    let creditedShare = 0;
    let verifiedTaskNo = '';
    let serviceTitle = '';

    this.tasks = this.tasks.map(t => {
      if (t.id === taskId || t.taskNo === taskId) {
        if (t.status !== 'VERIFIED') {
          creditedShare = t.operatorShare;
          verifiedTaskNo = t.taskNo;
          serviceTitle = t.serviceName;
        }
        return { ...t, status: 'VERIFIED', verifiedAt: nowStr };
      }
      return t;
    });

    if (creditedShare > 0) {
      this.opBalance += creditedShare;
      this.walletTxns.unshift({
        id: Date.now().toString(),
        type: 'EARNING',
        amount: creditedShare,
        description: `Service Execution Share credited: ${serviceTitle} (${verifiedTaskNo})`,
        dateTime: nowStr,
        refNo: verifiedTaskNo
      });
    }

    this.saveToStorage();
  }

  // Reject Task & Auto-Refund Service Fee to Shop Wallet
  public rejectTask(taskId: string, reason?: string) {
    const nowStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    let rejectedTask: ServiceTask | null = null;

    this.tasks = this.tasks.map(t => {
      if (t.id === taskId) {
        rejectedTask = {
          ...t,
          status: 'REJECTED',
          outputNote: reason || 'Application rejected by operator/manager',
          completedAt: nowStr
        };
        return rejectedTask;
      }
      return t;
    });

    if (rejectedTask) {
      const task = rejectedTask as ServiceTask;
      walletStore.addRefund({
        amount: task.amount,
        serviceName: task.serviceName,
        appId: task.taskNo,
        remarks: reason || 'Application Rejected'
      });
    }

    this.saveToStorage();
  }

  // Withdrawal methods
  public getWithdrawalRequests(): OperatorWithdrawalReq[] {
    return [...this.withdrawals];
  }

  public getOperatorWallet(): { balance: number; txns: OperatorWalletTxn[] } {
    return { balance: this.opBalance, txns: [...this.walletTxns] };
  }

  public submitWithdrawal(data: {
    operatorName: string;
    accountHolderName: string;
    mobile: string;
    bankName: string;
    accountNo: string;
    ifsc: string;
    upiId?: string;
    amount: number;
  }) {
    const nowStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const reqNo = `WDR-2026-${100 + this.withdrawals.length + 1}`;
    
    const newReq: OperatorWithdrawalReq = {
      id: Date.now().toString(),
      reqNo,
      operatorId: 'op_1',
      operatorName: data.operatorName,
      accountHolderName: data.accountHolderName,
      mobile: data.mobile,
      bankName: data.bankName,
      accountNo: data.accountNo,
      ifsc: data.ifsc,
      upiId: data.upiId || undefined,
      amount: data.amount,
      status: 'PENDING',
      requestedAt: nowStr
    };

    this.withdrawals.unshift(newReq);
    this.opBalance -= data.amount;
    this.walletTxns.unshift({
      id: Date.now().toString(),
      type: 'WITHDRAWAL',
      amount: data.amount,
      description: `Payout Withdrawal Request Submitted (${data.bankName})`,
      dateTime: nowStr,
      refNo: reqNo
    });

    this.saveToStorage();
    return newReq;
  }

  public approveWithdrawal(id: string) {
    const nowStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    this.withdrawals = this.withdrawals.map(w => {
      if (w.id === id) {
        return { ...w, status: 'PAID', paidAt: nowStr };
      }
      return w;
    });
    this.saveToStorage();
  }

  public rejectWithdrawal(id: string) {
    let refundAmount = 0;
    this.withdrawals = this.withdrawals.map(w => {
      if (w.id === id) {
        refundAmount = w.amount;
        return { ...w, status: 'REJECTED' };
      }
      return w;
    });

    if (refundAmount > 0) {
      this.opBalance += refundAmount;
      this.walletTxns.unshift({
        id: Date.now().toString(),
        type: 'EARNING',
        amount: refundAmount,
        description: `Refunded rejected withdrawal request`,
        dateTime: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      });
    }

    this.saveToStorage();
  }

  public resetTasks() {
    this.tasks = [
      {
        id: '1',
        taskNo: 'TSK-2026-8004',
        shopName: 'Sharma MP Online & CSC Center',
        shopCode: 'SHOP-2026-1003',
        ownerName: 'Rajesh Sharma',
        serviceName: 'MP Samagra ID Services',
        serviceCode: 'SRV-1',
        category: 'Citizen Services',
        amount: 400,
        operatorShare: 320,
        operatorId: 'op_1',
        operatorName: 'Ramesh Kumar Verma',
        status: 'COMPLETED',
        outputNote: 'wert',
        formData: DEFAULT_FORM_DATA_BY_SERVICE['MP Samagra ID Services'],
        requestedAt: '19 Sept 2026, 01:06 am',
        completedAt: '19 Sept 2026, 01:06 am'
      },
      {
        id: '2',
        taskNo: 'TSK-2026-8001',
        shopName: 'Sharma MP Online & CSC Center',
        shopCode: 'SHOP-2026-1003',
        ownerName: 'Rajesh Sharma',
        serviceName: 'Income & Domicile Certificate',
        serviceCode: 'SRV-005',
        category: 'Citizen Services',
        amount: 200,
        operatorShare: 160,
        operatorId: 'op_1',
        operatorName: 'Ramesh Kumar Verma',
        status: 'COMPLETED',
        outputNote: 'Documents processed successfully.',
        formData: DEFAULT_FORM_DATA_BY_SERVICE['Income & Domicile Certificate'],
        requestedAt: '18 Sept 2026, 11:30 am',
        completedAt: '18 Sept 2026, 11:45 am'
      },
      {
        id: '3',
        taskNo: 'TSK-2026-8002',
        shopName: 'Digital Seva Kendra',
        shopCode: 'SHOP-2026-1004',
        ownerName: 'Aman Gupta',
        serviceName: 'MP E-District Revenue Certificate',
        serviceCode: 'SRV-002',
        category: 'Citizen Services',
        amount: 300,
        operatorShare: 240,
        operatorId: 'op_1',
        operatorName: 'Ramesh Kumar Verma',
        status: 'COMPLETED',
        formData: DEFAULT_FORM_DATA_BY_SERVICE['MP E-District Revenue Certificate'],
        outputRefNo: 'MP-INC-2026-9921',
        outputNote: 'Certificate generated & signed successfully.',
        requestedAt: '18 Sept 2026, 10:15 am',
        completedAt: '18 Sept 2026, 10:50 am'
      },
      {
        id: '4',
        taskNo: 'TSK-2026-8003',
        shopName: 'ma kali Services',
        shopCode: 'SHOP-2026-1008',
        ownerName: 'test owner',
        serviceName: 'Ayushman Card PVC Print',
        serviceCode: 'SRV-001',
        category: 'Health Services',
        amount: 150,
        operatorShare: 120,
        operatorId: 'op_2',
        operatorName: 'Suresh Patel',
        status: 'VERIFIED',
        formData: DEFAULT_FORM_DATA_BY_SERVICE['Ayushman Card PVC Print'],
        outputRefNo: 'AYU-PVC-7731',
        requestedAt: '17 Sept 2026, 03:00 pm',
        completedAt: '17 Sept 2026, 03:40 pm',
        verifiedAt: '17 Sept 2026, 04:00 pm'
      }
    ];
    this.saveToStorage();
  }
}

export const serviceTaskStore = new ServiceTaskStoreService();
