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

const Layout = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '250px', backgroundColor: '#f8fafc' }}>
        <Navbar />
        <main style={{ padding: '2rem' }}>
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
          <Route path="/billing" element={<Layout><Billing /></Layout>} />
          <Route path="/invoices" element={<Layout><InvoiceHistory /></Layout>} />
          <Route path="/customers" element={<Layout><Customers /></Layout>} />
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
