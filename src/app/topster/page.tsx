"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useCategories } from "@/hooks/useCategories";
import { useItems } from "@/hooks/useItems";
import { TopsterGrid } from "@/components/topster/TopsterGrid";
import { exportTopsterAsImage, downloadImage } from "@/lib/topster";

export default function TopsterPage() {
  const { categories } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { items } = useItems(selectedCategoryId, "rating");

  const [gridSize, setGridSize] = useState(3);
  const [showCaptions, setShowCaptions] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!gridRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await exportTopsterAsImage(gridRef.current);
      downloadImage(dataUrl, `dbsein-topster-${gridSize}x${gridSize}.png`);
    } catch (e) {
      console.error("Export failed:", e);
    }
    setDownloading(false);
  };

  return (
    <div>
      <div className="window" style={{ margin: 0 }}>
        <div className="title-bar">
          <div className="title-bar-text">Topster</div>
          <div className="title-bar-controls">
            <button aria-label="Close" />
          </div>
        </div>
        <div className="window-body" style={{ padding: "4px 8px", margin: 0 }}>
          <div className="flex items-center gap-2 flex-wrap" style={{ fontSize: 12 }}>
            <Link href="/"><button>← Back</button></Link>

            <select
              value={selectedCategoryId || ""}
              onChange={(e) => setSelectedCategoryId(e.target.value || null)}
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <span>Grid:</span>
            {[3, 4, 5].map((size) => (
              <button
                key={size}
                onClick={() => setGridSize(size)}
                style={{ fontWeight: gridSize === size ? "bold" : "normal" }}
              >
                {size}x{size}
              </button>
            ))}

            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={showCaptions}
                onChange={(e) => setShowCaptions(e.target.checked)}
              />
              Captions
            </label>

            <button onClick={handleDownload} disabled={downloading}>
              {downloading ? "Saving..." : "Save PNG"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: 8, overflow: "auto" }}>
        <TopsterGrid ref={gridRef} items={items} gridSize={gridSize} showCaptions={showCaptions} />
      </div>
    </div>
  );
}
