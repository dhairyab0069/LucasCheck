// Every query the pages and actions use. All parameterised; NUMERIC columns
// come back from Postgres as strings and are converted here.
import "server-only";
import { getDb, query } from "./db";
import type { Cart } from "./cart";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  stock: number;
}

const PRODUCT_COLUMNS = `
  p.product_id AS id, p.product_name AS name, p.product_desc AS description,
  p.price::float8 AS price, c.category_name AS category, p.image_url AS "imageUrl",
  COALESCE(i.quantity, 0) AS stock
  FROM product p
  JOIN category c ON c.category_id = p.category_id
  LEFT JOIN product_inventory i ON i.product_id = p.product_id AND i.warehouse_id = 1`;

export async function listCategories() {
  const rows = await query<{ name: string }>("SELECT category_name AS name FROM category ORDER BY category_name");
  return rows.map((r) => r.name);
}

export async function listProducts({ search, category }: { search?: string; category?: string }) {
  const where: string[] = [];
  const params: unknown[] = [];
  if (search) {
    params.push(`%${search}%`);
    where.push(`p.product_name ILIKE $${params.length}`);
  }
  if (category) {
    params.push(category);
    where.push(`c.category_name = $${params.length}`);
  }
  return query<Product>(
    `SELECT ${PRODUCT_COLUMNS} ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY p.product_name`,
    params,
  );
}

export async function getProduct(id: number) {
  const rows = await query<Product>(`SELECT ${PRODUCT_COLUMNS} WHERE p.product_id = $1`, [id]);
  return rows[0] ?? null;
}

export interface CartLine extends Product {
  quantity: number;
  subtotal: number;
}

export async function cartLines(cart: Cart): Promise<CartLine[]> {
  const ids = Object.keys(cart).map(Number);
  if (ids.length === 0) return [];
  const products = await query<Product>(`SELECT ${PRODUCT_COLUMNS} WHERE p.product_id = ANY($1::int[]) ORDER BY p.product_name`, [ids]);
  return products.map((p) => {
    const quantity = cart[String(p.id)];
    return { ...p, quantity, subtotal: Math.round(p.price * quantity * 100) / 100 };
  });
}

export async function findCustomerLogin(userId: string) {
  const rows = await query<{ id: number; userId: string; name: string; passwordHash: string; isAdmin: boolean }>(
    `SELECT customer_id AS id, user_id AS "userId", first_name || ' ' || last_name AS name,
            password_hash AS "passwordHash", is_admin AS "isAdmin"
     FROM customer WHERE lower(user_id) = lower($1)`,
    [userId],
  );
  return rows[0] ?? null;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  userId: string;
}

export async function getCustomer(id: number) {
  const rows = await query<Customer>(
    `SELECT customer_id AS id, first_name AS "firstName", last_name AS "lastName", email, phone, address,
            city, state, postal_code AS "postalCode", country, user_id AS "userId"
     FROM customer WHERE customer_id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export interface OrderSummary {
  id: number;
  date: string;
  total: number;
  customerId: number;
  customerName: string;
  shippedAt: string | null;
  items: { productId: number; productName: string; quantity: number; price: number }[];
}

export async function listOrders({ customerId, orderId }: { customerId?: number; orderId?: number } = {}) {
  const where: string[] = [];
  const params: unknown[] = [];
  if (customerId !== undefined) {
    params.push(customerId);
    where.push(`o.customer_id = $${params.length}`);
  }
  if (orderId !== undefined) {
    params.push(orderId);
    where.push(`o.order_id = $${params.length}`);
  }
  return query<OrderSummary>(
    `SELECT o.order_id AS id, o.order_date AS date, o.total_amount::float8 AS total,
            o.customer_id AS "customerId", c.first_name || ' ' || c.last_name AS "customerName",
            s.shipment_date AS "shippedAt",
            COALESCE((SELECT json_agg(json_build_object(
                'productId', op.product_id, 'productName', p.product_name,
                'quantity', op.quantity, 'price', op.price::float8) ORDER BY p.product_name)
              FROM order_product op JOIN product p ON p.product_id = op.product_id
              WHERE op.order_id = o.order_id), '[]') AS items
     FROM order_summary o
     JOIN customer c ON c.customer_id = o.customer_id
     LEFT JOIN shipment s ON s.order_id = o.order_id
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY o.order_date DESC, o.order_id DESC`,
    params,
  );
}

export async function salesByDay() {
  return query<{ day: string; orders: number; total: number }>(
    `SELECT to_char(order_date AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day, count(*)::int AS orders,
            sum(total_amount)::float8 AS total
     FROM order_summary GROUP BY 1 ORDER BY 1 DESC`,
  );
}

export class StoreError extends Error {}

/** Places an order for the cart at current database prices. Returns the order id. */
export async function placeOrder(customerId: number, cart: Cart) {
  const db = await getDb();
  return db.transaction(async (tx) => {
    const ids = Object.keys(cart).map(Number);
    const { rows: products } = await tx.query<{ id: number; price: number }>(
      "SELECT product_id AS id, price::float8 AS price FROM product WHERE product_id = ANY($1::int[])",
      [ids],
    );
    if (products.length === 0) throw new StoreError("Your cart is empty.");
    const total = products.reduce((sum, p) => sum + p.price * cart[String(p.id)], 0);
    const { rows } = await tx.query<{ id: number }>(
      "INSERT INTO order_summary (customer_id, total_amount) VALUES ($1, $2) RETURNING order_id AS id",
      [customerId, total.toFixed(2)],
    );
    const orderId = rows[0].id;
    for (const p of products) {
      await tx.query("INSERT INTO order_product (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)", [
        orderId,
        p.id,
        cart[String(p.id)],
        p.price,
      ]);
    }
    return orderId;
  });
}

/**
 * Ships an order from warehouse 1: checks every item has enough stock, takes
 * it out and records the shipment, all in one transaction (the old ship.jsp).
 */
export async function shipOrder(orderId: number) {
  const db = await getDb();
  return db.transaction(async (tx) => {
    const { rows: shipped } = await tx.query("SELECT 1 FROM shipment WHERE order_id = $1", [orderId]);
    if (shipped.length) throw new StoreError(`Order #${orderId} has already shipped.`);
    const { rows: items } = await tx.query<{ productId: number; name: string; quantity: number; stock: number | null }>(
      `SELECT op.product_id AS "productId", p.product_name AS name, op.quantity, i.quantity AS stock
       FROM order_product op
       JOIN product p ON p.product_id = op.product_id
       LEFT JOIN product_inventory i ON i.product_id = op.product_id AND i.warehouse_id = 1
       WHERE op.order_id = $1`,
      [orderId],
    );
    if (items.length === 0) throw new StoreError(`Order #${orderId} has no items.`);
    const short = items.filter((item) => (item.stock ?? 0) < item.quantity);
    if (short.length) {
      throw new StoreError(
        `Not enough stock to ship order #${orderId}: ` +
          short.map((s) => `${s.name} (need ${s.quantity}, have ${s.stock ?? 0})`).join(", "),
      );
    }
    for (const item of items) {
      // Guarded so a concurrent shipment can't take stock below zero; any miss
      // throws and rolls the whole shipment back.
      const { rows: updated } = await tx.query(
        `UPDATE product_inventory SET quantity = quantity - $1
         WHERE product_id = $2 AND warehouse_id = 1 AND quantity >= $1 RETURNING quantity`,
        [item.quantity, item.productId],
      );
      if (updated.length === 0) throw new StoreError(`Stock for ${item.name} changed; try shipping order #${orderId} again.`);
    }
    // order_id is UNIQUE, so shipping the same order twice at once fails here.
    await tx.query("INSERT INTO shipment (order_id, warehouse_id) VALUES ($1, 1)", [orderId]).catch((err) => {
      if ((err as { code?: string }).code === "23505") throw new StoreError(`Order #${orderId} has already shipped.`);
      throw err;
    });
  });
}
