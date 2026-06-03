import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../api/orders';
import './Cart.css';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

export default function Cart() {
  const { items, total, removeItem, updateQty, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState('cart'); // 'cart' | 'checkout' | 'success'
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', province: '', postal_code: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createOrder({
        customer: form,
        items: items.map(i => ({ variant_id: i.variantId, quantity: i.quantity })),
      });
      clearCart();
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <main className="cart-success">
        <div className="success-box">
          <div className="success-icon">✓</div>
          <h1>¡Pedido realizado!</h1>
          <p>Gracias por tu compra. Te contactaremos pronto para coordinar el envío.</p>
          <Link to="/" className="btn btn--primary">Volver al inicio</Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="cart-empty">
        <h1>Tu carrito está vacío</h1>
        <p>Agregá productos desde el catálogo.</p>
        <Link to="/catalogo" className="btn btn--primary">Ver catálogo</Link>
      </main>
    );
  }

  return (
    <main className="cart">
      <div className="cart__container">
        <div className="cart__items">
          <h1>{step === 'cart' ? 'Tu carrito' : 'Datos de envío'}</h1>

          {step === 'cart' ? (
            <>
              {items.map(item => (
                <div key={item.variantId} className="cart-item">
                  <div className="cart-item__img">
                    {item.image
                      ? <img src={`${BASE_URL}${item.image}`} alt={item.productName} />
                      : <div className="cart-item__placeholder" />}
                  </div>
                  <div className="cart-item__info">
                    <h3>{item.productName}</h3>
                    <p>{item.variantName}</p>
                  </div>
                  <div className="cart-item__qty">
                    <button onClick={() => updateQty(item.variantId, Math.max(1, item.quantity - 1))}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQty(item.variantId, item.quantity + 1)}>+</button>
                  </div>
                  <div className="cart-item__price">
                    ${(item.price * item.quantity).toLocaleString('es-AR')}
                  </div>
                  <button className="cart-item__remove" onClick={() => removeItem(item.variantId)}>✕</button>
                </div>
              ))}
            </>
          ) : (
            <form id="checkout-form" onSubmit={handleSubmit} className="checkout-form">
              <div className="form-row">
                <label>Nombre completo *<input name="name" value={form.name} onChange={handleChange} required /></label>
                <label>Email *<input name="email" type="email" value={form.email} onChange={handleChange} required /></label>
              </div>
              <div className="form-row">
                <label>Teléfono<input name="phone" value={form.phone} onChange={handleChange} /></label>
                <label>Código postal<input name="postal_code" value={form.postal_code} onChange={handleChange} /></label>
              </div>
              <label>Dirección<input name="address" value={form.address} onChange={handleChange} /></label>
              <div className="form-row">
                <label>Ciudad<input name="city" value={form.city} onChange={handleChange} /></label>
                <label>Provincia<input name="province" value={form.province} onChange={handleChange} /></label>
              </div>
              {error && <p className="form-error">{error}</p>}
            </form>
          )}
        </div>

        <aside className="cart__summary">
          <h2>Resumen</h2>
          {items.map(i => (
            <div key={i.variantId} className="summary-item">
              <span>{i.productName} × {i.quantity}</span>
              <span>${(i.price * i.quantity).toLocaleString('es-AR')}</span>
            </div>
          ))}
          <div className="summary-total">
            <strong>Total</strong>
            <strong>${total.toLocaleString('es-AR')}</strong>
          </div>

          {step === 'cart' ? (
            <button className="btn btn--primary" style={{ width: '100%' }} onClick={() => setStep('checkout')}>
              Continuar con el pedido
            </button>
          ) : (
            <button
              className="btn btn--primary"
              style={{ width: '100%' }}
              type="submit"
              form="checkout-form"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Confirmar pedido'}
            </button>
          )}

          {step === 'checkout' && (
            <button className="btn btn--outline" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => setStep('cart')}>
              Volver al carrito
            </button>
          )}
        </aside>
      </div>
    </main>
  );
}
