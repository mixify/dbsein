"use client";

import { useState, useEffect, useCallback } from "react";
import type { Item, SortMode } from "@/types";

export function useItems(categoryId: string | null, sort: SortMode = "reviewed_at") {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ sort });
    if (categoryId) params.set("categoryId", categoryId);
    const res = await fetch(`/api/items?${params}`);
    if (res.ok) {
      setItems(await res.json());
    }
    setLoading(false);
  }, [categoryId, sort]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  const addItem = async (data: {
    categoryId: string;
    title: string;
    creator?: string;
    releaseDate?: string;
    imageUrl?: string;
    rating?: number;
    review?: string;
  }) => {
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) await fetch_();
    return res.ok;
  };

  const updateItem = async (id: string, data: Record<string, unknown>) => {
    const res = await fetch("/api/items", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    if (res.ok) await fetch_();
    return res.ok;
  };

  const deleteItem = async (id: string) => {
    const res = await fetch("/api/items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) await fetch_();
    return res.ok;
  };

  return { items, loading, refetch: fetch_, addItem, updateItem, deleteItem };
}
