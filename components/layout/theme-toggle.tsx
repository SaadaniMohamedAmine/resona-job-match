"use client";

import { useEffect, useState } from "react";
import { IconSun, IconMoon } from "@tabler/icons-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Sync from the DOM attribute the root layout's inline script may have already set from
    // localStorage before hydration — starting state at "dark" keeps server/client markup
    // matching, then this corrects it once mounted.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("resona-theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="flex size-8 items-center justify-center rounded-(--radius-control) text-muted transition-colors hover:text-accent"
    >
      {theme === "dark" ? <IconSun size={18} stroke={1.5} /> : <IconMoon size={18} stroke={1.5} />}
    </button>
  );
}
