"use client";

import { useEffect } from "react";

export default function SessionBootstrap() {
  useEffect(() => {
    const key = "pt_bootstrapped";
    if (typeof window === "undefined") return;

    const already = window.sessionStorage.getItem(key);
    if (already) return;

    (async () => {
      try {
        await fetch("/api/session", { method: "GET", cache: "no-store" });
      } finally {
        window.sessionStorage.setItem(key, "1");
        // Reload so Server Components can see the cookie on the next request.
        window.location.reload();
      }
    })();
  }, []);

  return null;
}
