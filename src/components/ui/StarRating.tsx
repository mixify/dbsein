"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
}

export function StarRating({ value, onChange, readonly = false }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={readonly ? "" : "cursor-pointer"}
          style={{ userSelect: "none" }}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(null)}
          onClick={(e) => {
            if (readonly || !onChange) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const isLeft = e.clientX - rect.left < rect.width / 2;
            onChange(isLeft ? star - 0.5 : star);
          }}
        >
          {display >= star ? "★" : "☆"}
        </span>
      ))}
      {value > 0 && <span style={{ marginLeft: 4, color: "#888" }}>{value.toFixed(1)}</span>}
    </span>
  );
}
