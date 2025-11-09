import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders.php', { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.orders);
      } else {
        setError(data.error || 'Siparişler alınamadı.');
      }
    } catch {
      setError('Sunucu hatası.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto mt-10">Yükleniyor...</div>;
  if (error) return <div className="max-w-3xl mx-auto mt-10 text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8 mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Siparişlerim</h2>
      {orders.length === 0 && <div className="text-gray-500">Henüz siparişiniz yok.</div>}
      <ul className="space-y-6">
        {orders.map(order => (
          <li key={order.id} className="border rounded p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold text-lg">Sipariş #{order.id}</div>
              <div className={`text-xs px-2 py-1 rounded font-bold ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{order.status === 'paid' ? 'Ödendi' : order.status}</div>
            </div>
            <div className="text-sm text-gray-700 mb-2">Tarih: {new Date(order.created_at).toLocaleString('tr-TR')}</div>
            <div className="mb-2">
              <span className="font-semibold">Adres:</span> {order.address ? `${order.address.title} - ${order.address.name} ${order.address.surname}, ${order.address.address}, ${order.address.district}, ${order.address.city}, ${order.address.country}` : 'Adres bulunamadı'}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Toplam:</span> {Number(order.total).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Ürünler:</span>
              <ul className="ml-4 list-disc">
                {order.cart && order.cart.map((item, i) => (
                  <li key={i} className="text-sm">{item.name} <span className="text-gray-500">x{item.quantity || item.qty || 1}</span></li>
                ))}
              </ul>
            </div>
            {order.note && <div className="text-xs text-gray-500">Not: {order.note}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
} 