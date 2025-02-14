import React, { useState } from "react";
import "./AdminLogin.css";  // Import the CSS file for styling
import logo from "../../assets/PicturesAdmin/logoBlack.png";  // Import the logo image

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Employee");
  const [employeeId, setEmployeeId] = useState(""); // State for employee ID

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can handle form submission (e.g., authentication)
    console.log("Username:", username);
    console.log("Password:", password);
    console.log("Role:", role);
    if (role === "Employee") {
      console.log("Employee ID:", employeeId);  // Log employee ID if role is Employee
    }
  };

  return (
    <div className="login-container">
      {/* Header for logo */}
      <div className="header-bar">
        <img src={logo} alt="Shop Logo" className="logo" />
      </div>

      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="role-selection">
            <label>
              <input
                type="radio"
                value="Admin"
                checked={role === "Admin"}
                onChange={() => setRole("Admin")}
              />
              Admin
            </label>
            <label>
              <input
                type="radio"
                value="Employee"
                checked={role === "Employee"}
                onChange={() => setRole("Employee")}
              />
              Employee
            </label>
          </div>

          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Conditionally render Employee ID input if the role is "Employee" */}
          {role === "Employee" && (
            <div className="input-group">
              <label>Employee ID</label>
              <input
                type="text"
                placeholder="Enter your Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
