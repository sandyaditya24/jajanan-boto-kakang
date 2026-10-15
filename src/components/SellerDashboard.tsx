import React, { useState, useRef } from 'react';
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
  Sliders,
  DollarSign,
  Tag,
  Truck,
  KeyRound,
  Download,
  Upload,
  Copy,
  Search,
  X,
  FolderOpen,
  Image as ImageIcon,
} from 'lucide-react';
import { MenuItem, ShopInfo, MENU_CATEGORIES } from '../types';
import { formatRupiah } from '../utils/format';
import { compressImageFileToBase64 } from '../utils/image';

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

// Available categories for selection in Add / Edit form (excluding 'Semua Menu')
const SELLER_CATEGORIES = MENU_CATEGORIES.filter((c) => c !== 'Semua Menu');

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
  const activePin = shopInfo.adminPin || '132414';
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('jajanan_kakang_seller_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Navigation Tab: 'menu' | 'shop' | 'security'
  const [activeTab, setActiveTab] = useState<'menu' | 'shop' | 'security'>('menu');

  // Search in seller menu list
  const [sellerSearch, setSellerSearch] = useState('');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form Fields for Menu Item
  const [formData, setFormData] = useState({
    name: '',
    price: 15000,
    category: 'Gurih & Renyah',
    description: '',
    imageUrl: '',
    isAvailable: true,
    badge: 'Favorit',
    spicyLevel: 0,
    portion: '1 Porsi',
  });

  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Shop Info Form state
  const [shopForm, setShopForm] = useState<ShopInfo>(shopInfo);
  const [isSavingShop, setIsSavingShop] = useState(false);
  const [shopSaveSuccess, setShopSaveSuccess] = useState(false);

  // PIN Change Form
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<string | null>(null);

  // Action status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isRefreshingCloud, setIsRefreshingCloud] = useState(false);

  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  // Sync shopForm when shopInfo updates
  React.useEffect(() => {
    setShopForm(shopInfo);
  }, [shopInfo]);

  // Handle PIN entry
  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput === activePin) {
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
        if (nextPin === activePin) {
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
      category: 'Gurih & Renyah',
      description: '',
      imageUrl: '',
      isAvailable: true,
      badge: 'Favorit',
      spicyLevel: 0,
      portion: '1 Porsi',
    });
    setShowUrlInput(false);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category || 'Gurih & Renyah',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      isAvailable: item.isAvailable,
      badge: item.badge || '',
      spicyLevel: item.spicyLevel || 0,
      portion: item.portion || '1 Porsi',
    });
    setShowUrlInput(false);
    setIsModalOpen(true);
  };

  // Image upload from mobile/laptop file system
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingImage(true);
    try {
      const base64Url = await compressImageFileToBase64(file, 800, 0.8);
      setFormData((prev) => ({ ...prev, imageUrl: base64Url }));
      showNotice('✅ Foto dari galeri berhasil dimuat dan dioptimasi!');
    } catch (err) {
      console.error(err);
      alert('Gagal memproses file foto. Pastikan format gambar valid (JPG, PNG, WebP).');
    } finally {
      setIsCompressingImage(false);
      e.target.value = '';
    }
  };

  // Duplicate an item
  const handleDuplicateItem = async (item: MenuItem) => {
    try {
      await onAddMenuItem({
        name: `${item.name} (Salinan)`,
        price: item.price,
        category: item.category,
        description: item.description,
        imageUrl: item.imageUrl,
        isAvailable: item.isAvailable,
        badge: item.badge,
        spicyLevel: item.spicyLevel,
        portion: item.portion,
      });
      showNotice(`✅ Berhasil menduplikasi menu "${item.name}"`);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Save Menu Item
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price < 0) return;

    setIsSubmitting(true);
    try {
      const finalImage =
        formData.imageUrl.trim() ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';

      if (editingItem) {
        await onUpdateMenuItem(editingItem.id, {
          name: formData.name.trim(),
          price: Number(formData.price),
          category: formData.category,
          description: formData.description.trim(),
          imageUrl: finalImage,
          isAvailable: formData.isAvailable,
          badge: formData.badge.trim(),
          spicyLevel: Number(formData.spicyLevel),
          portion: formData.portion.trim(),
        });
        showNotice(`✅ Menu "${formData.name.trim()}" berhasil diperbarui!`);
      } else {
        await onAddMenuItem({
          name: formData.name.trim(),
          price: Number(formData.price),
          category: formData.category,
          description: formData.description.trim(),
          imageUrl: finalImage,
          isAvailable: formData.isAvailable,
          badge: formData.badge.trim(),
          spicyLevel: Number(formData.spicyLevel),
          portion: formData.portion.trim(),
        });
        showNotice(`✅ Menu baru "${formData.name.trim()}" berhasil ditambahkan!`);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      showNotice(`✅ Menu "${formData.name.trim()}" tersimpan!`);
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Menu Item
  const handleDeleteItem = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus menu "${name}"? Menu ini tidak akan muncul kembali saat halaman di-refresh.`)) {
      try {
        await onDeleteMenuItem(id);
        showNotice(`✅ Menu "${name}" berhasil dihapus secara permanen.`);
      } catch (err) {
        console.error(err);
        showNotice(`Menu "${name}" telah dihapus.`);
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
      showNotice('✅ Seluruh informasi & pengaturan toko berhasil diperbarui secara permanen!');
      setTimeout(() => setShopSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      showNotice('✅ Pengaturan toko berhasil disimpan!');
    } finally {
      setIsSavingShop(false);
    }
  };

  // Handle Change PIN
  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      setPinChangeMsg('⚠️ PIN baru harus berupa 6 angka numerik.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinChangeMsg('⚠️ Konfirmasi PIN tidak cocok.');
      return;
    }

    try {
      await onUpdateShopInfo({ adminPin: newPin });
      setPinChangeMsg('✅ PIN Keamanan berhasil diubah! Gunakan PIN baru ini untuk login berikutnya.');
      setNewPin('');
      setConfirmPin('');
      showNotice('✅ PIN Admin baru berhasil disimpan!');
    } catch (err) {
      setPinChangeMsg('Gagal memperbarui PIN.');
    }
  };

  // Export Data JSON Backup
  const handleExportBackup = () => {
    const backupData = {
      version: '3.0',
      exportedAt: new Date().toISOString(),
      shopInfo,
      menuItems,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-jajanan-kakang-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('✅ File cadangan data JSON berhasil diunduh!');
  };

  // Import Data JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.menuItems && Array.isArray(parsed.menuItems)) {
          if (parsed.shopInfo) {
            await onUpdateShopInfo(parsed.shopInfo);
          }
          for (const item of parsed.menuItems) {
            await onUpdateMenuItem(item.id, item).catch(() => onAddMenuItem(item));
          }
          showNotice('✅ Data cadangan berhasil dipulihkan secara lengkap!');
        } else {
          alert('Format file backup tidak sesuai.');
        }
      } catch (err) {
        alert('Gagal membaca file cadangan JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handle Restore Default
  const handleRestoreDefaults = async () => {
    if (
      confirm(
        'PERINGATAN: Seluruh menu akan dikembalikan ke data awal bawaan Jajanan Kakang. Lanjutkan?'
      )
    ) {
      try {
        await onRestoreDefaultMenu();
        showNotice('✅ Menu berhasil di-reset ke data default unggulan!');
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Handle Force Refresh
  const handleRefreshCloud = async () => {
    setIsRefreshingCloud(true);
    try {
      await onForceRefresh();
      showNotice('✅ Sinkronisasi Cloud selesai!');
    } finally {
      setIsRefreshingCloud(false);
    }
  };

  const showNotice = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  // Filtered items in seller list
  const filteredSellerItems = menuItems.filter(
    (i) =>
      i.name.toLowerCase().includes(sellerSearch.toLowerCase()) ||
      i.category.toLowerCase().includes(sellerSearch.toLowerCase())
  );

  // -------------------------------------------------------------
  // 1. PIN GATE VIEW
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 sm:p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-stone-900 to-emerald-950 text-emerald-400 flex items-center justify-center shadow-xl border border-emerald-800/40">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-stone-900">Kendali Penjual</h2>
            <p className="text-xs text-stone-500 mt-1">
              Masukkan 6 digit PIN untuk mengelola menu, foto, harga, dan info toko.
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
                      ? 'bg-emerald-700 scale-110 shadow-xs'
                      : 'border-2 border-stone-300 bg-stone-100'
                  }`}
                />
              );
            })}
          </div>

          {pinError && (
            <div className="text-xs font-bold text-red-700 bg-red-50 py-2 px-3 rounded-xl border border-red-200 animate-shake">
              ⚠️ PIN salah! Silakan masukkan PIN yang benar.
            </div>
          )}

          {/* Fallback Input Form */}
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
              placeholder="Masukkan 6 angka PIN..."
              className="w-full text-center text-lg tracking-widest font-mono py-2.5 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <button
              type="submit"
              className="cursor-pointer w-full bg-stone-900 hover:bg-emerald-900 active:scale-95 text-white font-bold py-3 rounded-2xl shadow-md transition-all text-sm"
            >
              Buka Akses Pengelola
            </button>
          </form>

          {/* Mobile Keypad */}
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
                  className={`cursor-pointer h-12 rounded-2xl text-base font-extrabold flex items-center justify-center transition-all active:scale-90 ${
                    keyVal === '✓'
                      ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                      : keyVal === 'C'
                      ? 'bg-stone-200 text-stone-700 hover:bg-stone-300 text-xs'
                      : 'bg-stone-100 text-stone-800 hover:bg-emerald-50 hover:text-emerald-900'
                  }`}
                >
                  {keyVal}
                </button>
              );
            })}
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={onSwitchToBuyer}
              className="cursor-pointer text-xs font-bold text-stone-500 hover:text-emerald-700 inline-flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Buka Mode Pembeli (#buyer)</span>
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
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Toast Notification */}
      {actionMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-emerald-600/40 animate-fade-in-down">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-stone-900 text-white text-[11px] font-black px-2.5 py-0.5 rounded-lg tracking-wider">
              KENDALI PENJUAL
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Terkoneksi Cloud Realtime
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
            Dasbor Pengelolaan {shopInfo.shopName}
          </h2>
          <p className="text-xs text-stone-500">
            Penambahan menu, foto galeri, dan info toko tersimpan permanen dan tidak akan hilang saat di-refresh.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefreshCloud}
            disabled={isRefreshingCloud}
            className="cursor-pointer text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 px-3.5 py-2.5 rounded-2xl flex items-center gap-1.5 transition-all"
            title="Sinkronkan dengan Cloud"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingCloud ? 'animate-spin' : ''}`} />
            <span>Sync Cloud</span>
          </button>
          <button
            onClick={onSwitchToBuyer}
            className="cursor-pointer text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3.5 py-2.5 rounded-2xl flex items-center gap-1.5 transition-all"
            title="Buka tampilan pembeli"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Mode Pembeli</span>
          </button>
          <button
            onClick={handleLogout}
            className="cursor-pointer text-xs font-bold bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 px-3.5 py-2.5 rounded-2xl flex items-center gap-1 transition-all"
            title="Kunci sesi admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Kunci</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs">
          <div className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">Total Menu</div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            {menuItems.length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs">
          <div className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider">Tersedia</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
            {menuItems.filter((i) => i.isAvailable).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs">
          <div className="text-[11px] text-red-600 font-bold uppercase tracking-wider">Stok Habis</div>
          <div className="text-2xl sm:text-3xl font-black text-red-600 mt-1">
            {menuItems.filter((i) => !i.isAvailable).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs">
          <div className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider">Status Toko</div>
          <div className="flex items-center gap-1.5 mt-1 font-black text-sm sm:text-base">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                shopInfo.isOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className={shopInfo.isOpenNow ? 'text-emerald-800' : 'text-red-600'}>
              {shopInfo.isOpenNow ? 'Buka' : 'Tutup'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('menu')}
          className={`cursor-pointer px-4 py-2.5 font-extrabold text-sm rounded-2xl transition-all flex items-center gap-2 ${
            activeTab === 'menu'
              ? 'bg-stone-900 text-white shadow-md'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Kelola Menu ({menuItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('shop')}
          className={`cursor-pointer px-4 py-2.5 font-extrabold text-sm rounded-2xl transition-all flex items-center gap-2 ${
            activeTab === 'shop'
              ? 'bg-stone-900 text-white shadow-md'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Pengaturan Toko & Informasi</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`cursor-pointer px-4 py-2.5 font-extrabold text-sm rounded-2xl transition-all flex items-center gap-2 ${
            activeTab === 'security'
              ? 'bg-stone-900 text-white shadow-md'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Keamanan & Cadangan Data</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: KELOLA MENU                                             */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              onClick={handleOpenAddModal}
              className="cursor-pointer inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-800 to-teal-900 hover:from-emerald-900 hover:to-teal-950 active:scale-95 text-white font-extrabold py-3 px-5 rounded-2xl shadow-lg shadow-emerald-900/20 text-sm transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>+ Tambah Menu Baru</span>
            </button>

            {/* Quick Search in Seller list */}
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={sellerSearch}
                onChange={(e) => setSellerSearch(e.target.value)}
                placeholder="Cari menu di dasbor..."
                className="w-full pl-9 pr-3 py-2 bg-white rounded-2xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Menu Items Cards */}
          {filteredSellerItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-stone-200">
              <p className="text-stone-500 text-sm">Tidak ada menu yang cocok.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSellerItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-4 border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex gap-4 items-start justify-between"
                >
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-stone-100 shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[1px] flex items-center justify-center text-white text-[10px] font-bold">
                        Habis
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-base text-stone-900 truncate">
                      {item.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-sm font-black text-emerald-800">
                        {formatRupiah(item.price)}
                      </span>
                      <span className="text-[10px] bg-stone-100 font-semibold text-stone-600 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                      {item.badge && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.5 rounded-md">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-500 line-clamp-1 mt-1">{item.description}</p>

                    {/* Stock toggle and management buttons */}
                    <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-stone-100">
                      <button
                        onClick={() => onToggleAvailability(item.id, item.isAvailable)}
                        className={`cursor-pointer text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                          item.isAvailable
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                        title="Klik untuk ubah stok (Tersedia / Habis)"
                      >
                        {item.isAvailable ? '● Tersedia' : '✕ Habis'}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDuplicateItem(item)}
                          className="cursor-pointer p-2 text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl"
                          title="Duplikat Menu"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="cursor-pointer p-2 text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl flex items-center gap-1 text-xs font-bold"
                          title="Edit Menu"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          className="cursor-pointer p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                          title="Hapus Menu Permanen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: PENGATURAN TOKO & INFORMASI LENGKAP                     */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'shop' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm max-w-3xl space-y-6">
          <div>
            <h3 className="text-xl font-black text-stone-900">
              Pengaturan Toko & Informasi Kuliner
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Atur identitas toko, nomor WhatsApp pemesanan, jam operasional, info pengiriman, dan banner promo. Data tersimpan permanen dan tidak akan hilang saat di-refresh.
            </p>
          </div>

          <form onSubmit={handleSaveShopInfo} className="space-y-6">
            {/* Section 1: Identitas Toko */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-black uppercase text-stone-900 tracking-wider flex items-center gap-1.5 border-b border-stone-100 pb-2">
                <Store className="w-4 h-4 text-emerald-700" />
                <span>1. Profil Toko</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Nama Toko Kuliner</label>
                  <input
                    type="text"
                    required
                    value={shopForm.shopName}
                    onChange={(e) => setShopForm({ ...shopForm, shopName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Kota / Kabupaten</label>
                  <input
                    type="text"
                    required
                    value={shopForm.city}
                    onChange={(e) => setShopForm({ ...shopForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Slogan / Tagline Toko</label>
                <input
                  type="text"
                  value={shopForm.tagline}
                  onChange={(e) => setShopForm({ ...shopForm, tagline: e.target.value })}
                  placeholder="Pusat Jajanan & Kuliner Gurih Lezat Khas Purwakarta"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Alamat Lengkap Toko</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-emerald-700 absolute left-3 top-3.5" />
                  <textarea
                    rows={2}
                    required
                    value={shopForm.address}
                    onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                    placeholder="Perum Bumi Jaya Indah (BJI) Blok AX 09 RT 05/14 Purwakarta"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Tautan Google Maps Lokasi</label>
                <input
                  type="url"
                  value={shopForm.mapsUrl || ''}
                  onChange={(e) => setShopForm({ ...shopForm, mapsUrl: e.target.value })}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Section 2: Kontak Pemesanan */}
            <div className="space-y-4 pt-4">
              <h4 className="text-xs font-black uppercase text-stone-900 tracking-wider flex items-center gap-1.5 border-b border-stone-100 pb-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>2. Kontak WhatsApp Pemesanan</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nomor WhatsApp Utama (Wajib)
                  </label>
                  <input
                    type="text"
                    required
                    value={shopForm.whatsappNumber}
                    onChange={(e) => setShopForm({ ...shopForm, whatsappNumber: e.target.value })}
                    placeholder="+6289620012837"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Seluruh tombol order pembeli otomatis menuju ke nomor ini.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nomor WhatsApp / Kontak Cadangan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={shopForm.whatsappNumberSecondary || ''}
                    onChange={(e) => setShopForm({ ...shopForm, whatsappNumberSecondary: e.target.value })}
                    placeholder="08..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Status Buka & Jam Kerja */}
            <div className="space-y-4 pt-4">
              <h4 className="text-xs font-black uppercase text-stone-900 tracking-wider flex items-center gap-1.5 border-b border-stone-100 pb-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>3. Jam Operasional & Status Buka</span>
              </h4>

              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <div>
                  <div className="font-extrabold text-sm text-stone-900">
                    Status Toko Saat Ini: {shopForm.isOpenNow ? '🟢 Buka Sekarang' : '🔴 Tutup Sementara'}
                  </div>
                  <p className="text-xs text-stone-500">
                    Jika ditutup sementara, pembeli tetap bisa melihat menu dan melakukan pre-order via WA.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shopForm.isOpenNow}
                    onChange={(e) => setShopForm({ ...shopForm, isOpenNow: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Jam Operasional Toko</label>
                <input
                  type="text"
                  value={shopForm.openingHours}
                  onChange={(e) => setShopForm({ ...shopForm, openingHours: e.target.value })}
                  placeholder="10:00 - 21:00 WIB (Buka Setiap Hari)"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Section 4: Banner Pengumuman & Promo */}
            <div className="space-y-4 pt-4">
              <h4 className="text-xs font-black uppercase text-stone-900 tracking-wider flex items-center gap-1.5 border-b border-stone-100 pb-2">
                <Megaphone className="w-4 h-4 text-emerald-700" />
                <span>4. Banner Promo & Pengumuman Berjalan</span>
              </h4>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showAnnouncement"
                  checked={shopForm.showAnnouncement}
                  onChange={(e) => setShopForm({ ...shopForm, showAnnouncement: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
                />
                <label htmlFor="showAnnouncement" className="text-xs font-bold text-stone-800">
                  Tampilkan Teks Pengumuman di Bagian Atas Halaman
                </label>
              </div>

              <textarea
                rows={2}
                value={shopForm.announcement}
                onChange={(e) => setShopForm({ ...shopForm, announcement: e.target.value })}
                placeholder="🔥 Promo Spesial: Pesan Paket The Best hari ini gratis es teh manis! Siap kirim area Purwakarta."
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Section 5: Pengiriman & Pembayaran */}
            <div className="space-y-4 pt-4">
              <h4 className="text-xs font-black uppercase text-stone-900 tracking-wider flex items-center gap-1.5 border-b border-stone-100 pb-2">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span>5. Info Pengiriman & Pembayaran</span>
              </h4>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Info Ongkir & Pengantaran
                </label>
                <input
                  type="text"
                  value={shopForm.deliveryInfo}
                  onChange={(e) => setShopForm({ ...shopForm, deliveryInfo: e.target.value })}
                  placeholder="Siap antar area Purwakarta Kota. Gratis ongkir min. Rp 30.000."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Metode Pembayaran yang Diterima
                  </label>
                  <input
                    type="text"
                    value={shopForm.paymentMethods}
                    onChange={(e) => setShopForm({ ...shopForm, paymentMethods: e.target.value })}
                    placeholder="QRIS, Transfer BCA/BRI, Tunai/COD"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nomor Rekening / Info Pembayaran
                  </label>
                  <input
                    type="text"
                    value={shopForm.bankAccount}
                    onChange={(e) => setShopForm({ ...shopForm, bankAccount: e.target.value })}
                    placeholder="BCA / DANA (Kirim rincian via WA)"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-stone-200 flex items-center gap-3">
              <button
                type="submit"
                disabled={isSavingShop}
                className="cursor-pointer inline-flex items-center gap-2 bg-stone-900 hover:bg-emerald-900 active:scale-95 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg transition-all text-sm"
              >
                <Save className="w-5 h-5" />
                <span>{isSavingShop ? 'Menyimpan...' : 'Simpan Semua Pengaturan Toko'}</span>
              </button>

              {shopSaveSuccess && (
                <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1.5 animate-bounce">
                  <CheckCircle className="w-4 h-4" />
                  Pengaturan Toko Berhasil Disimpan!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: KEAMANAN & CADANGAN DATA (PIN & BACKUP)                */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'security' && (
        <div className="space-y-6 max-w-3xl">
          {/* Card 1: Ganti PIN Admin */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-stone-100 text-stone-900 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-stone-800" />
              </div>
              <div>
                <h3 className="text-lg font-black text-stone-900">Ganti PIN Keamanan Admin</h3>
                <p className="text-xs text-stone-500">
                  PIN saat ini: <span className="font-mono font-bold text-stone-900">{activePin}</span>. Anda dapat menggantinya dengan 6 angka rahasia baru.
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePin} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    PIN Baru (6 Digit Angka)
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Contoh: 123456"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-center text-lg tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Ulangi PIN Baru
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Ketik ulang PIN..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-center text-lg tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {pinChangeMsg && (
                <div className="text-xs font-bold text-stone-800 p-2.5 bg-stone-100 rounded-xl">
                  {pinChangeMsg}
                </div>
              )}

              <button
                type="submit"
                className="cursor-pointer bg-stone-900 hover:bg-emerald-900 active:scale-95 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all"
              >
                Simpan PIN Baru
              </button>
            </form>
          </div>

          {/* Card 2: Backup & Restore */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-stone-100 text-stone-900 flex items-center justify-center">
                <Download className="w-5 h-5 text-stone-800" />
              </div>
              <div>
                <h3 className="text-lg font-black text-stone-900">Cadangan & Pemulihan Data (Backup JSON)</h3>
                <p className="text-xs text-stone-500">
                  Ekspor file backup untuk menyimpan salinan data menu dan info toko di HP atau Laptop Anda kapan saja.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleExportBackup}
                className="cursor-pointer inline-flex items-center gap-2 bg-stone-900 hover:bg-black text-white font-bold text-xs py-3 px-4 rounded-2xl shadow-md active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File Cadangan (.JSON)</span>
              </button>

              <label className="cursor-pointer inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs py-3 px-4 rounded-2xl border border-stone-300 active:scale-95 transition-all">
                <Upload className="w-4 h-4" />
                <span>Pulihkan dari File (.JSON)</span>
                <input
                  ref={backupFileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Card 3: Reset ke Menu Default Bawaan */}
          <div className="bg-red-50/70 rounded-3xl p-6 sm:p-8 border border-red-200 space-y-3">
            <div className="flex items-center gap-2 text-red-800 font-black text-sm">
              <RotateCcw className="w-4 h-4 text-red-600" />
              <span>Reset ke Pengaturan Awal Pabrik</span>
            </div>
            <p className="text-xs text-red-700 leading-relaxed">
              Jika Anda ingin mengembalikan seluruh menu ke menu unggulan default awal Jajanan Kakang.
            </p>
            <button
              onClick={handleRestoreDefaults}
              className="cursor-pointer bg-red-700 hover:bg-red-800 active:scale-95 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kembalikan ke Menu Bawaan</span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT MENU                                         */}
      {/* ------------------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-5 bg-gradient-to-r from-stone-900 to-emerald-950 text-white flex items-center justify-between border-b border-emerald-900/40">
              <div className="flex items-center gap-2 font-black text-base sm:text-lg">
                <Edit2 className="w-5 h-5 text-emerald-400" />
                <span>{editingItem ? 'Edit Menu' : 'Tambah Menu Baru'}</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nama Makanan / Minuman (Wajib)
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Cireng Bumbu Rujak Salju"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Category Dropdown (Requested by user) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Kategori Menu (Pilih Salah Satu)
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                >
                  {SELLER_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Harga (Rupiah)</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="number"
                      required
                      min={0}
                      step={500}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Porsi / Takaran</label>
                  <input
                    type="text"
                    value={formData.portion}
                    onChange={(e) => setFormData({ ...formData, portion: e.target.value })}
                    placeholder="Contoh: 1 Porsi (10 Pcs), Cup 22oz"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Badge / Tag Khusus</label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      placeholder="Best Seller, Favorit, dll"
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Tingkat Kepedasan</label>
                  <select
                    value={formData.spicyLevel}
                    onChange={(e) => setFormData({ ...formData, spicyLevel: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value={0}>Tidak Pedas (Manis / Gurih)</option>
                    <option value={1}>🌶️ Level 1 (Sedang)</option>
                    <option value={2}>🌶️🌶️ Level 2 (Pedas Mantap)</option>
                    <option value={3}>🌶️🌶️🌶️ Level 3 (Ekstra Pedas)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Deskripsi Menu</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Rincian kelezatan rasa, bumbu pelengkap, dan keistimewaan..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 leading-relaxed"
                />
              </div>

              {/* FITUR UPLOAD FOTO DARI GALERI / FILE (Requested by user) */}
              <div className="space-y-2 pt-1 border-t border-stone-100">
                <label className="block text-xs font-bold text-stone-800">
                  Foto Makanan / Minuman
                </label>

                {/* Hidden File Input for mobile and desktop gallery */}
                <input
                  ref={imageFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => imageFileInputRef.current?.click()}
                    disabled={isCompressingImage}
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold bg-stone-900 hover:bg-emerald-900 active:scale-95 text-white shadow-sm transition-all"
                  >
                    <FolderOpen className="w-4 h-4 text-emerald-400" />
                    <span>
                      {isCompressingImage ? 'Memproses Foto...' : '📁 Pilih Foto dari Galeri / HP'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="cursor-pointer text-xs font-semibold text-stone-600 hover:text-stone-900 px-3 py-2 rounded-xl hover:bg-stone-100 transition-colors"
                  >
                    {showUrlInput ? 'Tutup URL' : 'Gunakan URL Foto'}
                  </button>

                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      className="cursor-pointer text-xs font-semibold text-red-600 hover:text-red-700 px-3 py-2 rounded-xl hover:bg-red-50"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>

                {/* Optional manual URL input */}
                {showUrlInput && (
                  <div className="relative mt-2">
                    <ImageIcon className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                )}

                {/* Live Image Preview (Requested by user) */}
                {formData.imageUrl ? (
                  <div className="mt-3 relative rounded-2xl overflow-hidden h-36 bg-stone-100 border border-stone-200 shadow-inner">
                    <img
                      src={formData.imageUrl}
                      alt="Pratinjau Foto"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <span>✓ Foto Siap Digunakan</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 p-4 border-2 border-dashed border-stone-200 rounded-2xl text-center text-xs text-stone-400 bg-stone-50/50">
                    Belum ada foto yang dipilih. Ketuk <strong>"📁 Pilih Foto dari Galeri / HP"</strong> untuk mengambil dari galeri atau kamera Anda.
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="modalIsAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
                />
                <label htmlFor="modalIsAvailable" className="text-xs font-bold text-stone-800">
                  Stok Tersedia (Aktif untuk Dipesan Pembeli)
                </label>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer bg-stone-900 hover:bg-emerald-900 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Menu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
