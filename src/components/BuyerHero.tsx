import React from 'react';
import { RefreshCw, Megaphone, Search } from 'lucide-react';
import { ShopInfo, MENU_CATEGORIES } from '../types';

interface BuyerHeroProps {
  shopInfo: ShopInfo;
  lastUpdated: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories: string[];
  totalMenuCount: number;
}

// Icons for each requested category
const CATEGORY_ICONS: Record<string, string> = {
  'Semua Menu': '🍽️',
  'Gurih & Renyah': '🥟',
  'Manis & Lumer': '🍯',
  'Pedas Nampol': '🌶️',
  'Makanan Berat & Paket': '🍱',
  'Minuman Segar & Es': '🍹',
  'Camilan Tradisional': '🥞',
  'Promo / Paket Hemat': '✨',
};

export const BuyerHero: React.FC<BuyerHeroProps> = ({
  shopInfo,
  lastUpdated,
  isRefreshing,
  onRefresh,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  totalMenuCount,
}) => {
  return (
    <div className="space-y-4">
      {/* Auto-Update & Cache-Busting Control Card */}
      <div className="bg-white rounded-3xl p-3.5 sm:p-4 border border-stone-200/90 shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status info */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
            </span>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                <span>Cloud Database Terkoneksi</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                  Realtime Active
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Menu ter-update: <span className="font-semibold text-stone-700">{lastUpdated || 'Baru saja'}</span>
              </p>
            </div>
          </div>

          {/* Physical "Perbarui Menu Terbaru" Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-white shadow-md active:scale-95 transition-all duration-200 ${
              isRefreshing
                ? 'bg-stone-400 cursor-not-allowed opacity-90'
                : 'bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 hover:from-emerald-800 hover:to-teal-800 shadow-emerald-700/20 hover:shadow-emerald-700/35'
            }`}
            title="Muat ulang menu langsung dari Cloud Database"
          >
            <RefreshCw
              className={`w-4 h-4 text-white ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>{isRefreshing ? 'Memuat Menu Cloud...' : '🔄 Perbarui Menu Terbaru'}</span>
          </button>
        </div>
      </div>

      {/* Store Announcement if present and enabled */}
      {shopInfo.showAnnouncement !== false && shopInfo.announcement && (
        <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-200/80 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
            <Megaphone className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="flex-1 text-xs sm:text-sm text-stone-700">
            <span className="font-extrabold text-emerald-950 mr-1.5">Info & Promo Toko:</span>
            <span>{shopInfo.announcement}</span>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={`Cari dari ${totalMenuCount} menu jajanan favoritmu...`}
          className="w-full pl-10 pr-9 py-2.5 sm:py-3 bg-white rounded-2xl border border-stone-200 text-sm text-stone-800 placeholder-stone-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-full w-5 h-5 flex items-center justify-center"
          >
            ✕
          </button>
        )}
      </div>

      {/* Categories Horizontal Scroll on Mobile & Desktop */}
      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-none no-scrollbar touch-pan-x">
          {MENU_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const icon = CATEGORY_ICONS[cat] || '✨';
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`cursor-pointer whitespace-nowrap px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-200 shrink-0 flex items-center gap-1.5 active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/20 ring-2 ring-emerald-600/30'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-emerald-50/50 hover:border-emerald-300 hover:text-emerald-900'
                }`}
              >
                <span>{icon}</span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
