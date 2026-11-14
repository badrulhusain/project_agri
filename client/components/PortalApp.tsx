"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { PortalShell } from "./PortalShell";
import {
  BuyerDashboard, BuyerMarketplace, BuyerProductDetail, FarmerDashboard,
  MyProducts, OrderList, ProductFormPage, ProfilePage, UnavailablePage,
} from "./PortalViews";
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
  } else if (role === "AGENCY") {
    const names: Record<string, [string, string]> = {
      dashboard: ["Agency overview", "The API has no agency metrics or commission endpoints yet."],
      farmers: [parts[1] === "new" ? "Register a farmer" : parts[1] ? "Farmer details" : "Connected farmers", "The API has no agency farmer registration, connection, or permission endpoints yet."],
      products: ["Managed products", "The API has no agency product permissions or delegated management endpoints yet."],
      connections: ["Connection requests", "The API has no agency connection endpoints yet."],
      transactions: ["Transactions", "The API has no facilitated transaction endpoints yet."],
      commissions: ["Commissions", "The API has no commission records or balances yet."],
    };
    const [title, detail] = names[section] ?? ["Page not found", "This agency route is unavailable."];
    page = { title, description: role === "AGENCY" ? "Support farmers and connect them with markets." : "", content: unavailable(title, detail) };
  } else {
    const names: Record<string, [string, string]> = {
      dashboard: ["Platform overview", "The API has no admin metrics or management endpoints yet."],
      farmers: ["Farmers", "The API has no admin farmer management endpoint yet."],
      buyers: ["Buyers", "The API has no admin buyer management endpoint yet."],
      agencies: ["Agencies", "The API has no admin agency management endpoint yet."],
      products: ["Products", "The API has no admin moderation endpoint yet."],
      orders: ["Orders", "The API has no admin order management endpoint yet."],
      schemes: ["Schemes", "The API has no scheme management endpoint yet."],
      commissions: ["Commissions", "The API has no commission management endpoint yet."],
      settings: ["Settings", "The API has no platform settings endpoint yet."],
    };
    const [title, detail] = names[section] ?? ["Page not found", "This admin route is unavailable."];
    page = { title, description: "Manage the marketplace with clear oversight.", content: unavailable(title, detail) };
  }

  return <PortalShell role={role} title={page.title} description={page.description} action={page.action}>{page.content}</PortalShell>;
}
