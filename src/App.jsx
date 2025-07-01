import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import StaffDashboard from './pages/StaffDashboard';
import NotFound from './pages/NotFound';
import { AuthProvider } from './context/AuthContext';
import { Toaster as SonnerToaster } from 'sonner';
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <SonnerToaster position="top-right" richColors />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
