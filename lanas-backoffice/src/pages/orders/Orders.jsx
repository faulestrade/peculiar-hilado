import { useEffect, useState } from 'react';
import { getOrders, getOrder, updateOrderStatus } from '../../api';
import '../products/Products.css';
import '../Dashboard.css';
import './Orders.css';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const STATUS_LABEL = { pending: 'Pendiente', confirmed: 'Confirmado', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado' };
const STATUS_CLASS = { pending: 'badge--pending', confirmed: 'badge--confirmed', shipped: 'badge--shipped', delivered: 'badge--delivered', cancelled: 'badge--cancelled' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const limit = 20;

  const load = () => {
    setLoading(true);
    getOrders({ status: statusFilter || undefined, page, limit })
      .then(d => { setOrders(d.orders); setTotal(d.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter, page]);

  const openOrder = async (id) => {
    const data = await getOrder(id);
    setSelected(data);
  };

  const handleStatus = async (id, status) => {
    await updateOrderStatus(id, status);
    if (selected?.id === id) setSelected(s => ({ ...s, status }));
    load();
  };

  if (selected) {
    return <OrderDetail order={selected} onBack={() => setSelected(null)} onStatus={handleStatus} />;
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h1 className="page-title">Pedidos</h1>

      <div className="toolbar">
        <select className="search-input" style={{ width: 'auto' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">Todos los estados</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <span className="count-label">{total} pedidos</span>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="table-loading">Cargando...</td></tr>
            ) : orders.map(o => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>
                  <strong>{o.customer_name || 'N/A'}</strong><br />
                  <small style={{ color: '#9a7a5a' }}>{o.customer_email}</small>
                </td>
                <td>${Number(o.total).toLocaleString('es-AR')}</td>
                <td><span className={`badge ${STATUS_CLASS[o.status]}`}>{STATUS_LABEL[o.status]}</span></td>
                <td>{new Date(o.created_at).toLocaleDateString('es-AR')}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn-edit" onClick={() => openOrder(o.id)}>Ver detalle</button>
                    {o.status === 'pending' && (
                      <button className="btn-primary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}
                        onClick={() => handleStatus(o.id, 'confirmed')}>
                        Confirmar
                      </button>
                    )}
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

function OrderDetail({ order, onBack, onStatus }) {
  return (
    <div className="order-detail">
      <div className="product-form-header">
        <h1 className="page-title">Pedido #{order.id}</h1>
        <button className="btn-back" onClick={onBack}>← Volver</button>
      </div>

      <div className="order-grid">
        <div className="order-card">
          <h2>Cliente</h2>
          <p><strong>{order.customer_name}</strong></p>
          <p>{order.customer_email}</p>
          <p>{order.customer_phone}</p>
          <p>{order.shipping_address}</p>
        </div>

        <div className="order-card">
          <h2>Estado</h2>
          <span className={`badge ${STATUS_CLASS[order.status]}`}>{STATUS_LABEL[order.status]}</span>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {STATUSES.filter(s => s !== order.status).map(s => (
              <button key={s} className="btn-edit" onClick={() => onStatus(order.id, s)}>
                → {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="order-card" style={{ gridColumn: '1 / -1' }}>
          <h2>Productos</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Variante</th>
                <th>Cantidad</th>
                <th>Precio unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map(item => (
                <tr key={item.id}>
                  <td>{item.product_name}</td>
                  <td>{item.variant_name}</td>
                  <td>{item.quantity}</td>
                  <td>${Number(item.unit_price).toLocaleString('es-AR')}</td>
                  <td>${(item.unit_price * item.quantity).toLocaleString('es-AR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: 'right', marginTop: '1rem', fontWeight: 700, color: '#b06040', fontSize: '1.1rem' }}>
            Total: ${Number(order.total).toLocaleString('es-AR')}
          </div>
        </div>
      </div>
    </div>
  );
}
