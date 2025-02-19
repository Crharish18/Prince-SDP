import React, { useState } from "react";
import Sidebar from "../../components/sidebar";
import Header from "../../components/Header";
import './ManageEmployee.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // bootstrap

function ManageEmployee() {
  const [showModal, setShowModal] = useState(false);

  const handleAddEmployeeClick = () => {
    setShowModal(true); // Show modal when "Add Employee" is clicked
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close modal
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
              <input
                type="text"
                className="form-control search-bar"
                placeholder="Search employees..."
              />
              <div className="btn-container">
                <button className="btn btn-primary" onClick={handleAddEmployeeClick}>
                  Add Employee
                </button>
                <button className="btn btn-secondary">Filter</button>
              </div>
            </div>
          </div>

          {/* Employee Table */}
          <div className="table-container">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Address</th>
                  <th>DOB</th>
                  <th>Mobile</th>
                  <th>National ID</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {/* just some rows of entries */}
                {[...Array(20)].map((_, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>John Doe</td>
                    <td>123 Main St, City</td>
                    <td>1990-01-01</td>
                    <td>123-456-7890</td>
                    <td>123456789V</td>
                    <td>johndoe@email.com</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Adding Employee */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Add Employee</h2>
              <form>
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" className="form-control" placeholder="Enter name" />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" className="form-control" placeholder="Enter address" />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" className="form-control" />
                </div>
                <div className="form-group">
                  <label>Mobile</label>
                  <input type="text" className="form-control" placeholder="Enter mobile number" />
                </div>
                <div className="form-group">
                  <label>National ID</label>
                  <input type="text" className="form-control" placeholder="Enter National ID" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" className="form-control" placeholder="Enter email" />
                </div>
                <div className="btn-container">
                  <button type="button" className="btn btn-primary">Save Employee</button>
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
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
