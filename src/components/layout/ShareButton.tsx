"use client";

import { Share2 } from "lucide-react";

export default function ShareButton({ ariaLabel }: { ariaLabel: string }) {
  const handleShare = async () => {
    const shareData = {
      title: "Aqua Still Zlatibor",
      text: "Pogledajte Aqua Still Zlatibor – alati, vodovodni materijal i kupatilska oprema.",
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(window.location.origin);
    } catch {
      // Korisnik je otkazao deljenje ili clipboard nije dostupan.
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={ariaLabel}
      title={ariaLabel}
      className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
    >
      <Share2 className="w-5 h-5" />
    </button>
  );
}
