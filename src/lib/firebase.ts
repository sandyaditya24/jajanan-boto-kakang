import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  getDocsFromServer,
  getDocFromServer,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { MenuItem, ShopInfo } from '../types';

// Initialize Firebase App & Firestore with provisioned databaseId
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
    },
    operationType,
    path,
  };
  console.warn('Firestore Notice: ', JSON.stringify(errInfo));
  return errInfo;
}

// Local Storage Keys for offline/fallback resilience
const STORAGE_KEY_MENU = 'jajanan_kakang_local_menu_v2';
const STORAGE_KEY_SHOP = 'jajanan_kakang_local_shop_v2';

// Default initial data specified in prompt
export const DEFAULT_SHOP_INFO: ShopInfo = {
  shopName: 'Jajanan Kakang',
  address: 'Perum Bumi Jaya Indah (BJI) Blok AX 09 RT 05/14 Purwakarta',
  whatsappNumber: '+6289620012837',
  openingHours: '10:00 - 21:00 WIB (Setiap Hari)',
  announcement: '🔥 Promo Hari Ini: Pesan Paket The Best gratis es teh manis! Siap antar ke seluruh area Purwakarta.',
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: 'pempek-the-best',
    name: 'Pempek Goreng Paket The Best',
    price: 20000,
    category: 'Camilan & Gorengan',
    description: '1 Kapal Selam Mini, 2 Lenjer Crispy, 2 Kulit Krispi disiram kuah cuko kental pedas asam manis khas Palembang asli.',
    imageUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    badge: 'Best Seller',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cireng-bumbu-rujak',
    name: 'Cireng Bumbu Rujak',
    price: 15000,
    category: 'Camilan & Gorengan',
    description: 'Cireng salju krispi kenyal renyah isi 10 pcs, dicocol bumbu rujak gula aren pedas manis gurih mantap.',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    badge: 'Favorit',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'otak-otak-crispy',
    name: 'Otak-otak Goreng Crispy',
    price: 18000,
    category: 'Camilan & Gorengan',
    description: 'Otak-otak ikan tenggiri goreng garing renyah di luar, lembut kenyal di dalam, disajikan dengan saus cocolan gurih khas Kakang.',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    badge: 'Rekomendasi',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'es-kuwut-bali',
    name: 'Es Kuwut Segar Khas Bali',
    price: 10000,
    category: 'Minuman Segar',
    description: 'Kombinasi kelapa muda serut, potongan melon manis, perasan jeruk nipis segar, selasih, dan sirup dingin pelepas dahaga.',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    badge: 'Paling Segar',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dimsum-mentai',
    name: 'Dimsum Ayam Keju Mentai',
    price: 22000,
    category: 'Makanan Utama',
    description: 'Dimsum daging ayam padat lembut isi 4 pcs dengan lelehan keju mozzarella dan saus mentai bakar wangi berlimpah.',
    imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    badge: 'Spesial',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tahu-bakso-semarang',
    name: 'Tahu Bakso Gurih Khas Semarang',
    price: 18000,
    category: 'Makanan Utama',
    description: 'Tahu cokelat gurih isi daging sapi kenyal isi 5 pcs digoreng hangat, disantap dengan cabai rawit hijau segar.',
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    badge: 'Gurih',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pisang-goreng-madu',
    name: 'Pisang Goreng Madu Wijen',
    price: 15000,
    category: 'Camilan & Gorengan',
    description: 'Pisang raja manis terkaramelisasi madu murni dengan aroma wijen sangrai gurih renyah isi 4 potong besar.',
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    badge: 'Manis Legit',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'es-teh-kampul-jumbo',
    name: 'Es Teh Kampul Melati Jumbo',
    price: 5000,
    category: 'Minuman Segar',
    description: 'Teh melati wangi khas Solo dengan perasan irisan jeruk nipis segar (kampul) dan es batu porsi jumbo 22oz.',
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    badge: 'Hemat',
    updatedAt: new Date().toISOString(),
  },
];

// Helper: Read and write Local Storage
export function getLocalMenuItems(): MenuItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MENU);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read local menu items:', e);
  }
  return DEFAULT_MENU_ITEMS;
}

export function saveLocalMenuItems(items: MenuItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(items));
  } catch (e) {
    console.warn('Could not save local menu items:', e);
  }
}

export function getLocalShopInfo(): ShopInfo {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SHOP);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.shopName) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read local shop info:', e);
  }
  return DEFAULT_SHOP_INFO;
}

export function saveLocalShopInfo(info: ShopInfo): void {
  try {
    localStorage.setItem(STORAGE_KEY_SHOP, JSON.stringify(info));
  } catch (e) {
    console.warn('Could not save local shop info:', e);
  }
}

// Test initial connection as recommended by skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    // Expected when no auth or rules check
    return false;
  }
}

// Seed initial data to Firestore if accessible
export async function seedInitialDataIfEmpty(): Promise<void> {
  try {
    const shopDocRef = doc(db, 'shop_info', 'main');
    const shopSnap = await getDoc(shopDocRef);
    if (!shopSnap.exists()) {
      await setDoc(shopDocRef, DEFAULT_SHOP_INFO);
    }

    const menuColRef = collection(db, 'menu_items');
    const menuSnap = await getDocs(menuColRef);
    if (menuSnap.empty) {
      for (const item of DEFAULT_MENU_ITEMS) {
        await setDoc(doc(db, 'menu_items', item.id), item);
      }
    }
  } catch (error) {
    console.info('Initial cloud seed notice (using local storage fallback if needed)');
  }
}

// Force cache-busting data fetch from Firestore server directly with local fallback
export async function fetchFreshDataFromServer(): Promise<{
  menu: MenuItem[];
  shopInfo: ShopInfo;
}> {
  const localMenu = getLocalMenuItems();
  const localShop = getLocalShopInfo();

  try {
    const [menuSnap, shopSnap] = await Promise.all([
      getDocsFromServer(collection(db, 'menu_items')),
      getDocFromServer(doc(db, 'shop_info', 'main')),
    ]);

    let menu: MenuItem[] = [];
    if (!menuSnap.empty) {
      menu = menuSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<MenuItem, 'id'>),
      }));
      // Persist fresh server menu locally
      saveLocalMenuItems(menu);
    } else {
      menu = localMenu;
    }

    let shopInfo: ShopInfo = localShop;
    if (shopSnap.exists()) {
      shopInfo = shopSnap.data() as ShopInfo;
      saveLocalShopInfo(shopInfo);
    }

    return { menu, shopInfo };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'menu_items/shop_info');
    // Graceful fallback to persistent local data
    return { menu: localMenu, shopInfo: localShop };
  }
}

// Subscribe to menu items in real-time with resilient fallback
export function subscribeToMenuItems(
  onUpdate: (items: MenuItem[]) => void,
  onError?: (err: Error) => void
) {
  const colPath = 'menu_items';
  try {
    return onSnapshot(
      collection(db, colPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<MenuItem, 'id'>),
          }));
          saveLocalMenuItems(items);
          onUpdate(items);
        } else {
          onUpdate(getLocalMenuItems());
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, colPath);
        // Fallback to local items without crashing
        onUpdate(getLocalMenuItems());
        onError?.(error);
      }
    );
  } catch (err) {
    onUpdate(getLocalMenuItems());
    return () => {};
  }
}

// Subscribe to shop info in real-time with resilient fallback
export function subscribeToShopInfo(
  onUpdate: (info: ShopInfo) => void,
  onError?: (err: Error) => void
) {
  const docPath = 'shop_info/main';
  try {
    return onSnapshot(
      doc(db, 'shop_info', 'main'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as ShopInfo;
          saveLocalShopInfo(data);
          onUpdate(data);
        } else {
          onUpdate(getLocalShopInfo());
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, docPath);
        onUpdate(getLocalShopInfo());
        onError?.(error);
      }
    );
  } catch (err) {
    onUpdate(getLocalShopInfo());
    return () => {};
  }
}

// Add new menu item (Saves locally first, then attempts Cloud write safely)
export async function addMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
  const id = 'menu_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const newDoc: MenuItem = {
    ...item,
    id,
    updatedAt: new Date().toISOString(),
  };

  // 1. Immediately update local storage
  const currentItems = getLocalMenuItems();
  const updated = [newDoc, ...currentItems.filter((i) => i.id !== id)];
  saveLocalMenuItems(updated);

  // 2. Attempt Cloud write safely with try-catch
  try {
    await setDoc(doc(db, 'menu_items', id), newDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `menu_items/${id}`);
    console.warn('Firestore write restricted or offline. Item saved safely to local storage.');
  }

  return newDoc;
}

// Update existing menu item (Saves locally first, then attempts Cloud update safely)
export async function updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<void> {
  // 1. Immediately update local storage
  const currentItems = getLocalMenuItems();
  const updated = currentItems.map((item) =>
    item.id === id
      ? { ...item, ...updates, updatedAt: new Date().toISOString() }
      : item
  );
  saveLocalMenuItems(updated);

  // 2. Attempt Cloud update safely with try-catch
  try {
    await updateDoc(doc(db, 'menu_items', id), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `menu_items/${id}`);
    console.warn('Firestore update restricted or offline. Changes saved safely to local storage.');
  }
}

// Delete menu item (Saves locally first, then attempts Cloud delete safely without throwing)
export async function deleteMenuItem(id: string): Promise<void> {
  // 1. Immediately remove from local storage
  const currentItems = getLocalMenuItems();
  const updated = currentItems.filter((item) => item.id !== id);
  saveLocalMenuItems(updated);

  // 2. Attempt Cloud delete safely with try-catch
  try {
    await deleteDoc(doc(db, 'menu_items', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `menu_items/${id}`);
    console.warn('Firestore delete restricted or offline. Item removed safely from local storage.');
    // Do NOT throw error so user's delete flow is completely smooth and unblocked
  }
}

// Toggle availability
export async function toggleItemAvailability(id: string, currentStatus: boolean): Promise<void> {
  return updateMenuItem(id, { isAvailable: !currentStatus });
}

// Update shop information permanently (Saves locally first, then attempts Cloud write safely)
export async function updateShopInfo(info: Partial<ShopInfo>): Promise<void> {
  const currentShop = getLocalShopInfo();
  const updated: ShopInfo = {
    ...currentShop,
    ...info,
    updatedAt: new Date().toISOString(),
  };
  saveLocalShopInfo(updated);

  try {
    await setDoc(doc(db, 'shop_info', 'main'), updated, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'shop_info/main');
    console.warn('Firestore shop_info update restricted or offline. Saved safely to local storage.');
  }
}

// Restore default items
export async function restoreDefaultMenu(): Promise<void> {
  saveLocalMenuItems(DEFAULT_MENU_ITEMS);
  saveLocalShopInfo(DEFAULT_SHOP_INFO);

  try {
    const existingSnap = await getDocs(collection(db, 'menu_items'));
    for (const d of existingSnap.docs) {
      await deleteDoc(doc(db, 'menu_items', d.id));
    }
    for (const item of DEFAULT_MENU_ITEMS) {
      await setDoc(doc(db, 'menu_items', item.id), item);
    }
    await setDoc(doc(db, 'shop_info', 'main'), DEFAULT_SHOP_INFO);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'menu_items/restore');
    console.warn('Firestore restore notice: Local defaults applied.');
  }
}
