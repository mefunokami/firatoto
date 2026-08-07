import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AccountPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('user');
    if (!stored) {
      // Ana sayfaya yönlendir ve login popup açtır
      window.dispatchEvent(new CustomEvent('open-login-popup'));
      navigate('/', { replace: true });
      return;
    }
    const user = JSON.parse(stored);
    setForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
    });
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    const payload = { ...form };
    if (showPasswordForm) {
      payload.old_password = oldPassword;
      payload.new_password = newPassword;
      payload.new_password2 = newPassword2;
    }
    try {
      const res = await fetch('/api/user_update.php', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('user', JSON.stringify(data.user));
        setEditMode(false);
        setShowPasswordForm(false);
        setOldPassword('');
        setNewPassword('');
        setNewPassword2('');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(data.error || 'Güncelleme başarısız.');
      }
    } catch (err) {
      setError('Sunucu hatası.');
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-card rounded-xl shadow p-8 mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-foreground">Hesap Bilgilerim</h2>
      {success && <div className="mb-4 text-green-600 font-semibold">Bilgileriniz kaydedildi.</div>}
      {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Ad</label>
          <input
            type="text"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
            disabled={!editMode}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Soyad</label>
          <input
            type="text"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
            disabled={!editMode}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">E-posta</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
            disabled={!editMode}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Telefon</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
            disabled={!editMode}
            required
          />
        </div>
        {showPasswordForm && (
          <div className="space-y-2">
            <div>
              <label className="block font-semibold mb-1">Eski Şifre</label>
              <input
                type="password"
                name="old_password"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Yeni Şifre</label>
              <input
                type="password"
                name="new_password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Yeni Şifre (Tekrar)</label>
              <input
                type="password"
                name="new_password2"
                value={newPassword2}
                onChange={e => setNewPassword2(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded">Kaydet</button>
              <button type="button" onClick={() => { setShowPasswordForm(false); setOldPassword(''); setNewPassword(''); setNewPassword2(''); }} className="bg-gray-200 hover:bg-gray-300 text-gray-700 dark:text-gray-300 font-bold py-2 px-6 rounded">İptal</button>
            </div>
          </div>
        )}
        {/* Butonlar alta taşındı */}
        {!showPasswordForm && (
          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded"
              disabled={editMode}
            >
              Düzenle
            </button>
            <button
              type="button"
              onClick={() => { setShowPasswordForm(v => !v); setEditMode(false); }}
              className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded"
            >
              {showPasswordForm ? 'Şifre Değişikliğini İptal Et' : 'Şifreyi Değiştir'}
            </button>
          </div>
        )}
        {editMode && !showPasswordForm ? (
          <div className="flex gap-2 mt-2">
            <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded">Kaydet</button>
            <button type="button" onClick={() => setEditMode(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 dark:text-gray-300 font-bold py-2 px-6 rounded">İptal</button>
          </div>
        ) : null}
      </form>
    </div>
  );
};

export default AccountPage; 