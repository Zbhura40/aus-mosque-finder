import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TransparentNavbar from "@/components/TransparentNavbar";
import Index from "./pages/Index";
import UserFeedback from "./pages/UserFeedback";
import FAQ from "./pages/FAQ";
import ImamProfiles from "./pages/ImamProfiles";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TransparentNavbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/feedback" element={<UserFeedback />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/imam-profiles" element={<ImamProfiles />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
