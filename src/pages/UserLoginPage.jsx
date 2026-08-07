import React, { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import RegisterPage from './RegisterPage';
import { useNavigate } from 'react-router-dom';

const UserLoginPage = ({ open, setOpen, setUser }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    fetch('/api/login.php', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.csrf_token) {
          sessionStorage.setItem('csrf_token', data.csrf_token);
        }
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const csrfToken = sessionStorage.getItem('csrf_token');
      const res = await fetch('/api/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ ...form, remember }),
        credentials: 'include' // PHP session cookie'si için eklendi
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        sessionStorage.setItem('is-authenticated', 'true');
        sessionStorage.setItem('user', JSON.stringify(data.user));
        if (remember) {
          localStorage.setItem('is-authenticated', 'true');
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          localStorage.removeItem('is-authenticated');
          localStorage.removeItem('user');
        }
        if (typeof setUser === 'function') setUser(data.user);
        // Modal olarak mı açıldı, route olarak mı?
        if (typeof setOpen === 'function') {
          setOpen(false); // Modalı kapat
        } else {
          navigate('/'); // Route ise yönlendir
        }
      } else {
        setError(data.error || 'Giriş başarısız.');
      }
    } catch (err) {
      setError('Sunucu hatası.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0 bg-card rounded-xl shadow-lg border-4 border-white dark:border-border/50 p-2 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-1 text-gray-900 dark:text-foreground">HOŞ GELDİNİZ</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400 text-base">Hızlı ve güvenli alışverişe giriş yapın!</DialogDescription>
          </DialogHeader>
          <div className="p-8 pt-0">
            {success && <div className="mb-4 text-green-600 font-semibold">Giriş başarılı!</div>}
            {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="E-mail adresiniz"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Şifreniz"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
                required
              />
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 select-none">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="accent-yellow-500" />
                  Beni Hatırla
                </label>
                <button type="button" className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 underline" tabIndex={-1} onClick={() => { setOpen(false); navigate('/forgot-password'); }}>
                  Şifremi Unuttum
                </button>
              </div>
              <button
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 rounded text-lg transition disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>
            <div className="my-8 border-t" />
            <div className="mb-2 text-center">
              <span className="font-bold text-lg text-gray-900 dark:text-foreground">HENÜZ ÜYE DEĞİL MİSİNİZ?</span>
              <div className="text-gray-600 dark:text-gray-400 text-base mt-1 mb-4">Kolayca üye olabilirsiniz.</div>
              <button
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded text-lg transition"
                onClick={() => { setOpen(false); navigate('/register'); }}
                type="button"
              >
                Hemen Üye Ol
              </button>
            </div>
          </div>
          <DialogClose asChild>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:text-gray-300 text-2xl">×</button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserLoginPage; 