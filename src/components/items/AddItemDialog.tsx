"use client";

import { useState } from "react";
import type { Category, GeminiCandidate } from "@/types";
import { Dialog } from "@/components/ui/Dialog";
import { Spinner } from "@/components/ui/Spinner";
import { CandidateSelector } from "./CandidateSelector";
import { ImagePicker } from "./ImagePicker";
import { ItemForm } from "./ItemForm";

type Step = "search" | "candidates" | "image" | "form";

interface AddItemDialogProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  activeCategoryId: string | null;
  onSave: (data: {
    categoryId: string;
    title: string;
    creator?: string;
    releaseDate?: string;
    imageUrl?: string;
    rating?: number;
    review?: string;
  }) => Promise<boolean>;
}

export function AddItemDialog({
  open,
  onClose,
  categories,
  activeCategoryId,
  onSave,
}: AddItemDialogProps) {
  const [step, setStep] = useState<Step>("search");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [candidates, setCandidates] = useState<GeminiCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<GeminiCandidate | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [downloading, setDownloading] = useState(false);

  const reset = () => {
    setStep("search");
    setQuery("");
    setCandidates([]);
    setSelectedCandidate(null);
    setSelectedImageUrl("");
    setSearching(false);
    setDownloading(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: query.trim(),
          categories: categories.map((c) => c.name),
        }),
      });
      const data = await res.json();
      setCandidates(data.candidates || []);
      setStep("candidates");
    } catch {
      setCandidates([]);
      setStep("candidates");
    }
    setSearching(false);
  };

  const handleSelectCandidate = (candidate: GeminiCandidate) => {
    setSelectedCandidate(candidate);
    if (candidate.image_search_query) {
      setStep("image");
    } else {
      setStep("form");
    }
  };

  const handleSelectImage = async (url: string) => {
    setDownloading(true);
    const tempId = Date.now().toString(36);
    try {
      const res = await fetch("/api/download-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, id: tempId }),
      });
      const data = await res.json();
      if (data.path) {
        setSelectedImageUrl(data.path);
      }
    } catch {
      setSelectedImageUrl(url);
    }
    setDownloading(false);
    setStep("form");
  };

  const handleSave = async (data: {
    categoryId: string;
    title: string;
    creator: string;
    releaseDate: string;
    imageUrl: string;
    rating: number;
    review: string;
  }) => {
    const ok = await onSave({
      categoryId: data.categoryId,
      title: data.title,
      creator: data.creator || undefined,
      releaseDate: data.releaseDate || undefined,
      imageUrl: data.imageUrl || undefined,
      rating: data.rating || undefined,
      review: data.review || undefined,
    });
    if (ok) handleClose();
  };

  const matchedCategory = selectedCandidate
    ? categories.find((c) => c.name === selectedCandidate.category)
    : null;

  return (
    <Dialog open={open} onClose={handleClose} title="Add Item">
      {step === "search" && (
        <fieldset>
          <legend>Search</legend>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter title..."
              style={{ flex: 1 }}
              autoFocus
            />
            <button onClick={handleSearch} disabled={searching || !query.trim()}>
              {searching ? <Spinner /> : "Search"}
            </button>
          </div>
          <button
            onClick={() => { setSelectedCandidate(null); setStep("form"); }}
            style={{ marginTop: 8, fontSize: 12 }}
          >
            Manual Entry
          </button>
        </fieldset>
      )}

      {step === "candidates" && (
        <div>
          <CandidateSelector candidates={candidates} onSelect={handleSelectCandidate} />
          <div className="flex gap-2" style={{ marginTop: 8 }}>
            <button onClick={() => setStep("search")}>Back</button>
            <button onClick={() => { setSelectedCandidate(null); setStep("form"); }}>Manual</button>
          </div>
        </div>
      )}

      {step === "image" && selectedCandidate && (
        downloading ? (
          <div style={{ padding: 8 }}><Spinner /></div>
        ) : (
          <ImagePicker
            searchQuery={selectedCandidate.image_search_query}
            onSelect={handleSelectImage}
            onSkip={() => setStep("form")}
          />
        )
      )}

      {step === "form" && (
        <ItemForm
          categories={categories}
          initialData={
            selectedCandidate
              ? {
                  categoryId: matchedCategory?.id || activeCategoryId || categories[0]?.id,
                  title: selectedCandidate.title,
                  creator: selectedCandidate.creator,
                  releaseDate: selectedCandidate.release_date,
                  imageUrl: selectedImageUrl,
                }
              : {
                  categoryId: activeCategoryId || categories[0]?.id,
                  title: query,
                }
          }
          onSubmit={handleSave}
          onCancel={() => setStep(candidates.length > 0 ? "candidates" : "search")}
        />
      )}
    </Dialog>
  );
}
