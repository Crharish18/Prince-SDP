import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa"; 
import Sidebar from "../../components/sidebar";
import Header from "../../components/Header";
import styles from './ManageEmployee.module.css'; // Import as CSS module
import 'bootstrap/dist/css/bootstrap.min.css';
import ViewModal from "../../components/Viewmodal"; 
import EditModal from "../../components/EditModal"; 
import AddEntityModal from "../../components/AddEntityModal";
import PrintModal from "../../components/PrintModal";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';  // This is an additional library to handle tables in PDFs
import logodash from "../../assets/PicturesAdmin/logoWhite.png";


function ManageEmployee() {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  // State for new employee form data
  const [newEmployee, setNewEmployee] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNum: '',
    role: 'employee', // Hardcoded as "employee"
    dob: '',
    nationalId: '',
    address: '',
    password: '' 
  });

  // State for validation errors in add form
  const [validationErrors, setValidationErrors] = useState({
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
  
  // State for search input and column
  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [showViewModal, setShowViewModal] = useState(false); 
  const [selectedEmployee, setSelectedEmployee] = useState(null); 
  // State for showing edit modal and edited employee
  const [showEditModal, setShowEditModal] = useState(false); 
  const [editedEmployee, setEditedEmployee] = useState({}); 
  // State for showing print modal
  const [showPrintModal, setShowPrintModal] = useState(false);

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

  // Format date as YYYY-MM-DD
  const formatDate = (dob) => {
    const date = new Date(dob);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Handle search column dropdown change
  const handleSearchColumnChange = (e) => {
    setSearchColumn(e.target.value);  
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);  
  };
  
  // Filter employees based on search input and column
  const filteredEmployees = employees.filter((emp) => {
    if (!searchText || !searchColumn) return true; 
    const value = emp[searchColumn]?.toString().toLowerCase(); 
    return value && value.includes(searchText.toLowerCase());
  });

  // Field definitions for EditModal
  const employeeFields = [
    { label: "Username", name: "username", type: "text" },
    { label: "First Name", name: "first_name", type: "text" },
    { label: "Last Name", name: "last_name", type: "text" },
    { label: "Email", name: "email", type: "email" },
    { label: "Phone Number", name: "phonenum", type: "text" },
    { label: "Date of Birth", name: "dob", type: "date" },
    { label: "National ID", name: "natID", type: "text" },
    { label: "Address", name: "address", type: "text" },
    { label: "Status", name: "status", type: "select", options: ["Active", "Disable"] }
  ];

  // Show Add Employee modal
  const handleAddEmployeeClick = () => {
    setShowModal(true);
  };

  // Close Add Employee modal and reset form
  const handleCloseModal = () => {
    setNewEmployee({
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNum: '',
      role: 'employee', // Keep the hardcoded role
      dob: '',
      nationalId: '',
      address: '',
      password: ''
    });
    setValidationErrors({
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
    setShowModal(false);
  };

  // Handle input change in Add Employee form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Skip updating role as it's hardcoded
    if (name !== 'role') {
      setNewEmployee({
        ...newEmployee,
        [name]: value
      });
    }
  };

  // Validate and save new employee to backend
  const handleSaveNewEmployee = () => {
    let errors = {};
    // Username validation
    if (!newEmployee.username || newEmployee.username.length < 4) {
      errors.username = "Username must be at least 4 characters long.";
    } else if (!/^[a-zA-Z0-9]+$/.test(newEmployee.username)) {
      errors.username = "Username can only contain letters and numbers, no symbols.";
    }
    // First name validation
    if (!newEmployee.firstName || newEmployee.firstName.length < 4) {
      errors.firstName = "First name must be at least 4 characters long.";
    } else if (!/^[A-Za-z]+$/.test(newEmployee.firstName)) {
      errors.firstName = "First name should contain only letters.";
    }
    // Last name validation
    if (!newEmployee.lastName || newEmployee.lastName.length < 4) {
      errors.lastName = "Last name must be at least 4 characters long.";
    } else if (!/^[A-Za-z]+$/.test(newEmployee.lastName)) {
      errors.lastName = "Last name should contain only letters.";
    }
    // Email validation
    if (!newEmployee.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmployee.email)) {
      errors.email = "Invalid email address.";
    }
    // Phone number validation
    if (!newEmployee.phoneNum || !/^\d{10}$/.test(newEmployee.phoneNum)) {
      errors.phoneNum = "Phone number must be exactly 10 digits.";
    }
    // Date of Birth validation
    if (!newEmployee.dob) {
      errors.dob = "Date of Birth is required.";
    } else {
      const dobDate = new Date(newEmployee.dob);
      const currentDate = new Date();
      if (isNaN(dobDate)) {
        errors.dob = "Invalid date format.";
      } else if (dobDate >= currentDate) {
        errors.dob = "Date of Birth must be in the past.";
      }
    }
    // National ID validation
    if (!newEmployee.nationalId || !/^\d{10,12}$/.test(newEmployee.nationalId)) {
      errors.nationalId = "National ID must be between 10 to 12 digits.";
    }
    // Address validation
    if (!newEmployee.address || newEmployee.address.length < 5) {
      errors.address = "Address must be at least 5 characters long.";
    }
    // Password validation
    if (!newEmployee.password || newEmployee.password.length < 8) {
      errors.password = "Password must be at least 8 characters long.";
    }
    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      // Ensure role is set to "employee" before saving
      const employeeData = {
        ...newEmployee,
        role: 'employee',
        status: 'Active' // Set default status to Active
      };
      axios
        .post("http://localhost:5000/api/employees", employeeData)
        .then((response) => {
          setEmployees([...employees, response.data]);
          setShowModal(false);
          setNewEmployee({
            username: '',
            firstName: '',
            lastName: '',
            email: '',
            phoneNum: '',
            role: 'employee',
            dob: '',
            nationalId: '',
            address: '',
            password: ''
          });
        })
        .catch((error) => {
          console.error("Error adding employee:", error);
        });
    }
  };

  // Show view modal for selected employee
  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  // Close view modal
  const handleCloseViewModal = () => {
    setShowViewModal(false); 
  };

  // Delete employee by ID
  const handleDeleteEmployee = (employeeId) => {
    axios
      .delete(`http://localhost:5000/api/employees/${employeeId}`)
      .then((response) => {
        setEmployees((prevEmployees) =>
          prevEmployees.filter((employee) => employee.userid !== employeeId)
        );
      })
      .catch((error) => {
        console.error("Error deleting employee:", error);
      });
  };

  // Show edit modal for selected employee (with formatted DOB)
  const handleEditEmployee = (employee) => {
    const formattedDob = employee.dob ? employee.dob.split('T')[0] : '';
    setSelectedEmployee(employee);
    setEditedEmployee({ ...employee, dob: formattedDob });
    setShowEditModal(true);
  };
  
  // Validate and save edited employee to backend
  const handleSaveEditEmployee = () => {
    let isValid = true;
    // Username validation
    if (!editedEmployee.username || editedEmployee.username.length < 4 || !/^[a-zA-Z0-9]+$/.test(editedEmployee.username)) {
      isValid = false;
      alert("Username must be at least 4 characters long and contain only letters and numbers.");
      return;
    }
    // First name validation
    if (!editedEmployee.first_name || editedEmployee.first_name.length < 4 || !/^[A-Za-z]+$/.test(editedEmployee.first_name)) {
      isValid = false;
      alert("First name must be at least 4 characters long and contain only letters.");
      return;
    }
    // Last name validation
    if (!editedEmployee.last_name || editedEmployee.last_name.length < 4 || !/^[A-Za-z]+$/.test(editedEmployee.last_name)) {
      isValid = false;
      alert("Last name must be at least 4 characters long and contain only letters.");
      return;
    }
    // Email validation
    if (!editedEmployee.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedEmployee.email)) {
      isValid = false;
      alert("Invalid email address.");
      return;
    }
    // Phone number validation
    if (!editedEmployee.phonenum || !/^\d{10}$/.test(editedEmployee.phonenum)) {
      isValid = false;
      alert("Phone number must be exactly 10 digits.");
      return;
    }
    // Date of Birth validation
    if (!editedEmployee.dob) {
      isValid = false;
      alert("Date of Birth is required.");
      return;
    } else {
      const dobDate = new Date(editedEmployee.dob);
      const currentDate = new Date();
      if (isNaN(dobDate)) {
        isValid = false;
        alert("Invalid date format.");
        return;
      } else if (dobDate >= currentDate) {
        isValid = false;
        alert("Date of Birth must be in the past.");
        return;
      }
    }
    // National ID validation
    if (!editedEmployee.natID || !/^\d{10,12}$/.test(editedEmployee.natID)) {
      isValid = false;
      alert("National ID must be between 10 to 12 digits.");
      return;
    }
    // Address validation
    if (!editedEmployee.address || editedEmployee.address.length < 5) {
      isValid = false;
      alert("Address must be at least 5 characters long.");
      return;
    }
    if (isValid) {
      // Remove password and timestamps before sending update
      const { password, created_at, updated_at, ...employeeData } = editedEmployee;
      axios
        .put(`http://localhost:5000/api/employees/${editedEmployee.userid}`, employeeData)
        .then((response) => {
          setEmployees((prevEmployees) =>
            prevEmployees.map((emp) => (emp.userid === editedEmployee.userid ? editedEmployee : emp))
          );
          setShowEditModal(false);
        })
        .catch((error) => {
          console.error("Error updating employee:", error.response ? error.response.data : error);
        });
    }
  };

  // Handle input change in Edit Employee modal
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "dob") {
      setEditedEmployee((prev) => ({
        ...prev,
        [name]: new Date(value).toISOString().split('T')[0], 
      }));
    } else {
      setEditedEmployee((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Close edit modal and reset selected employee
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedEmployee(null);
  };

  // Show print modal for downloading PDF
  const handleDownloadPDF = () => {
    setShowPrintModal(true);
  };

  // Main render
  return (
    <div className={styles.ManageEmployeeContainer}>
      <Sidebar />
      <div className={styles.ManageEmployeeContent}>
        <Header />
        <div className={styles.InnerContainer} style={{ marginLeft: "10px", width: "100%" }}>
          <div className={styles.TopSection}>
            <h1 className="section-title" style={{ fontSize: '28px', fontWeight: 'bold' }}>Manage Employees</h1>
            {/* Search and action controls */}
            <div className={styles.SearchWrapper}>
              {/* Search column dropdown */}
              <select
                className="form-control"
                value={searchColumn}
                onChange={handleSearchColumnChange}
                style={{ marginRight: "10px", width: "200px" }}
              >
                <option value="userid">UserID</option>
                <option value="first_name">FirstName</option>
                <option value="last_name">LastName</option>
                <option value="email">Email</option>
                <option value="phoneNum">PhoneNum</option>
                <option value="natId">NationalID</option>
                <option value="status">Status</option>
              </select>
              {/* Search input */}
              <input
                type="text"
                className="form-control search-bar"
                value={searchText}
                onChange={handleSearchChange}
                placeholder={`Search by ${searchColumn}...`}
              />
              <div className={styles.BtnContainer}>
                {/* Add Employee button */}
                <button className="btn btn-primary" style={{ width: '150px', marginLeft:"10px" }} onClick={handleAddEmployeeClick}>
                  Add Employee
                </button>
                {/* Print button */}
                <button className="btn btn-secondary"  onClick={handleDownloadPDF} style={{ width: '150px', marginLeft:"10px" }}>Print</button>
              </div>
            </div>
          </div>

          {/* Employees table */}
          <div className={styles.TableContainer}>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>USERID</th>
                  <th>FIRSTNAME</th>
                  <th>LASTNAME</th>
                  <th>EMAIL</th>
                  <th>PHONENUM</th>
                  <th>NationalID</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.userid}>
                      <td>{emp.userid}</td>
                      <td>{emp.first_name}</td>
                      <td>{emp.last_name}</td>
                      <td>{emp.email}</td>
                      <td>{emp.phonenum}</td>
                      <td>{emp.natID}</td>
                      <td>
                        <span style={{ 
                          color: emp.status === 'Active' ? 'green' : 'red',
                          fontWeight: 'bold'
                        }}>
                          {emp.status || 'Active'}
                        </span>
                      </td>
                      <td>
                        {/* View employee button */}
                        <FaEye
                          style={{ marginRight: "10px", cursor: "pointer", color: "#2770b4" }}
                          onClick={() => handleViewEmployee(emp)} 
                        />
                        {/* Edit employee button */}
                        <FaEdit
                          style={{ marginRight: "10px", cursor: "pointer", color: "#f0ad4e" }}
                          onClick={() => handleEditEmployee(emp)} 
                        />
                        {/* Delete employee button */}
                        <FaTrash
                          style={{ cursor: "pointer", color: "#d9534f" }}
                          onClick={() => handleDeleteEmployee(emp.userid)} 
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">No employees found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Employee Modal */}
        <AddEntityModal
          showModal={showModal}
          handleClose={handleCloseModal}
          handleSave={handleSaveNewEmployee}
          entityTitle="Employee"
          entityData={newEmployee}
          entityFields={[
            { label: "Username", name: "username", type: "text" },
            { label: "First Name", name: "firstName", type: "text" },
            { label: "Last Name", name: "lastName", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Phone Number", name: "phoneNum", type: "text" },
            // Role field removed from the form since it's hardcoded
            { label: "Date of Birth", name: "dob", type: "date" },
            { label: "National ID", name: "nationalId", type: "text" },
            { label: "Address", name: "address", type: "text" },
            { label: "Password", name: "password", type: "password" }
          ]}
          handleInputChange={handleInputChange}
          validationErrors={validationErrors}
        />

        {/* View Modal for employee details */}
        <ViewModal
          showViewModal={showViewModal}
          selectedEntity={selectedEmployee}
          handleClose={handleCloseViewModal}
          entityTitle="Employee"
          entityFields={[
            { label: "USERID", name: "userid" },
            { label: "Username", name: "username" },
            { label: "First Name", name: "first_name" },
            { label: "Last Name", name: "last_name" },
            { label: "Email", name: "email" },
            { label: "Phone Number", name: "phonenum" },
            { label: "Role", name: "role" },
            { label: "Date of Birth", name: "dob", format: formatDate },
            { label: "National ID", name: "natID" },
            { label: "Address", name: "address" },
            { label: "Status", name: "status" }
          ]}
        />

        {/* Edit Modal for employee */}
        <EditModal
          showEditModal={showEditModal}
          entityData={editedEmployee}
          entityTitle="Employee"
          entityFields={employeeFields}
          handleClose={handleCloseEditModal}
          handleSaveEditEntity={handleSaveEditEmployee}
          handleEditInputChange={handleEditInputChange}
        />

        {/* Print Modal for employees */}
        <PrintModal
          show={showPrintModal}
          handleClose={() => setShowPrintModal(false)}
          title="Print Employee Report"
          data={filteredEmployees}
          fields={[
            { label: "USERID", field: "userid" },
            { label: "Username", field: "username" },
            { label: "First Name", field: "first_name" },
            { label: "Last Name", field: "last_name" },
            { label: "Email", field: "email" },
            { label: "Phone Number", field: "phonenum" },
            { label: "Role", field: "role" },
            { label: "Date of Birth", field: "dob", format: (date) => date ? new Date(date).toLocaleDateString() : "" },
            { label: "National ID", field: "natID" },
            { label: "Address", field: "address" },
            { label: "Status", field: "status" }
          ]}
          filename="employee_report.pdf"
          reportTitle="Employee Details Report"
        />

      </div>
    </div>
  );
}

export default ManageEmployee;
