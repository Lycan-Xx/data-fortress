import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MasterLogin from "./components/MasterLogin";
import { checkAuthStatus } from "@/lib/api";

const queryClient = new QueryClient();

const App = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isFirstRun, setIsFirstRun] = useState(true);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuthStatus()
      .then((res) => {
        setIsFirstRun(!res.data.isConfigured);
      })
      .catch(() => {
        // Backend unreachable — default to first-run demo
        setIsFirstRun(true);
      })
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary animate-pulse font-mono text-lg">Initializing SecureVault...</div>
      </div>
    );
  }

  if (!token) {
    return (
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <MasterLogin isFirstRun={isFirstRun} onAuthenticated={setToken} />
      </TooltipProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
