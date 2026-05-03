import { Toaster } from "@financial-tracker-sea/ui/components/sonner";
import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
  useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useState, useMemo } from "react";

import Header from "@/components/header";
import Sidebar from "@/components/sidebar";

import "../index.css";

export interface RouterAppContext {}

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Dashboard Utama",
    subtitle: "Lacak kemana uang mu pergi",
  },
  "/visualisasiData": {
    title: "Visualisasi Data",
    subtitle: "Pantau pola pengeluaran dan anggaran anda",
  },
  "/daftarImpian": {
    title: "Daftar Impian",
    subtitle: "Buat impian Mu Jadi Nyata",
  },
  "/daftarImpian/$wishlistId": {
    title: "Detail Impian",
    subtitle: "Lacak progres tabungan impianmu",
  },
};

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "financial-tracker-sea",
      },
      {
        name: "description",
        content: "financial-tracker-sea is a web application",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const pageMeta = useMemo(() => {
    // For dynamic routes like /daftarImpian/$wishlistId, match the route pattern
    const path = location.pathname;
    if (path.startsWith("/daftarImpian/") && path !== "/daftarImpian") {
      return PAGE_META["/daftarImpian/$wishlistId"] ?? {
        title: "Detail Impian",
        subtitle: "Lacak progres tabungan impianmu",
      };
    }
    return PAGE_META[path] ?? {
      title: "Dashboard Utama",
      subtitle: "Lacak kemana uang mu pergi",
    };
  }, [location.pathname]);

  return (
    <>
      <HeadContent />
      <div className="flex h-svh w-screen overflow-hidden bg-background">
        <Sidebar collapsed={!sidebarOpen} className="border-r border-sidebar-border" />
        <div className="flex flex-col h-full min-w-0 overflow-hidden flex-1">
          <Header
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            title={pageMeta.title}
            subtitle={pageMeta.subtitle}
          />
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster richColors />
      <TanStackRouterDevtools position="bottom-left" />
    </>
  );
}
