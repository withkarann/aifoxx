import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RootLayout } from "@/components/layout/RootLayout";
import HomePage from "./pages/HomePage";
import ToolDetailPage from "./pages/ToolDetailPage";
import SubmitPage from "./pages/SubmitPage";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <RootLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ai/:slug" element={<ToolDetailPage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </RootLayout>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
