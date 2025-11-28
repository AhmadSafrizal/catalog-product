"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import ConfirmModal from '@/components/ConfirmModal';

export default function TagsPage() {
  const router = useRouter();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/blogs/tags');
      const j = await res.json();
      if (j?.data) setTags(j.data);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const token = Cookies.get('adminAccessToken');
      const res = await fetch('/api/blogs/tags', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ name, slug }) });
      const j = await res.json();
      if (j?.data) { setName(''); setSlug(''); load(); } else alert('Create failed: ' + JSON.stringify(j));
    } catch (err) { console.error(err); alert('Create failed'); }
  }

  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: null });

  function openDeleteConfirm(id) {
    setConfirm({
      open: true,
      title: 'Hapus Tag',
      message: 'Hapus tag ini? Tindakan ini tidak dapat dibatalkan.',
      onConfirm: async () => {
        try {
          const token = Cookies.get('adminAccessToken');
          const res = await fetch(`/api/blogs/tags/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
          if (res.ok) {
            setConfirm((c) => ({ ...c, open: false }));
            load();
          } else {
            const j = await res.json();
            alert('Delete failed: ' + JSON.stringify(j));
          }
        } catch (e) {
          console.error(e);
          alert('Delete failed');
        }
      },
    });
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Tags</h1>
        <button className="btn" onClick={() => router.push('/admin/blogs')}>Back to Blogs</button>
      </div>
      <form onSubmit={handleCreate} className="flex gap-2 mb-4">
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="input input-bordered" />
        <input placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="input input-bordered" />
        <button className="btn btn-primary" type="submit">Add</button>
      </form>
      {loading && <div>Loading...</div>}
      <div className="grid grid-cols-3 gap-2">
        {tags.map((t) => (
          <div key={t.id} className="p-2 border rounded flex items-center justify-between">
            <div>
              <div className="font-medium">{t.name}</div>
              <div className="text-sm text-muted">{t.slug}</div>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-sm" onClick={() => router.push(`/admin/blogs/tags/${t.id}`)}>Edit</button>
              <button className="btn btn-sm btn-error" onClick={() => openDeleteConfirm(t.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      <ConfirmModal open={confirm.open} title={confirm.title} message={confirm.message} onConfirm={() => confirm.onConfirm && confirm.onConfirm()} onCancel={() => setConfirm((c) => ({ ...c, open: false }))} />
    </div>
  );
}
