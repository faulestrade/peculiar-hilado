import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories } from '../api/products';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';
import ProductCard from '../components/product/ProductCard';
import './Home.css';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts({ featured: 'true', limit: 4 }),
      getCategories(),
    ]).then(([prods, cats]) => {
      setFeatured(prods.products);
      setCategories(cats.filter(c => c.product_count > 0));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="hero__content">
          <h1 className="hero__title">Tejé con amor,<br />tejé con calidad</h1>
          <p className="hero__subtitle">
            Hilados teñidos a mano en Uruguay. Colores únicos,
            texturas que inspiran.
          </p>
          <Link to="/catalogo" className="btn btn--primary">
            Ver catálogo
          </Link>
        </div>
      </section>

      {/* Categorías */}
      {categories.length >= 3 && (
        <section className="section">
          <div className="container">
            <h2 className="section__title">Categorías</h2>
            <div className="categories-grid">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/catalogo?categoria=${cat.slug}`}
                  className="category-card"
                >
                  <div className="category-card__img">
                    {cat.image_url
                      ? <img src={`${API_BASE}${cat.image_url}`} alt={cat.name} />
                      : <div className="category-card__placeholder" />}
                  </div>
                  <span>{cat.name}</span>
                  <small>{cat.product_count} productos</small>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Destacados — solo si hay al menos 2 */}
      {!loading && featured.length >= 2 && (
        <section className="section section--bg">
          <div className="container">
            <h2 className="section__title">Destacados</h2>
            <div className="featured-grid">
              {featured.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            <div className="section__cta">
              <Link to="/catalogo" className="btn btn--outline">Ver todos los productos</Link>
            </div>
          </div>
        </section>
      )}

      {/* Propuesta de valor */}
      <section className="section">
        <div className="container">
          <div className="features">
            <div className="feature">
              <div className="feature__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <h3>Calidad premium</h3>
              <p>Seleccionamos cada hebra para garantizar la mejor experiencia.</p>
            </div>
            <div className="feature">
              <div className="feature__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8.5" cy="14" r="3.5"/>
                  <circle cx="15.5" cy="14" r="3.5"/>
                  <circle cx="12" cy="7.5" r="3.5"/>
                </svg>
              </div>
              <h3>Colores únicos</h3>
              <p>Amplia paleta para que tu creatividad no tenga límites.</p>
            </div>
            <div className="feature">
              <div className="feature__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="1"/>
                  <path d="M16 8h4l3 3v5h-7V8z"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
              <h3>Envíos a todo el país</h3>
              <p>Hacemos llegar tus materiales a cualquier punto de Argentina.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
