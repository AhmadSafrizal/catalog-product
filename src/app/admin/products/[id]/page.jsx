"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import ConfirmModal from '@/components/ConfirmModal';

export default function ProductEditor({ params }) {
  const router = useRouter();
  const id = params?.id;
  const isNew = id === 'new';

  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState({
    name: '',
    slug: '',
    price: 0,
    description: '',
    categoryId: '',
    images: [],
    variants: [],
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isNew) {
      setLoading(true);
      fetch(`/api/products/${id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.data) setProduct(data.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
    // fetch categories for selector
    fetch('/api/categories')
      .then((r) => r.json())
      .then((j) => {
        if (j?.data) setCategories(j.data);
      })
      .catch(() => setCategories([]));
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setProduct((p) => ({ ...p, [name]: value }));
  }

  function handleVariantChange(index, field, value) {
    setProduct((p) => {
      const v = [...(p.variants || [])];
      v[index] = { ...(v[index] || {}), [field]: value };
      return { ...p, variants: v };
    });
  }

  function addVariant() {
    setProduct((p) => ({ ...p, variants: [...(p.variants || []), { name: '', sku: '', price: 0 }] }));
  }

  function removeVariant(i) {
    setProduct((p) => ({ ...p, variants: (p.variants || []).filter((_, idx) => idx !== i) }));
  }

  async function handleFilesChange(e) {
    const chosen = Array.from(e.target.files || []);
    if (!chosen.length) return;
    setFiles(chosen);
    // create optimistic previews
    const newPreviews = chosen.map((f, idx) => ({
      id: `${Date.now()}_${idx}`,
      file: f,
      url: URL.createObjectURL(f),
      uploading: true,
    }));
    setPreviews((p) => [...p, ...newPreviews]);

    // auto-upload
    const form = new FormData();
    chosen.forEach((f) => form.append('images', f));
    setLoading(true);
    try {
      const token = Cookies.get('adminAccessToken');
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const json = await res.json();
      if (json?.data) {
        // append images
        setProduct((p) => ({ ...p, images: [...(p.images || []), ...json.data] }));
        // mark previews uploaded and then clear them
        setPreviews((prev) => {
          prev.forEach((pr) => URL.revokeObjectURL(pr.url));
          return [];
        });
        setFiles([]);
      } else if (json?.error) {
        alert('Upload error: ' + JSON.stringify(json.error));
        // revoke previews on error
        setPreviews((prev) => {
          prev.forEach((pr) => URL.revokeObjectURL(pr.url));
          return [];
        });
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
      setPreviews((prev) => {
        prev.forEach((pr) => URL.revokeObjectURL(pr.url));
        return [];
      });
    } finally {
      setLoading(false);
    }
  }

  function removeUploadedImage(index) {
    setProduct((p) => ({ ...p, images: (p.images || []).filter((_, i) => i !== index) }));
  }

  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: null });

  function openImageDeleteConfirm(index, img, imgUrl) {
    setConfirm({
      open: true,
      title: 'Hapus Gambar',
      message: 'Hapus gambar ini? Tindakan tidak dapat dibatalkan.',
      onConfirm: async () => {
        const token = Cookies.get('adminAccessToken');
        try {
          const body = JSON.stringify({ id: img?.id, url: imgUrl });
          const res = await fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body });
          const j = await res.json();
          if (res.ok) {
            removeUploadedImage(index);
            setConfirm((c) => ({ ...c, open: false }));
          } else {
            alert('Delete failed: ' + JSON.stringify(j));
          }
        } catch (err) {
          console.error(err);
          alert('Delete failed');
        }
      },
    });
  }

  useEffect(() => {
    return () => {
      // cleanup object URLs
      previews.forEach((pr) => URL.revokeObjectURL(pr.url));
    };
  }, [previews]);

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    // client-side validation
    if (!validate()) {
      setLoading(false);
      return;
    }
    try {
      const token = Cookies.get('adminAccessToken');
      const payload = { ...product };
      // ensure numeric price
      payload.price = Number(payload.price) || 0;
      const url = isNew ? '/api/products' : `/api/products/${id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json?.data) {
        router.push('/admin/products');
      } else {
        alert('Save failed: ' + JSON.stringify(json?.error || json));
      }
    } catch (err) {
      console.error(err);
      alert('Save failed');
    } finally {
      setLoading(false);
    }
  }

  function validate() {
    const errs = {};
    if (!product.name || !product.name.trim()) errs.name = 'Nama produk wajib';
    if (!product.slug || !product.slug.trim()) errs.slug = 'Slug wajib';
    if (!product.price || Number(product.price) <= 0) errs.price = 'Harga harus lebih dari 0';
    // if categories were fetched, require selection
    if (categories.length && !product.categoryId) errs.categoryId = 'Pilih kategori';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">{isNew ? 'Buat Produk Baru' : 'Edit Produk'}</h2>
      {loading && <div className="mb-4">Loading...</div>}
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm">Nama</label>
          <input name="name" value={product.name || ''} onChange={handleChange} className="input input-bordered w-full" />
          {errors.name && <p className="text-sm text-error mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm">Slug</label>
          <input name="slug" value={product.slug || ''} onChange={handleChange} className="input input-bordered w-full" />
          {errors.slug && <p className="text-sm text-error mt-1">{errors.slug}</p>}
        </div>
        <div>
          <label className="block text-sm">Harga (IDR)</label>
          <input name="price" type="number" value={product.price || 0} onChange={handleChange} className="input input-bordered w-full" />
          {errors.price && <p className="text-sm text-error mt-1">{errors.price}</p>}
        </div>
        <div>
          <label className="block text-sm">Deskripsi</label>
          <textarea name="description" value={product.description || ''} onChange={handleChange} className="textarea textarea-bordered w-full" />
        </div>
        <div>
          <label className="block text-sm">Kategori</label>
          {categories.length ? (
            <select name="categoryId" value={product.categoryId || ''} onChange={handleChange} className="select select-bordered w-full">
              <option value="">-- Pilih kategori --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          ) : (
            <input name="categoryId" value={product.categoryId || ''} onChange={handleChange} className="input input-bordered w-full" placeholder="Category ID or name" />
          )}
          {errors.categoryId && <p className="text-sm text-error mt-1">{errors.categoryId}</p>}
        </div>

        <div>
          <label className="block text-sm">Gambar</label>
          <input type="file" multiple accept="image/*" onChange={handleFilesChange} className="file-input file-input-bordered w-full" />
          <div className="flex gap-2 mt-2 flex-wrap">
            {/* optimistic previews */}
            {previews.map((pr) => (
              <div key={pr.id} className="relative w-24 h-24 bg-gray-100 p-1 border rounded">
                <img src={pr.url} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute left-1 top-1 bg-black/40 text-white text-xs px-1 rounded">Uploading</div>
              </div>
            ))}

            {/* uploaded / persisted images */}
            {(product.images || []).map((img, i) => {
              const imgUrl = typeof img === 'string' ? img : img.url || img.path;
              return (
                <div key={i} className="relative w-24 h-24 bg-gray-100 p-1 border rounded">
                  <img src={imgUrl} alt={img.alt || product.name} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => openImageDeleteConfirm(i, img, imgUrl)}
                    className="absolute right-1 top-1 bg-white rounded-full p-1 text-red-600">
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm">Variants</label>
          <div className="space-y-2">
            {(product.variants || []).map((v, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input placeholder="Name" value={v.name || ''} onChange={(e) => handleVariantChange(idx, 'name', e.target.value)} className="input input-bordered" />
                <input placeholder="SKU" value={v.sku || ''} onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)} className="input input-bordered" />
                <input placeholder="Price" type="number" value={v.price || 0} onChange={(e) => handleVariantChange(idx, 'price', Number(e.target.value))} className="input input-bordered w-28" />
                <button type="button" onClick={() => removeVariant(idx)} className="btn btn-error btn-sm">Remove</button>
              </div>
            ))}
            <button type="button" onClick={addVariant} className="btn btn-outline btn-sm">Add Variant</button>
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary">Save</button>
          <button type="button" onClick={() => router.push('/admin/products')} className="btn">Cancel</button>
        </div>
      </form>
      <ConfirmModal open={confirm.open} title={confirm.title} message={confirm.message} onConfirm={() => confirm.onConfirm && confirm.onConfirm()} onCancel={() => setConfirm((c) => ({ ...c, open: false }))} />
    </div>
  );
}
