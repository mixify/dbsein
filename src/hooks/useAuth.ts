"use client";

import { useState, useEffect } from "react";

export function useAuth() {
  const [authorized, setAuthorized] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      // Check if URL has token param, pass it to auth endpoint
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const url = token ? `/api/auth?token=${token}` : "/api/auth";

      const res = await fetch(url);
      const data = await res.json();
      setAuthorized(data.authorized);
      setChecked(true);

      // Clean token from URL
      if (token) {
        const clean = new URL(window.location.href);
        clean.searchParams.delete("token");
        window.history.replaceState({}, "", clean.pathname);
      }
    })();
  }, []);

  return { authorized, checked };
}
