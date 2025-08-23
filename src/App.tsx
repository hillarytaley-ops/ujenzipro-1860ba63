
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Builders from "./pages/Builders";
import Suppliers from "./pages/Suppliers";
import Materials from "./pages/Materials";
import Delivery from "./pages/Delivery";
import Communication from "./pages/Communication";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Feedback from "./pages/Feedback";
import Tracking from "./pages/Tracking";
import Procurement from "./pages/Procurement";
import MaterialRegister from "./pages/MaterialRegister";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/builders" element={<Builders />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/communication" element={<Communication />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/procurement" element={<Procurement />} />
          <Route path="/material-register" element={<MaterialRegister />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
