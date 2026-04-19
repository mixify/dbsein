"use client";

import { useState, useEffect, useCallback } from "react";
import type { Category } from "@/types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/categories");
    if (res.ok) {
      setCategories(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  const addCategory = async (name: string) => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) await fetch_();
    return res.ok;
  };

  const renameCategory = async (categoryId: string, name: string) => {
    const res = await fetch("/api/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, name }),
    });
    if (res.ok) await fetch_();
    return res.ok;
  };

  const deleteCategory = async (categoryId: string) => {
    const res = await fetch("/api/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId }),
    });
    if (res.ok) await fetch_();
    return res.ok;
  };

  return { categories, loading, refetch: fetch_, addCategory, renameCategory, deleteCategory };
}
