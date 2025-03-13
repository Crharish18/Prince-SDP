import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import Categories from "./pages/admin/Categories";
import ManageEmployee from "./pages/admin/ManageEmployee";
import EDashboard from "./pages/employee/Dashboard";
import Customer from "./pages/admin/Customer";
import Products from "./pages/admin/products";
import Supplier from "./pages/admin/Supplier";
import Orders from "./pages/admin/Orders";
import Profile from "./pages/admin/Profile";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  // Get the token and role from localStorage
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  return (
    <Router>
      <Routes>
        {/* ✅ Login Route: Allows access to the login page after sign out */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ✅ Protected Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={token && role === 'admin' ? <Dashboard /> : <Navigate to="/admin/login" />} 
        />

        <Route 
          path="/admin/Customer"
          element={token && role === 'admin' ? <Customer /> : <Navigate to="/admin/login" />} 
        />

         <Route 
          path="/admin/categories" 
          element={token && role === 'admin' ? <Categories /> : <Navigate to="/admin/login" />}  
          
        />

      <Route 
          path="/admin/profile" 
          element={token && role === 'admin' ? <Profile /> : <Navigate to="/admin/login" />}  
          
        />

        <Route 
          path="/admin/Supplier" 
          element={token && role === 'admin' ? <Supplier /> : <Navigate to="/admin/login" />}  
          
        />

        <Route 
          path="/admin/products" 
          element={token && role === 'admin' ? <Products /> : <Navigate to="/admin/login" />} 
        />

        <Route 
          path="/admin/Orders" 
          element={token && role === 'admin' ? <Orders /> : <Navigate to="/admin/login" />} 
        />

        <Route 
          path="/admin/manageemployee" 
          element={token && role === 'admin' ? <ManageEmployee /> : <Navigate to="/admin/login" />} 
        />
        
        {/* ✅ Protected Employee Routes */}
        <Route 
          path="/employee/dashboard" 
          element={token && role === 'employee' ? <EDashboard /> : <Navigate to="/admin/login" />} 
        />

        {/* ✅ Default Route: Redirects based on authentication */}
        <Route path="*" element={<Navigate to={token ? `/${role}/dashboard` : "/admin/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
