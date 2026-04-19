"use client";

import type { Item } from "@/types";
import { ItemCard } from "./ItemCard";

interface ItemListProps {
  items: Item[];
  loading: boolean;
  onItemClick: (item: Item) => void;
}

export function ItemList({ items, loading, onItemClick }: ItemListProps) {
  if (loading) {
    return <div style={{ padding: 16, fontSize: 12 }}>Loading...</div>;
  }

  if (items.length === 0) {
    return <div style={{ padding: 16, fontSize: 12, color: "#888" }}>No items yet.</div>;
  }

  return (
    <div className="sunken-panel" style={{ margin: 8, overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ textAlign: "left", background: "#c0c0c0" }}>
            <th style={{ width: 32, padding: 2 }}></th>
            <th style={{ padding: "2px 4px" }}>Title</th>
            <th style={{ padding: "2px 4px" }}>Creator</th>
            <th style={{ padding: "2px 4px" }}>Rating</th>
            <th style={{ padding: "2px 4px" }}>Year</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onClick={() => onItemClick(item)} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
