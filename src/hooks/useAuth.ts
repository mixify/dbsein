"use client";

import { useState, useEffect, useCallback } from "react";

export function useAuth() {
  const [authorized, setAuthorized] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const check = useCallback(async () => {
    const res = await fetch("/api/auth");
    const data = await res.json();
    setAuthorized(data.authorized);
    setUsername(data.username || null);
    setChecked(true);
  }, []);

  useEffect(() => { check(); }, [check]);

  const login = async (user: string, pass: string): Promise<string | null> => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", username: user, password: pass }),
    });
    const data = await res.json();
    if (res.ok) {
      setAuthorized(true);
      setUsername(data.username);
      return null;
    }
    return data.error;
  };

  const register = async (user: string, pass: string): Promise<string | null> => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register", username: user, password: pass }),
    });
    const data = await res.json();
    if (res.ok) {
      setAuthorized(true);
      setUsername(data.username);
      return null;
    }
    return data.error;
  };

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    setAuthorized(false);
    setUsername(null);
  };

  return { authorized, username, checked, login, register, logout };
}
