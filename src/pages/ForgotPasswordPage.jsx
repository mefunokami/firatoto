import React, { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/forgot_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) setSent(true);
      else setError(data.error || 'Bir hata oluştu.');
    } catch {
      setError('Sunucu hatası.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-card rounded shadow p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Şifremi Unuttum</h2>
        {sent ? (
          <div className="text-green-600 text-center">Eğer bu e-posta ile kayıtlı bir hesabınız varsa, şifre sıfırlama bağlantısı gönderildi.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              placeholder="E-posta adresiniz"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded" disabled={loading}>
              {loading ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 