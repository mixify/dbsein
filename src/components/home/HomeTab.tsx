"use client";

import { useState, useEffect, useRef } from "react";
import type { Category, GeminiCandidate } from "@/types";
import { Spinner } from "@/components/ui/Spinner";
import { CandidateSelector } from "@/components/items/CandidateSelector";
import { ImagePicker } from "@/components/items/ImagePicker";
import { ItemForm } from "@/components/items/ItemForm";
import { Dialog } from "@/components/ui/Dialog";
import { TopsterGrid } from "@/components/topster/TopsterGrid";
import { useItems } from "@/hooks/useItems";
import { exportTopsterAsImage, downloadImage } from "@/lib/topster";

interface HomeTabProps {
  authorized: boolean;
  categories: Category[];
  onAddItem: (data: {
    categoryId: string;
    title: string;
    creator?: string;
    releaseDate?: string;
    imageUrl?: string;
    rating?: number;
    review?: string;
  }) => Promise<boolean>;
  onAddCategory: (name: string) => Promise<boolean>;
  onRenameCategory: (id: string, name: string) => Promise<boolean>;
  onDeleteCategory: (id: string) => Promise<boolean>;
}

type SearchStep = "idle" | "searching" | "candidates" | "image" | "form";

export function HomeTab({
  authorized,
  categories,
  onAddItem,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
}: HomeTabProps) {
  // Profile
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(setProfile);
  }, []);

  const saveProfile = async (key: string, value: string) => {
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    setProfile(prev => ({ ...prev, [key]: value }));
    setEditingField(null);
  };

  // Search
  const [searchStep, setSearchStep] = useState<SearchStep>("idle");
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<GeminiCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<GeminiCandidate | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearchStep("searching");
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: query.trim(), categories: categories.map(c => c.name) }),
      });
      const data = await res.json();
      setCandidates(data.candidates || []);
      setSearchStep("candidates");
    } catch {
      setCandidates([]);
      setSearchStep("candidates");
    }
  };

  const handleSelectCandidate = (c: GeminiCandidate) => {
    setSelectedCandidate(c);
    setSearchStep(c.image_search_query ? "image" : "form");
  };

  const handleSelectImage = async (url: string) => {
    const tempId = Date.now().toString(36);
    try {
      const res = await fetch("/api/download-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, id: tempId }),
      });
      const data = await res.json();
      if (data.path) setSelectedImageUrl(data.path);
    } catch {
      setSelectedImageUrl(url);
    }
    setSearchStep("form");
  };

  const handleSave = async (data: {
    categoryId: string; title: string; creator: string;
    releaseDate: string; imageUrl: string; rating: number; review: string;
  }) => {
    const ok = await onAddItem({
      categoryId: data.categoryId, title: data.title,
      creator: data.creator || undefined, releaseDate: data.releaseDate || undefined,
      imageUrl: data.imageUrl || undefined, rating: data.rating || undefined,
      review: data.review || undefined,
    });
    if (ok) {
      setSearchStep("idle");
      setQuery("");
      setCandidates([]);
      setSelectedCandidate(null);
      setSelectedImageUrl("");
    }
  };

  const matchedCategory = selectedCandidate
    ? categories.find(c => c.name === selectedCandidate.category)
    : null;

  // Dialogs
  const [showCategories, setShowCategories] = useState(false);
  const [showTopster, setShowTopster] = useState(false);

  // Category management
  const [newCatName, setNewCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

  // Topster
  const [topsterCatId, setTopsterCatId] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState(3);
  const [showCaptions, setShowCaptions] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const { items: topsterItems } = useItems(topsterCatId, "rating_desc");
  const gridRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!gridRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await exportTopsterAsImage(gridRef.current);
      downloadImage(dataUrl, `dbsein-topster-${gridSize}x${gridSize}.png`);
    } catch (e) { console.error(e); }
    setDownloading(false);
  };

  const ProfileField = ({ label, fieldKey, tag: Tag = "span" }: { label: string; fieldKey: string; tag?: "span" | "h1" }) => {
    if (editingField === fieldKey) {
      return (
        <span>
          <input
            type="text"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") saveProfile(fieldKey, editValue);
              if (e.key === "Escape") setEditingField(null);
            }}
            autoFocus
            style={{ fontFamily: "inherit", fontSize: "inherit", border: "1px dashed #999", padding: "0 4px", background: "transparent" }}
          />
          {" "}
          <a href="#" onClick={e => { e.preventDefault(); saveProfile(fieldKey, editValue); }} style={{ fontSize: 11 }}>save</a>
        </span>
      );
    }
    return (
      <Tag style={Tag === "h1" ? { margin: 0, fontSize: 24 } : {}}>
        {profile[fieldKey] || label}
        {authorized && (
          <>
            {" "}
            <a
              href="#"
              onClick={e => { e.preventDefault(); setEditingField(fieldKey); setEditValue(profile[fieldKey] || ""); }}
              style={{ fontSize: 10, color: "#999" }}
            >
              [edit]
            </a>
          </>
        )}
      </Tag>
    );
  };

  return (
    <div style={{
      fontFamily: "Arial, Helvetica, sans-serif",
      fontSize: 13,
      lineHeight: 1.6,
      padding: "20px 30px",
      maxWidth: 640,
      color: "#333",
    }}>
      {/* Profile */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <ProfileField label="DBSein" fieldKey="name" tag="h1" />
        <p style={{ color: "#888", margin: "4px 0 0", fontStyle: "italic" }}>
          <ProfileField label="my collection" fieldKey="bio" />
        </p>
        <hr style={{ border: "none", borderTop: "1px dashed #ccc", margin: "16px 0" }} />
      </div>

      {/* Search */}
      {authorized && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: "bold", marginBottom: 6 }}>+ add new item</p>

          {searchStep === "idle" && (
            <div>
              <div style={{ display: "flex", gap: 4 }}>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder="search title..."
                  style={{ flex: 1, padding: "4px 6px", border: "1px solid #ccc", fontSize: 13 }}
                />
                <button onClick={handleSearch} disabled={!query.trim()}>search</button>
              </div>
              <p style={{ margin: "6px 0 0" }}>
                <a href="#" onClick={e => { e.preventDefault(); setSelectedCandidate(null); setSearchStep("form"); }} style={{ fontSize: 12 }}>
                  or enter manually...
                </a>
              </p>
            </div>
          )}

          {searchStep === "searching" && <Spinner />}

          {searchStep === "candidates" && (
            <div>
              <CandidateSelector candidates={candidates} onSelect={handleSelectCandidate} />
              <p style={{ marginTop: 8 }}>
                <a href="#" onClick={e => { e.preventDefault(); setSearchStep("idle"); }} style={{ fontSize: 12 }}>back</a>
                {" | "}
                <a href="#" onClick={e => { e.preventDefault(); setSelectedCandidate(null); setSearchStep("form"); }} style={{ fontSize: 12 }}>manual entry</a>
              </p>
            </div>
          )}

          {searchStep === "image" && selectedCandidate && (
            <ImagePicker
              searchQuery={selectedCandidate.image_search_query}
              onSelect={handleSelectImage}
              onSkip={() => setSearchStep("form")}
            />
          )}

          {searchStep === "form" && (
            <ItemForm
              categories={categories}
              initialData={
                selectedCandidate
                  ? {
                      categoryId: matchedCategory?.id || categories[0]?.id,
                      title: selectedCandidate.title,
                      creator: selectedCandidate.creator,
                      releaseDate: selectedCandidate.release_date,
                      imageUrl: selectedImageUrl,
                    }
                  : { categoryId: categories[0]?.id, title: query }
              }
              onSubmit={handleSave}
              onCancel={() => setSearchStep("idle")}
            />
          )}

          <hr style={{ border: "none", borderTop: "1px dashed #ccc", margin: "16px 0" }} />
        </div>
      )}

      {/* Links */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontWeight: "bold", marginBottom: 6 }}>links</p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li style={{ marginBottom: 4 }}>
            <a href="#" onClick={e => { e.preventDefault(); setShowTopster(true); }}>
              topster - generate a grid image of your favorites
            </a>
          </li>
          {authorized && (
            <li style={{ marginBottom: 4 }}>
              <a href="#" onClick={e => { e.preventDefault(); setShowCategories(true); }}>
                edit categories - add, rename, delete categories
              </a>
            </li>
          )}
          <li style={{ marginBottom: 4 }}>
            <a href="https://github.com/mixify/dbsein" target="_blank">
              github - source code
            </a>
          </li>
        </ul>
      </div>

      <hr style={{ border: "none", borderTop: "1px dashed #ccc", margin: "16px 0" }} />

      <p style={{ fontSize: 10, color: "#aaa", textAlign: "center" }}>
        powered by gemini + xp.css
      </p>

      {/* Category Dialog */}
      {authorized && (
        <Dialog open={showCategories} onClose={() => setShowCategories(false)} title="Edit Categories" width={320}>
          <div className="field-row" style={{ gap: 4, marginBottom: 8 }}>
            <input
              type="text"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && newCatName.trim()) { onAddCategory(newCatName.trim()); setNewCatName(""); } }}
              placeholder="New category"
              style={{ flex: 1 }}
            />
            <button onClick={() => { if (newCatName.trim()) { onAddCategory(newCatName.trim()); setNewCatName(""); } }}>Add</button>
          </div>
          <ul className="tree-view" style={{ height: 120, overflow: "auto" }}>
            {categories.map(cat => (
              <li
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                style={{
                  padding: "2px 4px", cursor: "pointer",
                  background: selectedCatId === cat.id ? "#316ac5" : "transparent",
                  color: selectedCatId === cat.id ? "#fff" : "inherit",
                }}
              >
                {editingCatId === cat.id ? (
                  <span onClick={e => e.stopPropagation()}>
                    <input type="text" value={editingCatName} onChange={e => setEditingCatName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { onRenameCategory(cat.id, editingCatName); setEditingCatId(null); } }}
                      style={{ width: 100 }} autoFocus />
                    <button onClick={() => { onRenameCategory(cat.id, editingCatName); setEditingCatId(null); }}>OK</button>
                    <button onClick={() => setEditingCatId(null)}>Cancel</button>
                  </span>
                ) : cat.name}
              </li>
            ))}
          </ul>
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <button disabled={!selectedCatId} onClick={() => {
              const cat = categories.find(c => c.id === selectedCatId);
              if (cat) { setEditingCatId(cat.id); setEditingCatName(cat.name); }
            }}>Rename</button>
            <button disabled={!selectedCatId} onClick={() => {
              if (selectedCatId && confirm("Delete category and all items?")) {
                onDeleteCategory(selectedCatId); setSelectedCatId(null);
              }
            }}>Delete</button>
          </div>
        </Dialog>
      )}

      {/* Topster Dialog */}
      <Dialog open={showTopster} onClose={() => setShowTopster(false)} title="Topster" width={500}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
          <select value={topsterCatId || ""} onChange={e => setTopsterCatId(e.target.value || null)}>
            <option value="">All</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {[3, 4, 5].map(s => (
            <button key={s} onClick={() => setGridSize(s)} style={{ fontWeight: gridSize === s ? "bold" : "normal" }}>{s}x{s}</button>
          ))}
          <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input type="checkbox" checked={showCaptions} onChange={e => setShowCaptions(e.target.checked)} />
            Captions
          </label>
          <button onClick={handleDownload} disabled={downloading}>
            {downloading ? "Saving..." : "Save PNG"}
          </button>
        </div>
        <div style={{ overflow: "auto" }}>
          <TopsterGrid ref={gridRef} items={topsterItems} gridSize={gridSize} showCaptions={showCaptions} />
        </div>
      </Dialog>
    </div>
  );
}
