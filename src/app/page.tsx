"use client";

import { useState } from "react";
import type { Item, SortMode } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { useItems } from "@/hooks/useItems";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { ItemList } from "@/components/items/ItemList";
import { AddItemDialog } from "@/components/items/AddItemDialog";
import { ItemDetail } from "@/components/items/ItemDetail";

export default function HomePage() {
  const { authorized } = useAuth();
  const [sort, setSort] = useState<SortMode>("reviewed_at");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const { categories, loading: catLoading, addCategory, renameCategory, deleteCategory } =
    useCategories();

  const effectiveCategoryId =
    activeCategoryId || (categories.length > 0 ? categories[0].id : null);

  const { items, loading: itemsLoading, addItem, updateItem, deleteItem } =
    useItems(effectiveCategoryId, sort);

  if (catLoading) {
    return <div className="p-4 text-xs text-[var(--dim)]">loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header sort={sort} onSortChange={setSort} />

      <main className="flex-1 pb-12">
        <ItemList items={items} loading={itemsLoading} onItemClick={setSelectedItem} />
      </main>

      {authorized && (
        <button
          onClick={() => setShowAdd(true)}
          className="fixed z-30"
          style={{ bottom: 40, right: 12, fontSize: 12 }}
        >
          Add Item
        </button>
      )}

      <BottomNav
        categories={categories}
        activeCategoryId={effectiveCategoryId}
        onSelect={(id) => setActiveCategoryId(id)}
        onAdd={addCategory}
        onRename={renameCategory}
        onDelete={deleteCategory}
        authorized={authorized}
      />

      {authorized && (
        <AddItemDialog
          open={showAdd}
          onClose={() => setShowAdd(false)}
          categories={categories}
          activeCategoryId={effectiveCategoryId}
          onSave={addItem}
        />
      )}

      <ItemDetail
        item={selectedItem}
        categories={categories}
        onClose={() => setSelectedItem(null)}
        onUpdate={updateItem}
        onDelete={deleteItem}
        authorized={authorized}
      />
    </div>
  );
}
