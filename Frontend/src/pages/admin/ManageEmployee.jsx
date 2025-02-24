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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("id");

  // Fetch employees from the backend
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/employees')
      .then((response) => {
        console.log('Employee data:', response.data);
        setEmployees(response.data);  // Update state
        console.log('Updated employees state:', employees);  // Check if state updated
      })
      .catch((error) => {
        console.error('Error fetching employees:', error);
      });
  }, []);
  
  
  
  const handleAddEmployeeClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleViewClick = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
  };

  const handleDeleteClick = (employeeId) => {
    const updatedEmployees = employees.filter((emp) => emp.id !== employeeId);
    setEmployees(updatedEmployees);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleSearchColumnChange = (e) => {
    setSearchColumn(e.target.value);
  };

  const filteredEmployees = employees.filter((emp) => {
    const value = emp[searchColumn];  // Get the value of the search column
    return value && value.toString().toLowerCase().includes(searchText.toLowerCase());
     // Check if it's not undefined or null
  });
  

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
        <td>{emp.phone_num}</td>
        <td>{emp.role}</td>
        <td>
          <FaEye
            style={{ marginRight: "10px", cursor: "pointer", color: "#2770b4" }}
            onClick={() => handleViewClick(emp)} // View action
          />
          <FaEdit
            style={{ marginRight: "10px", cursor: "pointer", color: "#f0ad4e" }}
            onClick={() => handleEditClick(emp)} // Edit action
          />
          <FaTrash
            style={{ cursor: "pointer", color: "#d9534f" }}
            onClick={() => handleDeleteClick(emp.userid)} // Delete action
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
      </div>
    </div>
  );
}

export default ManageEmployee;
