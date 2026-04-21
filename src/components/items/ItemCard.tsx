"use client";

import type { Item } from "@/types";
import { StarRating } from "@/components/ui/StarRating";
import { resolveImageUrl } from "@/lib/image-url";

interface ItemCardProps {
  item: Item;
  onClick: () => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  return (
    <tr onClick={onClick} className="listview-row" style={{ cursor: "pointer" }}>
      <td style={{ width: 28, textAlign: "center" }}>
        {item.image_url ? (
          <img src={resolveImageUrl(item.image_url)!} alt="" style={{ width: 16, height: 16, objectFit: "cover", verticalAlign: "middle" }} />
        ) : (
          <span style={{ display: "inline-block", width: 16, height: 16, background: "#e8e6d2", verticalAlign: "middle" }} />
        )}
      </td>
      <td>{item.title}</td>
      <td style={{ color: "#555" }}>{item.creator || ""}</td>
      <td>
        {item.rating != null && item.rating > 0 && <StarRating value={item.rating} readonly size={12} />}
      </td>
      <td style={{ color: "#555" }}>{item.release_date?.slice(0, 4) || ""}</td>
      <td style={{ color: "#555" }}>{formatDate(item.updated_at)}</td>
    </tr>
  );
}
