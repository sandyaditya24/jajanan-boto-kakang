import React, { useState } from 'react';
import {
  Plus,
  Minus,
  MessageCircle,
  AlertCircle,
  Sparkles,
  Flame,
  Info,
  X,
  Send,
} from 'lucide-react';
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
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [customNote, setCustomNote] = useState('');

  // Fallback food imagery if image broken or empty
  const fallbackImage =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';

  const waLink = generateSingleItemWhatsAppLink(item, shopInfo);

  const handleCustomWaOrder = () => {
    let text = `Halo *${shopInfo.shopName}*! 👋\n\nSaya mau pesan menu:\n• *${item.name}* (1 porsi) - ${formatRupiah(item.price)}`;
    if (customNote.trim()) {
      text += `\n📝 *Catatan Tambahan:* ${customNote.trim()}`;
    }
    text += `\n\nApakah menu ini siap dipesan? Terima kasih! 🙏`;
    const cleanPhone = shopInfo.whatsappNumber.replace(/[^0-9]/g, '').replace(/^0/, '62');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
    setShowDetailModal(false);
  };

  return (
    <>
      <div
        className={`group bg-white rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
          item.isAvailable
            ? 'border-stone-200/90 shadow-xs hover:shadow-xl hover:border-emerald-500/60 hover:-translate-y-0.5'
            : 'border-stone-200 bg-stone-50/80 opacity-75'
        }`}
      >
        <div>
          {/* Food Image with Badges */}
          <div
            onClick={() => setShowDetailModal(true)}
            className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 cursor-pointer"
          >
            <img
              src={imageError || !item.imageUrl ? fallbackImage : item.imageUrl}
              alt={item.name}
              onError={() => setImageError(true)}
              loading="lazy"
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-108 ${
                !item.isAvailable ? 'grayscale contrast-75' : ''
              }`}
            />

            {/* Subtle bottom vignette gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

            {/* Badge Pill (e.g. Best Seller / Favorit) */}
            {item.badge && item.isAvailable && (
              <div className="absolute top-3 left-3 bg-gradient-to-r from-emerald-800 to-teal-800 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 border border-white/20">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                <span>{item.badge}</span>
              </div>
            )}

            {/* Spicy level indicator */}
            {item.spicyLevel !== undefined && item.spicyLevel > 0 && item.isAvailable && (
              <div className="absolute top-3 right-3 bg-red-700/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
                <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
                <span>Level {item.spicyLevel}</span>
              </div>
            )}

            {/* Portion / Category Badge */}
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-semibold drop-shadow-md">
              <span className="bg-stone-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-white/10 text-[10px]">
                {item.category}
              </span>
              {item.portion && (
                <span className="bg-emerald-900/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 text-[10px]">
                  {item.portion}
                </span>
              )}
            </div>

            {/* Out of stock overlay */}
            {!item.isAvailable && (
              <div className="absolute inset-0 bg-stone-950/65 backdrop-blur-[2px] flex items-center justify-center p-2">
                <span className="bg-red-700 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-xl flex items-center gap-1.5 border border-red-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Habis Hari Ini
                </span>
              </div>
            )}
          </div>

          {/* Content details */}
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3
                onClick={() => setShowDetailModal(true)}
                className="font-extrabold text-base sm:text-lg text-stone-900 leading-snug line-clamp-2 hover:text-emerald-700 cursor-pointer transition-colors"
              >
                {item.name}
              </h3>
            </div>

            <p className="text-xs text-stone-500 line-clamp-2 mb-4 leading-relaxed">
              {item.description || 'Jajanan pilihan resep terbaik Kakang.'}
            </p>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-400 font-medium block">Harga Porsi</span>
                <span className="text-lg sm:text-xl font-black text-emerald-800 tracking-tight">
                  {formatRupiah(item.price)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowDetailModal(true)}
                className="cursor-pointer text-stone-400 hover:text-emerald-700 p-1.5 rounded-xl hover:bg-emerald-50 transition-colors"
                title="Lihat detail menu"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="p-4 pt-0 sm:p-5 sm:pt-0">
          <div className="border-t border-stone-100 pt-3 flex items-center gap-2">
            {item.isAvailable ? (
              <>
                {/* Direct WhatsApp Order */}
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Pesan menu ini langsung via WhatsApp"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 active:scale-95 border border-emerald-200/80 font-bold text-xs py-2.5 px-3 rounded-2xl transition-all shadow-2xs"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">Pesan WA</span>
                </a>

                {/* Cart stepper */}
                {cartQuantity > 0 ? (
                  <div className="flex items-center bg-stone-100 rounded-2xl border border-stone-200 p-1 shadow-2xs">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-xl bg-white text-stone-800 shadow-xs hover:bg-stone-200 active:scale-90 font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center font-black text-xs text-stone-900">
                      {cartQuantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs hover:bg-emerald-800 active:scale-90 font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onAddToCart(item)}
                    className="cursor-pointer inline-flex items-center justify-center gap-1.5 bg-stone-900 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs py-2.5 px-3.5 rounded-2xl shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                )}
              </>
            ) : (
              <div className="w-full text-center py-2 text-xs font-semibold text-stone-400 bg-stone-100 rounded-2xl border border-stone-200/60">
                Stok Sedang Habis
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
              <img
                src={imageError || !item.imageUrl ? fallbackImage : item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setShowDetailModal(false)}
                className="cursor-pointer absolute top-3 right-3 w-8 h-8 rounded-full bg-stone-900/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-stone-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              {item.badge && (
                <div className="absolute top-3 left-3 bg-emerald-800 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                  {item.badge}
                </div>
              )}
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                    {item.category}
                  </span>
                  {item.portion && (
                    <span className="text-xs font-medium text-stone-500">
                      Porsi: {item.portion}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-stone-900 mt-1">{item.name}</h3>
                <div className="text-2xl font-black text-emerald-800 mt-1">
                  {formatRupiah(item.price)}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Deskripsi Menu:
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {item.description || 'Jajanan lezat khas pilihan resep terbaik Kakang.'}
                </p>
              </div>

              {item.isAvailable && (
                <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2">
                  <label className="block text-xs font-bold text-stone-800">
                    Catatan Pesanan Khusus (Opsional):
                  </label>
                  <input
                    type="text"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Contoh: Cuko dipisah, bumbu banyakin"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              )}
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center gap-2">
              <button
                onClick={() => {
                  onAddToCart(item);
                  setShowDetailModal(false);
                }}
                disabled={!item.isAvailable}
                className="cursor-pointer flex-1 py-3 px-4 rounded-2xl font-bold text-xs bg-stone-900 hover:bg-emerald-900 active:scale-95 text-white disabled:bg-stone-300 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah ke Keranjang</span>
              </button>

              <button
                onClick={handleCustomWaOrder}
                disabled={!item.isAvailable}
                className="cursor-pointer py-3 px-4 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white disabled:bg-stone-300 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <Send className="w-4 h-4" />
                <span>Pesan via WA</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
