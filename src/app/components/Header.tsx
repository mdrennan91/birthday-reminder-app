"use client";

import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import SidebarNav from "@/app/components/SidebarNav";

export default function Header() {
  const { data: session } = useSession();
  const isAuthed = Boolean(session?.user);

  const user = session?.user as { username?: string | null; name?: string | null } | undefined;
  const displayName = user?.username ?? user?.name ?? "";

  return (
    <header className="w-full bg-lavender border-b shadow-sm">
      <div className="mx-auto flex h-14 items-center justify-between px-4">
        {/* Left: Mobile hamburger + logo/title */}
        <div className="flex items-center gap-3">
          {/* Hamburger (mobile only) */}
          {isAuthed && (
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border md:hidden"
                  aria-label="Open menu"
                >
                  <Menu size={18} />
                </button>
              </Dialog.Trigger>

              {/* Drawer */}
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
                <Dialog.Content
                  className="
                    fixed left-0 top-0 z-50 h-dvh w-72 bg-white shadow-xl md:hidden
                    data-[state=open]:animate-in data-[state=open]:slide-in-from-left
                    data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left
                    focus:outline-none
                  "
                >
                  {/* Drawer header */}
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <Dialog.Title>
                    <span className="font-semibold">Menu</span>
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border"
                        aria-label="Close menu"
                      >
                        <X size={18} />
                      </button>
                    </Dialog.Close>
                  </div>
                  <Dialog.Description className="sr-only">
                    Main navigation menu for the CakeMe app
                  </Dialog.Description>
                  {/* Sidebar content (scrollable) */}
                  <div className="overflow-y-auto">
                    <SidebarNav inDrawer />
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          )}

          {/* Logo + Title */}
          <div className="flex items-center gap-2">
            <Image
              src="/birthday-logo.png"
              alt="CakeMe logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <h1 className="text-base font-bold text-teal-700 md:text-lg">CakeMe</h1>
          </div>
        </div>

        {/* Right: Greeting + Logout (hidden if not authed) */}
        {isAuthed ? (
          <div className="flex items-center gap-3">
            {displayName && (
              <span className="hidden text-gray-700 sm:inline">
                Hello, {displayName}
              </span>
            )}
            <button
              onClick={() => signOut()}
              className="h-10 rounded-lg bg-red-600 px-3 text-sm text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="h-10" />
        )}
      </div>
    </header>
  );
}
