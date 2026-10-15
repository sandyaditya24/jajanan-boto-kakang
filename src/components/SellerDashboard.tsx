import React, { useState } from 'react';
import {
  Lock,
  Plus,
  Edit2,
  Trash2,
  Store,
  Phone,
  MapPin,
  Clock,
  Megaphone,
  Save,
  CheckCircle,
  Eye,
  LogOut,
  RefreshCw,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  X,
  Sliders,
  DollarSign,
  Tag,
  Image as ImageIcon,
} from 'lucide-react';
import { MenuItem, ShopInfo } from '../types';
import { formatRupiah } from '../utils/format';

interface SellerDashboardProps {
  menuItems: MenuItem[];
  shopInfo: ShopInfo;
  onAddMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<string>;
  onUpdateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  onDeleteMenuItem: (id: string) => Promise<void>;
  onToggleAvailability: (id: string, current: boolean) => Promise<void>;
  onUpdateShopInfo: (info: Partial<ShopInfo>) => Promise<void>;
  onRestoreDefaultMenu: () => Promise<void>;
  onSwitchToBuyer: () => void;
  onForceRefresh: () => Promise<void>;
}

const CORRECT_PIN = '132414';

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  menuItems,
  shopInfo,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
  onToggleAvailability,
  onUpdateShopInfo,
  onRestoreDefaultMenu,
  onSwitchToBuyer,
  onForceRefresh,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('jajanan_kakang_seller_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'menu' | 'shop'>('menu');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    price: 15000,
    category: 'Camilan & Gorengan',
    description: '',
    imageUrl: '',
    isAvailable: true,
    badge: '',
  });

  // Shop Info Form
  const [shopForm, setShopForm] = useState<ShopInfo>(shopInfo);
  const [isSavingShop, setIsSavingShop] = useState(false);
  const [shopSaveSuccess, setShopSaveSuccess] = useState(false);

  // Action status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isRefreshingCloud, setIsRefreshingCloud] = useState(false);

  // Sync shopForm when shopInfo updates from Firestore
  React.useEffect(() => {
    setShopForm(shopInfo);
  }, [shopInfo]);

  // Handle PIN entry
  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput === CORRECT_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem('jajanan_kakang_seller_auth', 'true');
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleKeypadPress = (val: string) => {
    if (val === 'C') {
      setPinInput('');
      setPinError(false);
      return;
    }
    if (pinInput.length < 6) {
      const nextPin = pinInput + val;
      setPinInput(nextPin);
      if (nextPin.length === 6) {
        if (nextPin === CORRECT_PIN) {
          setIsAuthenticated(true);
          sessionStorage.setItem('jajanan_kakang_seller_auth', 'true');
          setPinError(false);
          setPinInput('');
        } else {
          setPinError(true);
        }
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('jajanan_kakang_seller_auth');
    setPinInput('');
  };

  // Open modal for adding
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      price: 15000,
      category: 'Camilan & Gorengan',
      description: '',
      imageUrl:
        'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      badge: 'Baru',
    });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description,
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable,
      badge: item.badge || '',
    });
    setIsModalOpen(true);
  };

  // Handle Save Menu Item
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price < 0) return;

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await onUpdateMenuItem(editingItem.id, {
          name: formData.name.trim(),
          price: Number(formData.price),
          category: formData.category,
          description: formData.description.trim(),
          imageUrl: formData.imageUrl.trim(),
          isAvailable: formData.isAvailable,
          badge: formData.badge.trim(),
        });
        showNotice('Menu berhasil diperbarui di Cloud!');
      } else {
        await onAddMenuItem({
          name: formData.name.trim(),
          price: Number(formData.price),
          category: formData.category,
          description: formData.description.trim(),
          imageUrl: formData.imageUrl.trim(),
          isAvailable: formData.isAvailable,
          badge: formData.badge.trim(),
        });
        showNotice('Menu baru berhasil disimpan ke Cloud Database!');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan ke Cloud Firestore. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Menu Item
  const handleDeleteItem = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus menu "${name}" secara permanen dari Cloud?`)) {
      try {
        await onDeleteMenuItem(id);
        showNotice(`Menu "${name}" berhasil dihapus dari Cloud.`);
      } catch (err) {
        console.error(err);
        alert('Gagal menghapus menu.');
      }
    }
  };

  // Handle Save Shop Info
  const handleSaveShopInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingShop(true);
    try {
      await onUpdateShopInfo(shopForm);
      setShopSaveSuccess(true);
      showNotice('Alamat dan Kontak WhatsApp Toko berhasil diperbarui permanen di Cloud!');
      setTimeout(() => setShopSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan informasi toko.');
    } finally {
      setIsSavingShop(false);
    }
  };

  // Handle Restore Default
  const handleRestoreDefaults = async () => {
    if (
      confirm(
        'PERINGATAN: Menu di Cloud akan dikembalikan ke daftar bawaan awal Jajanan Kakang (Pempek, Cireng, Otak-otak, dsb). Lanjutkan?'
      )
    ) {
      try {
        await onRestoreDefaultMenu();
        showNotice('Menu Cloud berhasil di-reset ke data default unggulan!');
      } catch (err) {
        console.error(err);
        alert('Gagal mengembalikan menu default.');
      }
    }
  };

  // Handle Manual Force Refresh
  const handleRefreshCloud = async () => {
    setIsRefreshingCloud(true);
    try {
      await onForceRefresh();
      showNotice('Data Cloud Firestore disinkronkan!');
    } finally {
      setIsRefreshingCloud(false);
    }
  };

  const showNotice = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  // Quick preset food pictures
  const presetPhotos = [
    {
      title: 'Pempek',
      url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Cireng / Gorengan',
      url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Otak-otak / Seafood',
      url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Dimsum Mentai',
      url: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Tahu Bakso',
      url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Pisang Madu',
      url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Es Kuwut / Buah',
      url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Es Teh Jumbo',
      url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80',
    },
  ];

  // -------------------------------------------------------------
  // 1. PIN GATE VIEW
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-amber-200/80 p-6 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20 shadow-inner">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-stone-900">Mode Penjual (Seller)</h2>
            <p className="text-xs text-stone-500 mt-1">
              Masukkan 6 digit PIN keamanan untuk mengelola menu dan info toko Jajanan Kakang.
            </p>
          </div>

          {/* PIN Indicators */}
          <div className="flex justify-center items-center gap-2 py-2">
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              const hasDigit = pinInput.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full transition-all ${
                    hasDigit
                      ? 'bg-amber-600 scale-110 shadow-xs'
                      : 'border-2 border-stone-300 bg-stone-100'
                  }`}
                />
              );
            })}
          </div>

          {pinError && (
            <div className="text-xs font-bold text-red-600 bg-red-50 py-1.5 px-3 rounded-xl border border-red-200 animate-shake">
              ⚠️ PIN salah! Silakan coba lagi.
            </div>
          )}

          {/* Standard Form fallback for desktop/accessibility */}
          <form onSubmit={handlePinSubmit} className="space-y-3">
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              placeholder="Ketik PIN..."
              className="w-full text-center text-lg tracking-widest font-mono py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="cursor-pointer w-full bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold py-2.5 rounded-xl shadow-md transition-all text-sm"
            >
              Buka Akses Penjual
            </button>
          </form>

          {/* Mobile Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map((keyVal) => {
              return (
                <button
                  key={keyVal}
                  type="button"
                  onClick={() => {
                    if (keyVal === '✓') {
                      handlePinSubmit();
                    } else {
                      handleKeypadPress(keyVal);
                    }
                  }}
                  className={`cursor-pointer h-12 rounded-xl text-base font-bold flex items-center justify-center transition-all active:scale-90 ${
                    keyVal === '✓'
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : keyVal === 'C'
                      ? 'bg-stone-200 text-stone-700 hover:bg-stone-300 text-xs'
                      : 'bg-stone-100 text-stone-800 hover:bg-amber-100'
                  }`}
                >
                  {keyVal}
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onSwitchToBuyer}
              className="cursor-pointer text-xs font-semibold text-stone-500 hover:text-amber-700 inline-flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Kembali ke Halaman Pembeli (#buyer)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. AUTHENTICATED SELLER DASHBOARD VIEW
  // -------------------------------------------------------------
  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-16">
      {/* Toast Notification */}
      {actionMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-stone-700 animate-fade-in-down">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Top Seller Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold px-2 py-0.5 rounded-md">
              KONTROL PENJUAL (#seller)
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Cloud Firestore Aktif
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-stone-900 mt-1">
            Dasbor Pengelolaan Jajanan Kakang
          </h2>
        </div>

        {/* Action navigation buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefreshCloud}
            disabled={isRefreshingCloud}
            className="cursor-pointer text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-2 rounded-xl flex items-center gap-1.5"
            title="Tarik pembaruan terbaru dari Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingCloud ? 'animate-spin' : ''}`} />
            <span>Sync Cloud</span>
          </button>
          <button
            onClick={onSwitchToBuyer}
            className="cursor-pointer text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 px-3 py-2 rounded-xl flex items-center gap-1.5"
            title="Buka tampilan pembeli"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Mode Pembeli</span>
          </button>
          <button
            onClick={handleLogout}
            className="cursor-pointer text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-xl flex items-center gap-1"
            title="Kunci sesi admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Kunci</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-[11px] text-stone-500 font-medium">Total Menu</div>
          <div className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-0.5">
            {menuItems.length}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-[11px] text-emerald-600 font-medium">Menu Tersedia</div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-0.5">
            {menuItems.filter((i) => i.isAvailable).length}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-[11px] text-red-500 font-medium">Menu Habis</div>
          <div className="text-xl sm:text-2xl font-extrabold text-red-500 mt-0.5">
            {menuItems.filter((i) => !i.isAvailable).length}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-[11px] text-amber-600 font-medium">Nomor WhatsApp</div>
          <div className="text-xs sm:text-sm font-bold text-stone-800 mt-1 truncate">
            {shopInfo.whatsappNumber}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setActiveTab('menu')}
          className={`cursor-pointer px-4 py-2.5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'menu'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Kelola Menu ({menuItems.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('shop')}
          className={`cursor-pointer px-4 py-2.5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'shop'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Pengaturan Toko & Kontak WA</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: KELOLA MENU */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              onClick={handleOpenAddModal}
              className="cursor-pointer inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 active:scale-95 text-white font-bold py-2.5 px-4 rounded-xl shadow-md text-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Menu Baru</span>
            </button>

            <button
              onClick={handleRestoreDefaults}
              className="cursor-pointer inline-flex items-center justify-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-xl transition-all"
              title="Kembalikan menu awal jika terhapus"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset ke Menu Default</span>
            </button>
          </div>

          {/* Menu Items Table / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-2xs hover:shadow-xs transition-all flex gap-3.5 items-start justify-between"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-stone-100 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-bold text-sm sm:text-base text-stone-900 leading-tight truncate">
                      {item.name}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="text-xs font-bold text-amber-600">
                      {formatRupiah(item.price)}
                    </span>
                    <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    {item.badge && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-md">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-500 line-clamp-1 mt-1">{item.description}</p>

                  {/* Stock Toggle & Edit/Delete actions */}
                  <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-stone-100">
                    <button
                      onClick={() => onToggleAvailability(item.id, item.isAvailable)}
                      className={`cursor-pointer text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                        item.isAvailable
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {item.isAvailable ? '● Tersedia' : '✕ Habis'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="cursor-pointer p-1.5 text-stone-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                        title="Edit Menu"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="cursor-pointer p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Hapus Menu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: PENGATURAN TOKO & KONTAK WA */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'shop' && (
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm max-w-2xl">
          <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-1">
            Informasi Toko & Kontak WhatsApp
          </h3>
          <p className="text-xs text-stone-500 mb-5">
            Data ini akan tersimpan permanen di Cloud Firestore dan langsung diterapkan pada link pemesanan WhatsApp serta tampilan pembeli.
          </p>

          <form onSubmit={handleSaveShopInfo} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Nama Toko Kuliner</label>
              <div className="relative">
                <Store className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={shopForm.shopName}
                  onChange={(e) => setShopForm({ ...shopForm, shopName: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Nomor WhatsApp Toko (Penerima Pesanan)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={shopForm.whatsappNumber}
                  onChange={(e) => setShopForm({ ...shopForm, whatsappNumber: e.target.value })}
                  placeholder="+6289620012837"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Gunakan format +628... atau 08... Semua tombol "Pesan WA" akan ditujukan ke nomor ini.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Alamat Lengkap Toko</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-amber-600 absolute left-3 top-3" />
                <textarea
                  rows={2}
                  required
                  value={shopForm.address}
                  onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                  placeholder="Perum Bumi Jaya Indah (BJI) Blok AX 09 RT 05/14 Purwakarta"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Jam Operasional</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={shopForm.openingHours}
                  onChange={(e) => setShopForm({ ...shopForm, openingHours: e.target.value })}
                  placeholder="10:00 - 21:00 WIB (Setiap Hari)"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Pengumuman / Promo Toko
              </label>
              <div className="relative">
                <Megaphone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <textarea
                  rows={2}
                  value={shopForm.announcement}
                  onChange={(e) => setShopForm({ ...shopForm, announcement: e.target.value })}
                  placeholder="Contoh: Promo Gratis Es Teh Manis untuk pembelian di atas Rp 30.000!"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={isSavingShop}
                className="cursor-pointer inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-2.5 px-5 rounded-xl shadow-md text-sm transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingShop ? 'Menyimpan ke Cloud...' : 'Simpan Pengaturan ke Cloud'}</span>
              </button>

              {shopSaveSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Tersimpan di Cloud!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT MENU */}
      {/* ------------------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 bg-amber-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-base">
                <Edit2 className="w-4 h-4" />
                <span>{editingItem ? 'Edit Menu' : 'Tambah Menu Baru'}</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nama Makanan / Minuman</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Pempek Lenjer Jumbo"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Harga (Rupiah)</label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="number"
                      required
                      min={0}
                      step={500}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Camilan & Gorengan">Camilan & Gorengan</option>
                    <option value="Makanan Utama">Makanan Utama</option>
                    <option value="Minuman Segar">Minuman Segar</option>
                    <option value="Paket Hemat">Paket Hemat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Badge / Tag Khusus</label>
                <div className="relative">
                  <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="Contoh: Best Seller, Favorit, Pedas, Promo"
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Deskripsi Menu</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Jelaskan kelezatan bahan, porsi, dan bumbu pelengkap..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">URL Foto Makanan</label>
                <div className="relative">
                  <ImageIcon className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Preset quick photo choices */}
                <div className="mt-2">
                  <div className="text-[10px] text-stone-400 font-semibold mb-1">
                    Atau pilih foto kuliner siap pakai:
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {presetPhotos.map((preset) => (
                      <button
                        key={preset.title}
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                        className="cursor-pointer shrink-0 text-[10px] bg-stone-100 hover:bg-amber-100 text-stone-700 px-2 py-1 rounded-md border border-stone-200"
                      >
                        {preset.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview Image */}
                {formData.imageUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden h-28 bg-stone-100 border border-stone-200">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="modalIsAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="modalIsAvailable" className="text-xs font-bold text-stone-800">
                  Stok Tersedia (Aktif untuk Dipesan)
                </label>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Menyimpan...' : 'Simpan ke Cloud'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
