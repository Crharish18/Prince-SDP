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
    if (!newEmployee.username || !newEmployee.firstName || !newEmployee.lastName || !newEmployee.email || !newEmployee.phoneNum || !newEmployee.password) {
      alert("All fields are required!");
      return;
    }
  
    axios
      .post('http://localhost:5000/api/employees', newEmployee)
      .then((response) => {
        console.log("Employee added:", response.data);
        setEmployees([...employees, response.data]);
        setShowModal(false);
      })
      .catch((error) => {
        console.error('Error adding employee:', error);
      });
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
      </div>
    </div>
  );
}

export default ManageEmployee;
