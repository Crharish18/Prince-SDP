import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa"; 
import Sidebar from "../../components/sidebar";
import Header from "../../components/Header";
import './ManageEmployee.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function ManageEmployee() {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNum: '',
    role: '',
    dob: '',
    nationalId: '',
    address: '',
    password: '' 
  });
  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("id");
  const [showViewModal, setShowViewModal] = useState(false); // To show/hide the view modal
  const [selectedEmployee, setSelectedEmployee] = useState(null); // To store the selected employee


  // Fetch employees from the backend
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/employees')
      .then((response) => {
        setEmployees(response.data);
      })
      .catch((error) => {
        console.error('Error fetching employees:', error);
      });
  }, []);

  
  //to view the dob in my employee view mdel
  const formatDate = (dob) => {
    const date = new Date(dob);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const handleSearchColumnChange = (e) => {
    setSearchColumn(e.target.value);  // Updates the search column based on user selection
  };
  
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);  // Update the searchText state when the user types in the search input
  };
  
  const handleAddEmployeeClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee({
      ...newEmployee,
      [name]: value
    });
  };

  const handleSaveNewEmployee = () => {
    let errors = {};
  
    // Username validation
    if (!newEmployee.username || newEmployee.username.length < 4) {
      errors.username = "Username must be at least 4 characters long.";
    }
  
    // First Name validation
    if (!newEmployee.firstName || !/^[A-Za-z]+$/.test(newEmployee.firstName)) {
      errors.firstName = "First name is required and should contain only letters.";
    }
  
    // Last Name validation
    if (!newEmployee.lastName || !/^[A-Za-z]+$/.test(newEmployee.lastName)) {
      errors.lastName = "Last name is required and should contain only letters.";
    }
  
    // Email validation
    if (!newEmployee.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmployee.email)) {
      errors.email = "Invalid email address.";
    }
  
    // Phone Number validation
    if (!newEmployee.phoneNum || !/^\d{10,15}$/.test(newEmployee.phoneNum)) {
      errors.phoneNum = "Phone number must be between 10 and 15 digits.";
    }
  
    // Role validation
    if (!newEmployee.role || !["admin", "employee"].includes(newEmployee.role.toLowerCase())) {
      errors.role = "Role must be either 'admin' or 'employee'.";
    }
  
    // Date of Birth validation
    if (!newEmployee.dob) {
      errors.dob = "Date of Birth is required.";
    }
  
    // National ID validation
    if (!newEmployee.nationalId || newEmployee.nationalId.length < 6) {
      errors.nationalId = "National ID must be at least 6 characters long.";
    }
  
    // Address validation
    if (!newEmployee.address || newEmployee.address.length < 5) {
      errors.address = "Address must be at least 5 characters long.";
    }
  
    // Password validation
    if (!newEmployee.password || newEmployee.password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }
  
    // Check if there are any validation errors
    if (Object.keys(errors).length > 0) {
      alert(Object.values(errors).join("\n")); // Show all errors in an alert
      return;
    }

    
    // Proceed with saving the employee if validation passes
    axios
      .post("http://localhost:5000/api/employees", newEmployee)
      .then((response) => {
        console.log("Employee added:", response.data);
        setEmployees([...employees, response.data]);
        setShowModal(false);
      })
      .catch((error) => {
        console.error("Error adding employee:", error);
      });
  };


  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
    console.log("View Employee clicked:", employee);  // Check if this logs when clicking View button
  };
  
  
  return (
    <div className="ManageEmployee-container">
      <Sidebar />
      <div className="ManageEmployee-content">
        <Header />

        <div className="inner-container">
          <div className="top-section">
            <h1 className="section-title">Manage Employees</h1>
            <div className="search-wrapper">
              <select
                className="form-control"
                value={searchColumn}
                onChange={handleSearchColumnChange}
                style={{ marginRight: "10px", width: "200px" }}
              >
                <option value="id">USERID</option>
                <option value="firstName">FIRSTNAME</option>
                <option value="lastName">LASTNAME</option>
                <option value="email">EMAIL</option>
                <option value="phoneNum">PHONENUM</option>
                <option value="role">ROLE</option>
                <option value="username">USERNAME</option>
                <option value="dob">DATE OF BIRTH</option>
                <option value="natId">NATIONAL ID</option>
                <option value="address">ADDRESS</option>
              </select>
              <input
                type="text"
                className="form-control search-bar"
                value={searchText}
                onChange={handleSearchChange}
                placeholder={`Search by ${searchColumn}...`}
              />
              <div className="btn-container" style={{ marginTop: "-0px" }}>
                <button className="btn btn-primary" onClick={handleAddEmployeeClick}>
                  Add Employee
                </button>
                <button className="btn btn-secondary">Filter</button>
              </div>
            </div>
          </div>

          <div className="table-container">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>USERID</th>
                  <th>FIRSTNAME</th>
                  <th>LASTNAME</th>
                  <th>EMAIL</th>
                  <th>PHONENUM</th>
                  <th>ROLE</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length > 0 ? (
                  employees.map((emp) => (
                    <tr key={emp.userid}>
                      <td>{emp.userid}</td>
                      <td>{emp.first_name}</td>
                      <td>{emp.last_name}</td>
                      <td>{emp.email}</td>
                      <td>{emp.phonenum}</td>
                      <td>{emp.role}</td>
                      <td>
                        <FaEye
                          style={{ marginRight: "10px", cursor: "pointer", color: "#2770b4" }}
                          onClick={() => handleViewEmployee(emp)} // Ensure this triggers handleViewEmployee
                        />
                        <FaEdit
                          style={{ marginRight: "10px", cursor: "pointer", color: "#f0ad4e" }}
                        />
                        <FaTrash
                          style={{ cursor: "pointer", color: "#d9534f" }}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">No employees found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Employee Modal */}
        {showModal && (
          <div className="modal-overlay1">
            <div className="modal-content1">
              <h2>Add Employee</h2>
              <form className="modal-form1">
                <div className="grid-container">
                  <div className="form-group">
                    <label style={{ fontWeight: "bold" }}>Username</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Username"
                      name="username"
                      value={newEmployee.username}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: "bold" }}>First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter first name"
                      name="firstName"
                      value={newEmployee.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: "bold" }}>Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter last name"
                      name="lastName"
                      value={newEmployee.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: "bold" }}>Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter email"
                      name="email"
                      value={newEmployee.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: "bold" }}>Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter phone number"
                      name="phoneNum"
                      value={newEmployee.phoneNum}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: "bold" }}>Role</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter role"
                      name="role"
                      value={newEmployee.role}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: "bold" }}>Date of Birth</label>
                    <input
                      type="date"
                      className="form-control"
                      placeholder="Enter DOB"
                      name="dob"
                      value={newEmployee.dob}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: "bold" }}>National ID</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter NationalID"
                      name="nationalId"
                      value={newEmployee.nationalId}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: "bold" }}>Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Address"
                      name="address"
                      value={newEmployee.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                  <label style={{ fontWeight: "bold" }}>Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter password"
                    name="password"
                    value={newEmployee.password}
                    onChange={handleInputChange}
                  />
                </div>
                </div>
                <div className="btn-container">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                    style={{ marginLeft: "200px", width: "150px" }}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ marginRight: "210px" }}
                    onClick={handleSaveNewEmployee}
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal for Viewing Employee */}
        {showViewModal && selectedEmployee && (
          <div className="modal-overlay1">
            <div className="modal-content1">
              <h2 className="modal-title1">View Employee</h2>
              <form className="modal-form1">
                <div className="grid-container">
                  <div className="form-group">
                    <label style={{ fontWeight: "bold" }}>USERID</label>
                    <input type="text" className="form-control" value={selectedEmployee.userid} disabled />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: "bold" }}>Username</label>
                    <input type="text" className="form-control" value={selectedEmployee.username} disabled />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: "bold" }}>First Name</label>
                    <input type="text" className="form-control" value={selectedEmployee.first_name} disabled />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: "bold" }}>Last Name</label>
                    <input type="text" className="form-control" value={selectedEmployee.last_name} disabled />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: "bold" }}>Email</label>
                    <input type="email" className="form-control" value={selectedEmployee.email} disabled />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: "bold" }}>Phone Number</label>
                    <input type="text" className="form-control" value={selectedEmployee.phonenum} disabled />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: "bold" }}>Role</label>
                    <input type="text" className="form-control" value={selectedEmployee.role} disabled />
                  </div>
                  <div className="form-group">
            <label style={{ fontWeight: "bold" }}>Date of Birth</label>
            <input 
              type="date" 
              className="form-control" 
              value={formatDate(selectedEmployee.dob)} 
              disabled 
            />
          </div>
                  <div className="form-group">
                    <label style={{ fontWeight: "bold" }}>National ID</label>
                    <input type="text" className="form-control" value={selectedEmployee.natID} disabled />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: "bold" }}>Address</label>
                    <input type="text" className="form-control" value={selectedEmployee.address} disabled />
                  </div>
                </div>
                <div className="btn-container">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowViewModal(false)} // Close the modal
                    style={{ marginLeft: "200px", width: "150px" }}
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ManageEmployee;
