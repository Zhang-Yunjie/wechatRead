"use client";

import { useEffect, useRef } from "react";

export function useQuickCapture() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if (event.metaKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, []);
  return inputRef;
}
