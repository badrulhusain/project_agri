"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { PortalShell } from "./PortalShell";
import {
  AdminDashboard, AdminOrders, AdminProducts, AdminSettings, AdminSchemes, AdminSurplus, AdminUsers,
} from "./AdminViews";
import {
  BuyerDashboard, BuyerMarketplace, FarmerDashboard, ProfilePage, UnavailablePage,
} from "./PortalViews";
import { BuyerProductDetail, MyProducts, OrderList, ProductFormPage } from "./PortalWorkflows";
import type { Role } from "@/lib/api";

type PageConfig = { title: string; description: string; content: React.ReactNode; action?: React.ReactNode };

export default function PortalApp({ role }: { role: Role }) {
  return <Suspense fallback={<main className="portal-auth-state" aria-busy="true">Opening your workspace…</main>}><PortalBody role={role} /></Suspense>;
}

function PortalBody({ role }: { role: Role }) {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean).slice(1);
  const section = parts[0] ?? "dashboard";
  const unavailable = (name: string, detail: string) => <UnavailablePage name={name} detail={detail} />;
  let page: PageConfig;

  if (role === "FARMER") {
    if (section === "dashboard") page = { title: "Good to see you", description: "Here is what is happening with your harvest.", content: <FarmerDashboard />, action: <Link className="portal-button" href="/farmer/products/new"><Plus size={17} /> Add product</Link> };
    else if (section === "products" && parts[1] === "new") page = { title: "Add a product", description: "A few simple steps to show buyers what you have.", content: <ProductFormPage /> };
    else if (section === "products" && parts[2] === "edit") page = { title: "Edit product", description: "Update the details buyers can see.", content: <ProductFormPage id={parts[1]} /> };
    else if (section === "products" && !parts[1]) page = { title: "My products", description: "Keep your available produce up to date.", content: <MyProducts />, action: <Link className="portal-button" href="/farmer/products/new"><Plus size={17} /> Add product</Link> };
    else if (section === "orders" && !parts[1]) page = { title: "Orders", description: "Review requests from buyers and keep them updated.", content: <OrderList role="FARMER" /> };
    else if (section === "profile") page = { title: "Your profile", description: "Your account and farm information.", content: <ProfilePage role="FARMER" /> };
    else if (section === "buyers") page = { title: "Buyers", description: "Find people interested in your produce.", content: unavailable("Buyer connections", "The API does not yet provide farmer-to-buyer matching or connection endpoints.") };
    else if (section === "schemes") page = { title: "Government schemes", description: "Support that may be relevant to your farm.", content: unavailable("Scheme recommendations", "The API does not yet provide schemes, eligibility results, or official application links.") };
    else if (section === "surplus") page = { title: "Surplus products", description: "Give remaining produce another chance to sell.", content: unavailable("Surplus matching", "The API does not yet provide sold-versus-remaining quantities or surplus buyer matching.") };
    else page = { title: "Page not found", description: "", content: <Link href="/farmer/dashboard">Go to overview</Link> };
  } else if (role === "BUYER") {
    if (section === "dashboard") page = { title: "Welcome back", description: "A clear view of your purchasing activity.", content: <BuyerDashboard />, action: <Link className="portal-button" href="/buyer/marketplace">Find products</Link> };
    else if (section === "marketplace") page = { title: "Marketplace", description: "Find fresh produce from farmers.", content: <BuyerMarketplace /> };
    else if (section === "products" && parts[1]) page = { title: "Product details", description: "Check availability and place your order.", content: <BuyerProductDetail id={parts[1]} /> };
    else if (section === "orders") page = { title: "Your orders", description: "Track purchases and their current status.", content: <OrderList role="BUYER" /> };
    else if (section === "wishlist") page = { title: "Wishlist", description: "Products you would like to save.", content: unavailable("Saved products", "The API does not yet provide a wishlist endpoint, so products cannot be saved across visits.") };
    else if (section === "profile") page = { title: "Your profile", description: "Your account and buyer information.", content: <ProfilePage role="BUYER" /> };
    else page = { title: "Page not found", description: "", content: <Link href="/buyer/dashboard">Go to overview</Link> };
  } else if (role === "ADMIN") {
    if (section === "dashboard") page = { title: "Platform overview", description: "Monitor users, products, orders, schemes, and surplus.", content: <AdminDashboard /> };
    else if (section === "users" && !parts[1]) page = { title: "User management", description: "View, search, and manage farmer and buyer accounts.", content: <AdminUsers /> };
    else if (section === "products" && !parts[1]) page = { title: "Product moderation", description: "Review every product listed on the marketplace.", content: <AdminProducts /> };
    else if (section === "orders" && !parts[1]) page = { title: "Order monitoring", description: "Track orders placed across the platform.", content: <AdminOrders /> };
    else if (section === "schemes" && !parts[1]) page = { title: "Government schemes", description: "Publish and maintain verified scheme information.", content: <AdminSchemes /> };
    else if (section === "surplus" && !parts[1]) page = { title: "Surplus products", description: "Products that need attention because they remain unsold.", content: <AdminSurplus /> };
    else if (section === "settings") page = { title: "Platform settings", description: "General configuration for the marketplace.", content: <AdminSettings /> };
    else page = { title: "Page not found", description: "", content: <Link href="/admin/dashboard">Go to overview</Link> };
  } else {
    page = { title: "Unknown role", description: "", content: <UnavailablePage name="Unknown role" detail="This role does not have a portal configured." /> };
  }

  return <PortalShell role={role} title={page.title} description={page.description} action={page.action}>{page.content}</PortalShell>;
}