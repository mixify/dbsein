"use client";

import { useEffect, useState } from "react";

export function Spinner({ slow = false }: { slow?: boolean }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (slow) {
        setValue(prev => prev >= 90 ? 90 : prev + Math.random() * 3);
      } else {
        setValue(prev => prev >= 95 ? 10 : prev + Math.random() * 15);
      }
    }, slow ? 500 : 300);
    return () => clearInterval(interval);
  }, [slow]);

  return <progress max="100" value={value} style={{ width: "100%" }} />;
}
