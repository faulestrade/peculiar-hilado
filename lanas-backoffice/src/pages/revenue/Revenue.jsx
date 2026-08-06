import { useEffect, useState } from 'react';
import { getRevenue, getCategories } from '../../api';
import '../products/Products.css';
import './Revenue.css';

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function fmt(n) {
  return '$' + Number(n).toLocaleString('es-UY', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function Revenue() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (year) params.year = year;
    if (month) params.month = month;
    if (categoryId) params.category_id = categoryId;
    getRevenue(params)
      .then(setData)
      .finally(() => setLoading(false));
  }, [year, month, categoryId]);

  const allMonths = Array.from({ length: 12 }, (_, i) => {
    const found = data?.by_month?.find(r => r.month === i + 1);
    return { month: i + 1, revenue: found ? parseFloat(found.revenue) : 0, orders: found ? parseInt(found.orders) : 0 };
  });

  const maxRevenue = Math.max(...allMonths.map(m => m.revenue), 1);

  return (
    <div>
      <h1 className="page-title">Ingresos</h1>

      {/* Filters */}
      <div className="rev-filters">
        <label>
          Año
          <select value={year} onChange={e => setYear(e.target.value)}>
            <option value="">Todos</option>
            {(data?.available_years || [currentYear]).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>
        <label>
          Mes
          <select value={month} onChange={e => setMonth(e.target.value)}>
            <option value="">Todos</option>
            {MONTH_NAMES.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
        </label>
        <label>
          Categoría
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <option value="">Todas</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <div className="table-loading" style={{ padding: '3rem', textAlign: 'center' }}>Cargando...</div>
      ) : data && (
        <>
          {/* Summary cards */}
          <div className="rev-cards">
            <div className="rev-card">
              <span className="rev-card__label">Ingresos totales</span>
              <span className="rev-card__value">{fmt(data.summary.total_revenue)}</span>
            </div>
            <div className="rev-card">
              <span className="rev-card__label">Pedidos</span>
              <span className="rev-card__value">{data.summary.total_orders}</span>
            </div>
            <div className="rev-card">
              <span className="rev-card__label">Ticket promedio</span>
              <span className="rev-card__value">{fmt(data.summary.avg_order)}</span>
            </div>
          </div>

          {/* Monthly bar chart */}
          <div className="rev-section">
            <h2 className="rev-section__title">Por mes — {year || 'Todos los años'}</h2>
            <div className="bar-chart">
              {allMonths.map(m => (
                <div className="bar-chart__col" key={m.month}>
                  <div className="bar-chart__bar-wrap">
                    {m.revenue > 0 && (
                      <span className="bar-chart__tip">{fmt(m.revenue)}</span>
                    )}
                    <div
                      className="bar-chart__bar"
                      style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <span className="bar-chart__label">{MONTH_NAMES[m.month - 1]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* By category table */}
          <div className="rev-section">
            <h2 className="rev-section__title">Por categoría</h2>
            {data.by_category.length === 0 ? (
              <p style={{ color: '#9a7a5a', padding: '1rem 0' }}>Sin datos para el período seleccionado.</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Categoría</th>
                      <th>Ingresos</th>
                      <th>Pedidos</th>
                      <th>Participación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.by_category.map(c => (
                      <tr key={c.category}>
                        <td><strong>{c.category}</strong></td>
                        <td>{fmt(c.revenue)}</td>
                        <td>{c.orders}</td>
                        <td>
                          <div className="rev-bar-inline">
                            <div
                              className="rev-bar-inline__fill"
                              style={{
                                width: data.summary.total_revenue > 0
                                  ? `${(parseFloat(c.revenue) / data.summary.total_revenue) * 100}%`
                                  : '0%'
                              }}
                            />
                            <span>
                              {data.summary.total_revenue > 0
                                ? `${((parseFloat(c.revenue) / data.summary.total_revenue) * 100).toFixed(1)}%`
                                : '0%'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
