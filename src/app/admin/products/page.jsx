"use client";
import { useEffect, useState } from "react";
import ConfirmModal from '@/components/ConfirmModal';
import { useRouter } from 'next/navigation';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [page, limit]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();
      if (res.ok) {
        setProducts(json.data || []);
        if (json.meta) {
          setTotal(json.meta.total || 0);
          setTotalPages(json.meta.totalPages || 1);
        }
      } else {
        console.error(json.error || "Failed to fetch products");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  function handleLimitChange(e) {
    setLimit(Number(e.target.value) || 10);
    setPage(1);
  }

  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: null });

  function openDeleteConfirm(productId) {
    setConfirm({
      open: true,
      title: 'Hapus Produk',
      message: 'Hapus produk ini? Tindakan ini tidak dapat dibatalkan.',
      onConfirm: async () => {
        try {
          const token = typeof window !== 'undefined' ? (document.cookie.match(/(^|;)\s*adminAccessToken=([^;]+)/)?.pop()) : null;
          const res = await fetch(`/api/products/${productId}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
          if (res.ok) {
            setConfirm((c) => ({ ...c, open: false }));
            fetchProducts();
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

  return (
    <div className="flex flex-col items-center py-5">
      <div className="w-11/12">
        <h1 className="text-3xl font-bold text-center mb-6">Products</h1>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm hidden sm:block">Per halaman</label>
            <select value={limit} onChange={handleLimitChange} className="select select-bordered w-24">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div>
            <button className="btn btn-primary" onClick={() => router.push('/admin/products/new')}>Buat Produk</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto w-full min-w-[600px] border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 border">No</th>
                <th className="py-2 px-4 border">Name</th>
                <th className="py-2 px-4 border">Slug</th>
                <th className="py-2 px-4 border">Price</th>
                <th className="py-2 px-4 border">Variants</th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} className={(i + 1) % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="py-2 px-4 border">{i + 1}</td>
                  <td className="py-2 px-4 border">{p.name}</td>
                  <td className="py-2 px-4 border">{p.slug}</td>
                  <td className="py-2 px-4 border">{p.price}</td>
                  <td className="py-2 px-4 border">{p.variants ? p.variants.length : 0}</td>
                  <td className="py-2 px-4 border">
                    <button className="btn btn-sm mr-2" onClick={() => router.push(`/admin/products/${p.id}`)}>Edit</button>
                    <button className="btn btn-sm btn-error" onClick={() => openDeleteConfirm(p.id)}>Delete</button>
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
      </div>
      <ConfirmModal open={confirm.open} title={confirm.title} message={confirm.message} onConfirm={() => { confirm.onConfirm && confirm.onConfirm(); }} onCancel={() => setConfirm((c) => ({ ...c, open: false }))} />
    </div>
  );
}
