// Postgres schema and seed data, ported from the original SQL Server DDL
// (docs/legacy-orderdb-sqlserver.ddl). Shared by the runtime auto-setup in
// db.ts and by `npm run db:setup`.
import bcrypt from "bcryptjs";
import type { Queryable } from "./db";

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS customer (
  customer_id   SERIAL PRIMARY KEY,
  first_name    VARCHAR(40) NOT NULL,
  last_name     VARCHAR(40) NOT NULL,
  email         VARCHAR(50),
  phone         VARCHAR(20),
  address       VARCHAR(50),
  city          VARCHAR(40),
  state         VARCHAR(20),
  postal_code   VARCHAR(20),
  country       VARCHAR(40),
  user_id       VARCHAR(20) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_admin      BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS category (
  category_id   SERIAL PRIMARY KEY,
  category_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS product (
  product_id   SERIAL PRIMARY KEY,
  product_name VARCHAR(40) NOT NULL,
  product_desc VARCHAR(1000) NOT NULL DEFAULT '',
  price        NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  category_id  INT NOT NULL REFERENCES category(category_id),
  image_url    VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS order_summary (
  order_id     SERIAL PRIMARY KEY,
  order_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  customer_id  INT NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_product (
  order_id   INT NOT NULL REFERENCES order_summary(order_id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES product(product_id),
  quantity   INT NOT NULL CHECK (quantity > 0),
  price      NUMERIC(10,2) NOT NULL,
  PRIMARY KEY (order_id, product_id)
);

CREATE TABLE IF NOT EXISTS warehouse (
  warehouse_id   SERIAL PRIMARY KEY,
  warehouse_name VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS product_inventory (
  product_id   INT NOT NULL REFERENCES product(product_id),
  warehouse_id INT NOT NULL REFERENCES warehouse(warehouse_id),
  quantity     INT NOT NULL CHECK (quantity >= 0),
  PRIMARY KEY (product_id, warehouse_id)
);

CREATE TABLE IF NOT EXISTS shipment (
  shipment_id   SERIAL PRIMARY KEY,
  order_id      INT NOT NULL UNIQUE REFERENCES order_summary(order_id) ON DELETE CASCADE,
  shipment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  warehouse_id  INT NOT NULL REFERENCES warehouse(warehouse_id)
);
`;

export const DROP_SQL = `
DROP TABLE IF EXISTS shipment, product_inventory, warehouse, order_product,
  order_summary, product, category, customer CASCADE;
`;

const CATEGORIES = ["Clothing", "Hard Goods", "Soft Goods", "Footwear", "Kids", "Supplements"];

// [name, price, category id, image, warehouse stock]
const PRODUCTS: [string, number, number, string, number][] = [
  ["Baseball Bat", 106, 2, "baseball-bat.webp", 20],
  ["Basketball", 35, 2, "basketball.webp", 50],
  ["Bike Helmet", 72, 2, "bikehelmet.webp", 40],
  ["Hockey Stick", 360, 2, "hockey-stick.webp", 74],
  ["Lacrosse Stick", 250, 2, "lacrosse-racquet.webp", 32],
  ["Softball", 5, 2, "softball.webp", 101],
  ["Squash Racquet", 85, 2, "squash-racquet.jpeg", 12],
  ["Baseball Glove", 165, 2, "baseball-glove.webp", 69],
  ["Hockey Puck", 6, 2, "hockey-puck.webp", 157],
  ["Boxing Bag", 275, 2, "boxing-bag.jpeg", 10],
  ["Swimming Shorts", 25, 1, "swimming-shorts.jpeg", 43],
  ["Snow Pants", 85, 1, "snow-pants.jpg", 23],
  ["Hoodie", 60, 1, "hoodie.jpeg", 98],
  ["Gym Shorts", 45, 1, "gym-shorts.webp", 56],
  ["Protein Bar", 2, 6, "protein-bar.jpeg", 187],
  ["BCAA", 28, 6, "bccaa.jpeg", 35],
  ["Pre-workout", 36, 6, "preworkout.jpeg", 54],
  ["Multivitamins", 20, 6, "multivitamins.jpeg", 67],
  ["Soccer Cleats", 170, 4, "soccer-cleats.webp", 69],
  ["Snow Shoes", 202, 4, "snow-shoes.jpeg", 52],
  ["Running Shoes", 135, 4, "running-shoes.png", 56],
  ["Training Shoes", 120, 4, "training-shoes.webp", 34],
  ["Kids Shorts", 20, 5, "kids-shorts.jpeg", 65],
  ["Kids T-shirt", 15, 5, "kid-tshirt.jpeg", 42],
  ["Kids Winter Jacket", 85, 5, "kids-winter-jacket.jpeg", 69],
];

// Demo accounts from the original project. Arnold is the store admin.
const CUSTOMERS = [
  ["Arnold", "Anderson", "a.anderson@gmail.com", "204-111-2222", "103 AnyWhere Street", "Winnipeg", "MB", "R3X 45T", "Canada", "arnold", "test", true],
  ["Bobby", "Brown", "bobby.brown@hotmail.ca", "572-342-8911", "222 Bush Avenue", "Boston", "MA", "22222", "United States", "bobby", "bobby", false],
  ["Candace", "Cole", "cole@charity.org", "333-444-5555", "333 Central Crescent", "Chicago", "IL", "33333", "United States", "candace", "password", false],
  ["Darren", "Doe", "oe@doe.com", "250-807-2222", "444 Dover Lane", "Kelowna", "BC", "V1V 2X9", "Canada", "darren", "pw", false],
  ["Elizabeth", "Elliott", "engel@uiowa.edu", "555-666-7777", "555 Everwood Street", "Iowa City", "IA", "52241", "United States", "beth", "test", false],
] as const;

// [customer id, date, [product id, quantity, price][]]
const ORDERS: [number, string, [number, number, number][]][] = [
  [1, "2019-10-15 10:25:55", [[1, 1, 18], [5, 2, 21.35], [10, 1, 31]]],
  [2, "2019-10-16 18:00:00", [[5, 5, 21.35]]],
  [3, "2019-10-15 03:30:22", [[6, 2, 25], [7, 3, 30]]],
  [2, "2019-10-17 05:45:11", [[3, 4, 10], [8, 3, 40], [13, 3, 23.25]]],
  [5, "2019-10-15 10:25:55", [[5, 4, 21.35], [19, 2, 81], [20, 3, 10]]],
];

export async function seed(db: Queryable) {
  for (const name of CATEGORIES) {
    await db.query("INSERT INTO category (category_name) VALUES ($1)", [name]);
  }
  await db.query("INSERT INTO warehouse (warehouse_name) VALUES ('Main warehouse')");
  for (const [i, [name, price, categoryId, image, stock]] of PRODUCTS.entries()) {
    await db.query(
      "INSERT INTO product (product_name, price, category_id, image_url) VALUES ($1, $2, $3, $4)",
      [name, price, categoryId, `/img/${image}`],
    );
    await db.query(
      "INSERT INTO product_inventory (product_id, warehouse_id, quantity) VALUES ($1, 1, $2)",
      [i + 1, stock],
    );
  }
  for (const [first, last, email, phone, address, city, state, postal, country, userId, password, isAdmin] of CUSTOMERS) {
    await db.query(
      `INSERT INTO customer (first_name, last_name, email, phone, address, city, state, postal_code,
         country, user_id, password_hash, is_admin)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [first, last, email, phone, address, city, state, postal, country, userId, bcrypt.hashSync(password, 10), isAdmin],
    );
  }
  for (const [customerId, date, items] of ORDERS) {
    const total = items.reduce((sum, [, qty, price]) => sum + qty * price, 0);
    const { rows } = await db.query<{ order_id: number }>(
      "INSERT INTO order_summary (customer_id, order_date, total_amount) VALUES ($1, $2, $3) RETURNING order_id",
      [customerId, date, total.toFixed(2)],
    );
    for (const [productId, qty, price] of items) {
      await db.query(
        "INSERT INTO order_product (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [rows[0].order_id, productId, qty, price],
      );
    }
  }
}
