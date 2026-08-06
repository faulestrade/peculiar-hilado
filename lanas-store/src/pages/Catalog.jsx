import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../api/products';
import ProductCard from '../components/product/ProductCard';
import './Catalog.css';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('categoria') || '';
  const search = searchParams.get('buscar') || '';
  const page = Number(searchParams.get('pagina')) || 1;
  const limit = 16;

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    getProducts({ category, search, page, limit })
      .then(data => { setProducts(data.products); setTotal(data.total); })
      .finally(() => setLoading(false));
  }, [category, search, page]);

  const setFilter = (key, value) => {
    const params = Object.fromEntries(searchParams.entries());
    if (value) params[key] = value;
    else delete params[key];
    delete params.pagina;
    setSearchParams(params);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="catalog">
      <div className="catalog__container">
        <aside className="catalog__sidebar">
          <h2>Categorías</h2>
          <ul className="catalog__cats">
            <li>
              <button
                className={!category ? 'active' : ''}
                onClick={() => setFilter('categoria', '')}
              >
                Todas
              </button>
            </li>
            {categories.map(c => (
              <li key={c.id}>
                <button
                  className={`${category === c.slug ? 'active' : ''} ${Number(c.product_count) === 0 ? 'empty' : ''}`}
                  onClick={() => c.product_count > 0 && setFilter('categoria', c.slug)}
                  disabled={Number(c.product_count) === 0}
                >
                  <span className="cat-name">{c.name}</span>
                  {Number(c.product_count) === 0
                    ? <span className="cat-empty-tag">Sin stock</span>
                    : <span>{c.product_count}</span>}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="catalog__main">
          <div className="catalog__toolbar">
            <input
              type="text"
              placeholder="Buscar productos..."
              defaultValue={search}
              className="catalog__search"
              onKeyDown={(e) => {
                if (e.key === 'Enter') setFilter('buscar', e.target.value);
              }}
            />
            <p className="catalog__count">{total} productos</p>
          </div>

          {loading ? (
            <div className="loading">Cargando productos...</div>
          ) : products.length === 0 ? (
            <div className="catalog__empty">No se encontraron productos.</div>
          ) : (
            <div className="products-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div className="catalog__pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={page === p ? 'active' : ''}
                  onClick={() => setSearchParams({ ...Object.fromEntries(searchParams.entries()), pagina: p })}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
