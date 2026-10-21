"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker registrovan:", registration.scope);
          })
          .catch((error) => {
            console.warn("[PWA] Registracija Service Worker-a:", error);
          });
      });
    }
  }, []);

  return null;
}

