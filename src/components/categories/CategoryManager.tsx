"use client";

import { useState } from "react";
import type { Category } from "@/types";
import { Dialog } from "@/components/ui/Dialog";

interface CategoryManagerProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onAdd: (name: string) => Promise<boolean>;
  onRename: (id: string, name: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export function CategoryManager({
  open,
  onClose,
  categories,
  onAdd,
  onRename,
  onDelete,
}: CategoryManagerProps) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await onAdd(newName.trim());
    setNewName("");
  };

  const handleRename = async () => {
    if (!editingId || !editingName.trim()) return;
    await onRename(editingId, editingName.trim());
    setEditingId(null);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!confirm("Delete this category and all its items?")) return;
    await onDelete(selectedId);
    setSelectedId(null);
  };

  return (
    <Dialog open={open} onClose={onClose} title="Edit Categories">
      <fieldset>
        <legend>Add New</legend>
        <div className="field-row" style={{ gap: 4 }}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            style={{ flex: 1 }}
          />
          <button onClick={handleAdd} disabled={!newName.trim()}>Add</button>
        </div>
      </fieldset>

      <fieldset style={{ marginTop: 8 }}>
        <legend>Categories</legend>
        <ul className="tree-view" style={{ height: 120, overflow: "auto" }}>
          {categories.map((cat) => (
            <li
              key={cat.id}
              onClick={() => setSelectedId(cat.id)}
              style={{
                padding: "2px 4px",
                cursor: "pointer",
                background: selectedId === cat.id ? "#316ac5" : "transparent",
                color: selectedId === cat.id ? "#fff" : "inherit",
              }}
            >
              {editingId === cat.id ? (
                <span className="field-row" style={{ gap: 4 }} onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRename()}
                    style={{ width: 120 }}
                    autoFocus
                  />
                  <button onClick={handleRename}>OK</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </span>
              ) : (
                cat.name
              )}
            </li>
          ))}
        </ul>
        <div className="field-row" style={{ marginTop: 6, gap: 6 }}>
          <button
            disabled={!selectedId}
            onClick={() => {
              const cat = categories.find(c => c.id === selectedId);
              if (cat) { setEditingId(cat.id); setEditingName(cat.name); }
            }}
          >
            Rename
          </button>
          <button disabled={!selectedId} onClick={handleDelete}>Delete</button>
        </div>
      </fieldset>

      <div className="field-row" style={{ justifyContent: "flex-end", marginTop: 12 }}>
        <button onClick={onClose}>Close</button>
      </div>
    </Dialog>
  );
}
