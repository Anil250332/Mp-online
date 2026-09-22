import apiClient from '../api/client';

export interface Shop {
  id: string;
  shopCode: string;
  shopName: string;
  ownerName: string;
  mobile: string;
  email: string;
  aadhaar: string;
  address: string;
  password?: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'DELETE_REQUESTED';
  deleteReason?: string;
  registrationType: 'SELF_REGISTER' | 'DISTRIBUTOR_ADDED';
  createdAt: string;
  requestedAt?: string;
  approvedAt?: string;
}

const STORAGE_KEY = 'v2online_shops_db';

class ShopStoreService {
  private shops: Shop[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
    this.syncBackend();
  }

  public async syncBackend() {
    try {
      const response = await apiClient.get('/shops');
      if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        this.shops = response.data.data;
        this.saveToStorage();
      }
    } catch (e) {
      console.error('Failed to sync shops from backend API:', e);
    }
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.shops = JSON.parse(saved);
      } else {
        this.shops = [];
      }
    } catch {
      this.shops = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.shops));
    } catch (e) {
      console.error('Failed to save shops to storage', e);
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

  public getShops(): Shop[] {
    return [...this.shops];
  }

  // Self-Registration Form Submission -> PENDING
  public addSelfRegisteredShop(data: {
    ownerName: string;
    shopName: string;
    mobile: string;
    email: string;
    aadhaar: string;
    address: string;
  }): Shop {
    const year = new Date().getFullYear();
    const nowStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const newShop: Shop = {
      id: Date.now().toString(),
      shopCode: `SHOP-${year}-${1000 + this.shops.length + 1}`,
      ownerName: data.ownerName,
      shopName: data.shopName,
      mobile: data.mobile,
      email: data.email || 'N/A',
      aadhaar: data.aadhaar || 'N/A',
      address: data.address,
      status: 'PENDING',
      registrationType: 'SELF_REGISTER',
      createdAt: nowStr,
      requestedAt: nowStr
    };

    this.shops.unshift(newShop);
    this.saveToStorage();
    return newShop;
  }

  // Distributor Add New Shop Modal -> ACTIVE (API-first)
  public async addActiveShopByDistributor(data: {
    ownerName: string;
    shopName: string;
    mobile: string;
    email: string;
    aadhaar: string;
    address: string;
    password: string;
  }): Promise<Shop> {
    // Call API first to create in database
    try {
      const response = await apiClient.post('/shops', {
        ownerName: data.ownerName,
        shopName: data.shopName,
        mobile: data.mobile,
        email: data.email,
        aadhaar: data.aadhaar,
        address: data.address,
        password: data.password
      });

      // Re-sync from backend
      await this.syncBackend();

      if (response.data.status === 'success' && response.data.data) {
        const shop = this.shops.find(s => s.shopCode === response.data.data.shopCode);
        if (shop) return shop;
      }
    } catch (e) {
      console.error('Failed to add shop via API:', e);
    }

    // Fallback: add locally
    const year = new Date().getFullYear();
    const nowStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const shopCode = `SHOP-${year}-${1000 + this.shops.length + 1}`;
    const newShop: Shop = {
      id: Date.now().toString(),
      shopCode,
      ownerName: data.ownerName,
      shopName: data.shopName,
      mobile: data.mobile,
      email: data.email || 'N/A',
      aadhaar: data.aadhaar || 'N/A',
      address: data.address,
      password: data.password,
      status: 'ACTIVE',
      registrationType: 'DISTRIBUTOR_ADDED',
      createdAt: nowStr,
      requestedAt: nowStr,
      approvedAt: nowStr
    };

    this.shops.unshift(newShop);
    this.saveToStorage();
    return newShop;
  }

  // Approve Pending Shop
  public approveShop(shopId: string) {
    const nowStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    this.shops = this.shops.map(s => {
      if (s.id === shopId) {
        return { ...s, status: 'ACTIVE', approvedAt: nowStr };
      }
      return s;
    });
    this.saveToStorage();

    apiClient.patch(`/shops/${shopId}/approve`).then(() => {
      this.syncBackend();
    }).catch(() => {});
  }

  // Reject Pending Shop
  public rejectShop(shopId: string) {
    this.shops = this.shops.map(s => {
      if (s.id === shopId) {
        return { ...s, status: 'INACTIVE' };
      }
      return s;
    });
    this.saveToStorage();

    apiClient.patch(`/shops/${shopId}/reject`).then(() => {
      this.syncBackend();
    }).catch(() => {});
  }

  // Request Shop Deletion by Distributor
  public requestDeletion(shopId: string, reason: string) {
    this.shops = this.shops.map(s => {
      if (s.id === shopId) {
        return { ...s, status: 'DELETE_REQUESTED', deleteReason: reason };
      }
      return s;
    });
    this.saveToStorage();

    apiClient.post(`/shops/${shopId}/request-delete`, { reason }).then(() => {
      this.syncBackend();
    }).catch(() => {});
  }

  // Admin Approves Deletion Request -> Sets Status to INACTIVE (Login Blocked)
  public approveDeletion(shopId: string) {
    this.shops = this.shops.map(s => {
      if (s.id === shopId) {
        return { ...s, status: 'INACTIVE' };
      }
      return s;
    });
    this.saveToStorage();

    apiClient.patch(`/shops/${shopId}/approve-deletion`).then(() => {
      this.syncBackend();
    }).catch(() => {});
  }
}

export const shopStore = new ShopStoreService();
