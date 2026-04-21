"use client";

import { useState } from "react";
import type { Category } from "@/types";
import { StarRating } from "@/components/ui/StarRating";

interface ItemFormData {
  categoryId: string;
  title: string;
  creator: string;
  releaseDate: string;
  imageUrl: string;
  rating: number;
  review: string;
}

interface ItemFormProps {
  categories: Category[];
  initialData?: Partial<ItemFormData>;
  onSubmit: (data: ItemFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function ItemForm({
  categories,
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "OK",
}: ItemFormProps) {
  const [form, setForm] = useState<ItemFormData>({
    categoryId: initialData?.categoryId || categories[0]?.id || "",
    title: initialData?.title || "",
    creator: initialData?.creator || "",
    releaseDate: initialData?.releaseDate || "",
    imageUrl: initialData?.imageUrl || "",
    rating: initialData?.rating || 0,
    review: initialData?.review || "",
  });
  const [saving, setSaving] = useState(false);

  const update = (key: keyof ItemFormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await onSubmit(form);
    setSaving(false);
  };

  return (
    <div>
      <fieldset>
        <legend>Details</legend>
        <div className="field-row-stacked" style={{ marginBottom: 4 }}>
          <label>Category:</label>
          <select value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="field-row-stacked" style={{ marginBottom: 4 }}>
          <label>Title:</label>
          <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)} />
        </div>
        <div className="field-row-stacked" style={{ marginBottom: 4 }}>
          <label>Creator:</label>
          <input type="text" value={form.creator} onChange={(e) => update("creator", e.target.value)} />
        </div>
        <div className="field-row-stacked" style={{ marginBottom: 4 }}>
          <label>Release Date:</label>
          <input type="date" value={form.releaseDate} onChange={(e) => update("releaseDate", e.target.value)} />
        </div>
      </fieldset>

      <fieldset style={{ marginTop: 8 }}>
        <legend>Review</legend>
        <div className="field-row" style={{ marginBottom: 4 }}>
          <label>Rating:</label>
          <StarRating value={form.rating} onChange={(v) => update("rating", v)} />
        </div>
        <div className="field-row-stacked">
          <label>Notes:</label>
          <textarea value={form.review} onChange={(e) => update("review", e.target.value)} rows={3} />
        </div>
      </fieldset>

      <div className="field-row" style={{ justifyContent: "flex-end", marginTop: 12, gap: 6 }}>
        <button onClick={handleSubmit} disabled={saving || !form.title.trim()}>
          {saving ? "Saving..." : submitLabel}
        </button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
