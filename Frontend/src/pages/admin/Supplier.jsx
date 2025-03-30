import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from './Supplier.module.css'; // Import as CSS module
import 'bootstrap/dist/css/bootstrap.min.css';
import ViewModal from "../../components/Viewmodal";
import EditModal from "../../components/EditModal";
import AddEntityModal from "../../components/AddEntityModal";

function Supplier() {
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    username: '',
    companyName: '',
    contactPerson: '',
    email: '',
    phoneNum: '',
    address: '',
    nationalId: '',
    password: '' 
  });

  const [validationErrors, setValidationErrors] = useState({
    username: '',
    companyName: '',
    contactPerson: '',
    email: '',
    phoneNum: '',
    address: '',
    nationalId: '',
    password: ''
  });

  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedSupplier, setEditedSupplier] = useState({});

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/suppliers')
      .then((response) => {
        setSuppliers(response.data);
      })
      .catch((error) => {
        console.error('Error fetching suppliers:', error);
      });
  }, []);

  const handleSearchColumnChange = (e) => {
    setSearchColumn(e.target.value);  
  };
  
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);  
  };

  const filteredSuppliers = suppliers.filter((sup) => {
    if (!searchText || !searchColumn) return true;
    const value = sup[searchColumn]?.toString().toLowerCase(); 
    return value && value.includes(searchText.toLowerCase());
  });

  const supplierFields = [
    { label: "Username", name: "username", type: "text" },
    { label: "Company Name", name: "companyName", type: "text" },
    { label: "Contact Person", name: "contactPerson", type: "text" },
    { label: "Email", name: "email", type: "email" },
    { label: "Phone Number", name: "phoneNum", type: "text" },
    { label: "Address", name: "address", type: "text" },
    { label: "National ID", name: "nationalId", type: "text" }
  ];

  const handleAddSupplierClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSupplier({
      ...newSupplier,
      [name]: value
    });
  };

  const handleSaveNewSupplier = () => {
    let errors = {};
    if (!newSupplier.username || newSupplier.username.length < 4) {
      errors.username = "Username must be at least 4 characters long.";
    }
    if (!newSupplier.companyName) {
      errors.companyName = "Company Name is required.";
    }
    if (!newSupplier.contactPerson) {
      errors.contactPerson = "Contact Person is required.";
    }
    if (!newSupplier.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newSupplier.email)) {
      errors.email = "Invalid email address.";
    }
    if (!newSupplier.phoneNum || !/^\d{10,15}$/.test(newSupplier.phoneNum)) {
      errors.phoneNum = "Phone number must be between 10 and 15 digits.";
    }
    if (!newSupplier.address || newSupplier.address.length < 5) {
      errors.address = "Address must be at least 5 characters long.";
    }
    if (!newSupplier.nationalId || newSupplier.nationalId.length < 6) {
      errors.nationalId = "National ID must be at least 6 characters long.";
    }
    if (!newSupplier.password || newSupplier.password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }
  
    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      axios
        .post("http://localhost:5000/api/suppliers", newSupplier)
        .then((response) => {
          setSuppliers([...suppliers, response.data]);
          setShowModal(false);
        })
        .catch((error) => {
          console.error("Error adding supplier:", error);
        });
    }
  };

  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false); 
  };

  const handleDeleteSupplier = (supplierId) => {
    axios
      .delete(`http://localhost:5000/api/suppliers/${supplierId}`)
      .then((response) => {
        setSuppliers((prevSuppliers) =>
          prevSuppliers.filter((supplier) => supplier.userid !== supplierId)
        );
      })
      .catch((error) => {
        console.error("Error deleting supplier:", error);
      });
  };

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setEditedSupplier(supplier);
    setShowEditModal(true);
  };

  const handleSaveEditSupplier = () => {
    const { password, created_at, updated_at, ...supplierData } = editedSupplier;
    axios
      .put(`http://localhost:5000/api/suppliers/${editedSupplier.userid}`, supplierData)
      .then((response) => {
        setSuppliers((prevSuppliers) =>
          prevSuppliers.map((sup) => (sup.userid === editedSupplier.userid ? editedSupplier : sup))
        );
        setShowEditModal(false);
      })
      .catch((error) => {
        console.error("Error updating supplier:", error.response ? error.response.data : error);
      });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedSupplier((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedSupplier(null);
  };

  return (
    <div className={styles.ManageSupplierContainer}>
      <Sidebar />
      <div className={styles.ManageSupplierContent}>
        <Header />
        <div className={styles.InnerContainer} style={{ marginLeft: "10px", width: "100%" }}>
          <div className={styles.TopSection}>
            <h1 className="section-title" style={{ fontSize: '28px', fontWeight: 'bold' }}>Manage Suppliers</h1>
            <div className={styles.SearchWrapper}>
              <select
                className="form-control"
                value={searchColumn}
                onChange={handleSearchColumnChange}
                style={{ marginRight: "10px", width: "200px" }}
              >
                <option value="userid">UserID</option>
                <option value="companyName">CompanyName</option>
                <option value="contactPerson">ContactPerson</option>
                <option value="email">Email</option>
                <option value="phoneNum">PhoneNum</option>
                <option value="nationalId">NationalID</option>
              </select>
              <input
                type="text"
                className="form-control search-bar"
                value={searchText}
                onChange={handleSearchChange}
                placeholder={`Search by ${searchColumn}...`}
              />
              <div className={styles.BtnContainer}>
                <button className="btn btn-primary" style={{ width: '150px', marginLeft:"10px" }} onClick={handleAddSupplierClick}>
                  Add Supplier
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
                  <th>COMPANYNAME</th>
                  <th>CONTACTPERSON</th>
                  <th>EMAIL</th>
                  <th>PHONENUM</th>
                  <th>NationalID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map((sup) => (
                    <tr key={sup.userid}>
                      <td>{sup.userid}</td>
                      <td>{sup.companyName}</td>
                      <td>{sup.contactPerson}</td>
                      <td>{sup.email}</td>
                      <td>{sup.phoneNum}</td>
                      <td>{sup.nationalId}</td>
                      <td>
                        <button
                          className="btn btn-info"
                          onClick={() => handleViewSupplier(sup)}
                        >
                          <FaEye />
                        </button>
                        <button
                          className="btn btn-warning"
                          onClick={() => handleEditSupplier(sup)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteSupplier(sup.userid)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">No suppliers found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <AddEntityModal
            show={showModal}
            handleClose={handleCloseModal}
            handleSave={handleSaveNewSupplier}
            newEntity={newSupplier}
            handleInputChange={handleInputChange}
            validationErrors={validationErrors}
          />
        )}

        {showViewModal && selectedSupplier && (
          <ViewModal
            supplier={selectedSupplier}
            show={showViewModal}
            handleClose={handleCloseViewModal}
          />
        )}

        {showEditModal && (
          <EditModal
            supplier={editedSupplier}
            show={showEditModal}
            handleClose={handleCloseEditModal}
            handleSave={handleSaveEditSupplier}
            handleInputChange={handleEditInputChange}
          />
        )}
      </div>
    </div>
  );
}

export default Supplier;
