import React from 'react';
import {
  MapPin,
  Phone,
  Clock,
  Sparkles,
  Truck,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { ShopInfo } from '../types';
import { formatWhatsAppNumber } from '../utils/format';

interface HeaderProps {
  shopInfo: ShopInfo;
  isBuyerMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ shopInfo }) => {
  const cleanPhone = formatWhatsAppNumber(shopInfo.whatsappNumber);

  return (
    <header className="relative bg-gradient-to-br from-stone-950 via-emerald-950 to-stone-900 text-white shadow-2xl overflow-hidden border-b border-emerald-900/40">
      {/* Luxury ambient lighting glows (Deep Emerald & Warm Gold) */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-1/4 -bottom-24 w-80 h-80 bg-emerald-900/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-1/3 top-1/2 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Ticker / Announcement Bar if enabled */}
      {shopInfo.showAnnouncement && shopInfo.announcement && (
        <div className="bg-stone-950/80 backdrop-blur-md border-b border-emerald-800/30 px-4 py-2 text-xs text-emerald-200 flex items-center justify-center gap-2 text-center">
          <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
          <span className="font-semibold tracking-wide line-clamp-1">{shopInfo.announcement}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/10 backdrop-blur-xl p-2 border border-emerald-500/30 shadow-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-emerald-800 to-teal-700 flex items-center justify-center text-3xl sm:text-4xl shadow-inner shadow-black/30 border border-emerald-400/20">
                  🥟
                </div>
              </div>
              <span
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-stone-900 flex items-center justify-center shadow-xs"
                title="Toko Online"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </span>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 backdrop-blur-md border border-emerald-400/30 text-[11px] font-bold text-emerald-200 tracking-wider uppercase mb-1.5 shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-300" />
                {shopInfo.city || 'Purwakarta'} • Kuliner Asli Terlezat
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
                {shopInfo.shopName}
              </h1>

              <p className="text-xs sm:text-sm text-stone-300 font-medium mt-1 max-w-md">
                {shopInfo.tagline || 'Pusat Jajanan & Kuliner Gurih Lezat Khas Purwakarta'}
              </p>

              {/* Physical Address */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                <span className="text-xs text-stone-400 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="line-clamp-1">{shopInfo.address}</span>
                </span>
                {shopInfo.mapsUrl && (
                  <a
                    href={shopInfo.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-emerald-300 hover:text-white underline inline-flex items-center gap-0.5 transition-colors"
                  >
                    <span>Maps</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Badges: Open Status, Delivery, Contact WA */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 text-xs">
            {/* Open / Close Badge */}
            <div
              className={`px-3 py-1.5 rounded-xl backdrop-blur-md border flex items-center gap-2 font-bold shadow-xs ${
                shopInfo.isOpenNow
                  ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                  : 'bg-red-500/20 border-red-400/40 text-red-200'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  shopInfo.isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                }`}
              />
              <span>{shopInfo.isOpenNow ? 'Buka Sekarang' : 'Tutup Sementara'}</span>
            </div>

            {/* Hours */}
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 flex items-center gap-1.5 text-stone-200">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              <span>{shopInfo.openingHours}</span>
            </div>

            {/* Direct WhatsApp Callout */}
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold px-4 py-2 rounded-xl shadow-lg transition-all flex items-center gap-2 border border-emerald-400/30 hover:shadow-emerald-600/30"
            >
              <Phone className="w-4 h-4" />
              <span>Chat WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Delivery / Shipping Guarantee info pill */}
        {shopInfo.deliveryInfo && (
          <div className="mt-4 pt-3 border-t border-emerald-900/50 flex items-center justify-between gap-3 text-xs text-stone-300">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium text-[11px] sm:text-xs">{shopInfo.deliveryInfo}</span>
            </div>
            {shopInfo.paymentMethods && (
              <span className="hidden sm:inline-block text-[11px] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-md text-emerald-200">
                💳 {shopInfo.paymentMethods}
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
