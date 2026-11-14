"use client";

import { useEffect, useState } from "react";

export type BuyerRequirement = {
  id: string;
  buyerId: string;
  buyerName: string;
  businessName?: string;
  phone?: string;
  email?: string;
  productName: string;
  category: string;
  quantity: string | number;
  unit: string;
  targetPrice?: string | number;
  neededBy?: string;
  urgency: "NORMAL" | "HIGH" | "URGENT";
  location: string;
  deliveryAddress?: string;
  description: string;
  status: "OPEN" | "FULFILLED" | "CLOSED";
  createdAt: string;
};

export type RequirementInput = Omit<BuyerRequirement, "id" | "createdAt" | "status">;

const STORAGE_KEY = "vithu:buyer-requirements";

const INITIAL_REQUIREMENTS: BuyerRequirement[] = [
  {
    id: "req-101",
    buyerId: "buyer-seed-1",
    buyerName: "Rajesh Kumar",
    businessName: "Green Harvest Supermarkets",
    phone: "+91 98471 23456",
    email: "procurement@greenharvest.in",
    productName: "Fresh Red Onions",
    category: "Vegetables",
    quantity: "1500",
    unit: "kg",
    targetPrice: "28",
    neededBy: "Within 3 days",
    urgency: "URGENT",
    location: "Ernakulam, Kerala",
    deliveryAddress: "Green Harvest Central Warehouse, Kalamassery, Ernakulam",
    description: "Seeking medium-to-large sorted Nashik/Maharashtra red onions. Dry outer skin, packed in 50 kg mesh bags. Immediate payment upon delivery inspection.",
    status: "OPEN",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "req-102",
    buyerId: "buyer-seed-2",
    buyerName: "Anita Sharma",
    businessName: "Malabar Organic Foods",
    phone: "+91 94462 87654",
    email: "anita.procure@malabarorganic.com",
    productName: "Nendran Banana (Raw)",
    category: "Fruits",
    quantity: "3000",
    unit: "kg",
    targetPrice: "42",
    neededBy: "Next week",
    urgency: "HIGH",
    location: "Thrissur, Kerala",
    deliveryAddress: "Malabar Foods Processing Plant, Ollur, Thrissur",
    description: "Looking for pesticide-free mature raw Nendran bananas suitable for banana chip production. Farmers with farmgate pickup can quote directly.",
    status: "OPEN",
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: "req-103",
    buyerId: "buyer-seed-3",
    buyerName: "Suresh Menon",
    businessName: "Kerala Agro Millers",
    phone: "+91 98950 11223",
    email: "suresh@agrotraders.org",
    productName: "Matta Rice (Paddy)",
    category: "Grains & Cereals",
    quantity: "5",
    unit: "tonne",
    targetPrice: "34",
    neededBy: "Within 10 days",
    urgency: "NORMAL",
    location: "Palakkad, Kerala",
    deliveryAddress: "Agro Mill Yard, Chittur Road, Palakkad",
    description: "Need newly harvested Jaya / Matta paddy with moisture content below 14%. Direct farmer collection with truck weighing available.",
    status: "OPEN",
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
  {
    id: "req-104",
    buyerId: "buyer-seed-4",
    buyerName: "Farooq Hassan",
    businessName: "Hassan Fresh Produce Exports",
    phone: "+91 97455 33441",
    email: "exports@hassanagro.com",
    productName: "Green Cardamom (8mm+)",
    category: "Spices",
    quantity: "200",
    unit: "kg",
    targetPrice: "2150",
    neededBy: "Immediate",
    urgency: "URGENT",
    location: "Idukki, Kerala",
    deliveryAddress: "Spices Hub, Kumily, Idukki",
    description: "Grade A green cardamom bold 8mm pods with vibrant color. Sample verification required prior to bulk delivery. Cash payment terms.",
    status: "OPEN",
    createdAt: new Date(Date.now() - 3600000 * 50).toISOString(),
  },
];

export function getBuyerRequirements(): BuyerRequirement[] {
  if (typeof window === "undefined") return INITIAL_REQUIREMENTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REQUIREMENTS));
      return INITIAL_REQUIREMENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REQUIREMENTS));
    return INITIAL_REQUIREMENTS;
  } catch {
    return INITIAL_REQUIREMENTS;
  }
}

export function saveBuyerRequirements(requirements: BuyerRequirement[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requirements));
    window.dispatchEvent(new CustomEvent("vithu:requirements-updated", { detail: requirements }));
  } catch {
    // ignore storage quota error
  }
}

export function addBuyerRequirement(input: RequirementInput): BuyerRequirement {
  const all = getBuyerRequirements();
  const newReq: BuyerRequirement = {
    ...input,
    id: `req-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    status: "OPEN",
    createdAt: new Date().toISOString(),
  };
  const updated = [newReq, ...all];
  saveBuyerRequirements(updated);
  return newReq;
}

export function updateBuyerRequirementStatus(id: string, status: "OPEN" | "FULFILLED" | "CLOSED"): void {
  const all = getBuyerRequirements();
  const updated = all.map((req) => (req.id === id ? { ...req, status } : req));
  saveBuyerRequirements(updated);
}

export function deleteBuyerRequirement(id: string): void {
  const all = getBuyerRequirements();
  const updated = all.filter((req) => req.id !== id);
  saveBuyerRequirements(updated);
}

export function useRequirements() {
  const [requirements, setRequirements] = useState<BuyerRequirement[]>(INITIAL_REQUIREMENTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setRequirements(getBuyerRequirements());
      setMounted(true);
    });

    const handleUpdate = () => {
      setRequirements(getBuyerRequirements());
    };

    window.addEventListener("vithu:requirements-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("vithu:requirements-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return {
    requirements,
    mounted,
    addRequirement: addBuyerRequirement,
    updateStatus: updateBuyerRequirementStatus,
    deleteRequirement: deleteBuyerRequirement,
  };
}
