import React from 'react';
import { MapPin, Phone, Clock, Sparkles } from 'lucide-react';
import { ShopInfo } from '../types';
import { formatWhatsAppNumber } from '../utils/format';

interface HeaderProps {
  shopInfo: ShopInfo;
  isBuyerMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ shopInfo }) => {
  const cleanPhone = formatWhatsAppNumber(shopInfo.whatsappNumber);

  return (
    <header className="relative bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white shadow-lg overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute left-1/3 -bottom-16 w-56 h-56 bg-orange-800/30 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 py-5 sm:px-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          {/* Logo & Brand Info */}
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-md p-1.5 border border-white/20 shadow-inner flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-xl bg-amber-500/80 flex items-center justify-center text-2xl shadow-sm">
                🥟
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/30 text-[11px] font-semibold text-amber-100 tracking-wide mb-1">
                <Sparkles className="w-3 h-3 text-amber-200" />
                Kuliner Lezat & Gurih Khas Purwakarta
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                {shopInfo.shopName}
              </h1>
              <p className="text-xs sm:text-sm text-amber-100/90 font-medium flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="line-clamp-1">{shopInfo.address}</span>
              </p>
            </div>
          </div>

          {/* Quick Contact & Hours */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 text-xs">
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 flex items-center gap-1.5 text-amber-50">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>{shopInfo.openingHours}</span>
            </div>
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-3.5 py-1.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 border border-emerald-400/40"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Hubungi WA</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
