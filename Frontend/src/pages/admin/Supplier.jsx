import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa"; 
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from './Supplier.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ViewModal from "../../components/Viewmodal"; 
import EditModal from "../../components/EditModal"; 
import AddEntityModal from "../../components/AddEntityModal";

function Supplier() {
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  const [validationErrors, setValidationErrors] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
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

  const formatDate = (date) => {
    const formattedDate = new Date(date);
    const year = formattedDate.getFullYear();
    const month = (formattedDate.getMonth() + 1).toString().padStart(2, '0'); 
    const day = formattedDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const handleSearchColumnChange = (e) => {
    setSearchColumn(e.target.value);  
  };
  
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);  
  };
  
  const filteredSuppliers = suppliers.filter((supplier) => {
    if (!searchText || !searchColumn) return true; 
    const value = supplier[searchColumn]?.toString().toLowerCase(); 
    return value && value.includes(searchText.toLowerCase());
  });

  const supplierFields = [
    { label: "Supplier ID", name: "supplier_id", type: "text" },
    { label: "Name", name: "name", type: "text" },
    { label: "Phone", name: "phone", type: "text" },
    { label: "Email", name: "email", type: "email" },
    { label: "Address", name: "address", type: "text" },
    { label: "Created At", name: "created_at", type: "text" }
  ];

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
  };

  const handleAddSupplierClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Reset form data
    setNewSupplier({
      name: '',
      phone: '',
      email: '',
      address: ''
    });
    // Reset validation errors
    setValidationErrors({
      name: '',
      phone: '',
      email: '',
      address: ''
    });
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
    
    // Name validation: only letters and more than 3 characters
    if (!newSupplier.name) {
      errors.name = "Name is required.";
    } else if (newSupplier.name.length < 3) {
      errors.name = "Name must be at least 3 characters long.";
    } else if (!/^[a-zA-Z\s]+$/.test(newSupplier.name)) {
      errors.name = "Name can only contain letters and spaces.";
    }
    
    // Phone validation: only numbers and exactly 10 digits
    if (!newSupplier.phone) {
      errors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(newSupplier.phone)) {
      errors.phone = "Phone number must be exactly 10 digits.";
    }
    
    // Email validation: valid email format
    if (!newSupplier.email) {
      errors.email = "Email is required.";
    } else if (!validateEmail(newSupplier.email)) {
      errors.email = "Please enter a valid email address.";
    }
    
    // Address validation: more than 5 characters
    if (!newSupplier.address) {
      errors.address = "Address is required.";
    } else if (newSupplier.address.length < 5) {
      errors.address = "Address must be at least 5 characters long.";
    }
  
    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      axios
        .post("http://localhost:5000/api/suppliers", newSupplier)
        .then((response) => {
          setSuppliers([...suppliers, response.data]);
          setShowModal(false);
          // Reset form after successful save
          setNewSupplier({
            name: '',
            phone: '',
            email: '',
            address: ''
          });
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
          prevSuppliers.filter((supplier) => supplier.supplier_id !== supplierId)
        );
      })
      .catch((error) => {
        console.error("Error deleting supplier:", error);
      });
  };

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setEditedSupplier({ ...supplier });
    setShowEditModal(true);
  };
  
  const handleSaveEditSupplier = () => {
    const { created_at, ...supplierData } = editedSupplier;
    axios
      .put(`http://localhost:5000/api/suppliers/${editedSupplier.supplier_id}`, supplierData)
      .then((response) => {
        setSuppliers((prevSuppliers) =>
          prevSuppliers.map((sup) => (sup.supplier_id === editedSupplier.supplier_id ? editedSupplier : sup))
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
      [name]: value,
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
                <option value="supplier_id">Supplier ID</option>
                <option value="name">Name</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="address">Address</option>
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
                <button className="btn btn-secondary" style={{ width: '150px', marginLeft:"10px" }}>Print</button>
              </div>
            </div>
          </div>

          <div className={styles.TableContainer}>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>SUPPLIER ID</th>
                  <th>NAME</th>
                  <th>PHONE</th>
                  <th>EMAIL</th>
                  <th>ADDRESS</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map((supplier) => (
                    <tr key={supplier.supplier_id}>
                      <td>{supplier.supplier_id}</td>
                      <td>{supplier.name}</td>
                      <td>{supplier.phone}</td>
                      <td>{supplier.email}</td>
                      <td>{supplier.address || 'N/A'}</td>
                      <td>
                        <FaEye
                          style={{ marginRight: "10px", cursor: "pointer", color: "#2770b4" }}
                          onClick={() => handleViewSupplier(supplier)} 
                        />
                        <FaEdit
                          style={{ marginRight: "10px", cursor: "pointer", color: "#f0ad4e" }}
                          onClick={() => handleEditSupplier(supplier)} 
                        />
                        <FaTrash
                          style={{ cursor: "pointer", color: "#d9534f" }}
                          onClick={() => handleDeleteSupplier(supplier.supplier_id)} 
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No suppliers found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

       
        <AddEntityModal
          showModal={showModal}
          handleClose={handleCloseModal}
          handleSave={handleSaveNewSupplier}
          entityTitle="Supplier"
          entityData={newSupplier}
          entityFields={[
            { label: "Name", name: "name", type: "text" },
            { label: "Phone", name: "phone", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Address", name: "address", type: "text" }
          ]}
          handleInputChange={handleInputChange}
          validationErrors={validationErrors}
        />

        <ViewModal
          showViewModal={showViewModal}
          selectedEntity={selectedSupplier}
          handleClose={handleCloseViewModal}
          entityTitle="Supplier"
          entityFields={[
            { label: "Supplier ID", name: "supplier_id" },
            { label: "Name", name: "name" },
            { label: "Phone", name: "phone" },
            { label: "Email", name: "email" },
            { label: "Address", name: "address" },
            { label: "Created At", name: "created_at", format: formatDate }
          ]}
        />

        <EditModal
          showEditModal={showEditModal}
          entityData={editedSupplier}
          entityTitle="Supplier"
          entityFields={supplierFields}
          handleClose={handleCloseEditModal}
          handleSaveEditEntity={handleSaveEditSupplier}
          handleEditInputChange={handleEditInputChange}
        />
      </div>
    </div>
  );
}

export default Supplier;
