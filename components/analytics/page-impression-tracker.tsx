"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function PageImpressionTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return;
    }

    const sessionKey = `impression:${pathname}`;
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }

    sessionStorage.setItem(sessionKey, "1");

    fetch("/api/analytics/impression", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {
      // Ignore client-side tracking failures.
    });
  }, [pathname]);

  return null;
}
