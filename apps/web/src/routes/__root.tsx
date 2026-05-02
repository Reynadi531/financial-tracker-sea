import { Toaster } from "@financial-tracker-sea/ui/components/sonner";
import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useState } from "react";

import Header from "@/components/header";
import Sidebar from "@/components/sidebar";

import "../index.css";

export interface RouterAppContext {}

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

  return (
    <>
      <HeadContent />
      <div className="flex h-svh w-screen overflow-hidden bg-background">
        <Sidebar collapsed={!sidebarOpen} className="border-r border-sidebar-border" />
        <div className="flex flex-col h-full min-w-0 overflow-hidden flex-1">
          <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
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
