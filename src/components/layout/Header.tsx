"use client";

import Link from "next/link";
import type { SortMode } from "@/types";

interface HeaderProps {
  sort: SortMode;
  onSortChange: (mode: SortMode) => void;
}

export function Header({ sort, onSortChange }: HeaderProps) {
  return (
    <div className="window" style={{ margin: 0 }}>
      <div className="title-bar">
        <div className="title-bar-text">DBSein</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" />
          <button aria-label="Maximize" />
          <button aria-label="Close" />
        </div>
      </div>
      <div className="window-body flex items-center justify-between" style={{ padding: "4px 8px", margin: 0 }}>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" style={{ fontSize: 12 }}>Sort:</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortMode)}
            style={{ fontSize: 12 }}
          >
            <option value="reviewed_at">Recent</option>
            <option value="rating">Rating</option>
            <option value="release_date">Release</option>
          </select>
        </div>
        <Link href="/topster">
          <button style={{ fontSize: 12 }}>Topster</button>
        </Link>
      </div>
    </div>
  );
}
