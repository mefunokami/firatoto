import React, { useState } from 'react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Token URL'den alınır
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!password || password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.');
      return;
    }
    if (password !== password2) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/reset_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (data.success) setSuccess(true);
      else setError(data.error || 'Bir hata oluştu.');
    } catch {
      setError('Sunucu hatası.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><div className="bg-white rounded shadow p-8">Geçersiz bağlantı.</div></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded shadow p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Yeni Şifre Belirle</h2>
        {success ? (
          <div className="text-green-600 text-center">Şifreniz başarıyla değiştirildi. Giriş yapabilirsiniz.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              placeholder="Yeni şifre"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              placeholder="Yeni şifre (tekrar)"
              value={password2}
              onChange={e => setPassword2(e.target.value)}
              required
            />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded" disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Şifreyi Sıfırla'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 