"use client";

import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/Spinner";

interface ImagePickerProps {
  searchQuery: string;
  onSelect: (url: string) => void;
  onSkip: () => void;
}

export function ImagePicker({ searchQuery, onSelect, onSkip }: ImagePickerProps) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/image-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchQuery }),
        });
        const data = await res.json();
        setImages(data.images || []);
      } catch {
        setImages([]);
      }
      setLoading(false);
    })();
  }, [searchQuery]);

  if (loading) {
    return <div style={{ padding: 8 }}><Spinner /></div>;
  }

  if (images.length === 0) {
    return (
      <div>
        <p style={{ fontSize: 12 }}>No images found.</p>
        <button onClick={onSkip} style={{ marginTop: 8 }}>Skip</button>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: 12, marginBottom: 4 }}>Select an image:</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
        {images.map((url, i) => (
          <button
            key={i}
            onClick={() => onSelect(url)}
            style={{ padding: 0, border: "2px outset #c0c0c0", background: "#c0c0c0", cursor: "pointer" }}
            className="hover:border-[#000080]"
          >
            <img
              src={url}
              alt=""
              style={{ width: "100%", height: 72, objectFit: "cover", display: "block" }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </button>
        ))}
      </div>
      <button onClick={onSkip} style={{ marginTop: 8 }}>Skip</button>
    </div>
  );
}
