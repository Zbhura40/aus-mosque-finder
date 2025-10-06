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
import SydneyMosques from "./pages/SydneyMosques";
import MelbourneMosques from "./pages/MelbourneMosques";
import BrisbaneMosques from "./pages/BrisbaneMosques";
import PerthMosques from "./pages/PerthMosques";
import AdelaideMosques from "./pages/AdelaideMosques";
import TasmaniaMosques from "./pages/TasmaniaMosques";
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
          <Route path="/mosques-sydney" element={<SydneyMosques />} />
          <Route path="/mosques-melbourne" element={<MelbourneMosques />} />
          <Route path="/mosques-brisbane" element={<BrisbaneMosques />} />
          <Route path="/mosques-perth" element={<PerthMosques />} />
          <Route path="/mosques-adelaide" element={<AdelaideMosques />} />
          <Route path="/mosques-tasmania" element={<TasmaniaMosques />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
