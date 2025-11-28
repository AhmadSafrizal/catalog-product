"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import ConfirmModal from '@/components/ConfirmModal';

export default function BlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => { load(); }, [page, search, limit]);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (search) params.set('search', search);
      const res = await fetch(`/api/blogs?${params.toString()}`);
      const j = await res.json();
      if (j?.data) {
        setBlogs(j.data);
        if (j.meta) {
          setTotal(j.meta.total || 0);
          setTotalPages(j.meta.totalPages || 1);
        }
      }
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }

  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: null });

  function openDeleteConfirm(id) {
    setConfirm({
      open: true,
      title: 'Hapus Blog',
      message: 'Hapus blog ini? Tindakan tidak dapat dibatalkan.',
      onConfirm: async () => {
        try {
          const token = Cookies.get('adminAccessToken');
          const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
          if (res.ok) {
            setConfirm((c) => ({ ...c, open: false }));
            load();
          } else {
            const j = await res.json();
            alert('Delete failed: ' + JSON.stringify(j));
          }
        } catch (err) {
          console.error(err);
          alert('Delete failed');
        }
      },
    });
  }

  function submitSearch(e) {
    e?.preventDefault();
    setPage(1);
    setSearch(q.trim());
  }

  function handleLimitChange(e) {
    const v = Number(e.target.value) || 10;
    setLimit(v);
    setPage(1);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Blogs</h1>
        <div className="flex gap-2">
          <button className="btn" onClick={() => router.push('/admin/blogs/tags')}>Tags</button>
          <button className="btn btn-primary" onClick={() => router.push('/admin/blogs/new')}>Buat Blog</button>
        </div>
      </div>

      <form onSubmit={submitSearch} className="flex flex-col sm:flex-row gap-2 mb-4 items-start sm:items-center">
        <div className="flex gap-2 w-full">
          <input placeholder="Search title, slug, content" value={q} onChange={(e) => setQ(e.target.value)} className="input input-bordered flex-1" />
          <button className="btn" type="submit">Search</button>
          <button className="btn" type="button" onClick={() => { setQ(''); setSearch(''); setPage(1); }}>Clear</button>
        </div>
        <div className="flex gap-2 items-center">
          <label className="text-sm mr-2 hidden sm:block">Per halaman</label>
          <select value={limit} onChange={handleLimitChange} className="select select-bordered w-24">
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </form>

      {loading && <div>Loading...</div>}
      <div className="overflow-auto">
        <table className="table w-full min-w-[600px]">
          <thead>
            <tr>
              <th>Title</th>
              <th>Tags</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((b) => (
              <tr key={b.id}>
                <td>{b.title}</td>
                <td>{(b.tags || []).map((t) => t.tag?.name).filter(Boolean).join(', ')}</td>
                <td>{new Date(b.createdAt).toLocaleString()}</td>
                <td className="text-right">
                  <button className="btn btn-sm mr-2" onClick={() => router.push(`/admin/blogs/${b.id}`)}>Edit</button>
                  <button className="btn btn-sm btn-error" onClick={() => openDeleteConfirm(b.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2">
        <div className="text-sm">Showing page {page} of {totalPages} — {total} items</div>
        <div className="flex items-center gap-2">
          {/* Desktop: full controls */}
          <div className="hidden sm:flex btn-group">
            <button className="btn btn-sm" onClick={() => setPage(1)} disabled={page === 1}>First</button>
            <button className="btn btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
            <button className="btn btn-sm">{page}</button>
            <button className="btn btn-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
            <button className="btn btn-sm" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</button>
          </div>
          {/* Mobile: compact Prev/Next */}
          <div className="flex sm:hidden items-center gap-2">
            <button className="btn btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
            <div className="px-2 text-sm">{page}/{totalPages}</div>
            <button className="btn btn-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
          </div>
        </div>
      </div>
      <ConfirmModal open={confirm.open} title={confirm.title} message={confirm.message} onConfirm={() => confirm.onConfirm && confirm.onConfirm()} onCancel={() => setConfirm((c) => ({ ...c, open: false }))} />
    </div>
  );
}
