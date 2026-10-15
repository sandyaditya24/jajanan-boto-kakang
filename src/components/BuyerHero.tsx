import React from 'react';
import { RefreshCw, Megaphone, Search, CheckCircle2 } from 'lucide-react';
import { ShopInfo } from '../types';

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

export const BuyerHero: React.FC<BuyerHeroProps> = ({
  shopInfo,
  lastUpdated,
  isRefreshing,
  onRefresh,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categories,
  totalMenuCount,
}) => {
  return (
    <div className="space-y-4">
      {/* Auto-Update & Cache-Busting Control Card */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-amber-200/70 shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status info */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
                <span>Cloud Database Online</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md">
                  Sinkron Real-time
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Data terbaru: <span className="font-medium text-stone-700">{lastUpdated || 'Baru saja'}</span>
              </p>
            </div>
          </div>

          {/* Physical "Perbarui Menu Terbaru" Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md active:scale-95 transition-all duration-200 ${
              isRefreshing
                ? 'bg-amber-400 cursor-not-allowed opacity-90'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 shadow-orange-500/20 hover:shadow-orange-500/35'
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
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
            <Megaphone className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1 text-xs sm:text-sm text-stone-700">
            <span className="font-extrabold text-amber-900 mr-1.5">Info & Promo Toko:</span>
            <span>{shopInfo.announcement}</span>
          </div>
        </div>
      )}

      {/* Search & Category Filter Navigation */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Cari dari ${totalMenuCount} jajanan favoritmu...`}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white rounded-xl border border-stone-200 text-sm text-stone-800 placeholder-stone-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-full w-5 h-5 flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`cursor-pointer whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 shrink-0 ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30 ring-2 ring-amber-600/20'
                    : 'bg-white text-stone-600 border border-stone-200/80 hover:bg-amber-50 hover:text-amber-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
