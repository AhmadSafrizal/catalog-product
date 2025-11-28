"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function BlogEditor({ params }) {
  const router = useRouter();
  const id = params?.id;
  const isNew = id === 'new';

  const [loading, setLoading] = useState(false);
  const [blog, setBlog] = useState({ title: '', slug: '', content: '', thumbnail: '', tagIds: [] });
  const [tags, setTags] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadTags();
    if (!isNew) loadBlog();
  }, [id]);

  async function loadTags() {
    try {
      const res = await fetch('/api/blogs/tags');
      const j = await res.json();
      if (j?.data) setTags(j.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadBlog() {
    setLoading(true);
    try {
      const res = await fetch(`/api/blogs/${id}`);
      const j = await res.json();
      if (j?.data) {
        const b = j.data;
        setBlog({
          title: b.title || '',
          slug: b.slug || '',
          content: b.content || '',
          thumbnail: b.thumbnail || '',
          tagIds: (b.tags || []).map((t) => t.tagId),
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setBlog((b) => ({ ...b, [name]: value }));
  }

  function toggleTag(tagId) {
    setBlog((b) => {
      const ids = new Set(b.tagIds || []);
      if (ids.has(tagId)) ids.delete(tagId); else ids.add(tagId);
      return { ...b, tagIds: Array.from(ids) };
    });
  }

  function validate() {
    const errs = {};
    if (!blog.title || !blog.title.trim()) errs.title = 'Title wajib';
    if (!blog.slug || !blog.slug.trim()) errs.slug = 'Slug wajib';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const token = Cookies.get('adminAccessToken');
      const payload = { ...blog, tagIds: blog.tagIds };
      const url = isNew ? '/api/blogs' : `/api/blogs/${id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(payload) });
      const j = await res.json();
      if (j?.data) router.push('/admin/blogs'); else alert('Save failed: ' + JSON.stringify(j));
    } catch (err) {
      console.error(err);
      alert('Save failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">{isNew ? 'Buat Blog' : 'Edit Blog'}</h2>
      {loading && <div className="mb-4">Loading...</div>}
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm">Title</label>
          <input name="title" value={blog.title} onChange={handleChange} className="input input-bordered w-full" />
          {errors.title && <p className="text-sm text-error mt-1">{errors.title}</p>}
        </div>
        <div>
          <label className="block text-sm">Slug</label>
          <input name="slug" value={blog.slug} onChange={handleChange} className="input input-bordered w-full" />
          {errors.slug && <p className="text-sm text-error mt-1">{errors.slug}</p>}
        </div>
        <div>
          <label className="block text-sm">Content</label>
          <textarea name="content" value={blog.content} onChange={handleChange} className="textarea textarea-bordered w-full h-48" />
        </div>
        <div>
          <label className="block text-sm">Thumbnail URL</label>
          <input name="thumbnail" value={blog.thumbnail} onChange={handleChange} className="input input-bordered w-full" />
        </div>
        <div>
          <label className="block text-sm">Tags</label>
          <div className="flex gap-2 flex-wrap mt-2">
            {tags.map((t) => (
              <button key={t.id} type="button" className={`btn btn-sm ${blog.tagIds.includes(t.id) ? 'btn-primary' : 'btn-outline'}`} onClick={() => toggleTag(t.id)}>{t.name}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary">Save</button>
          <button type="button" onClick={() => router.push('/admin/blogs')} className="btn">Cancel</button>
        </div>
      </form>
    </div>
  );
}
