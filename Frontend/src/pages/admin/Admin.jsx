import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa"; 
import Sidebar from "../../components/sidebar";
import Header from "../../components/Header";
import styles from './Admin.module.css'; // Updated for Admin
import 'bootstrap/dist/css/bootstrap.min.css';
import ViewModal from "../../components/Viewmodal"; 
import EditModal from "../../components/EditModal"; 
import AddEntityModal from "../../components/AddEntityModal";
import PrintModal from "../../components/PrintModal";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';  // This is an additional library to handle tables in PDFs
import logodash from "../../assets/PicturesAdmin/logoWhite.png";

function Admin() {
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  // State for new admin form data
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNum: '',
    role: 'admin', // Already hardcoded as "admin"
    dob: '',
    nationalId: '',
    address: '',
    password: '',
    status: 'Active' // Default status
  });

  // State for form validation errors
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
  
  // State for search input and selected column
  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [showViewModal, setShowViewModal] = useState(false); 
  const [selectedAdmin, setSelectedAdmin] = useState(null); 
  const [showEditModal, setShowEditModal] = useState(false); 
  const [editedAdmin, setEditedAdmin] = useState({}); 
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Fetch admin data from API on component mount
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/admin') 
      .then((response) => {
        setAdmins(response.data);
      })
      .catch((error) => {
        console.error('Error fetching admin:', error);
      });
  }, []);

  // format date as YYYY-MM-DD
  const formatDate = (dob) => {
    const date = new Date(dob);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle change in search column dropdown
  const handleSearchColumnChange = (e) => {
    setSearchColumn(e.target.value);  
  };
  
  // Handle change in search input
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);  
  };

  // Filter admins based on search input and column
  const filteredAdmins = admins.filter((admin) => {
    if (!searchText || !searchColumn) return true; 
    const value = admin[searchColumn]?.toString().toLowerCase(); 
    return value && value.includes(searchText.toLowerCase());
  });

  // Field definitions for the EditModal
  const adminFields = [
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

  // Show Add Admin modal
  const handleAddAdminClick = () => {
    setShowModal(true);
  };

  // Close Add Admin modal and reset form
  const handleCloseModal = () => {
    // Reset the form data when modal is closed
    setNewAdmin({
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNum: '',
      role: 'admin', 
      dob: '',
      nationalId: '',
      address: '',
      password: '',
      status: 'Active' 
    });
    
    // Reset validation errors
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
    
    // Close the modal
    setShowModal(false);
  };

  // Handle input change for Add Admin form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Skip updating role as it's hardcoded
    if (name !== 'role') {
      setNewAdmin({
        ...newAdmin,
        [name]: value
      });
    }
  };

  // Validate and save new admin
  const handleSaveNewAdmin = () => {
    let errors = {};
    
    // Username validation: more than 4 characters and no symbols
    if (!newAdmin.username || newAdmin.username.length < 4) {
      errors.username = "Username must be at least 4 characters long.";
    } else if (!/^[a-zA-Z0-9]+$/.test(newAdmin.username)) {
      errors.username = "Username can only contain letters and numbers, no symbols.";
    }
    
    // First name validation: only letters and more than 4 letters
    if (!newAdmin.firstName || newAdmin.firstName.length < 4) {
      errors.firstName = "First name must be at least 4 characters long.";
    } else if (!/^[A-Za-z]+$/.test(newAdmin.firstName)) {
      errors.firstName = "First name should contain only letters.";
    }
    
    // Last name validation: only letters and more than 4 letters
    if (!newAdmin.lastName || newAdmin.lastName.length < 4) {
      errors.lastName = "Last name must be at least 4 characters long.";
    } else if (!/^[A-Za-z]+$/.test(newAdmin.lastName)) {
      errors.lastName = "Last name should contain only letters.";
    }
    
    // Email validation: valid email format
    if (!newAdmin.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAdmin.email)) {
      errors.email = "Invalid email address.";
    }
    
    // Phone number validation: exactly 10 digits
    if (!newAdmin.phoneNum || !/^\d{10}$/.test(newAdmin.phoneNum)) {
      errors.phoneNum = "Phone number must be exactly 10 digits.";
    }
    
    // Date of Birth validation - must be in the past
    if (!newAdmin.dob) {
      errors.dob = "Date of Birth is required.";
    } else {
      const dobDate = new Date(newAdmin.dob);
      const currentDate = new Date();
      
      if (isNaN(dobDate)) {
        errors.dob = "Invalid date format.";
      } else if (dobDate >= currentDate) {
        errors.dob = "Date of Birth must be in the past.";
      }
    }
    
    // National ID validation: between 10 to 12 digits
    if (!newAdmin.nationalId || !/^\d{10,12}$/.test(newAdmin.nationalId)) {
      errors.nationalId = "National ID must be between 10 to 12 digits.";
    }
    
    // Address validation: more than 5 characters
    if (!newAdmin.address || newAdmin.address.length < 5) {
      errors.address = "Address must be at least 5 characters long.";
    }
    
    // Password validation: more than 8 characters
    if (!newAdmin.password || newAdmin.password.length < 8) {
      errors.password = "Password must be at least 8 characters long.";
    }
    
    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      // Ensure role and status are set correctly before saving
      const adminData = {
        ...newAdmin,
        role: 'admin',
        status: 'Active'
      };
      
      axios
        .post("http://localhost:5000/api/admin", adminData)
        .then((response) => {
          setAdmins([...admins, response.data]);
          setShowModal(false);
          
          // Reset form after successful save
          setNewAdmin({
            username: '',
            firstName: '',
            lastName: '',
            email: '',
            phoneNum: '',
            role: 'admin',
            dob: '',
            nationalId: '',
            address: '',
            password: '',
            status: 'Active'
          });
        })
        .catch((error) => {
          console.error("Error adding admin:", error);
        });
    }
  };

  // Show view modal for selected admin
  const handleViewAdmin = (admin) => {
    setSelectedAdmin(admin);
    setShowViewModal(true);
  };

  // Close view modal
  const handleCloseViewModal = () => {
    setShowViewModal(false); 
  };

  // Disable (soft-delete) admin by updating status to "Disable"
  const handleDeleteAdmin = (adminId) => {
    axios
      .delete(`http://localhost:5000/api/admin/${adminId}`)
      .then((response) => {
        
        setAdmins((prevAdmins) =>
          prevAdmins.map((admin) => {
            if (admin.userid === adminId) {
              return { ...admin, status: "Disable" };
            }
            return admin;
          })
        );
      })
      .catch((error) => {
        console.error("Error disabling admin:", error);
      });
  };

  // Show edit modal for selected admin (with formatted DOB)
  const handleEditAdmin = (admin) => {
    const formattedDob = admin.dob ? admin.dob.split('T')[0] : '';
    setSelectedAdmin(admin);
    setEditedAdmin({ ...admin, dob: formattedDob });
    setShowEditModal(true);
  };
  
  // Validate and save edited admin data
  const handleSaveEditAdmin = () => {
    // Validate the edited admin data
    let isValid = true;
    
    // Username validation: more than 4 characters and no symbols
    if (!editedAdmin.username || editedAdmin.username.length < 4 || !/^[a-zA-Z0-9]+$/.test(editedAdmin.username)) {
      isValid = false;
      alert("Username must be at least 4 characters long and contain only letters and numbers.");
      return;
    }
    
    // First name validation: only letters and more than 4 letters
    if (!editedAdmin.first_name || editedAdmin.first_name.length < 4 || !/^[A-Za-z]+$/.test(editedAdmin.first_name)) {
      isValid = false;
      alert("First name must be at least 4 characters long and contain only letters.");
      return;
    }
    
    // Last name validation: only letters and more than 4 letters
    if (!editedAdmin.last_name || editedAdmin.last_name.length < 4 || !/^[A-Za-z]+$/.test(editedAdmin.last_name)) {
      isValid = false;
      alert("Last name must be at least 4 characters long and contain only letters.");
      return;
    }
    
    // Email validation: valid email format
    if (!editedAdmin.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedAdmin.email)) {
      isValid = false;
      alert("Invalid email address.");
      return;
    }
    
    // Phone number validation: exactly 10 digits
    if (!editedAdmin.phonenum || !/^\d{10}$/.test(editedAdmin.phonenum)) {
      isValid = false;
      alert("Phone number must be exactly 10 digits.");
      return;
    }
    
    // Date of Birth validation - must be in the past
    if (!editedAdmin.dob) {
      isValid = false;
      alert("Date of Birth is required.");
      return;
    } else {
      const dobDate = new Date(editedAdmin.dob);
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
    
    // National ID validation: between 10 to 12 digits
    if (!editedAdmin.natID || !/^\d{10,12}$/.test(editedAdmin.natID)) {
      isValid = false;
      alert("National ID must be between 10 to 12 digits.");
      return;
    }
    
    // Address validation: more than 5 characters
    if (!editedAdmin.address || editedAdmin.address.length < 5) {
      isValid = false;
      alert("Address must be at least 5 characters long.");
      return;
    }
    
    if (isValid) {
      // Remove password and timestamps before sending update
      const { password, created_at, updated_at, ...adminData } = editedAdmin;
      axios
        .put(`http://localhost:5000/api/admin/${editedAdmin.userid}`, adminData)
        .then((response) => {
          setAdmins((prevAdmins) =>
            prevAdmins.map((admin) => (admin.userid === editedAdmin.userid ? editedAdmin : admin))
          );
          setShowEditModal(false);
        })
        .catch((error) => {
          console.error("Error updating admin:", error.response ? error.response.data : error);
        });
    }
  };

  // Handle input change for Edit Admin modal
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "dob") {
      setEditedAdmin((prev) => ({
        ...prev,
        [name]: new Date(value).toISOString().split('T')[0], 
      }));
    } else {
      setEditedAdmin((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Close Edit Admin modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedAdmin(null);
  };

  // Show print modal for downloading PDF
  const handleDownloadPDF = () => {
    setShowPrintModal(true);
  };

  // Main component render
  return (
    <div className={styles.AdminContainer} >
      <Sidebar />
      <div className={styles.AdminContent}>
        <Header />
        <div className={styles.InnerContainer} style={{ marginLeft: "10px", width: "100%" }} >
          <div className={styles.TopSection} >
            <h1 className="section-title" style={{ fontSize: '28px', fontWeight: 'bold' }}>Manage Admins</h1>

            {/* Search and action buttons */}
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
                {/* Add Admin button */}
                <button className="btn btn-primary" style={{ width: '150px', marginLeft:"10px" }} onClick={handleAddAdminClick}>
                  Add Admin
                </button>
                {/* Print button */}
                <button className="btn btn-secondary" style={{ width: '150px', marginLeft:"10px" }} onClick={handleDownloadPDF}>Print</button>
              </div>
            </div>
          </div>

          {/* Admins table */}
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
                {filteredAdmins.length > 0 ? (
                  filteredAdmins.map((admin) => (
                    <tr key={admin.userid}>
                      <td>{admin.userid}</td>
                      <td>{admin.first_name}</td>
                      <td>{admin.last_name}</td>
                      <td>{admin.email}</td>
                      <td>{admin.phonenum}</td>
                      <td>{admin.natID}</td>
                      <td>
                        <span style={{ 
                          color: admin.status === 'Active' ? 'green' : 'red',
                          fontWeight: 'bold'
                        }}>
                          {admin.status}
                        </span>
                      </td>
                      <td>
                        {/* View admin button */}
                        <FaEye
                          style={{ marginRight: "10px", cursor: "pointer", color: "#2770b4" }}
                          onClick={() => handleViewAdmin(admin)} 
                        />
                        {/* Edit admin button */}
                        <FaEdit
                          style={{ marginRight: "10px", cursor: "pointer", color: "#f0ad4e" }}
                          onClick={() => handleEditAdmin(admin)} 
                        />
                        {/* Delete admin button */}
                        <FaTrash
                          style={{ cursor: "pointer", color: "#d9534f" }}
                          onClick={() => handleDeleteAdmin(admin.userid)} 
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">No admins found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Admin Modal */}
        <AddEntityModal
          showModal={showModal}
          handleClose={handleCloseModal}
          handleSave={handleSaveNewAdmin}
          entityTitle="Admin"
          entityData={newAdmin}
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
            { label: "Password", name: "password", type: "password" },
            
            // Status field removed from the form since it's hardcoded
          ]}
          handleInputChange={handleInputChange}
          validationErrors={validationErrors}
        />

        {/* View Admin Modal */}
        <ViewModal
          showViewModal={showViewModal}
          selectedEntity={selectedAdmin}
          handleClose={handleCloseViewModal}
          entityTitle="Admin"
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

        {/* Edit Admin Modal */}
        <EditModal
          showEditModal={showEditModal}
          entityData={editedAdmin}
          entityTitle="Admin"
          entityFields={adminFields}
          handleClose={handleCloseEditModal}
          handleSaveEditEntity={handleSaveEditAdmin}
          handleEditInputChange={handleEditInputChange}
        />

        {/* Print Modal */}
        <PrintModal
          show={showPrintModal}
          handleClose={() => setShowPrintModal(false)}
          title="Print Admin Report"
          data={filteredAdmins}
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
          filename="admin_report.pdf"
          reportTitle="Admin Details Report"
        />
      </div>
    </div>
  );
}

export default Admin;
