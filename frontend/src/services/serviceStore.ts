import apiClient from '../api/client';

export interface ServiceItem {
  id: string;
  name: string;
  code: string;
  fee: number;
  description: string;
  category: string;
  iconName?: string;
  isActive: boolean;
}

const STORAGE_KEY = 'v2online_services_db';

const defaultServices: ServiceItem[] = [
  { id: '1', name: 'Aadhaar Services', code: 'ADR-01', fee: 50.00, description: 'Aadhaar Update, Mobile Link, & Document Upload', category: 'Identity Services', iconName: 'UserCheck', isActive: true },
  { id: '2', name: 'Pan Card Services', code: 'PAN-01', fee: 107.00, description: 'New PAN Card & Correction Application', category: 'Tax & Identity', iconName: 'CreditCard', isActive: true },
  { id: '3', name: 'LL / DL / Vehicle Services', code: 'RTO-01', fee: 150.00, description: 'Learner License, Driving License & RC Renewal', category: 'Transport', iconName: 'Car', isActive: true },
  { id: '4', name: 'Ration Card Services', code: 'RTN-01', fee: 40.00, description: 'Member Add/Remove & New Ration Card', category: 'Food & Civil Supplies', iconName: 'ShoppingBag', isActive: true },
  { id: '5', name: 'Voter ID Services', code: 'VOT-01', fee: 30.00, description: 'Voter Card Form 6, 7, 8 Registration', category: 'Election Commission', iconName: 'Vote', isActive: true },
  { id: '6', name: 'Farmer / Khasra Services', code: 'FRM-01', fee: 45.00, description: 'MP Bhulekh Khasra, Khatauni & Land Record', category: 'Revenue & Land', iconName: 'Tractor', isActive: true },
  { id: '7', name: 'MP Samagra ID Services', code: 'SMG-01', fee: 30.00, description: 'Samagra Family ID, Member KYC & Edit', category: 'Social Security', iconName: 'FileText', isActive: true },
  { id: '8', name: 'MP Ration Parchi Services', code: 'RTP-01', fee: 25.00, description: 'Eligibility Slip & Ration Parchi Print', category: 'Food & Supplies', iconName: 'Printer', isActive: true },
  { id: '9', name: 'MP Sambal Yojana Services', code: 'SMB-01', fee: 50.00, description: 'Unorganized Worker Card & Sambal 2.0 Registration', category: 'Welfare', iconName: 'Shield', isActive: true },
  { id: '10', name: 'Ayushman Card Services', code: 'AYU-01', fee: 30.00, description: 'Ayushman Bharat 5 Lakh Health Card Creation', category: 'Health & Family Welfare', iconName: 'HeartPulse', isActive: true },
  { id: '11', name: 'MP eDistrict Services', code: 'EDT-01', fee: 60.00, description: 'Income, Caste, Residence & Solvency Certificate', category: 'e-Governance', iconName: 'Building', isActive: true },
  { id: '12', name: 'Gumasta License Services', code: 'GUM-01', fee: 200.00, description: 'Shop Establishment & Trade Gumasta License', category: 'Commercial & Trade', iconName: 'Store', isActive: true },
  { id: '13', name: 'Apply Udyam Certificate', code: 'UDY-01', fee: 100.00, description: 'MSME Udyam Registration Certificate', category: 'MSME', iconName: 'Award', isActive: true },
  { id: '14', name: 'GST Registration', code: 'GST-01', fee: 500.00, description: 'New GSTIN Registration & Filing Portal', category: 'Taxation', iconName: 'Receipt', isActive: true }
];

class ServiceStoreService {
  private services: ServiceItem[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
    this.syncBackend();
  }

  public async syncBackend() {
    try {
      const response = await apiClient.get('/services');
      if (response.data.status === 'success' && Array.isArray(response.data.data) && response.data.data.length > 0) {
        this.services = response.data.data;
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
        this.services = JSON.parse(saved);
      } else {
        this.services = [...defaultServices];
        this.saveToStorage();
      }
    } catch {
      this.services = [...defaultServices];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.services));
    } catch (e) {
      console.error('Failed to save services to storage', e);
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

  public getServices(): ServiceItem[] {
    return [...this.services];
  }

  public getActiveServices(): ServiceItem[] {
    return this.services.filter(s => s.isActive);
  }

  // Admin / Manager Adds New Service
  public addService(data: { name: string; fee: number; description: string; category: string }): ServiceItem {
    const newService: ServiceItem = {
      id: Date.now().toString(),
      name: data.name,
      code: `SRV-${Math.floor(100 + Math.random() * 900)}`,
      fee: parseFloat(data.fee.toString()),
      description: data.description,
      category: data.category || 'General Citizen Service',
      isActive: true
    };

    this.services.unshift(newService);
    this.saveToStorage();

    apiClient.post('/services', data).then(() => this.syncBackend()).catch(() => {});
    return newService;
  }

  // Admin / Manager Toggles Service Active Status
  public toggleService(id: string) {
    this.services = this.services.map(s => {
      if (s.id === id) {
        return { ...s, isActive: !s.isActive };
      }
      return s;
    });
    this.saveToStorage();

    apiClient.patch(`/services/${id}/toggle`).then(() => this.syncBackend()).catch(() => {});
  }
}

export const serviceStore = new ServiceStoreService();
