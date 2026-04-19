"use client";

import type { Item } from "@/types";
import { StarRating } from "@/components/ui/StarRating";

interface ItemCardProps {
  item: Item;
  onClick: () => void;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  return (
    <tr onClick={onClick} style={{ cursor: "pointer" }} className="hover:bg-[#000080] hover:text-white">
      <td style={{ width: 32, padding: 2 }}>
        {item.image_url ? (
          <img src={item.image_url} alt="" style={{ width: 24, height: 24, objectFit: "cover" }} />
        ) : (
          <span style={{ display: "inline-block", width: 24, height: 24, background: "#c0c0c0" }} />
        )}
      </td>
      <td style={{ padding: "2px 4px", fontSize: 12 }}>{item.title}</td>
      <td style={{ padding: "2px 4px", fontSize: 12, color: "#888" }}>{item.creator || ""}</td>
      <td style={{ padding: "2px 4px", fontSize: 12 }}>
        {item.rating != null && item.rating > 0 && <StarRating value={item.rating} readonly />}
      </td>
      <td style={{ padding: "2px 4px", fontSize: 12, color: "#888" }}>
        {item.release_date?.slice(0, 4) || ""}
      </td>
    </tr>
  );
}
