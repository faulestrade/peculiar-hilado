import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/products/Products';
import Categories from './pages/categories/Categories';
import Stock from './pages/stock/Stock';
import Orders from './pages/orders/Orders';
import Revenue from './pages/revenue/Revenue';
import './App.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: '#9a7a5a' }}>Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="productos" element={<Products />} />
        <Route path="categorias" element={<Categories />} />
        <Route path="stock" element={<Stock />} />
        <Route path="pedidos" element={<Orders />} />
        <Route path="ingresos" element={<Revenue />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
