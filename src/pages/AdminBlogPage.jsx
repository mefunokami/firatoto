import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminBlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', image_url: '' });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  // Blogları çek
  const fetchBlogs = () => {
    setLoading(true);
    fetch('/api/blog.php', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.blogs)) {
          setBlogs(data.blogs);
        } else {
          setBlogs([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setBlogs([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    setError('');
    try {
      let res;
      if (editId !== null) {
        res = await fetch('/api/blog.php', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ id: editId, title: form.title, content: form.content, image_url: form.image_url })
        });
      } else {
        res = await fetch('/api/blog.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ title: form.title, content: form.content, image_url: form.image_url })
        });
      }
      const data = await res.json();
      if (data.success) {
        fetchBlogs();
        setForm({ title: '', content: '', image_url: '' });
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
    setForm({ title: blogs[idx].title, content: blogs[idx].content, image_url: blogs[idx].image_url || '' });
    setEditId(blogs[idx].id);
  };

  const handleDelete = async idx => {
    if (!window.confirm('Bu blog yazısını silmek istiyor musunuz?')) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/blog.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: blogs[idx].id })
      });
      const data = await res.json();
      if (data.success) {
        fetchBlogs();
        setForm({ title: '', content: '', image_url: '' });
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
    <AdminLayout title="Blog">
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Blog Yönetimi</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded shadow p-6 mb-8 flex flex-col gap-4">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Başlık"
          className="border rounded px-3 py-2"
          disabled={saving}
        />
        <input
          name="image_url"
          value={form.image_url}
          onChange={handleChange}
          placeholder="Görsel URL (https://...)"
          className="border rounded px-3 py-2"
          disabled={saving}
        />
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="İçerik"
          className="border rounded px-3 py-2 min-h-[120px]"
          disabled={saving}
        />
        <div className="flex gap-2">
          <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-2 rounded" disabled={saving}>
            {editId !== null ? 'Güncelle' : 'Ekle'}
          </button>
          {editId !== null && (
            <button type="button" onClick={() => { setForm({ title: '', content: '', image_url: '' }); setEditId(null); }} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-6 py-2 rounded" disabled={saving}>İptal</button>
          )}
        </div>
        {error && <div className="text-red-600 font-semibold mt-2">{error}</div>}
      </form>
      <div className="space-y-6">
        {loading && <div className="text-gray-400">Yükleniyor...</div>}
        {!loading && blogs.length === 0 && <div className="text-gray-400">Henüz blog yazısı yok.</div>}
        {blogs.map((blog, idx) => (
          <div key={blog.id} className="bg-white rounded shadow p-4 relative">
            <div className="font-bold text-lg mb-1">{blog.title}</div>
            <div className="text-gray-600 text-sm mb-2">{new Date(blog.created_at).toLocaleString('tr-TR')}</div>
            {blog.image_url && <img src={blog.image_url} alt="Blog görseli" className="w-full h-40 object-cover rounded mb-2" />}
            <div className="text-gray-700 whitespace-pre-line mb-2 line-clamp-4">{blog.content.length > 200 ? blog.content.slice(0, 200) + '...' : blog.content}</div>
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