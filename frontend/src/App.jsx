import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Auth from './pages/Auth';
import AdminLogin from './pages/AdminLogin';
import Signup from './pages/Signup';
import ChefLayout from './layouts/ChefLayout';
import ChefDashboard from './pages/ChefDashboard';
import ChefProfile from './pages/ChefProfile';
import ChefOrders from './pages/ChefOrders';
import ManageMenus from './pages/ManageMenus';
import ManagePlans from './pages/ManagePlans';
import ChangePassword from './pages/ChangePassword';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Core Auth */}
        <Route path="/" element={<Auth />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Protected Chef Routes */}
        <Route path="/chef" element={
          <ProtectedRoute allowedRole="chef">
            <ChefLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<ChefDashboard />} />
          <Route path="profile" element={<ChefProfile />} />
          <Route path="orders" element={<ChefOrders />} />
          <Route path="menus" element={<ManageMenus />} />
          <Route path="plans" element={<ManagePlans />} />
          <Route path="password" element={<ChangePassword />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
