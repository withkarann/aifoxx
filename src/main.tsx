import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "@fontsource/jetbrains-mono/latin.css";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "./contexts/ThemeContext";
import { validateTools } from "./lib/tools";
import App from "./App";
import "./index.css";

// Validate tools data at startup
validateTools();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <App />
      <Analytics />
      <SpeedInsights />
    </ThemeProvider>
  </QueryClientProvider>
);
