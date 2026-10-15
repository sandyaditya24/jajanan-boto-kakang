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

// Local Storage Keys for offline/fallback resilience & full user authority
const STORAGE_KEY_MENU = 'jajanan_kakang_local_menu_v3';
const STORAGE_KEY_SHOP = 'jajanan_kakang_local_shop_v3';
const STORAGE_KEY_DELETED_IDS = 'jajanan_kakang_deleted_ids_v3';

// Default initial shop data specified in user prompt
export const DEFAULT_SHOP_INFO: ShopInfo = {
  shopName: 'Jajanan Kakang',
  tagline: 'Pusat Jajanan & Kuliner Gurih Lezat Khas Purwakarta',
  address: 'Perum Bumi Jaya Indah (BJI) Blok AX 09 RT 05/14 Purwakarta',
  city: 'Purwakarta',
  mapsUrl: 'https://maps.google.com/?q=Perum+Bumi+Jaya+Indah+Purwakarta',
  whatsappNumber: '+6289620012837',
  whatsappNumberSecondary: '',
  openingHours: '10:00 - 21:00 WIB (Buka Setiap Hari)',
  isOpenNow: true,
  announcement: '🔥 Promo Spesial: Pesan Paket The Best hari ini gratis es teh manis! Siap antar se-Purwakarta.',
  showAnnouncement: true,
  deliveryInfo: 'Siap antar area Purwakarta Kota & sekitarnya. Gratis ongkir untuk pesanan min. Rp 30.000.',
  paymentMethods: 'QRIS (Semua Bank & E-Wallet), Transfer BCA/BRI/Mandiri, Tunai / COD',
  bankAccount: 'BCA / DANA / QRIS (Konfirmasi di WhatsApp)',
  adminPin: '132414',
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: 'pempek-the-best',
    name: 'Pempek Goreng Paket The Best',
    price: 20000,
    category: 'Promo / Paket Hemat',
    description: '1 Kapal Selam Mini telur utuh, 2 Lenjer Crispy, 2 Kulit Krispi disiram kuah cuko kental pedas asam manis khas Palembang asli.',
    imageUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    badge: 'Best Seller',
    spicyLevel: 2,
    portion: '1 Paket (5 Pcs + Cuko)',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cireng-bumbu-rujak',
    name: 'Cireng Bumbu Rujak',
    price: 15000,
    category: 'Gurih & Renyah',
    description: 'Cireng salju krispi kenyal renyah isi 10 pcs, dicocol bumbu rujak gula aren pedas manis gurih mantap.',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    badge: 'Favorit',
    spicyLevel: 2,
    portion: '1 Porsi (10 Pcs)',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'otak-otak-crispy',
    name: 'Otak-otak Goreng Crispy',
    price: 18000,
    category: 'Gurih & Renyah',
    description: 'Otak-otak ikan tenggiri goreng garing renyah di luar, lembut kenyal di dalam, disajikan dengan saus cocolan gurih khas Kakang.',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    badge: 'Rekomendasi',
    spicyLevel: 1,
    portion: '1 Porsi (8 Pcs)',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pisang-goreng-madu',
    name: 'Pisang Goreng Madu Wijen',
    price: 15000,
    category: 'Manis & Lumer',
    description: 'Pisang raja manis terkaramelisasi madu murni dengan aroma wijen sangrai gurih renyah isi 4 potong besar.',
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    badge: 'Manis Legit',
    spicyLevel: 0,
    portion: '1 Porsi (4 Pcs Besar)',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tahu-bakso-semarang',
    name: 'Tahu Bakso Pedas Nampol Rawit',
    price: 18000,
    category: 'Pedas Nampol',
    description: 'Tahu cokelat gurih isi adonan bakso sapi kenyal padat isi 5 pcs digoreng hangat, disantap dengan sambal ulek rawit merah nampol.',
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    badge: 'Pedas Juara',
    spicyLevel: 3,
    portion: '1 Porsi (5 Pcs + Cabai)',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dimsum-mentai',
    name: 'Dimsum Ayam Keju Mentai Jumbo',
    price: 22000,
    category: 'Makanan Berat & Paket',
    description: 'Dimsum daging ayam padat lembut isi 4 pcs dengan lelehan keju mozzarella dan saus mentai bakar wangi berlimpah.',
    imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    badge: 'Spesial',
    spicyLevel: 1,
    portion: '1 Porsi (4 Pcs Jumbo)',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'es-kuwut-bali',
    name: 'Es Kuwut Segar Khas Bali',
    price: 10000,
    category: 'Minuman Segar & Es',
    description: 'Kombinasi kelapa muda serut, potongan melon manis, perasan jeruk nipis segar, biji selasih, dan sirup dingin pelepas dahaga.',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    badge: 'Paling Segar',
    spicyLevel: 0,
    portion: 'Cup Jumbo 22oz',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'es-teh-kampul-jumbo',
    name: 'Es Teh Kampul Melati Jumbo',
    price: 5000,
    category: 'Minuman Segar & Es',
    description: 'Teh melati wangi khas Solo dengan perasan irisan jeruk nipis segar (kampul) dan es batu porsi jumbo 22oz.',
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    badge: 'Hemat',
    spicyLevel: 0,
    portion: 'Cup Jumbo 22oz',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pukis-lumer-cokelat-keju',
    name: 'Kue Pukis Istimewa Cokelat Lumer',
    price: 16000,
    category: 'Manis & Lumer',
    description: 'Kue pukis empuk berserat lembut isi 5 pcs dengan lelehan cokelat pasta premium dan taburan keju cheddar parut melimpah.',
    imageUrl: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    badge: 'Favorit',
    spicyLevel: 0,
    portion: '1 Box (5 Pcs)',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'risol-mayo-melt',
    name: 'Risol Mayo Smoke Beef Melt',
    price: 16000,
    category: 'Gurih & Renyah',
    description: 'Risol goreng kulit krispi isi irisan smoked beef gurih, telur rebus, dan saus mayonnaise creamy lumer isi 4 pcs.',
    imageUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    badge: 'Renyah',
    spicyLevel: 0,
    portion: '1 Porsi (4 Pcs)',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kue-lapis-pandan',
    name: 'Kue Lapis Beras Pandan Suji Tradisional',
    price: 12000,
    category: 'Camilan Tradisional',
    description: 'Jajan pasar legendaris kenyal legit wangi daun pandan dan suji alami, perpaduan manis gurih santan kelapa asli.',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    badge: 'Khas Nusantara',
    spicyLevel: 0,
    portion: '1 Mika (4 Pcs)',
    updatedAt: new Date().toISOString(),
  },
];

// Helper: Get tombstone deleted IDs to prevent server re-injecting deleted items on refresh
export function getDeletedItemIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED_IDS);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr);
      }
    }
  } catch (e) {
    console.warn('Error reading deleted IDs:', e);
  }
  return new Set<string>();
}

export function markItemIdAsDeleted(id: string): void {
  try {
    const deleted = getDeletedItemIds();
    deleted.add(id);
    localStorage.setItem(STORAGE_KEY_DELETED_IDS, JSON.stringify(Array.from(deleted)));
  } catch (e) {
    console.warn('Error saving deleted ID:', e);
  }
}

export function unmarkItemIdAsDeleted(id: string): void {
  try {
    const deleted = getDeletedItemIds();
    if (deleted.has(id)) {
      deleted.delete(id);
      localStorage.setItem(STORAGE_KEY_DELETED_IDS, JSON.stringify(Array.from(deleted)));
    }
  } catch (e) {
    console.warn('Error unmarking deleted ID:', e);
  }
}

export function clearDeletedItemIds(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_DELETED_IDS);
  } catch (e) {
    console.warn('Error clearing deleted IDs:', e);
  }
}

// Helper: Read and write Local Storage for Menu Items
export function getLocalMenuItems(): MenuItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MENU);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const deletedIds = getDeletedItemIds();
        return parsed.filter((item) => !deletedIds.has(item.id));
      }
    }
  } catch (e) {
    console.warn('Could not read local menu items:', e);
  }
  // If first time, seed defaults locally
  const initial = DEFAULT_MENU_ITEMS;
  saveLocalMenuItems(initial);
  return initial;
}

export function saveLocalMenuItems(items: MenuItem[]): void {
  try {
    const deletedIds = getDeletedItemIds();
    const cleanItems = items.filter((item) => !deletedIds.has(item.id));
    localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(cleanItems));
  } catch (e) {
    console.warn('Could not save local menu items:', e);
  }
}

// Helper: Read and write Local Storage for Shop Info
export function getLocalShopInfo(): ShopInfo {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SHOP);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.shopName) {
        return {
          ...DEFAULT_SHOP_INFO,
          ...parsed,
        };
      }
    }
  } catch (e) {
    console.warn('Could not read local shop info:', e);
  }
  const initial = DEFAULT_SHOP_INFO;
  saveLocalShopInfo(initial);
  return initial;
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
    return false;
  }
}

// Seed initial data to cloud if accessible and not yet modified
export async function seedInitialDataIfEmpty(): Promise<void> {
  try {
    const shopDocRef = doc(db, 'shop_info', 'main');
    const shopSnap = await getDoc(shopDocRef);
    if (!shopSnap.exists()) {
      await setDoc(shopDocRef, DEFAULT_SHOP_INFO);
    }
  } catch (error) {
    console.info('Initial cloud sync notice');
  }
}

// Smart merger: server items filtered against deleted IDs, combined with local newly added items
function mergeMenuLists(serverItems: MenuItem[], localItems: MenuItem[]): MenuItem[] {
  const deletedIds = getDeletedItemIds();
  const validServerItems = serverItems.filter((item) => !deletedIds.has(item.id));
  const serverMap = new Map(validServerItems.map((item) => [item.id, item]));

  // For any item in local, if it is newer or not on server, keep local version
  const result: MenuItem[] = [];
  const processedIds = new Set<string>();

  // Process local items first (they have the seller's latest changes)
  for (const localItem of localItems) {
    if (deletedIds.has(localItem.id)) continue;

    const serverItem = serverMap.get(localItem.id);
    if (!serverItem) {
      // Local item not yet on server or offline write: KEEP IT!
      result.push(localItem);
    } else {
      // If local updatedAt is newer than or equal to server, prefer local
      const localTime = new Date(localItem.updatedAt || 0).getTime();
      const serverTime = new Date(serverItem.updatedAt || 0).getTime();
      if (localTime >= serverTime) {
        result.push(localItem);
      } else {
        result.push(serverItem);
      }
    }
    processedIds.add(localItem.id);
  }

  // Add any server items that weren't processed and not deleted
  for (const serverItem of validServerItems) {
    if (!processedIds.has(serverItem.id)) {
      result.push(serverItem);
    }
  }

  return result;
}

// Force cache-busting data fetch from Firestore server directly with local authority
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

    let mergedMenu: MenuItem[] = localMenu;
    if (!menuSnap.empty) {
      const serverItems = menuSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<MenuItem, 'id'>),
      }));
      mergedMenu = mergeMenuLists(serverItems, localMenu);
      saveLocalMenuItems(mergedMenu);
    }

    let mergedShop: ShopInfo = localShop;
    if (shopSnap.exists()) {
      const serverShop = shopSnap.data() as ShopInfo;
      // Merge with priority to local settings if updated recently
      const localTime = new Date(localShop.updatedAt || 0).getTime();
      const serverTime = new Date(serverShop.updatedAt || 0).getTime();
      if (serverTime > localTime) {
        mergedShop = { ...DEFAULT_SHOP_INFO, ...serverShop };
      } else {
        mergedShop = { ...DEFAULT_SHOP_INFO, ...localShop };
      }
      saveLocalShopInfo(mergedShop);
    }

    return { menu: mergedMenu, shopInfo: mergedShop };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'menu_items/shop_info');
    return { menu: localMenu, shopInfo: localShop };
  }
}

// Subscribe to menu items in real-time with resilient authority
export function subscribeToMenuItems(
  onUpdate: (items: MenuItem[]) => void,
  onError?: (err: Error) => void
) {
  const colPath = 'menu_items';
  try {
    return onSnapshot(
      collection(db, colPath),
      (snapshot) => {
        const localMenu = getLocalMenuItems();
        if (!snapshot.empty) {
          const serverItems = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<MenuItem, 'id'>),
          }));
          const merged = mergeMenuLists(serverItems, localMenu);
          saveLocalMenuItems(merged);
          onUpdate(merged);
        } else {
          onUpdate(localMenu);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, colPath);
        onUpdate(getLocalMenuItems());
        onError?.(error);
      }
    );
  } catch (err) {
    onUpdate(getLocalMenuItems());
    return () => {};
  }
}

// Subscribe to shop info in real-time with resilient authority
export function subscribeToShopInfo(
  onUpdate: (info: ShopInfo) => void,
  onError?: (err: Error) => void
) {
  const docPath = 'shop_info/main';
  try {
    return onSnapshot(
      doc(db, 'shop_info', 'main'),
      (docSnap) => {
        const localShop = getLocalShopInfo();
        if (docSnap.exists()) {
          const serverData = docSnap.data() as ShopInfo;
          const localTime = new Date(localShop.updatedAt || 0).getTime();
          const serverTime = new Date(serverData.updatedAt || 0).getTime();
          const finalShop =
            serverTime > localTime
              ? { ...DEFAULT_SHOP_INFO, ...serverData }
              : { ...DEFAULT_SHOP_INFO, ...localShop };
          saveLocalShopInfo(finalShop);
          onUpdate(finalShop);
        } else {
          onUpdate(localShop);
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

// Add new menu item: user is full master
export async function addMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
  const id = 'menu_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const newDoc: MenuItem = {
    ...item,
    id,
    updatedAt: new Date().toISOString(),
  };

  // Remove any previous tombstone if matching id
  unmarkItemIdAsDeleted(id);

  // 1. Immediately update local storage
  const currentItems = getLocalMenuItems();
  const updated = [newDoc, ...currentItems.filter((i) => i.id !== id)];
  saveLocalMenuItems(updated);

  // 2. Safely sync to Cloud Firestore
  try {
    await setDoc(doc(db, 'menu_items', id), newDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `menu_items/${id}`);
    console.info('Saved locally with full authority.');
  }

  return newDoc;
}

// Update existing menu item: user is full master
export async function updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<void> {
  // 1. Immediately update local storage
  const currentItems = getLocalMenuItems();
  const updated = currentItems.map((item) =>
    item.id === id
      ? { ...item, ...updates, updatedAt: new Date().toISOString() }
      : item
  );
  saveLocalMenuItems(updated);

  // 2. Safely sync to Cloud Firestore
  try {
    await updateDoc(doc(db, 'menu_items', id), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `menu_items/${id}`);
    console.info('Updated locally with full authority.');
  }
}

// Delete menu item: PERMANENTLY REMOVED AND NEVER RESURRECTED ON REFRESH
export async function deleteMenuItem(id: string): Promise<void> {
  // 1. Add ID to tombstone list
  markItemIdAsDeleted(id);

  // 2. Immediately remove from local storage
  const currentItems = getLocalMenuItems();
  const updated = currentItems.filter((item) => item.id !== id);
  saveLocalMenuItems(updated);

  // 3. Attempt deletion from Cloud Firestore
  try {
    await deleteDoc(doc(db, 'menu_items', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `menu_items/${id}`);
    console.info('Deleted locally with permanent tombstone.');
  }
}

// Toggle availability
export async function toggleItemAvailability(id: string, currentStatus: boolean): Promise<void> {
  return updateMenuItem(id, { isAvailable: !currentStatus });
}

// Update shop information permanently
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
    console.info('Shop info updated locally with full authority.');
  }
}

// Restore default items
export async function restoreDefaultMenu(): Promise<void> {
  clearDeletedItemIds();
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
    console.info('Restored defaults locally.');
  }
}
