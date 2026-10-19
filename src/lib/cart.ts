// The cart lives in a cookie as { productId: quantity }. Names and prices are
// always read from the database, never from the client.
import "server-only";
import { cookies } from "next/headers";

const COOKIE = "lc_cart";
export const MAX_QUANTITY = 99;

export type Cart = Record<string, number>;

export async function readCart(): Promise<Cart> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const cart: Cart = {};
    for (const [id, qty] of Object.entries(parsed)) {
      if (/^\d+$/.test(id) && Number.isInteger(qty) && qty > 0) cart[id] = Math.min(qty, MAX_QUANTITY);
    }
    return cart;
  } catch {
    return {};
  }
}

export async function writeCart(cart: Cart) {
  const store = await cookies();
  if (Object.keys(cart).length === 0) {
    store.delete(COOKIE);
    return;
  }
  store.set(COOKIE, JSON.stringify(cart), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function cartCount(cart: Cart) {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}
