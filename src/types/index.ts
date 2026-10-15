export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
  badge?: string;
  updatedAt?: string;
}

export interface ShopInfo {
  shopName: string;
  address: string;
  whatsappNumber: string;
  openingHours: string;
  announcement: string;
  updatedAt?: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
}

export type ViewMode = 'buyer' | 'seller';
