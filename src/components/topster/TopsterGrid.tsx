"use client";

import { forwardRef } from "react";
import type { Item } from "@/types";
import { resolveImageUrl } from "@/lib/image-url";

interface TopsterGridProps {
  items: Item[];
  gridSize: number;
  showCaptions: boolean;
}

export const TopsterGrid = forwardRef<HTMLDivElement, TopsterGridProps>(
  function TopsterGrid({ items, gridSize, showCaptions }, ref) {
    const cells = items.slice(0, gridSize * gridSize);
    const cellSize = 120;

    return (
      <div
        ref={ref}
        className="sunken-panel inline-block"
        style={{ padding: 4, background: "#000" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
            gap: 2,
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, i) => {
            const item = cells[i];
            return (
              <div
                key={i}
                style={{
                  position: "relative",
                  width: cellSize,
                  height: cellSize,
                  background: "#1a1a1a",
                }}
              >
                {item?.image_url ? (
                  <img
                    src={resolveImageUrl(item.image_url)!}
                    alt={item.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    crossOrigin="anonymous"
                  />
                ) : item ? (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    padding: 4,
                    textAlign: "center",
                    fontSize: 10,
                    color: "#666",
                  }}>
                    {item.title}
                  </div>
                ) : null}
                {showCaptions && item && (
                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "rgba(0,0,0,0.8)",
                    padding: "2px 4px",
                  }}>
                    <p style={{ fontSize: 9, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.title}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
