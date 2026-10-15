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

// Initialize Firebase App & Firestore with custom databaseId
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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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

// Test initial connection as required by skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, check connection.');
      return false;
    }
    return true;
  }
}

// Seed initial data if Firestore collections are empty
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
    console.error('Error during initial Firestore seeding:', error);
  }
}

// Force cache-busting data fetch from Firestore server directly
export async function fetchFreshDataFromServer(): Promise<{
  menu: MenuItem[];
  shopInfo: ShopInfo;
}> {
  const menuPath = 'menu_items';
  const shopPath = 'shop_info';

  try {
    const [menuSnap, shopSnap] = await Promise.all([
      getDocsFromServer(collection(db, menuPath)),
      getDocFromServer(doc(db, shopPath, 'main')),
    ]);

    let menu: MenuItem[] = [];
    if (!menuSnap.empty) {
      menu = menuSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<MenuItem, 'id'>),
      }));
    } else {
      // If server returned empty, seed defaults
      await seedInitialDataIfEmpty();
      menu = DEFAULT_MENU_ITEMS;
    }

    let shopInfo: ShopInfo = DEFAULT_SHOP_INFO;
    if (shopSnap.exists()) {
      shopInfo = shopSnap.data() as ShopInfo;
    }

    return { menu, shopInfo };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${menuPath}/${shopPath}`);
    return { menu: DEFAULT_MENU_ITEMS, shopInfo: DEFAULT_SHOP_INFO };
  }
}

// Subscribe to menu items in real-time
export function subscribeToMenuItems(
  onUpdate: (items: MenuItem[]) => void,
  onError?: (err: Error) => void
) {
  const colPath = 'menu_items';
  return onSnapshot(
    collection(db, colPath),
    (snapshot) => {
      if (snapshot.empty) {
        // Trigger auto seed if empty
        seedInitialDataIfEmpty().then(() => {
          onUpdate(DEFAULT_MENU_ITEMS);
        });
      } else {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<MenuItem, 'id'>),
        }));
        onUpdate(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, colPath);
      onError?.(error);
    }
  );
}

// Subscribe to shop info in real-time
export function subscribeToShopInfo(
  onUpdate: (info: ShopInfo) => void,
  onError?: (err: Error) => void
) {
  const docPath = 'shop_info/main';
  return onSnapshot(
    doc(db, 'shop_info', 'main'),
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as ShopInfo);
      } else {
        // Seed default shop info
        setDoc(doc(db, 'shop_info', 'main'), DEFAULT_SHOP_INFO).then(() => {
          onUpdate(DEFAULT_SHOP_INFO);
        });
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, docPath);
      onError?.(error);
    }
  );
}

// Add new menu item to Cloud Firestore
export async function addMenuItem(item: Omit<MenuItem, 'id'>): Promise<string> {
  const path = 'menu_items';
  try {
    const id = 'menu_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newDoc: MenuItem = {
      ...item,
      id,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, path, id), newDoc);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

// Update existing menu item in Cloud Firestore
export async function updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<void> {
  const path = `menu_items/${id}`;
  try {
    await updateDoc(doc(db, 'menu_items', id), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

// Delete menu item from Cloud Firestore
export async function deleteMenuItem(id: string): Promise<void> {
  const path = `menu_items/${id}`;
  try {
    await deleteDoc(doc(db, 'menu_items', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// Toggle availability
export async function toggleItemAvailability(id: string, currentStatus: boolean): Promise<void> {
  return updateMenuItem(id, { isAvailable: !currentStatus });
}

// Update shop information permanently in Cloud Firestore
export async function updateShopInfo(info: Partial<ShopInfo>): Promise<void> {
  const path = 'shop_info/main';
  try {
    await setDoc(
      doc(db, 'shop_info', 'main'),
      {
        ...info,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// Restore default items in Cloud Firestore
export async function restoreDefaultMenu(): Promise<void> {
  const path = 'menu_items';
  try {
    // Delete existing
    const existingSnap = await getDocs(collection(db, path));
    for (const d of existingSnap.docs) {
      await deleteDoc(doc(db, path, d.id));
    }
    // Set defaults
    for (const item of DEFAULT_MENU_ITEMS) {
      await setDoc(doc(db, path, item.id), item);
    }
    await setDoc(doc(db, 'shop_info', 'main'), DEFAULT_SHOP_INFO);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}
