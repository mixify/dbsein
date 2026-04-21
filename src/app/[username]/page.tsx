"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import type { Item, Category } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { ItemList } from "@/components/items/ItemList";
import { ItemDetail } from "@/components/items/ItemDetail";
import { Dialog } from "@/components/ui/Dialog";
import { TopsterGrid } from "@/components/topster/TopsterGrid";
import { exportTopsterAsImage, downloadImage } from "@/lib/topster";

export default function UserPage() {
  const { username } = useParams<{ username: string }>();
  const { authorized, username: currentUser } = useAuth();
  const isOwner = authorized && currentUser === username;

  const [profile, setProfile] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [sort, setSort] = useState("updated_at_desc");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Topster
  const [showTopster, setShowTopster] = useState(false);
  const [topsterCatId, setTopsterCatId] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState(3);
  const [showCaptions, setShowCaptions] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [topsterItems, setTopsterItems] = useState<Item[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [profileRes, catRes] = await Promise.all([
        fetch(`/api/profile?username=${username}`),
        fetch(`/api/categories?username=${username}`),
      ]);
      if (!catRes.ok) { setNotFound(true); setLoading(false); return; }
      const cats = await catRes.json();
      if (cats.length === 0) { setNotFound(true); setLoading(false); return; }
      setProfile(await profileRes.json());
      setCategories(cats);
      setActiveTab(cats[0]?.id || null);
      setNotFound(false);
      setLoading(false);
    })();
  }, [username]);

  // Fetch items when tab/sort changes
  useEffect(() => {
    if (!activeTab) return;
    (async () => {
      const res = await fetch(`/api/items?username=${username}&categoryId=${activeTab}&sort=${sort}`);
      if (res.ok) setItems(await res.json());
    })();
  }, [username, activeTab, sort]);

  // Fetch topster items
  useEffect(() => {
    if (!showTopster) return;
    (async () => {
      const params = new URLSearchParams({ username, sort: "rating_desc" });
      if (topsterCatId) params.set("categoryId", topsterCatId);
      const res = await fetch(`/api/items?${params}`);
      if (res.ok) setTopsterItems(await res.json());
    })();
  }, [showTopster, topsterCatId, username]);

  const handleTopsterDownload = async () => {
    if (!gridRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await exportTopsterAsImage(gridRef.current);
      downloadImage(dataUrl, `${username}-topster-${gridSize}x${gridSize}.png`);
    } catch (e) { console.error(e); }
    setDownloading(false);
  };

  if (loading) return <div style={{ padding: 16, fontSize: 11 }}>Loading...</div>;
  if (notFound) return (
    <div className="window" style={{ width: 300, margin: "100px auto" }}>
      <div className="title-bar">
        <div className="title-bar-text">Error</div>
      </div>
      <div className="window-body">
        <p>User &quot;{username}&quot; not found.</p>
        <button onClick={() => window.location.href = "/"}>OK</button>
      </div>
    </div>
  );

  return (
    <div className="window" style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="title-bar">
        <div className="title-bar-text">{profile.name || username}&apos;s collection</div>
        <div className="title-bar-controls">
          <button aria-label="Close" onClick={() => window.location.href = "/"} />
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ padding: "2px 4px", background: "#ece9d8", borderBottom: "1px solid #aca899", display: "flex", gap: 4, alignItems: "center", fontSize: 11 }}>
        <button onClick={() => window.location.href = "/"}>← Home</button>
        <button onClick={() => setShowTopster(true)}>Topster</button>
      </div>

      <section className="tabs tabs-fill">
        <menu role="tablist">
          {categories.map(cat => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={activeTab === cat.id}
              onClick={() => setActiveTab(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </menu>
        {categories.map(cat => (
          <article
            key={cat.id}
            role="tabpanel"
            hidden={activeTab !== cat.id || undefined}
          >
            <ItemList
              items={items}
              loading={false}
              sort={sort}
              onSortChange={setSort}
              onItemClick={setSelectedItem}
            />
          </article>
        ))}
      </section>

      <div className="status-bar">
        <p className="status-bar-field">{items.length} items</p>
        <p className="status-bar-field">{username}</p>
        <p className="status-bar-field">{isOwner ? "Owner" : "Visitor"}</p>
      </div>

      {/* Item Detail (read-only for visitors) */}
      <ItemDetail
        item={selectedItem}
        categories={categories}
        onClose={() => setSelectedItem(null)}
        onUpdate={async () => false}
        onDelete={async () => false}
        authorized={isOwner}
      />

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
          <button onClick={handleTopsterDownload} disabled={downloading}>
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
