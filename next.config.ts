import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite ships its Postgres build as .wasm/.data files it reads at runtime,
  // so it must stay a real node_module and those files must be traced into the
  // serverless bundle.
  serverExternalPackages: ["@electric-sql/pglite"],
  outputFileTracingIncludes: {
    "/**": ["./node_modules/@electric-sql/pglite/dist/**/*.{wasm,data}"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  // Old links from the JSP version of the site.
  async redirects() {
    const legacy: [string, string][] = [
      ["/index.jsp", "/"],
      ["/shop.html", "/"],
      ["/listprod.jsp", "/products"],
      ["/showcart.jsp", "/cart"],
      ["/checkout.jsp", "/cart"],
      ["/login.jsp", "/login"],
      ["/customer.jsp", "/account"],
      ["/listorder.jsp", "/admin"],
      ["/admin.jsp", "/admin"],
    ];
    return [
      ...legacy.map(([source, destination]) => ({ source, destination, permanent: true })),
      { source: "/product.jsp", has: [{ type: "query" as const, key: "id", value: "(?<id>\\d+)" }], destination: "/products/:id", permanent: true },
    ];
  },
};

export default nextConfig;
