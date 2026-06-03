import { useEffect, useState } from 'react';
import { getDashboardStats } from '../api';
import './Dashboard.css';

const STATUS_LABEL = { pending: 'Pendiente', confirmed: 'Confirmado', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado' };
const STATUS_CLASS = { pending: 'badge--pending', confirmed: 'badge--confirmed', shipped: 'badge--shipped', delivered: 'badge--delivered', cancelled: 'badge--cancelled' };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Cargando...</div>;

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__value">{stats.orders.total}</div>
          <div className="stat-card__label">Pedidos totales</div>
        </div>
        <div className="stat-card stat-card--warn">
          <div className="stat-card__value">{stats.orders.pending}</div>
          <div className="stat-card__label">Pendientes</div>
        </div>
        <div className="stat-card stat-card--green">
          <div className="stat-card__value">${Number(stats.revenue).toLocaleString('es-AR')}</div>
          <div className="stat-card__label">Ingresos totales</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{stats.products}</div>
          <div className="stat-card__label">Productos activos</div>
        </div>
        {stats.low_stock > 0 && (
          <div className="stat-card stat-card--red">
            <div className="stat-card__value">{stats.low_stock}</div>
            <div className="stat-card__label">Stock bajo (≤5)</div>
          </div>
        )}
      </div>

      <div className="dashboard__section">
        <h2>Últimos pedidos</h2>
        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_orders.map(o => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.customer_name || 'N/A'}</td>
                  <td>${Number(o.total).toLocaleString('es-AR')}</td>
                  <td><span className={`badge ${STATUS_CLASS[o.status]}`}>{STATUS_LABEL[o.status]}</span></td>
                  <td>{new Date(o.created_at).toLocaleDateString('es-AR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
