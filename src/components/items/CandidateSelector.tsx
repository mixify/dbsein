"use client";

import type { GeminiCandidate } from "@/types";

interface CandidateSelectorProps {
  candidates: GeminiCandidate[];
  onSelect: (candidate: GeminiCandidate) => void;
}

export function CandidateSelector({ candidates, onSelect }: CandidateSelectorProps) {
  if (candidates.length === 0) {
    return <p style={{ fontSize: 12 }}>No results found.</p>;
  }

  return (
    <div>
      <p style={{ fontSize: 12, marginBottom: 4 }}>Select a result:</p>
      <ul className="tree-view" style={{ padding: 4 }}>
        {candidates.map((c, i) => (
          <li key={i}>
            <button
              onClick={() => onSelect(c)}
              style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", width: "100%", padding: "2px 4px", fontSize: 12 }}
              className="hover:bg-[#000080] hover:text-white"
            >
              {c.title} — {c.creator} · {c.release_date?.slice(0, 4)} · {c.category}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
