
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Builders from "./pages/Builders";
import Suppliers from "./pages/Suppliers";
import Delivery from "./pages/Delivery";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Feedback from "./pages/Feedback";
import Tracking from "./pages/Tracking";
import Procurement from "./pages/Procurement";
import SupplyAcknowledgementPage from "./pages/SupplyAcknowledgement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  useEffect(() => {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<ErrorBoundary><Index /></ErrorBoundary>} />
              <Route path="/builders" element={<ErrorBoundary><Builders /></ErrorBoundary>} />
              <Route path="/suppliers" element={<ErrorBoundary><Suppliers /></ErrorBoundary>} />
              <Route path="/delivery" element={<ErrorBoundary><Delivery /></ErrorBoundary>} />
              <Route path="/about" element={<ErrorBoundary><About /></ErrorBoundary>} />
              <Route path="/contact" element={<ErrorBoundary><Contact /></ErrorBoundary>} />
              <Route path="/auth" element={<ErrorBoundary><Auth /></ErrorBoundary>} />
              <Route path="/feedback" element={<ErrorBoundary><Feedback /></ErrorBoundary>} />
              <Route path="/tracking" element={<ErrorBoundary><Tracking /></ErrorBoundary>} />
              <Route path="/procurement" element={<ErrorBoundary><Procurement /></ErrorBoundary>} />
              <Route path="/acknowledgement" element={<ErrorBoundary><SupplyAcknowledgementPage /></ErrorBoundary>} />
              <Route path="*" element={<ErrorBoundary><NotFound /></ErrorBoundary>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
