import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa"; 
import Emp_Sidebar from "../../components/Employee/Emp_Sidebar";  
import Header from "../../components/Header";
import styles from './Emp_Supplier.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ViewModal from "../../components/Viewmodal"; 
import EditModal from "../../components/EditModal"; 
import AddEntityModal from "../../components/AddEntityModal";
import PrintModal from "../../components/PrintModal";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import logodash from "../../assets/PicturesAdmin/logoWhite.png";

// Employee Supplier management component
function Supplier() {
  // State for all suppliers
  const [suppliers, setSuppliers] = useState([]);
  // State for Add Supplier modal visibility
  const [showModal, setShowModal] = useState(false);
  // State for new supplier form data
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  // State for validation errors in add form
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  
  // State for search input and column
  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  // State for view modal and selected supplier
  const [showViewModal, setShowViewModal] = useState(false); 
  const [selectedSupplier, setSelectedSupplier] = useState(null); 
  // State for edit modal and edited supplier
  const [showEditModal, setShowEditModal] = useState(false); 
  const [editedSupplier, setEditedSupplier] = useState({}); 
  // State for validation errors in edit form
  const [editValidationErrors, setEditValidationErrors] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  // State for print modal
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Fetch suppliers from backend on mount
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

  // Format date as YYYY-MM-DD
  const formatDate = (date) => {
    const formattedDate = new Date(date);
    const year = formattedDate.getFullYear();
    const month = (formattedDate.getMonth() + 1).toString().padStart(2, '0'); 
    const day = formattedDate.getDate().toString().padStart(2, '0');
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
  
  // Filter suppliers based on search input and column
  const filteredSuppliers = suppliers.filter((supplier) => {
    if (!searchText || !searchColumn) return true; 
    const value = supplier[searchColumn]?.toString().toLowerCase(); 
    return value && value.includes(searchText.toLowerCase());
  });

  // Field definitions for EditModal
  const supplierFields = [
    { label: "Supplier ID", name: "supplier_id", type: "text" },
    { label: "Name", name: "name", type: "text" },
    { label: "Phone", name: "phone", type: "text" },
    { label: "Email", name: "email", type: "email" },
    { label: "Address", name: "address", type: "text" },
   
  ];

  // Email validation function
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
  };

  // Show Add Supplier modal
  const handleAddSupplierClick = () => {
    setShowModal(true);
  };

  // Close Add Supplier modal and reset form
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

  // Handle input change in Add Supplier form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSupplier({
      ...newSupplier,
      [name]: value
    });
  };

  // Validate and save new supplier to backend
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

  // Show view modal for selected supplier
  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setShowViewModal(true);
  };

  // Close view modal
  const handleCloseViewModal = () => {
    setShowViewModal(false); 
  };

  // Delete supplier by ID
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

  // Show edit modal for selected supplier
  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setEditedSupplier({ ...supplier });
    setShowEditModal(true);
    setEditValidationErrors({
      name: '',
      phone: '',
      email: '',
      address: ''
    });
  };
  
  // Validate and save edited supplier to backend
  const handleSaveEditSupplier = () => {
    let errors = {};
    
    // Name validation: only letters and more than 3 characters
    if (!editedSupplier.name) {
      errors.name = "Name is required.";
    } else if (editedSupplier.name.length < 3) {
      errors.name = "Name must be at least 3 characters long.";
    } else if (!/^[a-zA-Z\s]+$/.test(editedSupplier.name)) {
      errors.name = "Name can only contain letters and spaces.";
    }
    
    // Phone validation: only numbers and exactly 10 digits
    if (!editedSupplier.phone) {
      errors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(editedSupplier.phone)) {
      errors.phone = "Phone number must be exactly 10 digits.";
    }
    
    // Email validation: valid email format
    if (!editedSupplier.email) {
      errors.email = "Email is required.";
    } else if (!validateEmail(editedSupplier.email)) {
      errors.email = "Please enter a valid email address.";
    }
    
    // Address validation: more than 5 characters
    if (!editedSupplier.address) {
      errors.address = "Address is required.";
    } else if (editedSupplier.address.length < 5) {
      errors.address = "Address must be at least 5 characters long.";
    }
  
    setEditValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
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
    }
  };

  // Handle input change in Edit Supplier modal
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedSupplier((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Close edit modal and reset validation errors
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedSupplier(null);
    setEditValidationErrors({
      name: '',
      phone: '',
      email: '',
      address: ''
    });
  };

  // Show print modal for downloading PDF
  const handleDownloadPDF = () => {
    setShowPrintModal(true);
  };

  // Main render
  return (
    <div className={styles.ManageSupplierContainer}>
      <Emp_Sidebar />
      <div className={styles.ManageSupplierContent}>
        <Header />
        <div className={styles.InnerContainer} style={{ marginLeft: "10px", width: "100%" }}>
          <div className={styles.TopSection}>
            <h1 className="section-title" style={{ fontSize: '28px', fontWeight: 'bold' }}>Manage Suppliers</h1>

            {/* Search and action controls */}
            <div className={styles.SearchWrapper}>
              {/* Search column dropdown */}
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
              {/* Search input */}
              <input
                type="text"
                className="form-control search-bar"
                value={searchText}
                onChange={handleSearchChange}
                placeholder={`Search by ${searchColumn}...`}
              />
              <div className={styles.BtnContainer}>
                {/* Add Supplier button */}
                <button className="btn btn-primary" style={{ width: '150px', marginLeft:"10px" }} onClick={handleAddSupplierClick}>
                  Add Supplier
                </button>
                {/* Print button */}
                <button className="btn btn-secondary" onClick={handleDownloadPDF} style={{ width: '150px', marginLeft:"10px" }}>Print</button>
              </div>
            </div>
          </div>

          {/* Suppliers table */}
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
                        {/* View supplier button */}
                        <FaEye
                          style={{ marginRight: "10px", cursor: "pointer", color: "#2770b4" }}
                          onClick={() => handleViewSupplier(supplier)} 
                        />
                        {/* Edit supplier button */}
                        <FaEdit
                          style={{ marginRight: "10px", cursor: "pointer", color: "#f0ad4e" }}
                          onClick={() => handleEditSupplier(supplier)} 
                        />
                        {/* Delete supplier button */}
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

        {/* Add Supplier Modal */}
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

        {/* View Modal for supplier details */}
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

        {/* Edit Modal for supplier */}
        <EditModal
          showEditModal={showEditModal}
          entityData={editedSupplier}
          entityTitle="Supplier"
          entityFields={supplierFields}
          handleClose={handleCloseEditModal}
          handleSaveEditEntity={handleSaveEditSupplier}
          handleEditInputChange={handleEditInputChange}
          validationErrors={editValidationErrors}
        />

        {/* Print Modal for suppliers */}
        <PrintModal
          show={showPrintModal}
          handleClose={() => setShowPrintModal(false)}
          title="Print Suppliers Report"
          data={filteredSuppliers}
          fields={[
            { label: "Supplier ID", field: "supplier_id" },
            { label: "Name", field: "name" },
            { label: "Phone", field: "phone" },
            { label: "Email", field: "email" },
            { label: "Address", field: "address" },
            { label: "Created At", field: "created_at", format: (date) => date ? formatDate(date) : "N/A" }
          ]}
          filename="suppliers_report.pdf"
          reportTitle="Suppliers Details Report"
        />
      </div>
    </div>
  );
}

export default Supplier;
