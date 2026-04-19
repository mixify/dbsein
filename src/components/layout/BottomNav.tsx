"use client";

import { useState } from "react";
import type { Category } from "@/types";
import { CategoryManager } from "@/components/categories/CategoryManager";

interface BottomNavProps {
  categories: Category[];
  activeCategoryId: string | null;
  onSelect: (id: string) => void;
  onAdd: (name: string) => Promise<boolean>;
  onRename: (id: string, name: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  authorized: boolean;
}

export function BottomNav({
  categories,
  activeCategoryId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
  authorized,
}: BottomNavProps) {
  const [showManager, setShowManager] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-20" style={{ background: "#c0c0c0", borderTop: "2px outset #fff", padding: "4px 8px" }}>
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              style={{
                fontSize: 12,
                fontWeight: activeCategoryId === cat.id ? "bold" : "normal",
              }}
              className={activeCategoryId === cat.id ? "active" : ""}
            >
              {cat.name}
            </button>
          ))}
          {authorized && (
            <button onClick={() => setShowManager(true)} style={{ fontSize: 12 }}>
              Edit...
            </button>
          )}
        </div>
      </div>

      {authorized && (
        <CategoryManager
          open={showManager}
          onClose={() => setShowManager(false)}
          categories={categories}
          onAdd={onAdd}
          onRename={onRename}
          onDelete={onDelete}
        />
      )}
    </>
  );
}
