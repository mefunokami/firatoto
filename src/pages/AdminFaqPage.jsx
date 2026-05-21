import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [form, setForm] = useState({ question: '', answer: '', faq_order: 0 });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  // SSS'leri çek
  const fetchFaqs = () => {
    setLoading(true);
    fetch('/api/faq.php', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.faqs)) {
          setFaqs(data.faqs);
        } else {
          setFaqs([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setFaqs([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    setError('');
    try {
      let res;
      if (editId !== null) {
        res = await fetch('/api/faq.php', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ id: editId, question: form.question, answer: form.answer, faq_order: Number(form.faq_order) })
        });
      } else {
        res = await fetch('/api/faq.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ question: form.question, answer: form.answer, faq_order: Number(form.faq_order) })
        });
      }
      const data = await res.json();
      if (data.success) {
        fetchFaqs();
        setForm({ question: '', answer: '', faq_order: 0 });
        setEditId(null);
      } else {
        setError(data.error || 'Bir hata oluştu.');
      }
    } catch {
      setError('Sunucuya ulaşılamadı.');
    }
    setSaving(false);
  };

  const handleEdit = idx => {
    setForm({ question: faqs[idx].question, answer: faqs[idx].answer, faq_order: faqs[idx].faq_order || 0 });
    setEditId(faqs[idx].id);
  };

  const handleDelete = async idx => {
    if (!window.confirm('Bu SSS kaydını silmek istiyor musunuz?')) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/faq.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: faqs[idx].id })
      });
      const data = await res.json();
      if (data.success) {
        fetchFaqs();
        setForm({ question: '', answer: '', faq_order: 0 });
        setEditId(null);
      } else {
        setError(data.error || 'Bir hata oluştu.');
      }
    } catch {
      setError('Sunucuya ulaşılamadı.');
    }
    setSaving(false);
  };

  return (
    <AdminLayout title="SSS">
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Sık Sorulan Sorular</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded shadow p-6 mb-8 flex flex-col gap-4">
        <input
          name="question"
          value={form.question}
          onChange={handleChange}
          placeholder="Soru"
          className="border rounded px-3 py-2"
          disabled={saving}
        />
        <textarea
          name="answer"
          value={form.answer}
          onChange={handleChange}
          placeholder="Cevap"
          className="border rounded px-3 py-2 min-h-[80px]"
          disabled={saving}
        />
        <input
          name="faq_order"
          type="number"
          value={form.faq_order}
          onChange={handleChange}
          placeholder="Sıra (küçükten büyüğe)"
          className="border rounded px-3 py-2"
          disabled={saving}
        />
        <div className="flex gap-2">
          <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-2 rounded" disabled={saving}>
            {editId !== null ? 'Güncelle' : 'Ekle'}
          </button>
          {editId !== null && (
            <button type="button" onClick={() => { setForm({ question: '', answer: '', faq_order: 0 }); setEditId(null); }} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-6 py-2 rounded" disabled={saving}>İptal</button>
          )}
        </div>
        {error && <div className="text-red-600 font-semibold mt-2">{error}</div>}
      </form>
      <div className="space-y-6">
        {loading && <div className="text-gray-400">Yükleniyor...</div>}
        {!loading && faqs.length === 0 && <div className="text-gray-400">Henüz SSS eklenmemiş.</div>}
        {faqs.map((faq, idx) => (
          <div key={faq.id} className="bg-white rounded shadow p-4 relative">
            <div className="font-bold text-lg mb-1">{faq.question}</div>
            <div className="text-gray-700 whitespace-pre-line mb-2">{faq.answer}</div>
            <div className="text-gray-500 text-xs mb-2">Sıra: {faq.faq_order}</div>
            <div className="flex gap-2 absolute top-4 right-4">
              <button onClick={() => handleEdit(idx)} className="text-blue-600 font-bold" disabled={saving}>Düzenle</button>
              <button onClick={() => handleDelete(idx)} className="text-red-600 font-bold" disabled={saving}>Sil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </AdminLayout>
  );
} 