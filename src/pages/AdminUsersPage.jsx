import React, { useEffect, useState } from 'react';

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
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="flex items-center mb-8">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-700 hover:text-yellow-500 font-semibold px-3 py-2 rounded bg-gray-100 hover:bg-yellow-100 transition">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
          Panele Dön
        </button>
        <h2 className="text-2xl font-bold ml-6 border-b-2 border-yellow-400 pb-1">Kullanıcılar</h2>
      </div>
      <div className="bg-white rounded shadow p-6">
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
  );
} 