import { CartItem, MenuItem, ShopInfo } from '../types';

// Format number to Indonesian Rupiah currency format
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Sanitize phone number for wa.me URL
export function formatWhatsAppNumber(phone: string): string {
  // Remove non-numeric characters except +
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  return cleaned;
}

// Generate direct WhatsApp link for single item
export function generateSingleItemWhatsAppLink(
  item: MenuItem,
  shopInfo: ShopInfo
): string {
  const phone = formatWhatsAppNumber(shopInfo.whatsappNumber);
  const text = `Halo *${shopInfo.shopName}*! 👋

Saya mau pesan menu berikut:
• *${item.name}* (1 porsi) - ${formatRupiah(item.price)}

Apakah menu ini masih tersedia hari ini?
Terima kasih! 🙏`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

// Generate direct WhatsApp link for full cart
export function generateCartWhatsAppLink(
  cart: CartItem[],
  shopInfo: ShopInfo,
  customerName?: string,
  customerAddress?: string,
  customerNotes?: string
): string {
  const phone = formatWhatsAppNumber(shopInfo.whatsappNumber);
  const total = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);

  const itemsList = cart
    .map(
      (ci, index) =>
        `${index + 1}. *${ci.item.name}* (${ci.quantity}x) = ${formatRupiah(
          ci.item.price * ci.quantity
        )}${ci.notes ? `\n   _Catatan: ${ci.notes}_` : ''}`
    )
    .join('\n');

  let text = `Halo *${shopInfo.shopName}*! 👋\nSaya ingin memesan jajanan lezat berikut:\n\n${itemsList}\n\n`;
  text += `💰 *TOTAL PESANAN: ${formatRupiah(total)}*\n\n`;

  if (customerName?.trim()) {
    text += `👤 *Nama Pemesan:* ${customerName.trim()}\n`;
  }
  if (customerAddress?.trim()) {
    text += `📍 *Alamat Pengantaran:* ${customerAddress.trim()}\n`;
  }
  if (customerNotes?.trim()) {
    text += `📝 *Catatan Khusus:* ${customerNotes.trim()}\n`;
  }

  text += `\nMohon info ketersediaan stok & estimasi pengirimannya ya Kak. Terima kasih! 🙏`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

// Format current time in WIB
export function getFormattedCurrentTime(): string {
  const date = new Date();
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }) + ' WIB';
}
