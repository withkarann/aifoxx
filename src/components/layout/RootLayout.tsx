import { type ReactNode } from "react";
import { NavBar } from "./NavBar";
import { Footer } from "./Footer";
import { CRTOverlay } from "@/components/ui/CRTOverlay";

interface RootLayoutProps {
  children: ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-bg-base text-text-primary overflow-x-hidden">
      <NavBar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
      <CRTOverlay />
    </div>
  );
}
