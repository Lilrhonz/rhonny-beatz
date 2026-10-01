const db = require('../db/connection');
const stripe = require('../services/stripeClient');

async function checkout(req, res) {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const beatIds = items.map((i) => i.beatId);
  if (beatIds.some((id) => !Number.isInteger(id))) {
    return res.status(400).json({ error: 'Invalid cart item' });
  }
  if (new Set(beatIds).size !== beatIds.length) {
    return res.status(400).json({ error: 'Each beat can only appear once per order' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const orderItems = [];
    let totalCents = 0;
    let currency = null;

    for (const item of items) {
      const [beatRows] = await connection.query(
        'SELECT id, title, status FROM beats WHERE id = ? FOR UPDATE',
        [item.beatId]
      );
      const beat = beatRows[0];

      if (!beat) {
        throw new UserError(`Beat ${item.beatId} no longer exists`);
      }
      if (beat.status === 'sold_exclusive') {
        throw new UserError(`"${beat.title}" has already sold exclusively and is no longer available`);
      }

      const [priceRows] = await connection.query(
        `SELECT lt.id AS tier_id, lt.name, lt.is_exclusive, bp.price_cents, bp.currency
         FROM beat_prices bp
         JOIN license_tiers lt ON lt.id = bp.tier_id
         WHERE bp.beat_id = ? AND bp.tier_id = ?`,
        [item.beatId, item.tierId]
      );
      const price = priceRows[0];

      if (!price) {
        throw new UserError(`"${beat.title}" is not available at that licence tier`);
      }

      if (currency === null) {
        currency = price.currency;
      } else if (currency !== price.currency) {
        throw new UserError('All items in one order must use the same currency');
      }

      totalCents += price.price_cents;
      orderItems.push({
        beatId: beat.id,
        tierId: price.tier_id,
        isExclusive: price.is_exclusive === 1,
        priceCents: price.price_cents
      });
    }

    if (currency !== 'USD') {
      throw new UserError('This store only sells in USD');
    }

    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, provider, amount_cents, currency, status)
       VALUES (?, 'stripe', ?, ?, 'pending')`,
      [req.user.id, totalCents, currency]
    );
    const orderId = orderResult.insertId;

    for (const item of orderItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, beat_id, tier_id, price_cents) VALUES (?, ?, ?, ?)`,
        [orderId, item.beatId, item.tierId, item.priceCents]
      );
    }

    await connection.commit();

    res.status(201).json({ orderId, amount_cents: totalCents, currency });
  } catch (err) {
    await connection.rollback();
    if (err instanceof UserError) {
      return res.status(409).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Checkout failed' });
  } finally {
    connection.release();
  }
}

async function createStripeSession(req, res) {
  const orderId = req.params.orderId;

  try {
    const [orderRows] = await db.query(
      'SELECT id, user_id, amount_cents, currency, status FROM orders WHERE id = ?',
      [orderId]
    );
    const order = orderRows[0];

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (order.status !== 'pending') {
      return res.status(409).json({ error: `Order is already ${order.status}` });
    }

    const [items] = await db.query(
      `SELECT oi.price_cents, b.title, lt.name AS tier_name
       FROM order_items oi
       JOIN beats b ON b.id = oi.beat_id
       JOIN license_tiers lt ON lt.id = oi.tier_id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: items.map((item) => ({
        price_data: {
          currency: order.currency.toLowerCase(),
          product_data: { name: `${item.title} — ${item.tier_name}` },
          unit_amount: item.price_cents
        },
        quantity: 1
      })),
      metadata: { order_id: String(order.id) },
      success_url: `${process.env.CLIENT_URL}/order-success?order_id=${order.id}`,
      cancel_url: `${process.env.CLIENT_URL}/order-cancelled?order_id=${order.id}`
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not start payment' });
  }
}

class UserError extends Error {}

module.exports = { checkout, createStripeSession };