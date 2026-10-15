import React, { useState } from 'react';
import { Plus, Minus, MessageCircle, AlertCircle, Sparkles } from 'lucide-react';
import { MenuItem, ShopInfo } from '../types';
import { formatRupiah, generateSingleItemWhatsAppLink } from '../utils/format';

interface MenuCardProps {
  item: MenuItem;
  shopInfo: ShopInfo;
  cartQuantity: number;
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  item,
  shopInfo,
  cartQuantity,
  onAddToCart,
  onUpdateQuantity,
}) => {
  const [imageError, setImageError] = useState(false);

  // Fallback food imagery if image broken or empty
  const fallbackImage =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';

  const waLink = generateSingleItemWhatsAppLink(item, shopInfo);

  return (
    <div
      className={`group bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
        item.isAvailable
          ? 'border-stone-200/80 shadow-xs hover:shadow-md hover:border-amber-300'
          : 'border-stone-200 bg-stone-50/70 opacity-80'
      }`}
    >
      <div>
        {/* Food Image with Badges */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
          <img
            src={imageError || !item.imageUrl ? fallbackImage : item.imageUrl}
            alt={item.name}
            onError={() => setImageError(true)}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              !item.isAvailable ? 'grayscale contrast-75' : ''
            }`}
          />

          {/* Badge Pill (e.g. Best Seller) */}
          {item.badge && item.isAvailable && (
            <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{item.badge}</span>
            </div>
          )}

          {/* Out of stock badge */}
          {!item.isAvailable ? (
            <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] flex items-center justify-center p-2">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Habis Hari Ini
              </span>
            </div>
          ) : (
            <div className="absolute bottom-2 right-2 bg-stone-900/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
              {item.category}
            </div>
          )}
        </div>

        {/* Content details */}
        <div className="p-3.5 sm:p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-sm sm:text-base text-stone-900 leading-snug line-clamp-2">
              {item.name}
            </h3>
          </div>

          <p className="text-xs text-stone-500 line-clamp-2 mb-3 leading-relaxed">
            {item.description || 'Jajanan lezat khas pilihan resep terbaik Kakang.'}
          </p>

          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-extrabold text-amber-600">
              {formatRupiah(item.price)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="p-3.5 pt-0 sm:p-4 sm:pt-0">
        <div className="border-t border-stone-100 pt-3 flex items-center gap-2">
          {item.isAvailable ? (
            <>
              {/* WhatsApp direct order */}
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                title="Pesan menu ini langsung via WhatsApp"
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 active:scale-95 border border-emerald-200/80 font-bold text-xs py-2 px-2.5 rounded-xl transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Pesan WA</span>
              </a>

              {/* Cart stepper */}
              {cartQuantity > 0 ? (
                <div className="flex items-center bg-amber-50 rounded-xl border border-amber-300 p-0.5">
                  <button
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-lg bg-white text-stone-700 shadow-xs hover:bg-amber-100 active:scale-90 font-bold"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-7 text-center font-bold text-xs text-amber-900">
                    {cartQuantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-lg bg-amber-600 text-white shadow-xs hover:bg-amber-700 active:scale-90 font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onAddToCart(item)}
                  className="cursor-pointer inline-flex items-center justify-center gap-1 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              )}
            </>
          ) : (
            <div className="w-full text-center py-1.5 text-xs font-semibold text-stone-400 bg-stone-100 rounded-xl">
              Stok Belum Tersedia
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
