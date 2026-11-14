"use client";

/* eslint-disable @next/next/no-img-element -- Product images use backend-provided URLs from arbitrary hosts. */
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Package, Sprout, TriangleAlert } from "lucide-react";
import { api, getPage, type Order, type Product } from "@/lib/api";

export const money = (value: string | number | undefined) => {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount)
    : "Price unavailable";
};

export function useProducts(query = "limit=100") {
  return useQuery({ queryKey: ["products", query], queryFn: () => getPage<Product>(`products?${query}`) });
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders", "my"],
    queryFn: async () => {
      const result = await api<Order[] | { items?: Order[]; orders?: Order[] }>("orders/my");
      return Array.isArray(result) ? result : result.items ?? result.orders ?? [];
    },
  });
}

export function useFarmerId() {
  return useQuery({
    queryKey: ["farmer", "me"],
    queryFn: async () => {
      const profile = await api<Record<string, unknown>>("farmers/me");
      return typeof profile.id === "string" ? profile.id : null;
    },
  });
}

export function ownedProducts(products: Product[] | undefined, userId: string | undefined, farmerId: string | null | undefined) {
  return products?.filter((product) => {
    const owner = product.farmerId ?? product.farmer?.id;
    return !!owner && (owner === userId || owner === farmerId);
  }) ?? [];
}

export function ViewState({ loading, error, empty, children, retry }: {
  loading: boolean; error?: Error | null; empty?: string; children?: React.ReactNode; retry?: () => void;
}) {
  if (loading) return <div className="portal-state" aria-busy="true"><span className="portal-spinner" /><p>Loading information…</p></div>;
  if (error) return <div className="portal-state"><TriangleAlert size={28} /><h2>Could not load this page</h2><p>{error.message}</p>{retry && <button className="portal-button" onClick={retry}>Try again</button>}</div>;
  if (empty) return <div className="portal-state"><Sprout size={30} /><h2>Nothing here yet</h2><p>{empty}</p>{children}</div>;
  return <>{children}</>;
}

export function ProductCard({ product, href }: { product: Product; href: string }) {
  return (
    <article className="portal-product-card">
      <Link href={href} className="portal-product-image">
        {product.images?.[0] ? <img src={product.images[0]} alt={product.name} /> : <Package size={45} aria-hidden="true" />}
      </Link>
      <div className="portal-product-body">
        <span className="portal-chip">{product.category}</span>
        <h3><Link href={href}>{product.name}</Link></h3>
        <p className="portal-product-location">{product.location || "Location not listed"}</p>
        <div className="portal-product-bottom"><strong>{money(product.pricePerUnit)} <small>/ {product.unit}</small></strong><span>{product.availableQuantity} {product.unit} available</span></div>
      </div>
    </article>
  );
}
