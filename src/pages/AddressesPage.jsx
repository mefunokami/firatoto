import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const initialForm = {
  title: '', name: '', surname: '', country: 'Türkiye', city: '', district: '', phone: '', mobile: '', tc: '', address: '', type: 'bireysel',
  company_title: '', tax_no: '', tax_office: '', efatura: false
};

const AddressesPage = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('user');
    if (!stored) {
      window.dispatchEvent(new CustomEvent('open-login-popup'));
      navigate('/', { replace: true });
      return;
    }
    fetchAddresses();
  }, [navigate]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/user_addresses.php', { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.success) setAddresses(data.addresses);
    } catch {}
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu adresi silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/user_addresses.php?id=${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchAddresses();
      } else {
        setError(data.error || 'Adres silinemedi.');
      }
    } catch {
      setError('Sunucu hatası.');
    }
  };

  const handleEdit = (addr) => {
    setForm({ ...addr });
    setEditId(addr.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setForm(initialForm);
    setEditId(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess(false);
    try {
      let res, data;
      if (editId) {
        res = await fetch(`/api/user_addresses.php?id=${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
          credentials: 'include',
        });
      } else {
        res = await fetch('/api/user_addresses.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
          credentials: 'include',
        });
      }
      data = await res.json();
      if (res.ok && data.success) {
        setForm(initialForm);
        setEditId(null);
        setSuccess(true);
        fetchAddresses();
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(data.error || (editId ? 'Adres güncellenemedi.' : 'Adres eklenemedi.'));
      }
    } catch {
      setError('Sunucu hatası.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8 mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Adreslerim</h2>
      {addresses.length > 0 && (
        <div className="mb-8">
          <h3 className="font-bold mb-2">Kayıtlı Adresler</h3>
          <ul className="space-y-2">
            {addresses.map(addr => (
              <li key={addr.id} className="border rounded p-4">
                <div className="font-semibold">{addr.title} - {addr.name} {addr.surname}</div>
                <div>{addr.address}, {addr.district}, {addr.city}, {addr.country}</div>
                <div>Tel: {addr.mobile} {addr.phone && `/ ${addr.phone}`}</div>
                <div className="text-xs text-gray-500">Fatura Tipi: {addr.type} {addr.tc && `| TC: ${addr.tc}`}</div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleEdit(addr)} className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-1 px-4 rounded">Düzenle</button>
                  <button onClick={() => handleDelete(addr.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-4 rounded">Sil</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <h3 className="font-bold text-lg mb-2">Yeni Adres Ekle</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-3 mb-4">
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
        <textarea name="address" value={form.address} onChange={handleChange} placeholder="* Adres" className="border rounded px-3 py-2 col-span-1 md:col-span-3" required />
        <div className="col-span-1 md:col-span-3 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 mt-2">
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
            <input name="company_title" value={form.company_title} onChange={handleChange} placeholder="* Ticari Ünvanı" className="border rounded px-3 py-2 col-span-1 md:col-span-3" required />
            <input name="tax_no" value={form.tax_no} onChange={handleChange} placeholder="* Vergi No" className="border rounded px-3 py-2 col-span-1" required />
            <input name="tax_office" value={form.tax_office} onChange={handleChange} placeholder="* Vergi Dairesi" className="border rounded px-3 py-2 col-span-1 md:col-span-2" required />
            <div className="col-span-1 md:col-span-3 flex items-center gap-2 mt-2">
              <input type="checkbox" name="efatura" checked={form.efatura} onChange={handleChange} id="efatura" />
              <label htmlFor="efatura" className="text-sm">E-fatura mükellefiyim.</label>
            </div>
          </>
        )}
        <div className="col-span-1 md:col-span-3 flex flex-col md:flex-row justify-end mt-2 gap-2">
          <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-8 rounded" disabled={loading}>{loading ? (editId ? 'Güncelleniyor...' : 'Kaydediliyor...') : (editId ? 'GÜNCELLE' : 'KAYDET')}</button>
          {editId && <button type="button" onClick={handleCancelEdit} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-8 rounded">İptal</button>}
        </div>
      </form>
      {success && <div className="mb-2 text-green-600 font-semibold">Adres kaydedildi.</div>}
      {error && <div className="mb-2 text-red-600 font-semibold">{error}</div>}
    </div>
  );
};

export default AddressesPage; 