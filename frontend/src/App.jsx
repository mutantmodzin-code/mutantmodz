import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Billing from './pages/Billing';
import InvoiceHistory from './pages/InvoiceHistory';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import Auth from './pages/Auth';
import ProfitDashboard from './pages/ProfitDashboard';
import Vendors from './pages/Vendors';
import GstReports from './pages/GstReports';
import OnlineOrders from './pages/OnlineOrders';
import Combos from './pages/Combos';
import GarageSale from './pages/GarageSale';

const Layout = ({ children }) => {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isMobile={isMobile} />
      
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 105, backdropFilter: 'blur(4px)' }}
        />
      )}

      <div style={{ 
        flex: 1, 
        marginLeft: isMobile ? 0 : '250px', 
        backgroundColor: '#f8fafc',
        transition: 'margin-left 0.3s ease',
        minWidth: 0 // Prevent content from breaking flexbox
      }}>
        <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isMobile={isMobile} />
        <main style={{ padding: isMobile ? '1rem' : '2rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/products" element={<Layout><Products /></Layout>} />
          <Route path="/combos" element={<Layout><Combos /></Layout>} />
          <Route path="/garage-sale" element={<Layout><GarageSale /></Layout>} />
          <Route path="/billing" element={<Layout><Billing /></Layout>} />
          <Route path="/invoices" element={<Layout><InvoiceHistory /></Layout>} />
          <Route path="/customers" element={<Layout><Customers /></Layout>} />
          <Route path="/online-orders" element={<Layout><OnlineOrders /></Layout>} />
          <Route path="/reports" element={<Layout><Reports /></Layout>} />
          <Route path="/profit" element={<Layout><ProfitDashboard /></Layout>} />
          <Route path="/vendors" element={<Layout><Vendors /></Layout>} />
          <Route path="/gst-reports" element={<Layout><GstReports /></Layout>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
