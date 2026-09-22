import { type ReactNode } from "react";
import { NavBar } from "./NavBar";
import { Footer } from "./Footer";
import { MobileTabBar } from "./MobileTabBar";
import { CompareTray } from "@/components/tools/CompareTray";

interface RootLayoutProps {
  children: ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-bg-base text-text-primary overflow-x-clip pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <NavBar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
      <MobileTabBar />
      <CompareTray />
    </div>
  );
}
