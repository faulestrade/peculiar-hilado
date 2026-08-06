import { useEffect, useRef, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory, uploadCategoryImage } from '../../api';
import '../products/Products.css';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

function slugify(str) {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const load = () => { getCategories().then(setCategories).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (name === 'name' && !editing) setForm(f => ({ ...f, slug: slugify(value) }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let saved;
      if (editing) {
        saved = await updateCategory(editing.id, form);
        setEditing(null);
      } else {
        saved = await createCategory(form);
      }
      if (imageFile) {
        await uploadCategoryImage(saved.id, imageFile);
      }
      setForm({ name: '', slug: '', description: '' });
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  };

  const startEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '' });
    setImageFile(null);
    setImagePreview(cat.image_url ? `${BASE_URL}${cat.image_url}` : null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ name: '', slug: '', description: '' });
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Desactivar esta categoría?')) return;
    await deleteCategory(id);
    load();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
      <div>
        <h1 className="page-title">Categorías</h1>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Slug</th>
                <th>Productos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="table-loading">Cargando...</td></tr>
              ) : categories.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td><code style={{ fontSize: '0.8rem', background: '#f5ede5', padding: '0.1rem 0.4rem', borderRadius: 4 }}>{c.slug}</code></td>
                  <td>{c.product_count}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn-edit" onClick={() => startEdit(c)}>Editar</button>
                      <button className="btn-delete" onClick={() => handleDelete(c.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="page-title" style={{ fontSize: '1.2rem' }}>
          {editing ? `Editar: ${editing.name}` : 'Nueva categoría'}
        </h2>
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 500, color: '#5a4a3a' }}>
            Nombre *
            <input name="name" value={form.name} onChange={handleChange} required
              style={{ padding: '0.55rem 0.8rem', border: '1px solid #e0d0c0', borderRadius: 8, fontSize: '0.9rem', outline: 'none' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 500, color: '#5a4a3a' }}>
            Slug *
            <input name="slug" value={form.slug} onChange={handleChange} required
              style={{ padding: '0.55rem 0.8rem', border: '1px solid #e0d0c0', borderRadius: 8, fontSize: '0.9rem', outline: 'none' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 500, color: '#5a4a3a' }}>
            Descripción
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              style={{ padding: '0.55rem 0.8rem', border: '1px solid #e0d0c0', borderRadius: 8, fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 500, color: '#5a4a3a' }}>
            Foto de la categoría
            {imagePreview && (
              <img src={imagePreview} alt="preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%', marginBottom: '0.4rem' }} />
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange}
              style={{ fontSize: '0.85rem' }} />
          </label>
          {error && <p style={{ color: '#c04040', fontSize: '0.85rem' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {editing && <button type="button" onClick={cancelEdit} className="btn-cancel" style={{ background: 'transparent', border: '1px solid #e0d0c0', borderRadius: 8, padding: '0.55rem 1rem', cursor: 'pointer', fontSize: '0.9rem' }}>Cancelar</button>}
            <button type="submit" className="btn-primary">
              {editing ? 'Guardar cambios' : 'Crear categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
