import { Link } from 'react-router-dom';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const price = product.price;
  const image = product.main_image
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000'}${product.main_image}`
    : null;

  const totalStock = product.variants
    ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
    : null;
  const isOutOfStock = totalStock !== null && totalStock === 0;

  return (
    <Link to={`/producto/${product.slug}`} className="product-card">
      <div className="product-card__img">
        {image
          ? <img src={image} alt={product.name} />
          : <div className="product-card__placeholder" />}
        {isOutOfStock && (
          <span className={`product-card__badge ${product.coming_soon ? 'product-card__badge--soon' : 'product-card__badge--out'}`}>
            {product.coming_soon ? 'Próximamente' : 'Agotado'}
          </span>
        )}
      </div>
      <div className="product-card__info">
        {product.category_name && (
          <span className="product-card__category">{product.category_name}</span>
        )}
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__price">${Number(price).toLocaleString('es-AR')}</p>
      </div>
    </Link>
  );
}
