"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "vithu:wishlist";

export function getWishlistIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function saveWishlistIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent("vithu:wishlist-updated", { detail: ids }));
  } catch {
    // ignore local storage errors
  }
}

export function isWishlisted(productId: string): boolean {
  return getWishlistIds().includes(productId);
}

export function toggleWishlist(productId: string): boolean {
  const current = getWishlistIds();
  const exists = current.includes(productId);
  const updated = exists ? current.filter((id) => id !== productId) : [...current, productId];
  saveWishlistIds(updated);
  return !exists;
}

export function addToWishlist(productId: string): void {
  const current = getWishlistIds();
  if (!current.includes(productId)) {
    saveWishlistIds([...current, productId]);
  }
}

export function removeFromWishlist(productId: string): void {
  const current = getWishlistIds();
  saveWishlistIds(current.filter((id) => id !== productId));
}

export function useWishlist() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setWishlistIds(getWishlistIds());
    setMounted(true);

    const handleUpdate = () => {
      setWishlistIds(getWishlistIds());
    };

    window.addEventListener("vithu:wishlist-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("vithu:wishlist-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return {
    wishlistIds,
    mounted,
    has: (productId: string) => wishlistIds.includes(productId),
    toggle: (productId: string) => toggleWishlist(productId),
    add: (productId: string) => addToWishlist(productId),
    remove: (productId: string) => removeFromWishlist(productId),
    count: wishlistIds.length,
  };
}
