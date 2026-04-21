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
    if (!confirm("Are you sure you want to delete this item?")) return;
    const ok = await onDelete(item.id);
    if (ok) onClose();
  };

  return (
    <Dialog open={!!item} onClose={onClose} title={editing ? "Edit Item" : "Properties"}>
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
        />
      ) : (
        <div>
          {item.image_url && (
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <img src={resolveImageUrl(item.image_url)!} alt="" style={{ maxHeight: 120 }} />
            </div>
          )}

          <fieldset>
            <legend>Details</legend>
            <div className="field-row">
              <label style={{ width: 70 }}>Title:</label>
              <span>{item.title}</span>
            </div>
            {item.creator && (
              <div className="field-row">
                <label style={{ width: 70 }}>Creator:</label>
                <span>{item.creator}</span>
              </div>
            )}
            {item.release_date && (
              <div className="field-row">
                <label style={{ width: 70 }}>Released:</label>
                <span>{item.release_date}</span>
              </div>
            )}
            {item.rating != null && item.rating > 0 && (
              <div className="field-row">
                <label style={{ width: 70 }}>Rating:</label>
                <StarRating value={item.rating} readonly />
              </div>
            )}
          </fieldset>

          {item.review && (
            <fieldset style={{ marginTop: 8 }}>
              <legend>Review</legend>
              <p style={{ fontSize: 11, whiteSpace: "pre-wrap", margin: 0 }}>{item.review}</p>
            </fieldset>
          )}

          {authorized && (
            <div className="field-row" style={{ justifyContent: "flex-end", marginTop: 12, gap: 6 }}>
              <button onClick={() => setEditing(true)}>Edit</button>
              <button onClick={handleDelete}>Delete</button>
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}
