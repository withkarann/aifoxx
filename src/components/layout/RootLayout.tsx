import { type ReactNode } from "react";
import { NavBar } from "./NavBar";
import { Footer } from "./Footer";

interface RootLayoutProps {
  children: ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-bg-base text-text-primary">
      <NavBar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}
