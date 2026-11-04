// Runs the real queries in src/lib/store.ts against the in-memory PGlite
// database, seeded exactly as the demo site is. One database for the whole file,
// so tests that change stock or add orders are written to be order-independent.
import { describe, expect, it } from "vitest";
import { query } from "@/lib/db";
import { StoreError, cartLines, getProduct, listCategories, listOrders, listProducts, placeOrder, salesByDay, shipOrder } from "@/lib/store";

const stock = async (productId: number) =>
  (await query<{ quantity: number }>("SELECT quantity FROM product_inventory WHERE product_id = $1", [productId]))[0].quantity;

describe("seed data", () => {
  it("has 25 products in six categories", async () => {
    expect(await listProducts({})).toHaveLength(25);
    expect(await listCategories()).toEqual(["Clothing", "Footwear", "Hard Goods", "Kids", "Soft Goods", "Supplements"]);
  });

  it("filters by search text (case-insensitive) and category", async () => {
    expect((await listProducts({ search: "SHORTS" })).map((p) => p.name)).toEqual(["Gym Shorts", "Kids Shorts", "Swimming Shorts"]);
    expect((await listProducts({ category: "Supplements" })).map((p) => p.name)).toEqual(["BCAA", "Multivitamins", "Pre-workout", "Protein Bar"]);
    expect(await listProducts({ search: "zzz" })).toEqual([]);
  });

  it("treats a search with SQL characters as plain text", async () => {
    expect(await listProducts({ search: "'; DROP TABLE product; --" })).toEqual([]);
    expect(await listProducts({})).toHaveLength(25);
  });

  it("returns a product with its price, category and warehouse stock", async () => {
    expect(await getProduct(21)).toMatchObject({ name: "Running Shoes", price: 135, category: "Footwear", stock: 56 });
    expect(await getProduct(999)).toBeNull();
  });

  it("stores each seed order's total as the sum of its lines", async () => {
    const orders = await listOrders();
    expect(orders.length).toBeGreaterThanOrEqual(5);
    for (const o of orders.filter((o) => o.id <= 5)) {
      const sum = o.items.reduce((s, i) => s + i.quantity * i.price, 0);
      expect(o.total).toBeCloseTo(sum, 2);
    }
  });
});

describe("cart pricing", () => {
  it("prices lines from the database, ignoring anything but ids and quantities", async () => {
    const lines = await cartLines({ "2": 3, "9": 10 });
    expect(lines.map((l) => [l.name, l.quantity, l.subtotal])).toEqual([
      ["Basketball", 3, 105],
      ["Hockey Puck", 10, 60],
    ]);
  });

  it("drops ids that are not products", async () => {
    expect(await cartLines({ "9999": 1 })).toEqual([]);
    expect(await cartLines({})).toEqual([]);
  });
});

describe("placing and shipping orders", () => {
  it("places an order at database prices, unshipped, and lists it for its owner", async () => {
    const id = await placeOrder(2, { "2": 2, "15": 4 }); // 2 basketballs (35), 4 protein bars (2)
    const [order] = await listOrders({ orderId: id });
    expect(order).toMatchObject({ customerId: 2, total: 78, shippedAt: null });
    expect(order.items.map((i) => [i.productName, i.quantity, i.price])).toEqual([
      ["Basketball", 2, 35],
      ["Protein Bar", 4, 2],
    ]);
    expect((await listOrders({ customerId: 2 })).some((o) => o.id === id)).toBe(true);
    expect((await listOrders({ customerId: 3 })).some((o) => o.id === id)).toBe(false);
    expect((await salesByDay()).reduce((n, d) => n + d.orders, 0)).toBeGreaterThanOrEqual(6);
  });

  it("refuses an empty cart", async () => {
    await expect(placeOrder(1, {})).rejects.toThrow(StoreError);
    await expect(placeOrder(1, { "9999": 1 })).rejects.toThrow("Your cart is empty.");
  });

  it("ships an order: takes stock out and records the shipment once", async () => {
    const before = await stock(6);
    const id = await placeOrder(1, { "6": 3 });
    await shipOrder(id);
    expect(await stock(6)).toBe(before - 3);
    expect((await listOrders({ orderId: id }))[0].shippedAt).not.toBeNull();
    await expect(shipOrder(id)).rejects.toThrow(`Order #${id} has already shipped.`);
    expect(await stock(6)).toBe(before - 3);
  });

  it("changes nothing when any item is short of stock", async () => {
    const [bagBefore, ballBefore] = [await stock(10), await stock(2)];
    const id = await placeOrder(1, { "2": 1, "10": bagBefore + 1 });
    await expect(shipOrder(id)).rejects.toThrow(/Boxing Bag \(need \d+, have \d+\)/);
    expect([await stock(10), await stock(2)]).toEqual([bagBefore, ballBefore]);
    expect((await listOrders({ orderId: id }))[0].shippedAt).toBeNull();
  });

  it("rejects an order that does not exist", async () => {
    await expect(shipOrder(424242)).rejects.toThrow("has no items");
  });
});
