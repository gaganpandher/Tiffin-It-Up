import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Auth from './pages/Auth';
import AdminLogin from './pages/AdminLogin';
import Signup from './pages/Signup';
import ChefLayout from './layouts/ChefLayout';
import ChefDashboard from './pages/ChefDashboard';
import ManageMenus from './pages/ManageMenus';
import ManagePlans from './pages/ManagePlans';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Core Auth */}
        <Route path="/" element={<Auth />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Chef Protected Routes */}
        <Route path="/chef" element={<ChefLayout />}>
          <Route path="dashboard" element={<ChefDashboard />} />
          <Route path="menus" element={<ManageMenus />} />
          <Route path="plans" element={<ManagePlans />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
