"use client";
import { useEffect, useState } from "react";

export function useIsDesktop(minWidth = 768) {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);
    const set = () => setIsDesktop(mq.matches);
    set();
    mq.addEventListener?.("change", set);
    return () => mq.removeEventListener?.("change", set);
  }, [minWidth]);
  return isDesktop;
}
