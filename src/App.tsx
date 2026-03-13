import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RootLayout } from "@/components/layout/RootLayout";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import HomePage from "./pages/HomePage";
import ToolDetailPage from "./pages/ToolDetailPage";
import CategoryPage from "./pages/CategoryPage";
import TagPage from "./pages/TagPage";
import SubmitPage from "./pages/SubmitPage";
import NotFoundPage from "./pages/NotFoundPage";

function AppRoutes() {
  useScrollToTop();
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/ai/:slug" element={<ToolDetailPage />} />
      <Route path="/category/:category" element={<CategoryPage />} />
      <Route path="/tag/:tag" element={<TagPage />} />
      <Route path="/submit" element={<SubmitPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <RootLayout>
        <AppRoutes />
      </RootLayout>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
