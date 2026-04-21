"use client";

import { useState } from "react";
import type { Item, Category } from "@/types";
import { Dialog } from "@/components/ui/Dialog";
import { ItemForm } from "./ItemForm";
import { StarRating } from "@/components/ui/StarRating";
import { resolveImageUrl } from "@/lib/image-url";

interface ItemDetailProps {
  item: Item | null;
  categories: Category[];
  onClose: () => void;
  onUpdate: (id: string, data: Record<string, unknown>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  authorized: boolean;
}

export function ItemDetail({ item, categories, onClose, onUpdate, onDelete, authorized }: ItemDetailProps) {
  const [editing, setEditing] = useState(false);

  if (!item) return null;

  const handleUpdate = async (data: {
    categoryId: string;
    title: string;
    creator: string;
    releaseDate: string;
    imageUrl: string;
    rating: number;
    review: string;
  }) => {
    const ok = await onUpdate(item.id, data);
    if (ok) { setEditing(false); onClose(); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this item?")) return;
    const ok = await onDelete(item.id);
    if (ok) onClose();
  };

  return (
    <Dialog open={!!item} onClose={onClose} title={editing ? "Edit" : item.title}>
      {editing ? (
        <ItemForm
          categories={categories}
          initialData={{
            categoryId: item.category_id,
            title: item.title,
            creator: item.creator || "",
            releaseDate: item.release_date || "",
            imageUrl: item.image_url || "",
            rating: item.rating || 0,
            review: item.review || "",
          }}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
          submitLabel="Update"
        />
      ) : (
        <div>
          {item.image_url && (
            <img src={resolveImageUrl(item.image_url)!} alt="" style={{ maxHeight: 120, marginBottom: 8 }} />
          )}
          <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: 2, fontSize: 12 }}>
            <span style={{ color: "#888" }}>Title:</span>
            <span>{item.title}</span>
            {item.creator && (
              <>
                <span style={{ color: "#888" }}>Creator:</span>
                <span>{item.creator}</span>
              </>
            )}
            {item.release_date && (
              <>
                <span style={{ color: "#888" }}>Released:</span>
                <span>{item.release_date}</span>
              </>
            )}
            {item.rating != null && item.rating > 0 && (
              <>
                <span style={{ color: "#888" }}>Rating:</span>
                <span><StarRating value={item.rating} readonly /></span>
              </>
            )}
          </div>
          {item.review && (
            <fieldset style={{ marginTop: 8 }}>
              <legend>Review</legend>
              <p style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>{item.review}</p>
            </fieldset>
          )}
          {authorized && (
            <div className="flex gap-2" style={{ marginTop: 12 }}>
              <button onClick={() => setEditing(true)}>Edit</button>
              <button onClick={handleDelete}>Delete</button>
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}
