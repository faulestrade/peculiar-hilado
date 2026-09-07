import { useEffect, useState } from 'react';
import { getBanners, saveBanner, toggleBannerActive, deleteBanner, getProducts } from '../../api';
import { imgUrl } from '../../utils/imgUrl';
import '../products/Products.css';

const EMPTY = { product_id: '', title: '', subtitle: '', cta_text: 'Ver producto', active: false };

export default function Banner() {
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = () => getBanners().then(setBanners);

  useEffect(() => {
    load();
    getProducts({ limit: 200, all: true }).then(d => setProducts(d.products || []));
  }, []);

  const selectedProduct = products.find(p => p.id === Number(form.product_id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await saveBanner({ ...form, id: editing });
      setForm(EMPTY);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleEdit = (b) => {
    setEditing(b.id);
    setForm({ product_id: b.product_id || '', title: b.title || '', subtitle: b.subtitle || '', cta_text: b.cta_text || 'Ver producto', active: b.active });
  };

  const handleToggle = async (id, active) => {
    await toggleBannerActive(id, active);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este banner?')) return;
    await deleteBanner(id);
    load();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
      <div>
        <h1 className="page-title">Banners</h1>

        {banners.length === 0 ? (
          <p style={{ color: '#999', fontSize: '0.9rem' }}>No hay banners creados.</p>
        ) : banners.map(b => (
          <div key={b.id} style={{ background: '#fff', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '0.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {b.product_image && (
              <img src={imgUrl(b.product_image)} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: '0.9rem' }}>{b.title || b.product_name || 'Sin título'}</strong>
              {b.subtitle && <p style={{ fontSize: '0.8rem', color: '#888', margin: '0.15rem 0 0' }}>{b.subtitle}</p>}
              <p style={{ fontSize: '0.75rem', color: '#aaa', margin: '0.1rem 0 0' }}>{b.product_name}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
              <button
                className={`toggle-active ${b.active ? 'on' : 'off'}`}
                onClick={() => handleToggle(b.id, !b.active)}
                title={b.active ? 'Desactivar' : 'Activar'}
              >
                <span className="toggle-active__knob" />
              </button>
              <button className="btn-edit" onClick={() => handleEdit(b)}>Editar</button>
              <button className="btn-delete" onClick={() => handleDelete(b.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="page-title" style={{ fontSize: '1.2rem' }}>{editing ? 'Editar banner' : 'Nuevo banner'}</h2>
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 500, color: '#5a4a3a' }}>
            Producto
            <select
              value={form.product_id}
              onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}
              style={{ padding: '0.55rem 0.8rem', border: '1px solid #e0d0c0', borderRadius: 8, fontSize: '0.9rem', background: '#fff' }}
            >
              <option value="">— Sin producto —</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>

          {['title', 'subtitle', 'cta_text'].map(field => (
            <label key={field} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 500, color: '#5a4a3a' }}>
              {{ title: 'Título', subtitle: 'Subtítulo', cta_text: 'Texto del botón' }[field]}
              <input
                value={form[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                placeholder={{ title: 'Ej: Nueva colección', subtitle: 'Ej: Hilados teñidos a mano', cta_text: 'Ver producto' }[field]}
                style={{ padding: '0.55rem 0.8rem', border: '1px solid #e0d0c0', borderRadius: 8, fontSize: '0.9rem' }}
              />
            </label>
          ))}

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: '#5a4a3a', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
            Activar banner (solo puede haber uno activo)
          </label>

          {/* Preview */}
          {(selectedProduct || form.title) && (
            <div style={{ borderRadius: 10, overflow: 'hidden', background: '#f5ede5', padding: '1rem', fontSize: '0.8rem', color: '#5a4a3a' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Preview</p>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {selectedProduct?.main_image && <img src={imgUrl(selectedProduct.main_image)} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />}
                <div>
                  <div style={{ fontWeight: 600 }}>{form.title || selectedProduct?.name}</div>
                  {form.subtitle && <div style={{ color: '#888', fontSize: '0.75rem' }}>{form.subtitle}</div>}
                  <div style={{ marginTop: '0.25rem', background: '#2BBFBA', color: '#fff', borderRadius: 4, padding: '0.15rem 0.5rem', display: 'inline-block', fontSize: '0.72rem' }}>{form.cta_text || 'Ver producto'}</div>
                </div>
              </div>
            </div>
          )}

          {error && <p style={{ color: '#c04040', fontSize: '0.85rem' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn-primary">{editing ? 'Guardar cambios' : 'Crear banner'}</button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setForm(EMPTY); }} style={{ background: 'none', border: '1px solid #e0d0c0', borderRadius: 8, padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
