import React, { useState } from 'react';
import { ShoppingBag, X, Plus, Minus, Trash2, Send, MapPin, User, FileText } from 'lucide-react';
import { CartItem, ShopInfo } from '../types';
import { formatRupiah, generateCartWhatsAppLink } from '../utils/format';

interface CartDrawerProps {
  cart: CartItem[];
  shopInfo: ShopInfo;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  cart,
  shopInfo,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  const totalQuantity = cart.reduce((sum, ci) => sum + ci.quantity, 0);
  const totalPrice = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);

  if (cart.length === 0) return null;

  const handleSendOrder = () => {
    const waUrl = generateCartWhatsAppLink(
      cart,
      shopInfo,
      customerName,
      customerAddress,
      customerNotes
    );
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Sticky Bottom Bar on Mobile/Desktop */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 bg-gradient-to-t from-stone-950/60 via-stone-950/20 to-transparent pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <div className="bg-stone-900/95 backdrop-blur-md text-white p-3.5 rounded-3xl shadow-2xl border border-stone-800 flex items-center justify-between gap-3 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-emerald-700 flex items-center justify-center text-white shadow-md">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs border-2 border-stone-900">
                  {totalQuantity}
                </span>
              </div>
              <div>
                <div className="text-[11px] text-stone-400 font-medium">Total ({totalQuantity} menu):</div>
                <div className="text-base font-black text-emerald-400">
                  {formatRupiah(totalPrice)}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(true)}
              className="cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-95 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Lihat & Pesan</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-[11px]">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cart Modal / Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-stone-900 to-emerald-950 text-white flex items-center justify-between border-b border-emerald-900/40">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base sm:text-lg">Pesanan Saya</h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                  {totalQuantity} Item
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="cursor-pointer w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content List */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              <div className="divide-y divide-stone-100">
                {cart.map((ci) => (
                  <div key={ci.item.id} className="py-3 flex items-center justify-between gap-3">
                    <img
                      src={ci.item.imageUrl}
                      alt={ci.item.name}
                      className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-stone-900 truncate">{ci.item.name}</h4>
                      <p className="text-xs text-amber-600 font-semibold">
                        {formatRupiah(ci.item.price * ci.quantity)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-stone-100 rounded-xl p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(ci.item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-white text-stone-700 shadow-2xs font-bold text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-xs text-stone-800">
                          {ci.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(ci.item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-amber-500 text-white shadow-2xs font-bold text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(ci.item.id)}
                        className="text-stone-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order details fields */}
              <div className="bg-amber-50/60 p-3.5 rounded-2xl space-y-3 border border-amber-200/50">
                <div className="text-xs font-bold text-amber-900">
                  Data Pengiriman (Opsional):
                </div>

                <div className="relative">
                  <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nama Pemesan (contoh: Kak Sandy)"
                    className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Alamat Pengantaran di Purwakarta"
                    className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="relative">
                  <FileText className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Catatan (contoh: Cuko pedas dipisah)"
                    className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Footer Summary & WhatsApp Button */}
            <div className="p-4 bg-stone-50 border-t border-stone-100 space-y-3">
              <div className="flex items-center justify-between text-stone-600 text-xs">
                <span>Jumlah Menu:</span>
                <span className="font-semibold text-stone-900">{totalQuantity} porsi</span>
              </div>
              <div className="flex items-center justify-between text-base font-extrabold text-stone-900">
                <span>Total Belanja:</span>
                <span className="text-xl text-amber-600">{formatRupiah(totalPrice)}</span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={onClearCart}
                  className="cursor-pointer px-3 py-3 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-semibold"
                  title="Kosongkan Keranjang"
                >
                  Reset
                </button>
                <button
                  onClick={handleSendOrder}
                  className="cursor-pointer flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/20 text-sm transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Pesan via WhatsApp Sekarang</span>
                </button>
              </div>
              <p className="text-[10px] text-center text-stone-400">
                Pesanan akan langsung dibuka di aplikasi WhatsApp toko ({shopInfo.whatsappNumber})
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
