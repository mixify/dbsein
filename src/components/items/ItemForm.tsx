"use client";

import { useState } from "react";
import type { Category } from "@/types";
import { StarRating } from "@/components/ui/StarRating";
import { resolveImageUrl } from "@/lib/image-url";

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
  submitLabel = "Save",
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
      <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 4, fontSize: 12 }}>
        <label>Category:</label>
        <select value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <label>Title:</label>
        <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)} />

        <label>Creator:</label>
        <input type="text" value={form.creator} onChange={(e) => update("creator", e.target.value)} />

        <label>Released:</label>
        <input type="date" value={form.releaseDate} onChange={(e) => update("releaseDate", e.target.value)} />

        <label>Image:</label>
        <input type="text" value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} readOnly />

        <label>Rating:</label>
        <div><StarRating value={form.rating} onChange={(v) => update("rating", v)} /></div>

        <label>Review:</label>
        <textarea value={form.review} onChange={(e) => update("review", e.target.value)} rows={3} />
      </div>

      {form.imageUrl && (
        <img src={resolveImageUrl(form.imageUrl)!} alt="" style={{ maxHeight: 80, marginTop: 8 }} />
      )}

      <div className="flex gap-2 justify-end" style={{ marginTop: 12 }}>
        <button onClick={onCancel}>Cancel</button>
        <button onClick={handleSubmit} disabled={saving || !form.title.trim()}>
          {saving ? "Saving..." : submitLabel}
        </button>
      </div>
    </div>
  );
}
