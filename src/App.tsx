
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navigation from "@/components/Navigation";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Match from "./pages/Match";
import Bookings from "./pages/Bookings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStands from "./pages/admin/AdminStands";
import AdminSeats from "./pages/admin/AdminSeats";
import AdminMatchSeats from "./pages/admin/AdminMatchSeats";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navigation />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/match/:matchId" element={<Match />} />
            
            {/* Protected routes for regular users */}
            <Route element={<ProtectedRoute />}>
              <Route path="/bookings" element={<Bookings />} />
            </Route>
            
            {/* Protected routes for admin users */}
            <Route element={<ProtectedRoute requireAdmin={true} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/stadiums/:stadiumId/stands" element={<AdminStands />} />
              <Route path="/admin/stands/:standId/seats" element={<AdminSeats />} />
              <Route path="/admin/matches/:matchId/seats" element={<AdminMatchSeats />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
