import { useEffect, useState } from 'react';
import { getProducts, updateVariantStock } from '../../api';
import '../products/Products.css';

export default function Stock() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    getProducts({ limit: 100, search })
      .then(d => setProducts(d.products))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const handleStockChange = async (variantId, newStock) => {
    setSaving(s => ({ ...s, [variantId]: true }));
    try {
      await updateVariantStock(variantId, Number(newStock));
    } finally {
      setSaving(s => ({ ...s, [variantId]: false }));
    }
  };

  return (
    <div>
      <h1 className="page-title">Gestión de Stock</h1>

      <div className="toolbar">
        <input
          placeholder="Buscar producto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Color</th>
              <th>SKU</th>
              <th>Stock actual</th>
              <th>Nuevo stock</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="table-loading">Cargando...</td></tr>
            ) : products.flatMap(p =>
              (p.variants || []).map(v => (
                <tr key={v.id} className={v.stock <= 5 ? 'row-low-stock' : ''}>
                  <td>{p.name}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {v.color_hex && (
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: v.color_hex, border: '1px solid #ddd' }} />
                      )}
                      {v.color_name}
                    </div>
                  </td>
                  <td>{v.sku || '—'}</td>
                  <td>
                    <span className={v.stock === 0 ? 'stock-zero' : v.stock <= 5 ? 'stock-low' : 'stock-ok'}>
                      {v.stock}
                    </span>
                  </td>
                  <td>
                    <StockEditor
                      variantId={v.id}
                      current={v.stock}
                      saving={!!saving[v.id]}
                      onSave={handleStockChange}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StockEditor({ variantId, current, saving, onSave }) {
  const [val, setVal] = useState(current);

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <input
        type="number"
        min="0"
        value={val}
        onChange={e => setVal(e.target.value)}
        style={{ width: 70, padding: '0.3rem 0.5rem', border: '1px solid #e0d0c0', borderRadius: 6, fontSize: '0.9rem' }}
      />
      <button
        onClick={() => onSave(variantId, val)}
        disabled={saving || Number(val) === current}
        style={{
          background: '#b06040', color: '#fff', border: 'none',
          borderRadius: 6, padding: '0.3rem 0.7rem', fontSize: '0.8rem',
          cursor: 'pointer', opacity: saving ? 0.6 : 1
        }}
      >
        {saving ? '...' : 'Guardar'}
      </button>
    </div>
  );
}
