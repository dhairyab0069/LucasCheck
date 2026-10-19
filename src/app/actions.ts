"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MAX_QUANTITY, readCart, writeCart } from "@/lib/cart";
import { createSession, destroySession, getSession } from "@/lib/session";
import { StoreError, findCustomerLogin, getProduct, placeOrder, shipOrder } from "@/lib/store";

export type FormState = { error?: string; message?: string; username?: string } | undefined;

function intField(form: FormData, name: string) {
  const value = Number(form.get(name));
  return Number.isInteger(value) && value > 0 ? value : null;
}

/** Only allow redirects back into this site. */
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function addToCart(form: FormData) {
  const id = intField(form, "productId");
  if (!id || !(await getProduct(id))) return;
  const cart = await readCart();
  cart[String(id)] = Math.min((cart[String(id)] ?? 0) + 1, MAX_QUANTITY);
  await writeCart(cart);
  revalidatePath("/", "layout");
}

export async function updateQuantity(form: FormData) {
  const id = intField(form, "productId");
  if (!id) return;
  const quantity = Number(form.get("quantity"));
  const cart = await readCart();
  if (!Number.isInteger(quantity) || quantity <= 0) delete cart[String(id)];
  else cart[String(id)] = Math.min(quantity, MAX_QUANTITY);
  await writeCart(cart);
  revalidatePath("/", "layout");
}

export async function removeFromCart(form: FormData) {
  const id = intField(form, "productId");
  if (!id) return;
  const cart = await readCart();
  delete cart[String(id)];
  await writeCart(cart);
  revalidatePath("/", "layout");
}

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const userId = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!userId || !password) return { error: "Enter your username and password.", username: userId };

  const customer = await findCustomerLogin(userId);
  if (!customer || !(await bcrypt.compare(password, customer.passwordHash))) {
    return { error: "That username and password don't match an account.", username: userId };
  }
  await createSession({ customerId: customer.id, userId: customer.userId, name: customer.name, isAdmin: customer.isAdmin });
  redirect(safeNext(form.get("next")));
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function checkout(): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/login?next=/cart");
  const cart = await readCart();
  if (Object.keys(cart).length === 0) redirect("/cart");

  let orderId: number;
  try {
    orderId = await placeOrder(session.customerId, cart);
  } catch (err) {
    if (err instanceof StoreError) redirect(`/cart?error=${encodeURIComponent(err.message)}`);
    throw err;
  }
  await writeCart({});
  revalidatePath("/", "layout");
  redirect(`/orders/${orderId}?placed=1`);
}

export async function ship(_prev: FormState, form: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session?.isAdmin) return { error: "Only administrators can ship orders." };
  const orderId = intField(form, "orderId");
  if (!orderId) return { error: "Invalid order." };
  try {
    await shipOrder(orderId);
  } catch (err) {
    if (err instanceof StoreError) return { error: err.message };
    throw err;
  }
  revalidatePath("/admin");
  return { message: `Order #${orderId} shipped.` };
}
