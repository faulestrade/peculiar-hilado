const pool = require('../config/db');

async function getStats(req, res) {
  try {
    const [ordersRes, revenueRes, productsRes, lowStockRes] = await Promise.all([
      pool.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status='pending') as pending FROM orders"),
      pool.query("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status != 'cancelled'"),
      pool.query('SELECT COUNT(*) as total FROM products WHERE active = true'),
      pool.query('SELECT COUNT(*) as total FROM product_variants WHERE stock <= 5 AND active = true'),
    ]);

    const recentOrders = await pool.query(
      `SELECT o.id, o.total, o.status, o.created_at, cu.name as customer_name
       FROM orders o LEFT JOIN customers cu ON o.customer_id = cu.id
       ORDER BY o.created_at DESC LIMIT 5`
    );

    res.json({
      orders: { total: parseInt(ordersRes.rows[0].total), pending: parseInt(ordersRes.rows[0].pending) },
      revenue: parseFloat(revenueRes.rows[0].total),
      products: parseInt(productsRes.rows[0].total),
      low_stock: parseInt(lowStockRes.rows[0].total),
      recent_orders: recentOrders.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
}

async function getRevenue(req, res) {
  const currentYear = new Date().getFullYear();
  const selectedYear = req.query.year ? parseInt(req.query.year) : null;
  const selectedMonth = req.query.month ? parseInt(req.query.month) : null;
  const categoryId = req.query.category_id ? parseInt(req.query.category_id) : null;

  try {
    const yearsRes = await pool.query(
      `SELECT DISTINCT EXTRACT(YEAR FROM created_at)::int as year FROM orders ORDER BY year DESC`
    );
    const availableYears = yearsRes.rows.map(r => r.year);
    if (!availableYears.length) availableYears.push(currentYear);

    // Summary
    const sc = [`o.status != 'cancelled'`];
    const sp = [];
    let si = 1;
    if (selectedYear) { sc.push(`EXTRACT(YEAR FROM o.created_at) = $${si++}`); sp.push(selectedYear); }
    if (selectedMonth) { sc.push(`EXTRACT(MONTH FROM o.created_at) = $${si++}`); sp.push(selectedMonth); }
    if (categoryId) { sc.push(`p.category_id = $${si++}`); sp.push(categoryId); }

    const summaryRes = await pool.query(`
      SELECT
        COALESCE(SUM(oi.unit_price * oi.quantity), 0) as total_revenue,
        COUNT(DISTINCT o.id) as total_orders
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN product_variants pv ON pv.id = oi.variant_id
      LEFT JOIN products p ON p.id = pv.product_id
      WHERE ${sc.join(' AND ')}
    `, sp);

    const totalRevenue = parseFloat(summaryRes.rows[0].total_revenue);
    const totalOrders = parseInt(summaryRes.rows[0].total_orders);

    // By month for selected (or current) year
    const yearForMonths = selectedYear || currentYear;
    const mc = [`o.status != 'cancelled'`, `EXTRACT(YEAR FROM o.created_at) = $1`];
    const mp = [yearForMonths];
    if (categoryId) { mc.push(`p.category_id = $2`); mp.push(categoryId); }

    const byMonthRes = await pool.query(`
      SELECT
        EXTRACT(MONTH FROM o.created_at)::int as month,
        COALESCE(SUM(oi.unit_price * oi.quantity), 0) as revenue,
        COUNT(DISTINCT o.id) as orders
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN product_variants pv ON pv.id = oi.variant_id
      LEFT JOIN products p ON p.id = pv.product_id
      WHERE ${mc.join(' AND ')}
      GROUP BY month ORDER BY month
    `, mp);

    // By category
    const cc = [`o.status != 'cancelled'`];
    const cp = [];
    let ci = 1;
    if (selectedYear) { cc.push(`EXTRACT(YEAR FROM o.created_at) = $${ci++}`); cp.push(selectedYear); }
    if (selectedMonth) { cc.push(`EXTRACT(MONTH FROM o.created_at) = $${ci++}`); cp.push(selectedMonth); }

    const byCatRes = await pool.query(`
      SELECT
        COALESCE(c.name, 'Sin categoría') as category,
        c.id as category_id,
        COALESCE(SUM(oi.unit_price * oi.quantity), 0) as revenue,
        COUNT(DISTINCT o.id) as orders
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN product_variants pv ON pv.id = oi.variant_id
      LEFT JOIN products p ON p.id = pv.product_id
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE ${cc.join(' AND ')}
      GROUP BY c.id, c.name ORDER BY revenue DESC
    `, cp);

    res.json({
      summary: {
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        avg_order: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      },
      by_month: byMonthRes.rows,
      by_category: byCatRes.rows,
      available_years: availableYears,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener ingresos' });
  }
}

module.exports = { getStats, getRevenue };
