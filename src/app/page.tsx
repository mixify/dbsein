"use client";

import { useState } from "react";
import type { Item } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { useItems } from "@/hooks/useItems";
import { ItemList } from "@/components/items/ItemList";
import { AddItemDialog } from "@/components/items/AddItemDialog";
import { ItemDetail } from "@/components/items/ItemDetail";
import { CategoryManager as CatManager } from "@/components/categories/CategoryManager";

export default function HomePage() {
  const { authorized } = useAuth();
  const [sort, setSort] = useState("updated_at_desc");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [showCatManager, setShowCatManager] = useState(false);

  const { categories, loading: catLoading, addCategory, renameCategory, deleteCategory } =
    useCategories();

  const effectiveCategoryId =
    activeCategoryId || (categories.length > 0 ? categories[0].id : null);

  const { items, loading: itemsLoading, addItem, updateItem, deleteItem } =
    useItems(effectiveCategoryId, sort);

  if (catLoading) {
    return <div style={{ padding: 16, fontSize: 11 }}>Loading...</div>;
  }

  return (
    <div className="window" style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Title bar */}
      <div className="title-bar">
        <div className="title-bar-text">DBSein</div>
        <div className="title-bar-controls">
          <button aria-label="Help" onClick={() => window.open("https://github.com/mixify/dbsein", "_blank")} />
          <button aria-label="Close" />
        </div>
      </div>

      {/* Menu bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: "1px 2px",
        background: "#ece9d8",
        borderBottom: "1px solid #aca899",
        fontSize: 11,
      }}>
        {authorized && (
          <button onClick={() => setShowAdd(true)}>Add Item</button>
        )}
        <button onClick={() => window.location.href = "/topster"}>Topster</button>
        <div style={{ flex: 1 }} />
        {authorized && (
          <button onClick={() => setShowCatManager(true)}>Edit Categories</button>
        )}
      </div>

      {/* Tabs + Content */}
      <section className="tabs" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <menu role="tablist">
          {categories.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={effectiveCategoryId === cat.id}
              aria-controls={`tab-${cat.id}`}
              onClick={() => setActiveCategoryId(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </menu>
        {categories.map((cat) => (
          <article
            key={cat.id}
            role="tabpanel"
            id={`tab-${cat.id}`}
            hidden={effectiveCategoryId !== cat.id}
            style={{ flex: 1, overflow: "auto", padding: 0 }}
          >
            <ItemList
              items={items}
              loading={itemsLoading}
              sort={sort}
              onSortChange={setSort}
              onItemClick={setSelectedItem}
            />
          </article>
        ))}
      </section>

      {/* Status bar */}
      <div className="status-bar">
        <p className="status-bar-field">{items.length} items</p>
        <p className="status-bar-field">{categories.find(c => c.id === effectiveCategoryId)?.name || ""}</p>
        <p className="status-bar-field">{authorized ? "Read/Write" : "Read Only"}</p>
      </div>

      {/* Dialogs */}
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

      {authorized && (
        <CatManager
          open={showCatManager}
          onClose={() => setShowCatManager(false)}
          categories={categories}
          onAdd={addCategory}
          onRename={renameCategory}
          onDelete={deleteCategory}
        />
      )}
    </div>
  );
}
