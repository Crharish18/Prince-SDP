import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import Categories from "./pages/admin/Categories";
import ManageEmployee from "./pages/admin/ManageEmployee";
import Admin from "./pages/admin/Admin";
import Customer from "./pages/admin/Customer";
import Products from "./pages/admin/products";
import Supplier from "./pages/admin/Supplier";
import Orders from "./pages/admin/Orders";
import Profile from "./pages/admin/Profile";
import Transactions from "./pages/admin/Transaction";
import Inventory from "./pages/admin/Inventory";
import Reviews from "./pages/admin/Reviews";
import Reports from "./pages/admin/Reports";
import ActivityLog from "./pages/admin/Activity_log";
import ResetPass from "./pages/admin/Reset_Password";
import ExpiredInventories from "./pages/admin/Expired_Inventories";
import Messages from "./pages/admin/Messages";
import OrderAddress from "./pages/admin/Order_Address";

import EDashboard from "./pages/employee/Emp_Dashboard";
import Emp_Profile from "./pages/employee/Emp_Profile";
import Emp_Customer from "./pages/employee/Emp_Customer";
import Emp_Orders from "./pages/employee/Emp_Order";
import Emp_Inventory from "./pages/employee/Emp_Inventory";
import Emp_Products from "./pages/employee/Emp_Products";
import Emp_Categories from "./pages/employee/Emp_Categories";
import Emp_Supplier from "./pages/employee/Emp_Supplier";
import Emp_ExpiredInventories from "./pages/employee/Emp_Expired_Inventories";
import Emp_Order_Address from "./pages/employee/Emp_Order_Address";
import Emp_Transactions from "./pages/employee/Emp_Transaction";

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Main App component that handles routing for the entire application
function App() {
  // Get the token and role from localStorage for authentication
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  return (
    <Router>
      <Routes>
        {/* Login Route: Allows access to the login page after sign out */}
        <Route path="/admin" element={<AdminLogin />} />

        {/* Protected Admin Routes - Only accessible if user is authenticated as admin */}
        <Route 
          path="/admin/dashboard" 
          element={token && role === 'admin' ? <Dashboard /> : <Navigate to="/admin" />} 
        />

        <Route 
          path="/admin/Customer"
          element={token && role === 'admin' ? <Customer /> : <Navigate to="/admin" />} 
        />

         <Route 
          path="/admin/categories" 
          element={token && role === 'admin' ? <Categories /> : <Navigate to="/admin" />}  
          
        />

      <Route 
          path="/admin/profile" 
          element={token && role === 'admin' ? <Profile /> : <Navigate to="/admin" />}  
          
        />

        <Route 
          path="/admin/Supplier" 
          element={token && role === 'admin' ? <Supplier /> : <Navigate to="/admin" />}  
          
        />

        <Route 
          path="/admin/products" 
          element={token && role === 'admin' ? <Products /> : <Navigate to="/admin" />} 
        />

      <Route 
          path="/admin/Inventory" 
          element={token && role === 'admin' ? <Inventory /> : <Navigate to="/admin" />}  
          
        />

        <Route 
          path="/admin/Orders" 
          element={token && role === 'admin' ? <Orders /> : <Navigate to="/admin" />} 
        />

        <Route 
          path="/admin/manageemployee" 
          element={token && role === 'admin' ? <ManageEmployee /> : <Navigate to="/admin" />} 
        />

        <Route 
          path="/admin/Admin"
          element={token && role === 'admin' ? <Admin /> : <Navigate to="/admin" />}
        />

        <Route 
          path="/admin/Transactions" 
          element={token && role === 'admin' ? <Transactions /> : <Navigate to="/admin" />} 
        />

        <Route 
          path="/admin/Reports" 
          element={token && role === 'admin' ? <Reports /> : <Navigate to="/admin" />} 
        />

        <Route 
          path="/admin/Reviews" 
          element={token && role === 'admin' ? <Reviews /> : <Navigate to="/admin" />} 
        />

        <Route 
          path="/admin/Activitylog" 
          element={token && role === 'admin' ? <ActivityLog /> : <Navigate to="/admin" />} 
        />

        <Route 
          path="/admin/Expired_Inventories"
          element={token && role === 'admin' ? <ExpiredInventories /> : <Navigate to="/admin" />} 
           
        />

         <Route 
          path="/admin/Messages"
          element={token && role === 'admin' ? <Messages /> : <Navigate to="/admin" />} 
           
        />

        <Route
          path="/admin/Order_Address"
          element={token && role === 'admin' ? <OrderAddress /> : <Navigate to="/admin" />} 
        />

        {/* Reset Password Route - Accessible without authentication */}
        <Route 
                    path="/admin/Reset_Password" 
                    element={<ResetPass />} 
                  />


        {/* Protected Employee Routes - Only accessible if user is authenticated as employee */}
        <Route 
          path="/employee/dashboard" 
          element={token && role === 'employee' ? <EDashboard /> : <Navigate to="/admin" />} 
        />

        <Route 
          path="/employee/profile" 
          element={token && role === 'employee' ? <Emp_Profile /> : <Navigate to="/admin" />}  
          
        />

        <Route 
          path="/employee/customer" 
          element={token && role === 'employee' ? <Emp_Customer /> : <Navigate to="/admin" />}  
          
        />

        <Route 
          path="/employee/orders" 
          element={token && role === 'employee' ? <Emp_Orders/> : <Navigate to="/admin" />}  
          
        />

        <Route 
          path="/employee/Inventory" 
          element={token && role === 'employee' ? <Emp_Inventory/> : <Navigate to="/admin" />}  
          
        />

        <Route 
          path="/employee/products" 
          element={token && role === 'employee' ? <Emp_Products/> : <Navigate to="/admin" />}  
          
        /> 
       

        <Route 
          path="/employee/categories" 
          element={token && role === 'employee' ? <Emp_Categories/> : <Navigate to="/admin" />}  
          
        /> 
        

        <Route 
          path="/employee/supplier" 
          element={token && role === 'employee' ? <Emp_Supplier/> : <Navigate to="/admin" />}  
          
        /> 

        <Route
          path="/employee/Expired_Inventories"    
          element={token && role === 'employee' ? <Emp_ExpiredInventories /> : <Navigate to="/admin" />}
        />

        <Route
          path="/employee/Order_Address"   
          element={token && role === 'employee' ? <Emp_Order_Address /> : <Navigate to="/admin" />}
        />

        <Route
          path="/employee/Transactions"
          element={token && role === 'employee' ? <Emp_Transactions /> : <Navigate to="/admin" />}
        />
        

        {/* Default Route: Redirects based on authentication - if authenticated, go to role-specific dashboard, otherwise go to login */}
        <Route path="*" element={<Navigate to={token ? `/${role}/dashboard` : "/admin"} />} />
      </Routes>
    </Router>
  );
}

export default App;
