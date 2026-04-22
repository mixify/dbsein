"use client";

import { useState, useEffect } from "react";
import type { Category, GeminiCandidate } from "@/types";
import { Spinner } from "@/components/ui/Spinner";
import { SeaBackground } from "@/components/home/SeaBackground";
import { CandidateSelector } from "@/components/items/CandidateSelector";
import { ImagePicker } from "@/components/items/ImagePicker";
import { ItemForm } from "@/components/items/ItemForm";

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
  onOpenCategories: () => void;
  onOpenTopster: () => void;
}

type SearchStep = "idle" | "searching" | "candidates" | "image" | "form";

export function HomeTab({
  authorized,
  categories,
  onAddItem,
  onOpenCategories,
  onOpenTopster,
}: HomeTabProps) {
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const [searchStep, setSearchStep] = useState<SearchStep>("idle");
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<GeminiCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<GeminiCandidate | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");

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

  const s = {
    page: { position: "relative" as const, color: "#e0e8f0", fontFamily: "arial, sans-serif", fontSize: 13, minHeight: "100%", display: "flex", flexDirection: "column" as const, alignItems: "center", overflow: "hidden" },
    top: { position: "relative" as const, zIndex: 1, width: "100%", textAlign: "right" as const, padding: "4px 8px", fontSize: 11, color: "rgba(255,255,255,0.6)" },
    center: { position: "relative" as const, zIndex: 1, flex: 1, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", width: "100%", maxWidth: 500, padding: "0 16px" },
    searchBox: { display: "flex", width: "100%", marginBottom: 8 },
    input: { flex: 1, padding: "5px 8px", fontSize: 13, border: "1px solid #cdcdcd" },
    btn: { padding: "5px 12px", fontSize: 12, background: "#f2f2f2", border: "1px solid #cdcdcd", cursor: "pointer", whiteSpace: "nowrap" as const },
    btnPrimary: { padding: "5px 16px", fontSize: 12, background: "#4285f4", color: "#fff", border: "1px solid #3079ed", cursor: "pointer", fontWeight: "bold" as const },
    links: { display: "flex", gap: 12, justifyContent: "center", margin: "12px 0", fontSize: 12 },
    a: { color: "#88bbff", textDecoration: "none" },
    footer: { position: "relative" as const, zIndex: 1, padding: "8px", fontSize: 11, color: "rgba(255,255,255,0.4)", textAlign: "center" as const, borderTop: "1px solid rgba(255,255,255,0.1)", width: "100%" },
    resultArea: { width: "100%", textAlign: "left" as const, marginTop: 8 },
  };

  const renderField = (key: string, label: string) => {
    if (editingField === key) {
      return (
        <span>
          <input
            type="text" value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") saveProfile(key, editValue); if (e.key === "Escape") setEditingField(null); }}
            autoFocus style={{ fontSize: "inherit", border: "1px solid #cdcdcd", padding: "1px 4px" }}
          />
          {" "}<a href="#" onClick={e => { e.preventDefault(); saveProfile(key, editValue); }} style={s.a}>save</a>
        </span>
      );
    }
    return (
      <>
        {profile[key] || label}
        {authorized && (
          <> <a href="#" onClick={e => { e.preventDefault(); setEditingField(key); setEditValue(profile[key] || ""); }} style={{ ...s.a, fontSize: 10 }}>[edit]</a></>
        )}
      </>
    );
  };

  return (
    <div style={s.page}>
      <SeaBackground />

      {/* Content over background */}
      {/* Top right links */}
      <div style={s.top}>
        <a href="https://github.com/mixify/dbsein" target="_blank" style={s.a}>GitHub</a>
      </div>

      {/* Center */}
      <div style={s.center}>
        <h1 style={{ fontSize: 36, fontWeight: "bold", margin: "0 0 8px", letterSpacing: -1 }}>DBSein</h1>
        {/* Search */}
        {authorized && searchStep === "idle" && (
          <>
            <div style={s.searchBox}>
              <input
                type="text" value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder=""
                style={s.input}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleSearch} disabled={!query.trim()}>
                I&apos;m Always Lucky
              </button>
            </div>

            <p style={{ marginTop: 20, fontSize: 12, color: "#666" }}>
              기록하고 싶은 범주를 추가/삭제 해보세요. <a href="#" onClick={e => { e.preventDefault(); onOpenCategories(); }} style={s.a}>Categories</a>
            </p>
            <p style={{ fontSize: 12, color: "#666" }}>
              <a href="#" onClick={e => { e.preventDefault(); onOpenTopster(); }} style={s.a}>Topster</a>
            </p>
          </>
        )}

        {searchStep === "searching" && (
          <div style={{ width: "100%", maxWidth: 500, padding: "0 16px" }}>
            <Spinner slow />
          </div>
        )}

        {searchStep === "candidates" && (
          <div style={s.resultArea}>
            <CandidateSelector candidates={candidates} onSelect={handleSelectCandidate} />
            <p style={{ marginTop: 8, fontSize: 12 }}>
              <a href="#" onClick={e => { e.preventDefault(); setSearchStep("idle"); }} style={s.a}>back</a>
              {" · "}
              <a href="#" onClick={e => { e.preventDefault(); setSelectedCandidate(null); setSearchStep("form"); }} style={s.a}>manual entry</a>
            </p>
          </div>
        )}

        {searchStep === "image" && selectedCandidate && (
          <div style={s.resultArea}>
            <ImagePicker
              searchQuery={selectedCandidate.image_search_query}
              onSelect={handleSelectImage}
              onSkip={() => setSearchStep("form")}
            />
          </div>
        )}

        {searchStep === "form" && (
          <div style={s.resultArea}>
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
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={s.footer}>
        <form onSubmit={e => { e.preventDefault(); const input = (e.target as HTMLFormElement).elements.namedItem("visit") as HTMLInputElement; if (input.value.trim()) window.location.href = `/${input.value.trim()}`; }}
          style={{ marginBottom: 4 }}>
          <input name="visit" type="text" placeholder="visit user..." style={{ fontSize: 11, padding: "2px 4px", border: "1px solid #cdcdcd", width: 120 }} />
          {" "}
          <button type="submit" style={{ fontSize: 11 }}>Go</button>
        </form>
        &copy; DBSein · powered by Gemini
      </div>
    </div>
  );
}
