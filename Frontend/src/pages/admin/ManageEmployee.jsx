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
  
  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [showViewModal, setShowViewModal] = useState(false); 
  const [selectedEmployee, setSelectedEmployee] = useState(null); 
  const [showEditModal, setShowEditModal] = useState(false); 
  const [editedEmployee, setEditedEmployee] = useState({}); 

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

  const formatDate = (dob) => {
    const date = new Date(dob);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const handleSearchColumnChange = (e) => {
    setSearchColumn(e.target.value);  
  };
  
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);  
  };
  
  const filteredEmployees = employees.filter((emp) => {
    if (!searchText || !searchColumn) return true; 
    const value = emp[searchColumn]?.toString().toLowerCase(); 
    return value && value.includes(searchText.toLowerCase());
  });

  const employeeFields = [
    { label: "Username", name: "username", type: "text" },
    { label: "First Name", name: "first_name", type: "text" },
    { label: "Last Name", name: "last_name", type: "text" },
    { label: "Email", name: "email", type: "email" },
    { label: "Phone Number", name: "phonenum", type: "text" },
    { label: "Role", name: "role", type: "text" },
    { label: "Date of Birth", name: "dob", type: "date" },
    { label: "National ID", name: "natID", type: "text" },
    { label: "Address", name: "address", type: "text" }
  ];

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
    if (!newEmployee.username || newEmployee.username.length < 4) {
      errors.username = "Username must be at least 4 characters long.";
    }
    if (!newEmployee.firstName || !/^[A-Za-z]+$/.test(newEmployee.firstName)) {
      errors.firstName = "First name is required and should contain only letters.";
    }
    if (!newEmployee.lastName || !/^[A-Za-z]+$/.test(newEmployee.lastName)) {
      errors.lastName = "Last name is required and should contain only letters.";
    }
    if (!newEmployee.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmployee.email)) {
      errors.email = "Invalid email address.";
    }
    if (!newEmployee.phoneNum || !/^\d{10,15}$/.test(newEmployee.phoneNum)) {
      errors.phoneNum = "Phone number must be between 10 and 15 digits.";
    }
    if (!newEmployee.role || !["admin", "employee"].includes(newEmployee.role.toLowerCase())) {
      errors.role = "Role must be either 'admin' or 'employee'.";
    }
    if (!newEmployee.dob) {
      errors.dob = "Date of Birth is required.";
    }
    if (!newEmployee.nationalId || newEmployee.nationalId.length < 6) {
      errors.nationalId = "National ID must be at least 6 characters long.";
    }
    if (!newEmployee.address || newEmployee.address.length < 5) {
      errors.address = "Address must be at least 5 characters long.";
    }
    if (!newEmployee.password || newEmployee.password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }
  
    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      axios
        .post("http://localhost:5000/api/employees", newEmployee)
        .then((response) => {
          setEmployees([...employees, response.data]);
          setShowModal(false);
        })
        .catch((error) => {
          console.error("Error adding employee:", error);
        });
    }
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false); 
  };

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

  const handleEditEmployee = (employee) => {
    const formattedDob = employee.dob ? employee.dob.split('T')[0] : '';
    setSelectedEmployee(employee);
    setEditedEmployee({ ...employee, dob: formattedDob });
    setShowEditModal(true);
  };
  
  const handleSaveEditEmployee = () => {
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
  };

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

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedEmployee(null);
  };

  return (
    <div className={styles.ManageEmployeeContainer}>
      <Sidebar />
      <div className={styles.ManageEmployeeContent}>
        <Header />
        <div className={styles.InnerContainer} style={{ marginLeft: "10px", width: "100%" }}>
          <div className={styles.TopSection}>
          <h1 className="section-title" style={{ fontSize: '28px', fontWeight: 'bold' }}>Manage Employees</h1>

            <div className={styles.SearchWrapper}>
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
              </select>
              <input
                type="text"
                className="form-control search-bar"
                value={searchText}
                onChange={handleSearchChange}
                placeholder={`Search by ${searchColumn}...`}
              />
              <div className={styles.BtnContainer}>
                <button className="btn btn-primary" style={{ width: '150px', marginLeft:"10px" }} onClick={handleAddEmployeeClick}>
                  Add Employee
                </button>
                <button className="btn btn-secondary" style={{ width: '150px', marginLeft:"10px" }}>Report</button>
              </div>
            </div>
          </div>

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
                        <FaEye
                          style={{ marginRight: "10px", cursor: "pointer", color: "#2770b4" }}
                          onClick={() => handleViewEmployee(emp)} 
                        />
                        <FaEdit
                          style={{ marginRight: "10px", cursor: "pointer", color: "#f0ad4e" }}
                          onClick={() => handleEditEmployee(emp)} 
                        />
                        <FaTrash
                          style={{ cursor: "pointer", color: "#d9534f" }}
                          onClick={() => handleDeleteEmployee(emp.userid)} 
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
            { label: "Role", name: "role", type: "text" },
            { label: "Date of Birth", name: "dob", type: "date" },
            { label: "National ID", name: "nationalId", type: "text" },
            { label: "Address", name: "address", type: "text" },
            { label: "Password", name: "password", type: "password" } // ✅ Password field included
          ]}
          handleInputChange={handleInputChange}
          validationErrors={validationErrors}
        />

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
            { label: "Address", name: "address" }
          ]}
        />

        <EditModal
          showEditModal={showEditModal}
          entityData={editedEmployee}
          entityTitle="Employee"
          entityFields={employeeFields}
          handleClose={() => setShowEditModal(false)}
          handleSaveEditEntity={handleSaveEditEmployee}
          handleEditInputChange={handleEditInputChange}
        />
      </div>
    </div>
  );
}

export default ManageEmployee;
