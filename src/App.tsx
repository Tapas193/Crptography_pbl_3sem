import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import Navigation from "@/components/layout/Navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Rewards from "./pages/Rewards";
import History from "./pages/History";
import FAQ from "./pages/FAQ";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRewards from "./pages/admin/AdminRewards";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminCrypto from "./pages/admin/AdminCrypto";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>;
  
  return user ? <>{children}</> : <Navigate to="/auth" />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Index />} />
      <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
      <Route path="/dashboard" element={<ProtectedRoute><Navigation /><Dashboard /></ProtectedRoute>} />
      <Route path="/rewards" element={<ProtectedRoute><Navigation /><Rewards /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><Navigation /><History /></ProtectedRoute>} />
      <Route path="/faq" element={<ProtectedRoute><Navigation /><FAQ /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Navigation /><Settings /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/rewards" element={<ProtectedRoute><AdminLayout><AdminRewards /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/coupons" element={<ProtectedRoute><AdminLayout><AdminCoupons /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/crypto" element={<ProtectedRoute><AdminLayout><AdminCrypto /></AdminLayout></ProtectedRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
