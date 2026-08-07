import { useEffect, useState } from 'react';
import { createProduct, updateProduct, getCategories, uploadProductImage, deleteProductImage } from '../../api';
import './ProductForm.css';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

function slugify(str) {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function ProductForm({ product, onClose }) {
  const isNew = !product;
  const [categories, setCategories] = useState([]);
  const defaultStock = product?.variants?.length === 1 && product.variants[0].color_name === 'Único'
    ? product.variants[0].stock
    : '';
  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    category_id: product?.category_id || '',
    price: product?.price || '',
    weight_grams: product?.weight_grams || '',
    stock: defaultStock,
    fiber_composition: product?.fiber_composition || '',
    needle_size: product?.needle_size || '',
    featured: product?.featured || false,
    coming_soon: product?.coming_soon || false,
  });
  const [variants, setVariants] = useState([]);
  const [existingImages, setExistingImages] = useState(product?.images || []);
  const [newImages, setNewImages] = useState([]); // [{ file, previewUrl }]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { getCategories().then(setCategories); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'name' && isNew) setForm(f => ({ ...f, slug: slugify(value) }));
  };

  const addVariant = () => setVariants(v => [...v, { color_name: '', color_hex: '#3BBFBA', stock: 0, price_override: '' }]);
  const updateVariant = (i, key, val) => setVariants(v => v.map((x, j) => j === i ? { ...x, [key]: val } : x));
  const removeVariant = (i) => setVariants(v => v.filter((_, j) => j !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const colorVariants = variants.filter(v => v.color_name);
      const resolvedVariants = colorVariants.length === 0 && form.stock !== ''
        ? [{ color_name: 'Único', stock: Number(form.stock) }]
        : colorVariants;
      const payload = { ...form, variants: resolvedVariants };
      let saved;
      if (isNew) {
        saved = await createProduct(payload);
      } else {
        saved = await updateProduct(product.id, payload);
      }

      for (let i = 0; i < newImages.length; i++) {
        const fd = new FormData();
        fd.append('image', newImages[i].file);
        fd.append('is_main', existingImages.length === 0 && i === 0 ? 'true' : 'false');
        await uploadProductImage(saved.id, fd);
      }

      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form-page">
      <div className="product-form-header">
        <h1 className="page-title">{isNew ? 'Nuevo producto' : `Editar: ${product.name}`}</h1>
        <button className="btn-back" onClick={onClose}>← Volver</button>
      </div>

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-section">
          <h2>Información básica</h2>
          <div className="form-row">
            <label>
              Nombre *
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            {!isNew && (
              <label>
                Slug
                <input name="slug" value={form.slug} readOnly style={{ color: '#999', cursor: 'default', background: '#f8f5f0' }} />
              </label>
            )}
          </div>
          <label>
            Descripción
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
          </label>
          <div className="form-row">
            <label>
              Categoría
              <select name="category_id" value={form.category_id} onChange={handleChange}>
                <option value="">Sin categoría</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label>
              Precio *
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required />
            </label>
            <label>
              Stock
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} placeholder="0"  />
            </label>
          </div>
          <div className="form-row">
            <label>
              Peso por unidad (g)
              <input name="weight_grams" type="number" min="0" value={form.weight_grams} onChange={handleChange} />
            </label>
            <label>
              Composición de fibra
              <input name="fiber_composition" value={form.fiber_composition} onChange={handleChange} placeholder="100% lana merino" />
            </label>
            <label>
              Tamaño de agujas
              <input name="needle_size" value={form.needle_size} onChange={handleChange} placeholder="4 - 5 mm" />
            </label>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <label className="checkbox-label">
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
              Producto destacado
            </label>
            <label className="checkbox-label">
              <input type="checkbox" name="coming_soon" checked={form.coming_soon} onChange={handleChange} />
              Vuelve al stock (muestra "Próximamente")
            </label>
          </div>
        </div>

        <div className="form-section">
          <h2>Fotos del producto</h2>
          <div className="images-grid">
            {existingImages.map(img => (
              <div key={img.id} className="image-thumb">
                <img src={`${BASE_URL}${img.image_url}`} alt="" />
                {img.is_main && <span className="image-badge">Principal</span>}
                <button
                  type="button"
                  className="image-delete"
                  onClick={async () => {
                    await deleteProductImage(img.id);
                    setExistingImages(imgs => imgs.filter(i => i.id !== img.id));
                  }}
                >✕</button>
              </div>
            ))}
            {newImages.map((img, i) => (
              <div key={`new-${i}`} className="image-thumb image-thumb--preview">
                <img src={img.previewUrl} alt="" />
                <button
                  type="button"
                  className="image-delete"
                  onClick={() => {
                    URL.revokeObjectURL(img.previewUrl);
                    setNewImages(imgs => imgs.filter((_, j) => j !== i));
                  }}
                >✕</button>
              </div>
            ))}
          </div>
          {existingImages.length + newImages.length < 3 && (
            <label className="image-upload-btn">
              + Agregar foto
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files[0];
                  if (file) setNewImages(imgs => [...imgs, { file, previewUrl: URL.createObjectURL(file) }]);
                  e.target.value = '';
                }}
              />
            </label>
          )}
          <p className="image-hint">{existingImages.length + newImages.length}/3 fotos</p>
        </div>


        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : isNew ? 'Crear producto' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
