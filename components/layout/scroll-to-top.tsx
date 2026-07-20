"use client";

import { useEffect, useState } from "react";
import { IconArrowUp } from "@tabler/icons-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 400);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={`fixed right-6 bottom-6 z-40 flex size-11 items-center justify-center rounded-full bg-accent text-[var(--color-base)] shadow-none transition-all hover:opacity-90 active:scale-95 ${
        visible ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <IconArrowUp size={20} stroke={1.5} />
    </button>
  );
}
