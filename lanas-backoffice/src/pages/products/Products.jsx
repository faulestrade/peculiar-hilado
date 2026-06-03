import { useEffect, useState } from 'react';
import { getProducts, getProductBySlug, deleteProduct } from '../../api';
import ProductForm from './ProductForm';
import '../Dashboard.css';
import './Products.css';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | product object
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const load = () => {
    setLoading(true);
    getProducts({ search, page, limit })
      .then(d => { setProducts(d.products); setTotal(d.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, page]);

  const handleDelete = async (id) => {
    if (!confirm('¿Desactivar este producto?')) return;
    await deleteProduct(id);
    load();
  };

  if (editing !== null) {
    return (
      <ProductForm
        product={editing === 'new' ? null : editing}
        onClose={() => { setEditing(null); load(); }}
      />
    );
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Productos</h1>
        <button className="btn-primary" onClick={() => setEditing('new')}>+ Nuevo producto</button>
      </div>

      <div className="toolbar">
        <input
          placeholder="Buscar..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="search-input"
        />
        <span className="count-label">{total} productos</span>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="table-loading">Cargando...</td></tr>
            ) : products.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="product-thumb">
                    {p.main_image
                      ? <img src={`${BASE_URL}${p.main_image}`} alt={p.name} />
                      : <div className="product-thumb__placeholder" />}
                  </div>
                </td>
                <td>
                  <strong>{p.name}</strong>
                  {p.featured && <span className="badge badge--confirmed" style={{ marginLeft: '0.5rem' }}>Destacado</span>}
                </td>
                <td>{p.category_name || '—'}</td>
                <td>${Number(p.price).toLocaleString('es-AR')}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn-edit" onClick={() => getProductBySlug(p.slug).then(setEditing)}>Editar</button>
                    <button className="btn-delete" onClick={() => handleDelete(p.id)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
