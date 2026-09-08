import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories } from '../api/products';
import api from '../api/axios';

import ProductCard from '../components/product/ProductCard';
import { imgUrl } from '../utils/imgUrl';
import { useInView } from '../hooks/useInView';
import './Home.css';

function Anim({ children, delay = 0, className = '' }) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      className={`anim${visible ? ' visible' : ''} ${className}`.trim()}
      style={delay ? { '--anim-delay': `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts({ featured: 'true', limit: 4 }),
      getCategories(),
      api.get('/banners/active').then(r => r.data).catch(() => null),
    ]).then(([prods, cats, ban]) => {
      setFeatured(prods.products);
      setCategories(cats.filter(c => c.product_count > 0));
      setBanner(ban);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <main className="page-enter">
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
            <Anim><h2 className="section__title">Categorías</h2></Anim>
            <div className="categories-grid">
              {categories.map((cat, i) => (
                <Anim key={cat.id} delay={i * 80}>
                  <Link
                    to={`/catalogo?categoria=${cat.slug}`}
                    className="category-card"
                  >
                    <div className="category-card__img">
                      {cat.image_url
                        ? <img src={imgUrl(cat.image_url)} alt={cat.name} />
                        : <div className="category-card__placeholder" />}
                    </div>
                    <span>{cat.name}</span>
                    <small>{cat.product_count} productos</small>
                  </Link>
                </Anim>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Banner promocional */}
      {banner && (
        <Anim>
          <div className="promo-banner-wrap">
          <section className="promo-banner">
            {(banner.banner_image_url || banner.image_url)
              ? (
                <div className="promo-banner__full">
                  <img src={imgUrl(banner.banner_image_url || banner.image_url)} alt={banner.title || ''} />
                  {(banner.title || banner.subtitle || banner.product_slug) && (
                    <div className="promo-banner__overlay">
                      {banner.title && <h2 className="promo-banner__title">{banner.title}</h2>}
                      {banner.subtitle && <p className="promo-banner__subtitle">{banner.subtitle}</p>}
                      {banner.product_slug && (
                        <Link to={`/producto/${banner.product_slug}`} className="btn btn--primary">
                          {banner.cta_text || 'Ver producto'}
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )
              : (
                <div className="container promo-banner__inner">
                  {banner.product_image && (
                    <div className="promo-banner__img">
                      <img src={imgUrl(banner.product_image)} alt={banner.product_name} />
                    </div>
                  )}
                  <div className="promo-banner__text">
                    {banner.title && <h2 className="promo-banner__title">{banner.title}</h2>}
                    {banner.subtitle && <p className="promo-banner__subtitle">{banner.subtitle}</p>}
                    {banner.product_slug && (
                      <Link to={`/producto/${banner.product_slug}`} className="btn btn--primary">
                        {banner.cta_text || 'Ver producto'}
                      </Link>
                    )}
                  </div>
                </div>
              )
            }
          </section>
          </div>
        </Anim>
      )}

      {/* Destacados — solo si hay al menos 2 */}
      {!loading && featured.length >= 2 && (
        <section className="section section--bg">
          <div className="container">
            <Anim><h2 className="section__title">Destacados</h2></Anim>
            <div className="featured-grid">
              {featured.slice(0, 4).map((p, i) => (
                <Anim key={p.id} delay={i * 70}>
                  <ProductCard product={p} />
                </Anim>
              ))}
            </div>
            <Anim>
              <div className="section__cta">
                <Link to="/catalogo" className="btn btn--outline">Ver todos los productos</Link>
              </div>
            </Anim>
          </div>
        </section>
      )}

      {/* Propuesta de valor */}
      <section className="section">
        <div className="container">
          <div className="features">
            {[
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ),
                title: 'Merino superwash',
                text: 'Trabajamos con lana Merino de 19 micras, seleccionada e hilada en Uruguay.',
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8.5" cy="14" r="3.5"/>
                    <circle cx="15.5" cy="14" r="3.5"/>
                    <circle cx="12" cy="7.5" r="3.5"/>
                  </svg>
                ),
                title: 'Teñido a mano',
                text: 'Cada madeja en pequeños lotes, con colores de profundidad y personalidad propias.',
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" rx="1"/>
                    <path d="M16 8h4l3 3v5h-7V8z"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                ),
                title: 'Envíos a todo el país',
                text: 'Hacemos llegar tus materiales a cualquier punto de Uruguay. Para envíos al exterior, contáctanos antes de comprar.',
              },
            ].map((f, i) => (
              <Anim key={f.title} delay={i * 100}>
                <div className="feature">
                  <div className="feature__icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              </Anim>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
