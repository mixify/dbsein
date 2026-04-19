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

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await onAdd(newName.trim());
    setNewName("");
  };

  const startRename = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleRename = async () => {
    if (!editingId || !editingName.trim()) return;
    await onRename(editingId, editingName.trim());
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category and all its items?")) return;
    await onDelete(id);
  };

  return (
    <Dialog open={open} onClose={onClose} title="Categories">
      <fieldset>
        <legend>Add New</legend>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            style={{ flex: 1 }}
          />
          <button onClick={handleAdd}>Add</button>
        </div>
      </fieldset>
      <fieldset style={{ marginTop: 8 }}>
        <legend>Manage</legend>
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between" style={{ padding: "2px 0" }}>
            {editingId === cat.id ? (
              <div className="flex gap-1 items-center flex-1">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRename()}
                  style={{ flex: 1 }}
                  autoFocus
                />
                <button onClick={handleRename}>OK</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            ) : (
              <>
                <span style={{ fontSize: 12 }}>{cat.name}</span>
                <div className="flex gap-1">
                  <button onClick={() => startRename(cat)} style={{ fontSize: 11 }}>Rename</button>
                  <button onClick={() => handleDelete(cat.id)} style={{ fontSize: 11 }}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </fieldset>
    </Dialog>
  );
}
