const pool = require('../config/db');

async function create(req, res) {
  const { customer, items, notes } = req.body;
  if (!customer || !items || !items.length) {
    return res.status(400).json({ error: 'Cliente e items son requeridos' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let customerId;
    const existing = await client.query('SELECT id FROM customers WHERE email = $1', [customer.email]);
    if (existing.rows[0]) {
      customerId = existing.rows[0].id;
    } else {
      const { rows } = await client.query(
        `INSERT INTO customers (name, email, phone, address, city, province, postal_code)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
        [customer.name, customer.email, customer.phone || null, customer.address || null,
          customer.city || null, customer.province || null, customer.postal_code || null]
      );
      customerId = rows[0].id;
    }

    let total = 0;
    for (const item of items) {
      const { rows } = await client.query(
        `SELECT pv.*, p.price, p.name as product_name,
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_main = true LIMIT 1) as product_image
         FROM product_variants pv JOIN products p ON pv.product_id = p.id WHERE pv.id = $1`,
        [item.variant_id]
      );
      const variant = rows[0];
      if (!variant) throw new Error(`Variante ${item.variant_id} no encontrada`);
      if (variant.stock < item.quantity) throw new Error(`Stock insuficiente para variante ${variant.color_name}`);

      const unitPrice = variant.price_override || variant.price;
      total += unitPrice * item.quantity;
      item._variant = variant;
      item._unit_price = unitPrice;
    }

    const orderRes = await client.query(
      `INSERT INTO orders (customer_id, total, shipping_address, notes)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [customerId, total, customer.address || null, notes || null]
    );
    const order = orderRes.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, variant_id, product_name, variant_name, quantity, unit_price)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [order.id, item.variant_id, item._variant.product_name, item._variant.color_name || null,
          item.quantity, item._unit_price]
      );
      await client.query(
        'UPDATE product_variants SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.variant_id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ order_id: order.id, total: order.total });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(400).json({ error: err.message || 'Error al crear el pedido' });
  } finally {
    client.release();
  }
}

async function getAll(req, res) {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let i = 1;

  if (status) { conditions.push(`o.status = $${i++}`); values.push(status); }
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  try {
    const countRes = await pool.query(`SELECT COUNT(*) FROM orders o ${where}`, values);
    values.push(limit, offset);

    const { rows } = await pool.query(
      `SELECT o.*, cu.name as customer_name, cu.email as customer_email
       FROM orders o
       LEFT JOIN customers cu ON o.customer_id = cu.id
       ${where}
       ORDER BY o.created_at DESC
       LIMIT $${i++} OFFSET $${i++}`,
      values
    );
    res.json({ orders: rows, total: parseInt(countRes.rows[0].count), page: Number(page) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
}

async function getOne(req, res) {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT o.*, cu.name as customer_name, cu.email as customer_email, cu.phone as customer_phone,
        (SELECT json_agg(json_build_object('id', oi.id, 'product_name', oi.product_name,
          'variant_name', oi.variant_name, 'quantity', oi.quantity, 'unit_price', oi.unit_price,
          'product_image', (SELECT image_url FROM product_images pi
            JOIN product_variants pv ON pv.product_id = pi.product_id
            WHERE pv.id = oi.variant_id AND pi.is_main = true LIMIT 1)))
         FROM order_items oi WHERE oi.order_id = o.id) as items
       FROM orders o
       LEFT JOIN customers cu ON o.customer_id = cu.id
       WHERE o.id = $1`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener pedido' });
  }
}

async function updateStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const valid = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Estado inválido' });

  try {
    const { rows } = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
}

module.exports = { create, getAll, getOne, updateStatus };
