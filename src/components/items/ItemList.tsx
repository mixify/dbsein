"use client";

import type { Item } from "@/types";
import { ItemCard } from "./ItemCard";

interface ItemListProps {
  items: Item[];
  loading: boolean;
  sort: string;
  onSortChange: (sort: string) => void;
  onItemClick: (item: Item) => void;
}

type ColDef = { key: string; label: string; width?: number };

const COLUMNS: ColDef[] = [
  { key: "icon", label: "", width: 28 },
  { key: "title", label: "Name" },
  { key: "creator", label: "Creator", width: 160 },
  { key: "rating", label: "Rating", width: 130 },
  { key: "release_date", label: "Year", width: 70 },
  { key: "updated_at", label: "Date Modified", width: 130 },
];

export function ItemList({ items, loading, sort, onSortChange, onItemClick }: ItemListProps) {
  const [currentCol, currentDir] = sort.split(/_(?:asc|desc)$/).length
    ? [sort.replace(/_(asc|desc)$/, ""), sort.endsWith("_asc") ? "asc" : "desc"]
    : ["updated_at", "desc"];

  const handleHeaderClick = (col: string) => {
    if (col === "icon") return;
    if (currentCol === col) {
      onSortChange(`${col}_${currentDir === "desc" ? "asc" : "desc"}`);
    } else {
      onSortChange(`${col}_desc`);
    }
  };

  if (loading) {
    return <div style={{ padding: 16, fontSize: 11 }}>Loading...</div>;
  }

  if (items.length === 0) {
    return <div style={{ padding: 16, fontSize: 11, color: "#888" }}>No items yet.</div>;
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr className="listview-header">
          {COLUMNS.map((col) => (
            <th
              key={col.key}
              className={currentCol === col.key ? "sorted" : ""}
              onClick={() => handleHeaderClick(col.key)}
              style={col.width ? { width: col.width } : undefined}
            >
              {col.label}
              {currentCol === col.key && (
                <span style={{ marginLeft: 3, fontSize: 8 }}>
                  {currentDir === "desc" ? "▼" : "▲"}
                </span>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <ItemCard key={item.id} item={item} onClick={() => onItemClick(item)} />
        ))}
      </tbody>
    </table>
  );
}
