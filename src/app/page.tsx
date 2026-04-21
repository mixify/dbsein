"use client";

import { useState, useRef } from "react";
import type { Item } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { useItems } from "@/hooks/useItems";
import { HomeTab } from "@/components/home/HomeTab";
import { ItemList } from "@/components/items/ItemList";
import { ItemDetail } from "@/components/items/ItemDetail";
import { Dialog } from "@/components/ui/Dialog";
import { TopsterGrid } from "@/components/topster/TopsterGrid";
import { exportTopsterAsImage, downloadImage } from "@/lib/topster";

export default function MainPage() {
  const { authorized, username, checked, login, register, logout } = useAuth();
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [sort, setSort] = useState("updated_at_desc");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [showHelp, setShowHelp] = useState(false);

  const { categories, loading: catLoading, addCategory, renameCategory, deleteCategory } =
    useCategories();

  const activeCategoryId = activeTab === "home" ? null : activeTab;

  const { items, loading: itemsLoading, addItem, updateItem, deleteItem } =
    useItems(activeCategoryId, sort);

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

  const handleTopsterDownload = async () => {
    if (!gridRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await exportTopsterAsImage(gridRef.current);
      downloadImage(dataUrl, `dbsein-topster-${gridSize}x${gridSize}.png`);
    } catch (e) { console.error(e); }
    setDownloading(false);
  };

  if (catLoading) {
    return <div style={{ padding: 16, fontSize: 11 }}>Loading...</div>;
  }

  const tabs = [
    { id: "home", label: "Home" },
    ...categories.map(c => ({ id: c.id, label: c.name })),
  ];

  return (
    <div className="window" style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="title-bar">
        <div className="title-bar-text">DBSein</div>
        <div className="title-bar-controls">
          <button aria-label="Help" onClick={() => setShowHelp(true)} />
          <button aria-label="Close" />
        </div>
      </div>

      <section className="tabs tabs-fill">
        <menu role="tablist">
          {tabs.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </menu>

        {/* Home tab */}
        <article
          role="tabpanel"
          id="tab-home"
          hidden={activeTab !== "home" || undefined}
        >
          <HomeTab
            authorized={authorized}
            categories={categories}
            onAddItem={addItem}
            onOpenCategories={() => setShowCategories(true)}
            onOpenTopster={() => setShowTopster(true)}
          />
        </article>

        {/* Category tabs */}
        {categories.map(cat => (
          <article
            key={cat.id}
            role="tabpanel"
            id={`tab-${cat.id}`}
            hidden={activeTab !== cat.id || undefined}
          >
            <ItemList
              items={items}
              loading={itemsLoading}
              sort={sort}
              onSortChange={setSort}
              onItemClick={setSelectedItem}
            />
          </article>
        ))}
      </section>

      <div className="status-bar">
        <p className="status-bar-field">
          {activeTab === "home" ? "Home" : `${items.length} items`}
        </p>
        <p className="status-bar-field">
          {tabs.find(t => t.id === activeTab)?.label || ""}
        </p>
        <p className="status-bar-field">
          {authorized ? (
            <>{username} · <a href="#" onClick={e => { e.preventDefault(); logout(); }} style={{ color: "inherit" }}>logout</a></>
          ) : (
            <a href="#" onClick={e => { e.preventDefault(); setLoginError(""); }} style={{ color: "inherit" }}>login</a>
          )}
        </p>
      </div>

      {/* Item Detail */}
      <ItemDetail
        item={selectedItem}
        categories={categories}
        onClose={() => setSelectedItem(null)}
        onUpdate={updateItem}
        onDelete={deleteItem}
        authorized={authorized}
      />

      {/* Categories Dialog */}
      <Dialog open={showCategories} onClose={() => setShowCategories(false)} title="Edit Categories" width={320}>
        <div className="field-row" style={{ gap: 4, marginBottom: 8 }}>
          <input type="text" value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && newCatName.trim()) { addCategory(newCatName.trim()); setNewCatName(""); } }}
            placeholder="New category" style={{ flex: 1 }} />
          <button onClick={() => { if (newCatName.trim()) { addCategory(newCatName.trim()); setNewCatName(""); } }}>Add</button>
        </div>
        <ul className="tree-view" style={{ height: 120, overflow: "auto" }}>
          {categories.map(cat => (
            <li key={cat.id} onClick={() => setSelectedCatId(cat.id)}
              style={{ padding: "2px 4px", cursor: "pointer",
                background: selectedCatId === cat.id ? "#316ac5" : "transparent",
                color: selectedCatId === cat.id ? "#fff" : "inherit" }}>
              {editingCatId === cat.id ? (
                <span onClick={e => e.stopPropagation()}>
                  <input type="text" value={editingCatName} onChange={e => setEditingCatName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { renameCategory(cat.id, editingCatName); setEditingCatId(null); } }}
                    style={{ width: 100 }} autoFocus />
                  <button onClick={() => { renameCategory(cat.id, editingCatName); setEditingCatId(null); }}>OK</button>
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
              deleteCategory(selectedCatId); setSelectedCatId(null);
            }
          }}>Delete</button>
        </div>
      </Dialog>

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

      {/* Help Dialog */}
      <Dialog open={showHelp} onClose={() => setShowHelp(false)} title="DBSein 도움말" width={420}>
        <p><b>DBSein</b> — LLM을 DB처럼 쓰는 리뷰/로깅 앱</p>
        <p style={{ color: "#666" }}>작품명만 입력하면 LLM이 제작자, 출시일 등 메타정보를 자동으로 채워줍니다.</p>
        <fieldset style={{ marginTop: 8 }}>
          <legend>사용법</legend>
          <ol style={{ margin: "4px 0", paddingLeft: 20 }}>
            <li><b>jtoome</b> 탭에서 작품명을 검색하면 LLM이 정보를 채워줍니다</li>
            <li>카테고리 탭을 클릭해서 목록을 확인하세요</li>
            <li>컬럼 헤더를 클릭하면 정렬됩니다 (한 번 더 클릭하면 반대로)</li>
            <li>항목을 클릭하면 상세보기 / 수정 / 삭제가 가능합니다</li>
          </ol>
        </fieldset>
        <fieldset style={{ marginTop: 8 }}>
          <legend>카테고리</legend>
          <p style={{ margin: "4px 0" }}>카테고리를 추가하면 <b>LLM이 추가된 카테고리도 포함해서 추론</b>합니다.</p>
          <p style={{ margin: "4px 0" }}><b>예시:</b> 게임, 드라마, 미애니(일애니와 구분), 공연, 전시, 맛집</p>
        </fieldset>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <a href="https://github.com/mixify/dbsein" target="_blank" style={{ fontSize: 11 }}>GitHub</a>
          <button onClick={() => setShowHelp(false)}>확인</button>
        </div>
      </Dialog>

      {/* Login/Register Dialog */}
      <Dialog open={checked && !authorized} onClose={() => {}} title={isRegister ? "Register" : "Login"} width={300}>
        <div className="field-row-stacked" style={{ marginBottom: 6 }}>
          <label>Username:</label>
          <input type="text" value={loginUser} onChange={e => setLoginUser(e.target.value)}
            onKeyDown={e => e.key === "Enter" && document.getElementById("login-pass")?.focus()} />
        </div>
        <div className="field-row-stacked" style={{ marginBottom: 6 }}>
          <label>Password:</label>
          <input id="login-pass" type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)}
            onKeyDown={async e => {
              if (e.key === "Enter") {
                const err = isRegister
                  ? await register(loginUser, loginPass)
                  : await login(loginUser, loginPass);
                setLoginError(err || "");
              }
            }} />
        </div>
        {loginError && <p style={{ color: "red", fontSize: 11, margin: "4px 0" }}>{loginError}</p>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <a href="#" onClick={e => { e.preventDefault(); setIsRegister(!isRegister); setLoginError(""); }} style={{ fontSize: 11 }}>
            {isRegister ? "already have an account?" : "create account"}
          </a>
          <button onClick={async () => {
            const err = isRegister
              ? await register(loginUser, loginPass)
              : await login(loginUser, loginPass);
            setLoginError(err || "");
          }}>
            {isRegister ? "Register" : "Login"}
          </button>
        </div>
      </Dialog>
    </div>
  );
}
