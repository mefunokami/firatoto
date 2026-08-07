import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin_users.php', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) setUsers(data.users);
        else setError(data.error || 'Kullanıcılar alınamadı.');
      })
      .catch(() => setError('Sunucu hatası.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Kullanıcılar">
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-yellow-400 pb-2 inline-block">Kullanıcılar</h2>
      <div className="bg-card rounded shadow p-6">
        {loading ? (
          <div>Yükleniyor...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Ad</th>
                <th className="p-2">Soyad</th>
                <th className="p-2">Telefon</th>
                <th className="p-2">E-posta</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b">
                  <td className="p-2">{u.first_name}</td>
                  <td className="p-2">{u.last_name}</td>
                  <td className="p-2">{u.phone}</td>
                  <td className="p-2">{u.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
    </AdminLayout>
  );
} 