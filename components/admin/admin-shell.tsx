"use client";

import { useState } from "react";

import AdminHeader from "@/components/admin/admin-header";
import AdminSidebar from "@/components/admin/admin-sidebar";

type AdminShellProps = {
  children: React.ReactNode;
};

export default function AdminShell({ children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dark min-h-screen bg-[#030303] text-white">
      <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,210,50,0.08),transparent_28%),linear-gradient(180deg,#090909_0%,#050505_100%)]">
        <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <main className="min-w-0 flex-1">
          <AdminHeader onMenuToggle={() => setMobileOpen((prev) => !prev)} />
          {children}
        </main>
      </div>
    </div>
  );
}
