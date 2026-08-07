import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Cog, Loader2 } from 'lucide-react';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user && user.admin === 1) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.user.admin !== 1) {
          toast({ title: 'Yetkisiz', description: 'Sadece yöneticiler giriş yapabilir.', variant: 'destructive' });
          return;
        }
        sessionStorage.setItem('is-authenticated', 'true');
        sessionStorage.setItem('user', JSON.stringify(data.user));
        navigate('/admin');
      } else {
        toast({ title: 'Hata', description: data.error || 'Giriş başarısız.', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Hata', description: 'Sunucu bağlantı hatası.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-background p-4">
      <Helmet>
        <title>Yönetici Girişi | Fırat Oto</title>
      </Helmet>
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-yellow-400">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center">
              <Cog className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Yönetici Girişi</CardTitle>
          <CardDescription>
            Fırat Oto yönetim paneline erişmek için giriş yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                name="email"
                placeholder="E-posta Adresi"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                name="password"
                placeholder="Şifre"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Giriş Yap
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage; 