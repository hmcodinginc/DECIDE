import { Outlet } from "react-router";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

function RootLayout() {
  return (
    <TooltipProvider>
      <ScrollToTop />
      <div className="flex min-h-svh min-w-0 flex-col overflow-x-clip">
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

export { RootLayout };
