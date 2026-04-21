"use client";

import { useState, useEffect, useRef } from "react";

export default function HomePage() {
  const [authorized, setAuthorized] = useState(false);
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  // Search state
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [candidates, setCandidates] = useState<Array<{
    category: string; title: string; creator: string;
    release_date: string; image_search_query: string;
  }>>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetch("/api/auth").then(r => r.json()).then(d => setAuthorized(d.authorized));
    fetch("/api/profile").then(r => r.json()).then(setProfile);
    fetch("/api/categories").then(r => r.json()).then(setCategories);

    // Check URL token
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      fetch(`/api/auth?token=${token}`).then(r => r.json()).then(d => {
        setAuthorized(d.authorized);
        const clean = new URL(window.location.href);
        clean.searchParams.delete("token");
        window.history.replaceState({}, "", clean.pathname);
      });
    }
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
    setSearching(true);
    setShowResults(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: query.trim(), categories: categories.map(c => c.name) }),
      });
      const data = await res.json();
      setCandidates(data.candidates || []);
    } catch {
      setCandidates([]);
    }
    setSearching(false);
  };

  const selectCandidate = (c: typeof candidates[0]) => {
    // Tell parent window to handle the rest
    window.parent.postMessage({ type: "dbsein:select-candidate", candidate: c }, "*");
  };

  const renderField = (key: string, label: string, isTitle = false) => {
    if (editingField === key) {
      return (
        <span>
          <input
            type="text"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") saveProfile(key, editValue);
              if (e.key === "Escape") setEditingField(null);
            }}
            autoFocus
          />
          {" "}
          <a href="#" onClick={e => { e.preventDefault(); saveProfile(key, editValue); }}>save</a>
        </span>
      );
    }
    const text = profile[key] || label;
    return (
      <>
        {isTitle ? <h1>{text}</h1> : <span>{text}</span>}
        {authorized && (
          <> <a href="#" onClick={e => {
            e.preventDefault();
            setEditingField(key);
            setEditValue(profile[key] || "");
          }} style={{ fontSize: "0.7em" }}>[edit]</a></>
        )}
      </>
    );
  };

  return (
    <>
      <link rel="stylesheet" href="/geo-bootstrap.css" />
      <style>{`
        #geo-home {
          background: url('/img/stars.gif');
          min-height: 100vh;
          padding: 20px;
        }
      `}</style>
    <div id="geo-home">
    <div className="container" style={{ maxWidth: 600, margin: "0 auto" }}>
      {/* Profile */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        {renderField("name", "DBSein", true)}
        <p className="lead">
          {renderField("bio", "my collection")}
        </p>
      </div>

      <hr />

      {/* Search */}
      {authorized && (
        <>
          <h3>+ add new item</h3>
          <div className="input-append" style={{ marginBottom: 10 }}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="search title..."
              style={{ width: "70%" }}
            />
            <button className="btn" onClick={handleSearch} disabled={searching || !query.trim()}>
              {searching ? "..." : "Search"}
            </button>
          </div>

          {showResults && (
            <div style={{ marginBottom: 20 }}>
              {searching ? (
                <p>searching...</p>
              ) : candidates.length === 0 ? (
                <p>no results.</p>
              ) : (
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Creator</th>
                      <th>Category</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((c, i) => (
                      <tr key={i}>
                        <td>{c.title}</td>
                        <td>{c.creator}</td>
                        <td><span className="label">{c.category}</span></td>
                        <td>
                          <button className="btn btn-small btn-primary" onClick={() => selectCandidate(c)}>
                            select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <a href="#" onClick={e => { e.preventDefault(); setShowResults(false); setCandidates([]); }}>close</a>
            </div>
          )}

          <p>
            <a href="#" onClick={e => {
              e.preventDefault();
              window.parent.postMessage({ type: "dbsein:manual-entry" }, "*");
            }}>
              or enter manually...
            </a>
          </p>

          <hr />
        </>
      )}

      {/* Links */}
      <h3>links</h3>
      <ul>
        <li>
          <a href="#" onClick={e => {
            e.preventDefault();
            window.parent.postMessage({ type: "dbsein:open-topster" }, "*");
          }}>
            topster
          </a> - generate a grid image of your favorites
        </li>
        {authorized && (
          <li>
            <a href="#" onClick={e => {
              e.preventDefault();
              window.parent.postMessage({ type: "dbsein:open-categories" }, "*");
            }}>
              edit categories
            </a> - add, rename, delete categories
          </li>
        )}
        <li>
          <a href="https://github.com/mixify/dbsein" target="_blank">github</a> - source code
        </li>
      </ul>

      <hr />

      <p style={{ textAlign: "center", fontSize: 11, opacity: 0.6 }}>
        powered by gemini &middot; xp.css &middot; geo-bootstrap
      </p>
    </div>
    </div>
    </>
  );
}
