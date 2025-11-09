import React, { useState, useEffect, useContext } from 'react';
import { CartContext } from '@/lib/CartContext.jsx';
import { useNavigate } from 'react-router-dom';

const initialForm = {
  title: '', name: '', surname: '', country: 'Türkiye', city: '', district: '', phone: '', mobile: '', tc: '', address: '', type: 'bireysel',
  company_title: '', tax_no: '', tax_office: '', efatura: false
};

export default function OrderStep2Page() {
  const { cart } = useContext(CartContext);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [paymentTab, setPaymentTab] = useState('card');
  const navigate = useNavigate();
  const [cardInfo, setCardInfo] = useState({ name: '', number: '', month: '', year: '', cvv: '' });
  const [cardLoading, setCardLoading] = useState(false);
  const paymentFormRef = React.useRef(null);
  const [selectedBank, setSelectedBank] = useState('QNB Finansbank');
  const [bankAccounts, setBankAccounts] = useState([]);
  const [bankLoading, setBankLoading] = useState(true);
  const [bankError, setBankError] = useState('');
  const bankIbans = {
    'QNB Finansbank': 'TR00 0000 0000 0000 0000 0000 00',
    'Ziraat Bankası': 'TR11 1111 1111 1111 1111 1111 11',
    'Garanti BBVA': 'TR22 2222 2222 2222 2222 2222 22',
  };
  const [orderNote, setOrderNote] = useState("");

  useEffect(() => {
    fetchAddresses();
    // fetchBankAccounts(); // Bu kısım ContactInfoPage'daki sabit QNB Finansbank hesabı ile değiştirildi
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/user_addresses.php', { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.success) setAddresses(data.addresses);
    } catch {}
  };

  const fetchBankAccounts = async () => {
    setBankLoading(true);
    try {
      const res = await fetch('/api/bank_accounts.php', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        const activeAccounts = data.accounts.filter(acc => acc.is_active);
        setBankAccounts(activeAccounts);
        if (activeAccounts.length > 0) setSelectedBank(activeAccounts[0].bank_name);
      } else {
        setBankError(data.error || 'Banka hesapları alınamadı.');
      }
    } catch { setBankError('Sunucu hatası.'); }
    setBankLoading(false);
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess(false);
    try {
      const res = await fetch('/api/user_addresses.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setForm(initialForm);
        setSuccess(true);
        fetchAddresses();
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(data.error || 'Adres eklenemedi.');
      }
    } catch {
      setError('Sunucu hatası.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardChange = e => {
    setCardInfo({ ...cardInfo, [e.target.name]: e.target.value });
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    setCardLoading(true);
    try {
      const payload = {
        ...cardInfo,
        address_id: selectedAddressId,
        cart_json: JSON.stringify(cart),
        total,
        note: '' // İsterseniz not alanını ekleyebilirsiniz
      };
      const res = await fetch('/api/qnb_mailorder.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert('Ödeme ve sipariş başarılı!');
        navigate('/orders');
      } else {
        alert('Ödeme başarısız: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch {
      alert('Sunucu hatası!');
    } finally {
      setCardLoading(false);
    }
  };

  const handleGoToPayment = () => {
    setPaymentTab('card');
    setTimeout(() => {
      paymentFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleEftWhatsapp = () => {
    const address = addresses.find(a => a.id === selectedAddressId);
    // Ürünleri her biri ayrı satırda ve aralarında bir satır boşluk olacak şekilde hazırla
    const cartText = cart.map(item => `${item.name} x${item.quantity || item.qty || 1}`).join('\n\n');
    const addressText = address ? `${address.title} - ${address.name} ${address.surname}, ${address.address}, ${address.district}, ${address.city}, ${address.country}` : '';
    const selected = bankAccounts.find(acc => acc.bank_name === selectedBank);
    const bankText = selected ? `Talep edilen IBAN: ${selected.bank_name} (${selected.iban})` : '';
    let message = `Sipariş İçeriği: ${cartText}\n\nAdres: ${addressText}\n\nToplam: ${total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}${kargoUcreti > 0 ? ' (Kargo Fiyatı Dahil)' : ''}\n${bankText}`;
    if (orderNote && orderNote.trim() !== "") {
      message += `\nŞasi Numarası: ${orderNote}`;
    }
    const url = `https://wa.me/905439740121?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Sepet toplamı
  const subtotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || item.qty || 1), 0);
  // KDV tamamen kaldırıldı
  // Kargo hesaplama
  const kargoUcreti = subtotal >= 2500 ? 0 : cart.reduce((sum, item) => sum + 350 * (item.quantity || item.qty || 1), 0);
  const total = subtotal + kargoUcreti;

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="w-full bg-[#d7efdf] border-b border-[#c2e3ce]">
        <div className="max-w-7xl mx-auto flex items-center justify-center py-2 px-4">
          <span className="inline-flex items-center gap-2 text-sm text-gray-700 font-medium">
            <svg width="18" height="18" fill="none" stroke="#4caf50" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
            Bu sitede yapacağınız alışveriş işlemleri 256bit SSL ile korunmaktadır.
          </span>
        </div>
      </div>
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 py-8">
        {/* Sol: Adres seçimi ve ekleme */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow p-6 mb-0">
            <div className="flex gap-2 mb-6">
              <div className="flex-1 text-center font-bold text-lg border-b-4 border-yellow-400 pb-2">TESLİMAT BİLGİLERİ</div>
            </div>
            <h2 className="text-xl font-bold mb-2">KAYITLI ADRESLER</h2>
            {addresses.length > 0 ? (
              <ul className="space-y-2 mb-6">
                {addresses.map(addr => (
                  <li key={addr.id} className={`border rounded p-4 cursor-pointer ${selectedAddressId === addr.id ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 bg-white'}`} onClick={() => setSelectedAddressId(addr.id)}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{addr.title} - {addr.name} {addr.surname}</div>
                        <div className="text-xs text-gray-500">{addr.address}, {addr.district}, {addr.city}, {addr.country}</div>
                        <div className="text-xs text-gray-500">Tel: {addr.mobile} {addr.phone && `/ ${addr.phone}`}</div>
                        <div className="text-xs text-gray-500">Fatura Tipi: {addr.type} {addr.tc && `| TC: ${addr.tc}`}</div>
                      </div>
                      {selectedAddressId === addr.id && <span className="ml-4 px-3 py-1 bg-yellow-400 text-white rounded text-xs font-bold">SEÇİLİ</span>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : <div className="text-sm text-gray-500 mb-4">Kayıtlı adresiniz yok. Aşağıdan ekleyebilirsiniz.</div>}
            <h3 className="font-bold text-lg mb-2">Yeni Adres Ekle</h3>
            {!showForm && (
              <button type="button" className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-8 rounded mb-4" onClick={() => setShowForm(true)}>
                + Yeni Adres Ekle
              </button>
            )}
            {showForm && (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <input name="title" value={form.title} onChange={handleChange} placeholder="* Adres Başlığı" className="border rounded px-3 py-2 col-span-1" required />
                <input name="name" value={form.name} onChange={handleChange} placeholder="* Ad" className="border rounded px-3 py-2 col-span-1" required />
                <input name="surname" value={form.surname} onChange={handleChange} placeholder="* Soyad" className="border rounded px-3 py-2 col-span-1" required />
                <select name="country" value={form.country} onChange={handleChange} className="border rounded px-3 py-2 col-span-1">
                  <option value="Türkiye">Türkiye</option>
                </select>
                <input name="city" value={form.city} onChange={handleChange} placeholder="Şehir" className="border rounded px-3 py-2 col-span-1" required />
                <input name="district" value={form.district} onChange={handleChange} placeholder="* İlçe" className="border rounded px-3 py-2 col-span-1" required />
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Telefon" className="border rounded px-3 py-2 col-span-1" />
                <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="* Cep Telefonu" className="border rounded px-3 py-2 col-span-1" required />
                <input name="tc" value={form.tc} onChange={handleChange} placeholder="TC Kimlik No" className="border rounded px-3 py-2 col-span-1" />
                <textarea name="address" value={form.address} onChange={handleChange} placeholder="* Adres" className="border rounded px-3 py-2 col-span-3" required />
                <div className="col-span-3 flex items-center gap-4 mt-2">
                  <span className="font-semibold">Fatura Tipi</span>
                  <label className="flex items-center gap-1">
                    <input type="radio" name="type" value="bireysel" checked={form.type === 'bireysel'} onChange={handleChange} /> Bireysel
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="radio" name="type" value="kurumsal" checked={form.type === 'kurumsal'} onChange={handleChange} /> Kurumsal
                  </label>
                </div>
                {form.type === 'kurumsal' && (
                  <>
                    <input name="company_title" value={form.company_title} onChange={handleChange} placeholder="* Ticari Ünvanı" className="border rounded px-3 py-2 col-span-3" required />
                    <input name="tax_no" value={form.tax_no} onChange={handleChange} placeholder="* Vergi No" className="border rounded px-3 py-2 col-span-1" required />
                    <input name="tax_office" value={form.tax_office} onChange={handleChange} placeholder="* Vergi Dairesi" className="border rounded px-3 py-2 col-span-2" required />
                    <div className="col-span-3 flex items-center gap-2 mt-2">
                      <input type="checkbox" name="efatura" checked={form.efatura} onChange={handleChange} id="efatura" />
                      <label htmlFor="efatura" className="text-sm">E-fatura mükellefiyim.</label>
              </div>
                  </>
                )}
                <div className="col-span-3 flex justify-end mt-2 gap-2">
                  <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-8 rounded" disabled={loading}>{loading ? 'Kaydediliyor...' : 'KAYDET'}</button>
                  <button type="button" onClick={() => { setShowForm(false); setForm(initialForm); }} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-8 rounded">İptal</button>
              </div>
            </form>
            )}
            {success && <div className="mb-2 text-green-600 font-semibold">Adres kaydedildi.</div>}
            {error && <div className="mb-2 text-red-600 font-semibold">{error}</div>}
          </div>
          {/* Kargo ve not alanı aynı kalabilir */}
          <div className="bg-white rounded-2xl shadow p-6 mb-0 mt-6">
            <div className="font-bold mb-2">DEĞERLİ MÜŞTERİLERİMİZ, 16:00 ÖNCESİ SİPARİŞLERİNİZ AYNI GÜN HIZLA KARGODA! GÜVENLİ, HIZLI VE SORUNSUZ ALIŞVERİŞ İÇİN BURADAYIZ, ÇÜNKÜ MEMNUNİYETİNİZ BİZİM ÖNCELİĞİMİZ!</div>
            <div className="text-xs text-yellow-700 mb-2">LÜTFEN SİPARİŞ NOTUNA ŞASİ NUMARANIZI YAZARAK ÜRÜNLERİN KONTROL EDİLEREK GÖNDERİLMESİNİ SAĞLAYINIZ.</div>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <label className="flex items-center gap-2 border border-gray-300 p-2 rounded cursor-pointer flex-1 bg-[#fafafa]">
                <input type="radio" checked readOnly />
                <img src="/araskargo.png" alt="Aras Kargo" className="h-6" />
                <span>Aras Kargo</span>
                <span className="ml-auto text-xs text-gray-500">ÜCRETSİZ</span>
              </label>
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">SİPARİŞ NOTU (ÖRNEK : ARAÇ ŞASİ NUMARASI)</label>
              <input className="border border-gray-300 p-2 rounded w-full bg-[#fafafa]" placeholder="Not (Araç Şasi Numarası)" value={orderNote} onChange={e => setOrderNote(e.target.value)} />
            </div>
          </div>
          {/* Ödeme işlemleri */}
          {/* HAVALE/EFT alanını tamamen kaldırıyorum, sadece Sepet Özeti kısmında banka ve buton olacak */}
        </div>
        {/* Sağ: Sepet Özeti */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow p-6 mb-0">
            <div className="font-bold text-lg mb-4 border-b pb-2">SEPET ÖZETİ</div>
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b py-2">
                <div className="flex-1">
                  <div className="font-semibold text-sm">{item.name}</div>
                  <div className="text-xs text-gray-400">{item.brand}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-base">{Number(item.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} <span className="text-green-600 text-xs">(KDV Dahil)</span></div>
                </div>
              </div>
            ))}
            <div className="flex justify-between mb-2 text-sm"><span>Ara Toplam</span><span>{subtotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span></div>
            {/* KDV satırı kaldırıldı */}
            <div className="flex justify-between mb-2 text-sm">
              <span>Kargo</span>
              <span>
                {subtotal >= 2500 ? (
                  <span className="text-green-600 font-bold flex items-center gap-1">0,00 TL <span title="2500 TL ve üzeri ücretsiz kargo">★</span></span>
                ) : (
                  kargoUcreti.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
                )}
              </span>
            </div>
            <div className="flex justify-between mb-4 text-base font-bold">
              <span>Toplam</span>
              <span>
                {total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                {kargoUcreti > 0 ? <span className="text-xs text-gray-500 ml-1">(Kargo Fiyatı Dahil)</span> : null}
              </span>
            </div>
            {/* Banka hesaplarını API'den çekme kodlarını ve state'lerini kaldırıyorum */}
            {/* HAVALE/EFT alanını ContactInfoPage'daki gibi sabit QNB Finansbank hesabı ile değiştiriyorum */}
            <button
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded text-base mt-4"
              onClick={handleEftWhatsapp}
              type="button"
            >WHATSAPP İLE SİPARİŞİ TAMAMLA</button>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
              <span>Bu site 256bit SSL ile korunmaktadır.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 