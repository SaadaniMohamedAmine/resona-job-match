"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import {
  IconLayoutDashboard,
  IconUpload,
  IconHistory,
  IconLayoutKanban,
  IconSettings,
  IconHome,
  IconCreditCard,
  IconCode,
  IconLogin,
  IconLogout,
  IconUserPlus,
  IconFlask,
} from "@tabler/icons-react";

export function CommandPalette({ isAuthenticated }: { isAuthenticated: boolean }) {
  const t = useTranslations("commandPalette");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  const AUTH_COMMANDS = [
    { icon: IconLayoutDashboard, label: t("goToDashboard"), href: "/dashboard" },
    { icon: IconUpload, label: t("newAnalysis"), href: "/upload" },
    { icon: IconHistory, label: t("goToHistory"), href: "/resumes" },
    { icon: IconLayoutKanban, label: t("goToApplications"), href: "/tracker" },
    { icon: IconSettings, label: t("goToSettings"), href: "/settings/account" },
    { icon: IconCreditCard, label: t("goToBilling"), href: "/settings/billing" },
  ];

  const PUBLIC_COMMANDS = [
    { icon: IconHome, label: t("goToHome"), href: "/" },
    { icon: IconFlask, label: t("tryLiveDemo"), href: "/demo" },
    { icon: IconCreditCard, label: t("goToPricing"), href: "/pricing" },
    { icon: IconCode, label: t("builtWith"), href: "/built-with" },
    { icon: IconLogin, label: t("signIn"), href: "/login" },
    { icon: IconUserPlus, label: t("createAccount"), href: "/sign-up" },
  ];

  const commands = isAuthenticated ? AUTH_COMMANDS : PUBLIC_COMMANDS;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center bg-black/85 px-4 pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <Command
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-(--radius-card) border border-track bg-base"
        label={t("openPalette")}
      >
        <Command.Input
          autoFocus
          placeholder={t("placeholder")}
          className="w-full border-b border-track bg-transparent px-5 py-4 text-sm text-base-light placeholder:text-muted focus:outline-none"
        />
        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-center text-sm text-muted">
            {t("noResults")}
          </Command.Empty>
          <Command.Group
            heading={t("navigationGroup")}
            className="px-2 py-2 text-xs tracking-widest text-muted uppercase [&_[cmdk-group-heading]]:mb-2 [&_[cmdk-group-heading]]:px-1"
          >
            {commands.map((cmd) => (
              <Command.Item
                key={cmd.href}
                onSelect={() => go(cmd.href)}
                className="flex cursor-pointer items-center gap-3 rounded-(--radius-control) px-3 py-2.5 text-sm text-base-light data-[selected=true]:bg-track"
              >
                <cmd.icon size={16} stroke={1.5} className="text-accent" />
                {cmd.label}
              </Command.Item>
            ))}
          </Command.Group>
          {isAuthenticated && (
            <Command.Group
              heading={t("accountGroup")}
              className="px-2 py-2 text-xs tracking-widest text-muted uppercase [&_[cmdk-group-heading]]:mb-2 [&_[cmdk-group-heading]]:px-1"
            >
              <Command.Item
                onSelect={() => {
                  setOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="flex cursor-pointer items-center gap-3 rounded-(--radius-control) px-3 py-2.5 text-sm text-base-light data-[selected=true]:bg-track"
              >
                <IconLogout size={16} stroke={1.5} className="text-accent" />
                {t("signOut")}
              </Command.Item>
            </Command.Group>
          )}
        </Command.List>
      </Command>
    </div>
  );
}
