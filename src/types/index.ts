export const MENU_CATEGORIES = [
  'Semua Menu',
  'Gurih & Renyah',
  'Manis & Lumer',
  'Pedas Nampol',
  'Makanan Berat & Paket',
  'Minuman Segar & Es',
  'Camilan Tradisional',
  'Promo / Paket Hemat',
] as const;

export type MenuCategory = (typeof MENU_CATEGORIES)[number];

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
  badge?: string;
  spicyLevel?: number; // 0: Tidak pedas, 1: Sedang, 2: Pedas Mantap, 3: Ekstra Pedas
  portion?: string; // e.g. "1 Porsi", "10 Pcs", "Cup 22oz"
  updatedAt?: string;
}

export interface ShopInfo {
  shopName: string;
  tagline: string;
  address: string;
  city: string;
  mapsUrl?: string;
  whatsappNumber: string;
  whatsappNumberSecondary?: string;
  openingHours: string;
  isOpenNow: boolean;
  announcement: string;
  showAnnouncement: boolean;
  deliveryInfo: string;
  paymentMethods: string;
  bankAccount: string;
  adminPin: string;
  updatedAt?: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
  selectedSpicyLevel?: number;
}

export type ViewMode = 'buyer' | 'seller';
