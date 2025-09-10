import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Emp_Sidebar from "../../components/Employee/Emp_Sidebar"
import Header from "../../components/Header";
import styles from './Emp_Customer.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ViewModal from "../../components/Viewmodal"; 
import EditModal from "../../components/EditModal"; 
import PrintModal from "../../components/PrintModal";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import logodash from "../../assets/PicturesAdmin/logoWhite.png";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [showViewModal, setShowViewModal] = useState(false); 
  const [selectedCustomer, setSelectedCustomer] = useState(null); 
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState({});
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/customers')
      .then(response => {
        setCustomers(response.data);
      })
      .catch(error => {
        console.error('Error fetching customers:', error);
      });
  }, []);

  const formatDate = (dob) => {
    if (!dob) return "N/A";
    
    try {
      const date = new Date(dob);
      
      // Check if date is valid
      if (isNaN(date.getTime())) return "N/A";
      
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };
  
  const handleSearchColumnChange = (e) => {
    setSearchColumn(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const filteredCustomers = customers.filter((customer) => {
    if (!searchText || !searchColumn) return true;
    const value = customer[searchColumn]?.toString().toLowerCase();
    return value && value.includes(searchText.toLowerCase());
  });

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
  };

  const handleDeleteCustomer = (customerId) => {
    // Instead of deleting, update status to 'disable'
    const customerToUpdate = customers.find(c => c.customer_id === customerId);
    if (customerToUpdate) {
      const updatedCustomer = { ...customerToUpdate, status: 'disable' };
      
      axios.put(`http://localhost:5000/api/customers/${customerId}`, updatedCustomer)
        .then(response => {
          setCustomers(prevCustomers => 
            prevCustomers.map(customer => 
              customer.customer_id === customerId ? 
                { ...customer, status: 'disable' } : customer
            )
          );
        })
        .catch(error => {
          console.error("Error updating customer status:", error);
        });
    }
  };

  const handleEditCustomer = (customer) => {
    // Format the date to yyyy-MM-dd for the date input
    const formattedCustomer = { ...customer };
    if (formattedCustomer.dob) {
      formattedCustomer.dob = formatDate(formattedCustomer.dob);
    }
    
    setSelectedCustomer(customer);
    setEditedCustomer(formattedCustomer);
    setValidationErrors({});
    setFormSubmitted(false);
    setShowEditModal(true);
  };

  const validateCustomerData = (customer) => {
    const errors = {};
    
    // First name validation
    if (!customer.first_name || customer.first_name.length < 3 || !/^[a-zA-Z]+$/.test(customer.first_name)) {
      errors.first_name = "First name must be letters only and at least 3 characters";
    }
    
    // Last name validation
    if (!customer.last_name || customer.last_name.length < 3 || !/^[a-zA-Z]+$/.test(customer.last_name)) {
      errors.last_name = "Last name must be letters only and at least 3 characters";
    }
    
    // Phone number validation
    if (!customer.phone_num || !/^\d{10}$/.test(customer.phone_num)) {
      errors.phone_num = "Phone number must be exactly 10 digits";
    }
    
    // Address validation
    if (!customer.address || customer.address.length < 5) {
      errors.address = "Address must be at least 5 characters";
    }
    
    // National ID validation
    if (!customer.national_id || customer.national_id.length < 10 || customer.national_id.length > 12) {
      errors.national_id = "National ID must be between 10 and 12 characters";
    }
    
    // Date of birth validation
    if (customer.dob) {
      const dobDate = new Date(customer.dob);
      const currentDate = new Date();
      
      if (isNaN(dobDate.getTime())) {
        errors.dob = "Invalid date format";
      } else if (dobDate > currentDate) {
        errors.dob = "Date of birth cannot be in the future";
      }
    } else {
      errors.dob = "Date of birth is required";
    }
    
    // Email validation
    if (!customer.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    return errors;
  };

  const handleSaveEditCustomer = (e) => {
    if (e) {
      e.preventDefault(); // Prevent default form submission
    }
    
    console.log("Saving customer:", editedCustomer);
    setFormSubmitted(true);
  
    if (!editedCustomer.customer_id) {
      console.error("Customer ID is missing!");
      return;
    }
    
    // Validate customer data
    const errors = validateCustomerData(editedCustomer);
    
    if (Object.keys(errors).length > 0) {
      console.log("Validation errors:", errors);
      setValidationErrors(errors);
      return;
    }
  
    axios
      .put(`http://localhost:5000/api/customers/${editedCustomer.customer_id}`, editedCustomer)
      .then((response) => {
        setCustomers((prevCustomers) =>
          prevCustomers.map((cust) =>
            cust.customer_id === editedCustomer.customer_id ? { ...cust, ...editedCustomer } : cust
          )
        );
        setShowEditModal(false);
        setValidationErrors({});
        setFormSubmitted(false);
        console.log("Customer updated successfully");
      })
      .catch((error) => {
        console.error("Error updating customer:", error);
      });
  };
  
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    
    // Update the edited customer data
    setEditedCustomer(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // If form has been submitted once, validate on change to give immediate feedback
    if (formSubmitted) {
      const error = validateField(name, value);
      setValidationErrors(prev => ({
        ...prev,
        [name]: error
      }));
    } else {
      // Otherwise just clear the error if there was one
      if (validationErrors[name]) {
        setValidationErrors(prev => ({
          ...prev,
          [name]: undefined
        }));
      }
    }
  };
  
  // Separate function for field validation to be called on blur
  const validateField = (name, value) => {
    let error = undefined;
    
    switch (name) {
      case "first_name":
        if (!value || value.length < 3 || !/^[a-zA-Z]+$/.test(value)) {
          error = "First name must be letters only and at least 3 characters";
        }
        break;
      
      case "last_name":
        if (!value || value.length < 3 || !/^[a-zA-Z]+$/.test(value)) {
          error = "Last name must be letters only and at least 3 characters";
        }
        break;
      
      case "phone_num":
        if (!value || !/^\d{10}$/.test(value)) {
          error = "Phone number must be exactly 10 digits";
        }
        break;
      
      case "address":
        if (!value || value.length < 5) {
          error = "Address must be at least 5 characters";
        }
        break;
      
      case "national_id":
        if (!value || value.length < 10 || value.length > 12) {
          error = "National ID must be between 10 and 12 characters";
        }
        break;
      
      case "dob":
        if (!value) {
          error = "Date of birth is required";
        } else {
          const dobDate = new Date(value);
          const currentDate = new Date();
          
          if (isNaN(dobDate.getTime())) {
            error = "Invalid date format";
          } else if (dobDate > currentDate) {
            error = "Date of birth cannot be in the future";
          }
        }
        break;
      
      case "email":
        if (!value) {
          error = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
      
      default:
        break;
    }
    
    return error;
  };
  
  const handleFieldBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };
  
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setValidationErrors({});
    setFormSubmitted(false);
  };

  const handleDownloadPDF = () => {
    setShowPrintModal(true);
  };

  // Custom component to display validation errors
  const ErrorMessage = ({ fieldName }) => {
    if (!validationErrors[fieldName]) return null;
    
    return (
      <div className="text-danger" style={{ fontSize: '12px', marginTop: '5px' }}>
        {validationErrors[fieldName]}
      </div>
    );
  };

  return (
    <div className={styles.ManageCustomerContainer}>
      <Emp_Sidebar />
      <div className={styles.ManageCustomerContent}>
        <Header />
        <div className={styles.InnerContainer} style={{ marginLeft: "10px", width: "100%" }}>
          <div className={styles.TopSection}>
            <h1 className="section-title" style={{ fontSize: '28px', fontWeight: 'bold' }}>Manage Customers</h1>
            <div className={styles.SearchWrapper}>
              <select
                className="form-control"
                value={searchColumn}
                onChange={handleSearchColumnChange}
                style={{ marginRight: "10px", width: "200px" }}
              >
                <option value="customer_id">Customer ID</option>
                <option value="first_name">First Name</option>
                <option value="last_name">Last Name</option>
                <option value="phone_num">Phone Number</option>
                <option value="status">Status</option>
              </select>
              <input
                type="text"
                className="form-control search-bar"
                value={searchText}
                onChange={handleSearchChange}
                placeholder={`Search by ${searchColumn}...`}
              />
              <div className={styles.BtnContainer}>
                <button className="btn btn-secondary" style={{ width: '150px', marginLeft:"10px" }} onClick={handleDownloadPDF}>Print</button>
              </div>
            </div>
          </div>

          <div className={styles.TableContainer}>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Phone Number</th>
                  <th>Address</th>
                  <th>NationalID</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.customer_id}>
                      <td>{customer.customer_id}</td>
                      <td>{customer.first_name}</td>
                      <td>{customer.last_name}</td>
                      <td>{customer.phone_num}</td>
                      <td>{customer.address}</td>
                      <td>{customer.national_id}</td>
                      <td>
                        <span style={{ 
                          color: customer.status === 'active' ? 'green' : 'red',
                          fontWeight: 'bold'
                        }}>
                          {customer.status || 'active'}
                        </span>
                      </td>
                      <td>
                        <FaEye
                          style={{ marginRight: "10px", cursor: "pointer", color: "#2770b4" }}
                          onClick={() => handleViewCustomer(customer)} 
                        />
                        <FaEdit
                          style={{ marginRight: "10px", cursor: "pointer", color: "#f0ad4e" }}
                          onClick={() => handleEditCustomer(customer)} 
                        />
                        
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">No customers found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ViewModal
            showViewModal={showViewModal}
            selectedEntity={selectedCustomer}
            handleClose={handleCloseViewModal}
            entityTitle="Customer"
            entityFields={[
              { label: "Customer ID", name: "customer_id" },
              { label: "First Name", name: "first_name" },
              { label: "Last Name", name: "last_name" },
              { label: "Date of Birth", name: "dob", format: formatDate },
              { label: "Email", name: "email" },
              { label: "Profile Picture", name: "profile_pic", type: "image" }
            ]}
          />


        <EditModal
          showEditModal={showEditModal}
          entityData={editedCustomer}
          entityTitle="Customer"
          entityFields={[
            { label: "First Name", name: "first_name" },
            { label: "Last Name", name: "last_name" },
            { label: "Phone Number", name: "phone_num" },
            { label: "Address", name: "address" },
            { label: "National ID", name: "national_id" },
            { label: "Date of Birth", name: "dob", type: "date" },
            { label: "Email", name: "email" },
            { label: "Status", name: "status", type: "select", options: ["active", "disable"] }
          ]}
          handleClose={handleCloseEditModal}
          handleSaveEditEntity={handleSaveEditCustomer}
          handleEditInputChange={handleEditInputChange}
          handleFieldBlur={handleFieldBlur}
          validationErrors={validationErrors}
          showValidationErrors={true}
          formSubmitted={formSubmitted}
          ErrorMessage={ErrorMessage}
        />

        <PrintModal
          show={showPrintModal}
          handleClose={() => setShowPrintModal(false)}
          title="Print Customer Report"
          data={filteredCustomers}
          fields={[
            { label: "Customer ID", field: "customer_id" },
            { label: "First Name", field: "first_name" },
            { label: "Last Name", field: "last_name" },
            { label: "Phone Number", field: "phone_num" },
            { label: "Address", field: "address" },
            { label: "National ID", field: "national_id" },
            { label: "Status", field: "status" },
            { label: "Date of Birth", field: "dob", format: (date) => date ? new Date(date).toLocaleDateString() : "N/A" }
          ]}
          filename="customer_report.pdf"
          reportTitle="Customer Details Report"
        />
      </div>
    </div>
  );
}

export default Customers;
