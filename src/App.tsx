/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MenuItem, ShopInfo, CartItem } from './types';
import {
  DEFAULT_SHOP_INFO,
  DEFAULT_MENU_ITEMS,
  getLocalMenuItems,
  getLocalShopInfo,
  testConnection,
  seedInitialDataIfEmpty,
  fetchFreshDataFromServer,
  subscribeToMenuItems,
  subscribeToShopInfo,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleItemAvailability,
  updateShopInfo,
  restoreDefaultMenu,
} from './lib/firebase';
import { Header } from './components/Header';
import { BuyerHero } from './components/BuyerHero';
import { MenuCard } from './components/MenuCard';
import { CartDrawer } from './components/CartDrawer';
import { SellerDashboard } from './components/SellerDashboard';
import { getFormattedCurrentTime } from './utils/format';
import { UtensilsCrossed, Sparkles } from 'lucide-react';

export default function App() {
  // Mode state: 'buyer' or 'seller' strictly based on URL hash
  const [currentHash, setCurrentHash] = useState<string>(() => window.location.hash);

  // Data states initialized immediately from local persistent store
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => getLocalMenuItems());
  const [shopInfo, setShopInfo] = useState<ShopInfo>(() => getLocalShopInfo());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Baru saja');
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);

  // Buyer Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Buyer Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Track Hash Changes for Mode Isolation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      setCurrentHash(hash);
      // If hash is neither seller nor buyer, normalize to #buyer
      if (hash !== '#seller' && hash !== '#buyer') {
        window.location.hash = '#buyer';
      }
    };

    if (!window.location.hash) {
      window.location.hash = '#buyer';
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const isSellerMode = currentHash === '#seller';

  // Function to perform force-refresh directly from Cloud Server (Cache-Busting)
  const refreshDataFromCloud = useCallback(async (showFeedback = true) => {
    setIsRefreshing(true);
    try {
      const { menu, shopInfo: freshShop } = await fetchFreshDataFromServer();
      if (menu && menu.length > 0) {
        setMenuItems(menu);
      }
      if (freshShop) {
        setShopInfo(freshShop);
      }
      const timeStr = getFormattedCurrentTime();
      setLastUpdated(timeStr);

      if (showFeedback) {
        setRefreshNotice('✅ Menu terbaru berhasil disinkronkan langsung dari Cloud!');
        setTimeout(() => setRefreshNotice(null), 3000);
      }
    } catch (error) {
      console.error('Failed to force refresh menu:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial Boot & Realtime Sync Setup
  useEffect(() => {
    let unsubscribeMenu: (() => void) | undefined;
    let unsubscribeShop: (() => void) | undefined;

    async function initialize() {
      setIsLoading(true);
      try {
        // Validate Firestore connectivity as required by Firebase skill
        await testConnection();
        // Seed initial data if database is empty
        await seedInitialDataIfEmpty();
        // Force fresh initial pull bypassing local memory caches
        await refreshDataFromCloud(false);

        // Attach Realtime Listeners
        unsubscribeMenu = subscribeToMenuItems((updatedMenu) => {
          if (updatedMenu && updatedMenu.length > 0) {
            setMenuItems(updatedMenu);
            setLastUpdated(getFormattedCurrentTime());
          }
        });

        unsubscribeShop = subscribeToShopInfo((updatedShop) => {
          if (updatedShop) {
            setShopInfo(updatedShop);
          }
        });
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initialize();

    // Cache-Busting on Mobile Tab Visibility Change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshDataFromCloud(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (unsubscribeMenu) unsubscribeMenu();
      if (unsubscribeShop) unsubscribeShop();
    };
  }, [refreshDataFromCloud]);

  // Derived Category List
  const categories = useMemo(() => {
    const set = new Set<string>();
    menuItems.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['Semua', ...Array.from(set)];
  }, [menuItems]);

  // Filtered Menu Items for Buyer View
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'Semua' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, selectedCategory]);

  // Cart Handlers
  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((ci) => {
          if (ci.item.id === itemId) {
            const nextQty = ci.quantity + delta;
            return nextQty > 0 ? { ...ci, quantity: nextQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Immediate Optimistic UI Handlers for Seller Actions
  const handleAddMenuItem = async (itemData: Omit<MenuItem, 'id'>): Promise<string> => {
    const newItem = await addMenuItem(itemData);
    setMenuItems((prev) => [newItem, ...prev.filter((i) => i.id !== newItem.id)]);
    setLastUpdated(getFormattedCurrentTime());
    return newItem.id;
  };

  const handleUpdateMenuItem = async (id: string, updates: Partial<MenuItem>): Promise<void> => {
    await updateMenuItem(id, updates);
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item
      )
    );
    setLastUpdated(getFormattedCurrentTime());
  };

  const handleDeleteMenuItem = async (id: string): Promise<void> => {
    await deleteMenuItem(id);
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
    setCart((prev) => prev.filter((ci) => ci.item.id !== id));
    setLastUpdated(getFormattedCurrentTime());
  };

  const handleToggleAvailability = async (id: string, current: boolean): Promise<void> => {
    await toggleItemAvailability(id, current);
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isAvailable: !current } : item))
    );
    setLastUpdated(getFormattedCurrentTime());
  };

  const handleUpdateShopInfo = async (info: Partial<ShopInfo>): Promise<void> => {
    await updateShopInfo(info);
    setShopInfo((prev) => ({ ...prev, ...info, updatedAt: new Date().toISOString() }));
  };

  const handleRestoreDefaultMenu = async (): Promise<void> => {
    await restoreDefaultMenu();
    setMenuItems(DEFAULT_MENU_ITEMS);
    setShopInfo(DEFAULT_SHOP_INFO);
    setLastUpdated(getFormattedCurrentTime());
  };

  // Switch to Buyer Mode
  const handleSwitchToBuyer = () => {
    window.location.hash = '#buyer';
  };

  return (
    <div className="min-h-screen bg-stone-50/70 text-stone-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Global Top Banner / Header */}
      <Header shopInfo={shopInfo} isBuyerMode={!isSellerMode} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-5 sm:px-6">
        {/* Floating Success Notice for Cache Refresh */}
        {refreshNotice && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-500 animate-bounce">
            {refreshNotice}
          </div>
        )}

        {isSellerMode ? (
          /* ========================================================= */
          /* 1. SELLER MODE (#seller)                                  */
          /* Protected by PIN 132414, allows adding/editing/deleting   */
          /* menu items and updating shop contact & address permanently */
          /* ========================================================= */
          <SellerDashboard
            menuItems={menuItems}
            shopInfo={shopInfo}
            onAddMenuItem={handleAddMenuItem}
            onUpdateMenuItem={handleUpdateMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
            onToggleAvailability={handleToggleAvailability}
            onUpdateShopInfo={handleUpdateShopInfo}
            onRestoreDefaultMenu={handleRestoreDefaultMenu}
            onSwitchToBuyer={handleSwitchToBuyer}
            onForceRefresh={() => refreshDataFromCloud(true)}
          />
        ) : (
          /* ========================================================= */
          /* 2. STRICT BUYER MODE (#buyer)                            */
          /* TOTAL ISOLATION: No admin/seller buttons, no "Kelola",    */
          /* no "+ Tambah Menu", no PIN forms.                         */
          /* Clean, mouthwatering mobile culinary experience.         */
          /* ========================================================= */
          <div className="space-y-6 pb-24">
            {/* Buyer Control Card (Cache-Busting Button, Announcement, Search, Categories) */}
            <BuyerHero
              shopInfo={shopInfo}
              lastUpdated={lastUpdated}
              isRefreshing={isRefreshing}
              onRefresh={() => refreshDataFromCloud(true)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              categories={categories}
              totalMenuCount={menuItems.length}
            />

            {/* Menu Catalog Grid */}
            {isLoading ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-semibold text-stone-600">
                  Mengambil menu terlezat dari Cloud Database...
                </p>
              </div>
            ) : filteredMenuItems.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-stone-200/80 shadow-xs space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-3xl">
                  🥣
                </div>
                <h3 className="font-bold text-lg text-stone-800">Menu Tidak Ditemukan</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Tidak ada menu dengan kata kunci "{searchQuery}" pada kategori {selectedCategory}.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Semua');
                  }}
                  className="cursor-pointer text-xs font-bold text-amber-600 hover:text-amber-700 underline"
                >
                  Tampilkan Semua Menu
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredMenuItems.map((item) => {
                  const cartItem = cart.find((ci) => ci.item.id === item.id);
                  const cartQty = cartItem ? cartItem.quantity : 0;

                  return (
                    <MenuCard
                      key={item.id}
                      item={item}
                      shopInfo={shopInfo}
                      cartQuantity={cartQty}
                      onAddToCart={handleAddToCart}
                      onUpdateQuantity={handleUpdateCartQuantity}
                    />
                  );
                })}
              </div>
            )}

            {/* Buyer Cart Drawer & Sticky Bottom Bar */}
            <CartDrawer
              cart={cart}
              shopInfo={shopInfo}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveFromCart}
              onClearCart={handleClearCart}
            />
          </div>
        )}
      </main>

      {/* Clean, appetising footer */}
      <footer className="mt-auto bg-stone-900 text-stone-400 py-6 text-center text-xs border-t border-stone-800">
        <div className="max-w-5xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-1.5 font-bold text-white text-sm">
            <UtensilsCrossed className="w-4 h-4 text-amber-500" />
            <span>{shopInfo.shopName}</span>
          </div>
          <p className="text-[11px] text-stone-400 max-w-md mx-auto">
            {shopInfo.address} • Kontak WA: {shopInfo.whatsappNumber}
          </p>
          <div className="text-[10px] text-stone-500 flex items-center justify-center gap-1 pt-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Real-time Cloud Database • Auto-fetch & Cache-Busting Terintegrasi</span>
          </div>
          <div className="pt-2 text-[10px] text-stone-600">
            <a
              href="#seller"
              className="hover:text-amber-400 transition-colors inline-flex items-center gap-1 opacity-70 hover:opacity-100"
            >
              <span>🔒 Akses Pemilik Toko (#seller)</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
