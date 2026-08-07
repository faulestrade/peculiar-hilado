import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct } from '../api/products';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setLoading(true);
    getProduct(slug)
      .then(p => {
        setProduct(p);
        if (p.variants?.length) setSelectedVariant(p.variants[0]);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="loading" style={{ padding: '6rem' }}>Cargando...</div>;
  if (!product) return <div className="loading" style={{ padding: '6rem' }}>Producto no encontrado</div>;

  const price = selectedVariant?.price_override ?? product.price;
  const stock = selectedVariant?.stock ?? 0;
  const images = product.images || [];

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      variantName: selectedVariant.color_name,
      price: Number(price),
      quantity,
      image: images.find(i => i.is_main)?.image_url || images[0]?.image_url || null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main className="detail">
      <div className="detail__container">
        {/* Imágenes */}
        <div className="detail__gallery">
          <div className="detail__main-img">
            {images[activeImg]
              ? <img src={`${BASE_URL}${images[activeImg].image_url}`} alt={product.name} />
              : <div className="detail__placeholder" />}
          </div>
          {images.length > 1 && (
            <div className="detail__thumbnails">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  className={`detail__thumb ${activeImg === i ? 'active' : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={`${BASE_URL}${img.image_url}`} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="detail__info">
          {product.category_name && (
            <Link to={`/catalogo?categoria=${product.category_slug}`} className="detail__breadcrumb">
              {product.category_name}
            </Link>
          )}
          <h1 className="detail__name">{product.name}</h1>
          <p className="detail__price">${Number(price).toLocaleString('es-AR')}</p>

          {product.description && (
            <p className="detail__desc">{product.description}</p>
          )}

          {/* Specs */}
          <div className="detail__specs">
            {product.fiber_composition && (
              <div className="detail__spec">
                <span>Composición</span>
                <strong>{product.fiber_composition}</strong>
              </div>
            )}
            {product.weight_grams && (
              <div className="detail__spec">
                <span>Peso</span>
                <strong>{product.weight_grams}g</strong>
              </div>
            )}
            {product.needle_size && (
              <div className="detail__spec">
                <span>Agujas</span>
                <strong>{product.needle_size}</strong>
              </div>
            )}
          </div>

          {/* Variantes / colores — solo si tienen color hex cargado */}
          {product.variants?.some(v => v.color_hex) && (
            <div className="detail__variants">
              {selectedVariant?.color_name && (
                <p>Color: <strong>{selectedVariant.color_name}</strong></p>
              )}
              <div className="detail__colors">
                {product.variants.map(v => (
                  <button
                    key={v.id}
                    title={v.color_name}
                    className={`detail__color ${selectedVariant?.id === v.id ? 'active' : ''} ${v.stock === 0 ? 'out' : ''}`}
                    style={{ background: v.color_hex || '#ccc' }}
                    onClick={() => { setSelectedVariant(v); setQuantity(1); }}
                    disabled={v.stock === 0}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          <p className={`detail__stock ${stock === 0 ? 'out' : ''}`}>
            {stock === 0 ? 'Sin stock' : `${stock} disponibles`}
          </p>

          {/* Cantidad */}
          {stock > 0 && (
            <div className="detail__qty">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(stock, q + 1))}>+</button>
            </div>
          )}

          <button
            className={`btn btn--primary detail__add ${added ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={stock === 0 || !selectedVariant}
          >
            {added ? '¡Agregado!' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </main>
  );
}
