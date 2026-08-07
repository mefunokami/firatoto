import React, { useEffect, useState } from 'react';

export default function AdminBankAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ bank_name: '', iban: '', account_holder: '', is_active: 1 });
  const [editingId, setEditingId] = useState(null);
  const [csrf, setCsrf] = useState('');

  useEffect(() => { fetchAccounts(); getCsrf(); }, []);

  const getCsrf = async () => {
    // CSRF token session'da tutuluyor, bir GET isteğiyle alınabilir
    const res = await fetch('/api/bank_accounts.php', { credentials: 'include' });
    const data = await res.json();
    setCsrf(window?.sessionStorage?.csrf_token || '');
  };

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bank_accounts.php', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setAccounts(data.accounts);
      else setError(data.error || 'Hesaplar alınamadı.');
    } catch { setError('Sunucu hatası.'); }
    setLoading(false);
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = '/api/bank_accounts.php' + (editingId ? '' : '');
    const body = editingId ? { ...form, id: editingId } : form;
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });
    const data = await res.json();
    if (data.success) {
      setForm({ bank_name: '', iban: '', account_holder: '', is_active: 1 });
      setEditingId(null);
      fetchAccounts();
    } else {
      alert(data.error || 'İşlem başarısız.');
    }
  };

  const handleEdit = acc => {
    setForm({
      bank_name: acc.bank_name,
      iban: acc.iban,
      account_holder: acc.account_holder,
      is_active: acc.is_active
    });
    setEditingId(acc.id);
  };

  const handleDelete = async id => {
    if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
    const res = await fetch('/api/bank_accounts.php?id=' + id, {
      method: 'DELETE',
      headers: { 'X-CSRF-Token': csrf },
      credentials: 'include',
    });
    const data = await res.json();
    if (data.success) fetchAccounts();
    else alert(data.error || 'Silinemedi.');
  };

  return (
    <div className="max-w-2xl mx-auto bg-card rounded-xl shadow p-8 mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-foreground">Banka Hesapları / IBAN Yönetimi</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 mb-6">
        <input name="bank_name" value={form.bank_name} onChange={handleChange} placeholder="Banka Adı" className="border rounded px-3 py-2" required />
        <input name="iban" value={form.iban} onChange={handleChange} placeholder="IBAN" className="border rounded px-3 py-2" required />
        <input name="account_holder" value={form.account_holder} onChange={handleChange} placeholder="Hesap Sahibi" className="border rounded px-3 py-2" required />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_active" checked={!!form.is_active} onChange={handleChange} /> Aktif
        </label>
        <div className="flex gap-2">
          <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-4 py-2 rounded">{editingId ? 'Güncelle' : 'Ekle'}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ bank_name: '', iban: '', account_holder: '', is_active: 1 }); }} className="bg-gray-200 hover:bg-gray-300 text-gray-700 dark:text-gray-300 font-bold px-4 py-2 rounded">İptal</button>}
        </div>
      </form>
      {loading ? <div>Yükleniyor...</div> : error ? <div className="text-red-600">{error}</div> : (
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Banka</th>
              <th className="p-2">IBAN</th>
              <th className="p-2">Hesap Sahibi</th>
              <th className="p-2">Aktif</th>
              <th className="p-2">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(acc => (
              <tr key={acc.id} className="border-b">
                <td className="p-2">{acc.bank_name}</td>
                <td className="p-2 font-mono">{acc.iban}</td>
                <td className="p-2">{acc.account_holder}</td>
                <td className="p-2 text-center">{acc.is_active ? '✔️' : ''}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => handleEdit(acc)} className="text-blue-600 hover:underline">Düzenle</button>
                  <button onClick={() => handleDelete(acc.id)} className="text-red-600 hover:underline">Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 