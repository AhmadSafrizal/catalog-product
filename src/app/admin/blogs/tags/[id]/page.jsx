"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function TagEditor({ params }) {
  const router = useRouter();
  const id = params?.id;
  const isNew = id === 'new';

  const [loading, setLoading] = useState(false);
  const [tag, setTag] = useState({ name: '', slug: '' });

  useEffect(() => {
    if (!isNew) load();
  }, [id]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/blogs/tags/${id}`);
      const j = await res.json();
      if (j?.data) setTag(j.data);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setTag((t) => ({ ...t, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const token = Cookies.get('adminAccessToken');
      const url = isNew ? '/api/blogs/tags' : `/api/blogs/tags/${id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(tag) });
      const j = await res.json();
      if (j?.data) router.push('/admin/blogs/tags'); else alert('Save failed: ' + JSON.stringify(j));
    } catch (e) {
      console.error(e);
      alert('Save failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">{isNew ? 'Buat Tag' : 'Edit Tag'}</h2>
      {loading && <div className="mb-4">Loading...</div>}
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm">Name</label>
          <input name="name" value={tag.name || ''} onChange={handleChange} className="input input-bordered w-full" />
        </div>
        <div>
          <label className="block text-sm">Slug</label>
          <input name="slug" value={tag.slug || ''} onChange={handleChange} className="input input-bordered w-full" />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary">Save</button>
          <button type="button" onClick={() => router.push('/admin/blogs/tags')} className="btn">Cancel</button>
        </div>
      </form>
    </div>
  );
}
