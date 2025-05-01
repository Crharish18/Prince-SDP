import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa"; 
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from './Admin.module.css'; // Updated for Admin
import 'bootstrap/dist/css/bootstrap.min.css';
import ViewModal from "../../components/Viewmodal"; 
import EditModal from "../../components/EditModal"; 
import AddEntityModal from "../../components/AddEntityModal";

function Admin() {
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNum: '',
    role: 'admin',
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
  const [selectedAdmin, setSelectedAdmin] = useState(null); 
  const [showEditModal, setShowEditModal] = useState(false); 
  const [editedAdmin, setEditedAdmin] = useState({}); 

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/admin')  // API endpoint for fetching admin data
      .then((response) => {
        setAdmins(response.data);
      })
      .catch((error) => {
        console.error('Error fetching admin:', error);
      });
  }, []);

  const handleSearchColumnChange = (e) => {
    setSearchColumn(e.target.value);  
  };
  
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);  
  };

  const filteredAdmins = admins.filter((admin) => {
    if (!searchText || !searchColumn) return true; 
    const value = admin[searchColumn]?.toString().toLowerCase(); 
    return value && value.includes(searchText.toLowerCase());
  });

  const adminFields = [
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

  const handleAddAdminClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin({
      ...newAdmin,
      [name]: value
    });
  };

  const handleSaveNewAdmin = () => {
    let errors = {};
    if (!newAdmin.username || newAdmin.username.length < 4) {
      errors.username = "Username must be at least 4 characters long.";
    }
    if (!newAdmin.firstName || !/^[A-Za-z]+$/.test(newAdmin.firstName)) {
      errors.firstName = "First name is required and should contain only letters.";
    }
    if (!newAdmin.lastName || !/^[A-Za-z]+$/.test(newAdmin.lastName)) {
      errors.lastName = "Last name is required and should contain only letters.";
    }
    if (!newAdmin.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAdmin.email)) {
      errors.email = "Invalid email address.";
    }
    if (!newAdmin.phoneNum || !/^\d{10,15}$/.test(newAdmin.phoneNum)) {
      errors.phoneNum = "Phone number must be between 10 and 15 digits.";
    }
    if (!newAdmin.role || !["admin"].includes(newAdmin.role.toLowerCase())) {
      errors.role = "Role must be 'admin'.";
    }
    if (!newAdmin.dob) {
      errors.dob = "Date of Birth is required.";
    }
    if (!newAdmin.nationalId || newAdmin.nationalId.length < 6) {
      errors.nationalId = "National ID must be at least 6 characters long.";
    }
    if (!newAdmin.address || newAdmin.address.length < 5) {
      errors.address = "Address must be at least 5 characters long.";
    }
    if (!newAdmin.password || newAdmin.password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }
  
    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      axios
        .post("http://localhost:5000/api/admin", newAdmin)
        .then((response) => {
          setAdmins([...admins, response.data]);
          setShowModal(false);
        })
        .catch((error) => {
          console.error("Error adding admin:", error);
        });
    }
  };

  const handleViewAdmin = (admin) => {
    setSelectedAdmin(admin);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false); 
  };

  const handleDeleteAdmin = (adminId) => {
    axios
      .delete(`http://localhost:5000/api/admin/${adminId}`)
      .then((response) => {
        setAdmins((prevAdmins) =>
          prevAdmins.filter((admin) => admin.userid !== adminId)
        );
      })
      .catch((error) => {
        console.error("Error deleting admin:", error);
      });
  };

  const handleEditAdmin = (admin) => {
    const formattedDob = admin.dob ? admin.dob.split('T')[0] : '';
    setSelectedAdmin(admin);
    setEditedAdmin({ ...admin, dob: formattedDob });
    setShowEditModal(true);
  };
  
  const handleSaveEditAdmin = () => {
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
  };

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

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedAdmin(null);
  };

  return (
    <div className={styles.AdminContainer} >
      <Sidebar />
      <div className={styles.AdminContent}>
        <Header />
        <div className={styles.InnerContainer} style={{ marginLeft: "10px", width: "100%" }} >
          <div className={styles.TopSection} >
            <h1 className="section-title" style={{ fontSize: '28px', fontWeight: 'bold' }}>Manage Admins</h1>

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
                <button className="btn btn-primary" style={{ width: '150px', marginLeft:"10px" }} onClick={handleAddAdminClick}>
                  Add Admin
                </button>
                <button className="btn btn-secondary" style={{ width: '150px', marginLeft:"10px" }}>Print</button>
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
                        <FaEye
                          style={{ marginRight: "10px", cursor: "pointer", color: "#2770b4" }}
                          onClick={() => handleViewAdmin(admin)} 
                        />
                        <FaEdit
                          style={{ marginRight: "10px", cursor: "pointer", color: "#f0ad4e" }}
                          onClick={() => handleEditAdmin(admin)} 
                        />
                        <FaTrash
                          style={{ cursor: "pointer", color: "#d9534f" }}
                          onClick={() => handleDeleteAdmin(admin.userid)} 
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">No admins found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

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
            { label: "Role", name: "role", type: "text" },
            { label: "Date of Birth", name: "dob", type: "date" },
            { label: "National ID", name: "nationalId", type: "text" },
            { label: "Address", name: "address", type: "text" },
            { label: "Password", name: "password", type: "password" }
          ]}
          handleInputChange={handleInputChange}
          validationErrors={validationErrors}
        />

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
            { label: "Date of Birth", name: "dob" },
            { label: "National ID", name: "natID" },
            { label: "Address", name: "address" }
          ]}
        />

        <EditModal
          showEditModal={showEditModal}
          entityData={editedAdmin}
          entityTitle="Admin"
          entityFields={adminFields}
          handleClose={() => setShowEditModal(false)}
          handleSaveEditEntity={handleSaveEditAdmin}
          handleEditInputChange={handleEditInputChange}
        />
      </div>
    </div>
  );
}

export default Admin;
