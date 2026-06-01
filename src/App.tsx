import { Outlet } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RootLayout } from "@/components/layout/RootLayout";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CompareProvider } from "@/contexts/CompareContext";
import { queryClient } from "@/lib/queryClient";
import { useScrollToTop } from "@/hooks/useScrollToTop";

function AppContent() {
  useScrollToTop();
  return (
    <RootLayout>
      <Outlet />
    </RootLayout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CompareProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent />
            <Analytics />
            <SpeedInsights />
          </TooltipProvider>
        </CompareProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
