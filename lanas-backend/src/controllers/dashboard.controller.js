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

module.exports = { getStats };
