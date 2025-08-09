"use client";
import { useEffect, useRef } from "react";

type GlobalWithCounts = typeof globalThis & {
  __cakeMeSingletons?: Record<string, number>;
};

function getGlobal(): GlobalWithCounts {
  return globalThis as GlobalWithCounts;
}

/** Returns true iff this is the first/only mounted instance for the given key. */
export function useSingleton(key: string): boolean {
  const wasCounted = useRef(false);

  // increment on first render, decrement on unmount
  useEffect(() => {
    const g = getGlobal();
    g.__cakeMeSingletons ??= {};
    g.__cakeMeSingletons[key] = (g.__cakeMeSingletons[key] ?? 0) + 1;
    wasCounted.current = true;
    return () => {
      const next = (g.__cakeMeSingletons?.[key] ?? 1) - 1;
      g.__cakeMeSingletons![key] = next > 0 ? next : 0;
    };
  }, [key]);

  // during first render before effect runs
  const g = getGlobal();
  const current = g.__cakeMeSingletons?.[key] ?? 0;
  return wasCounted.current ? (g.__cakeMeSingletons?.[key] ?? 1) <= 1 : current < 1;
}
