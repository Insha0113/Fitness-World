"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Re-render the server page every N seconds (stops after ~5 minutes). */
export function AutoRefresh({ seconds }: { seconds: number }) {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const t = setInterval(() => {
      if (++n > 300 / seconds) return clearInterval(t);
      router.refresh();
    }, seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds]);
  return null;
}
