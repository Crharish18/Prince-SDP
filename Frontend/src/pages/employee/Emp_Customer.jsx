import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Emp_Sidebar from "../../components/Employee/Emp_Sidebar";  
import Header from "../../components/Header";
import styles from './Emp_Customer.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ViewModal from "../../components/Viewmodal"; 
import EditModal from "../../components/EditModal"; 
import AddEntityModal from "../../components/AddEntityModal";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    first_name: '',
    last_name: '',
    phone_num: '',
    national_id: '',
    address: '',
     dob: '',
    password: ''
  });

  const [validationErrors, setValidationErrors] = useState({
    first_name: '',
    last_name: '',
    phone_num: '',
    national_id: '',
    address: '',
     dob: '',
    password: ''
  });

  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [showViewModal, setShowViewModal] = useState(false); 
  const [selectedCustomer, setSelectedCustomer] = useState(null); 
  const [showEditModal, setShowEditModal] = useState(false); 
  const [editedCustomer, setEditedCustomer] = useState({});

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

  const filteredCustomers = customers.filter((customer) => {
    if (!searchText || !searchColumn) return true;
    const value = customer[searchColumn]?.toString().toLowerCase();
    return value && value.includes(searchText.toLowerCase());
  });

  const handleAddCustomerClick = () => {
    setNewCustomer({
      first_name: '',
      last_name: '',
      phone_num: '',
      national_id: '',
      address: '',
      dob: '',
      password: ''  // Reset password field as well
    });
    setShowModal(true);
  };
  

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer({
      ...newCustomer,
      [name]: value,
    });
  };

  const handleSaveNewCustomer = () => {
    let errors = {};
    if (!newCustomer.first_name || newCustomer.first_name.length < 3) {
      errors.first_name = "First name must be at least 3 characters long.";
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      axios.post("http://localhost:5000/api/customers", newCustomer)
        .then(response => {
          setCustomers([...customers, response.data]);
          setShowModal(false);
        })
        .catch(error => {
          console.error("Error adding customer:", error);
        });
    }
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
  };

  const handleDeleteCustomer = (customerId) => {
    axios.delete(`http://localhost:5000/api/customers/${customerId}`)
      .then(response => {
        setCustomers((prevCustomers) =>
          prevCustomers.filter((customer) => customer.customer_id !== customerId)
        );
      })
      .catch(error => {
        console.error("Error deleting customer:", error);
      });
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setEditedCustomer(customer);
    setShowEditModal(true);
  };

  const handleSaveEditCustomer = () => {
    console.log("Saving customer:", editedCustomer);
  
    if (!editedCustomer.customer_id) {
      console.error("Customer ID is missing!");
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
        console.log("Customer updated successfully");
      })
      .catch((error) => {
        console.error("Error updating customer:", error);
      });
  };
  

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedCustomer({
      ...editedCustomer,
      [name]: value,
    });
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
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
              </select>
              <input
                type="text"
                className="form-control search-bar"
                value={searchText}
                onChange={handleSearchChange}
                placeholder={`Search by ${searchColumn}...`}
              />
              <div className={styles.BtnContainer}>
                <button className="btn btn-primary" style={{ width: '150px', marginLeft:"10px" }} onClick={handleAddCustomerClick}>
                  Add Customer
                </button>
                <button className="btn btn-secondary" style={{ width: '150px', marginLeft:"10px" }}>Report</button>
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
                         <FaEye
                         style={{ marginRight: "10px", cursor: "pointer", color: "#2770b4" }}
                         onClick={() => handleViewCustomer(customer)} 
                          />
                        <FaEdit
                         style={{ marginRight: "10px", cursor: "pointer", color: "#f0ad4e" }}
                          onClick={() => handleEditCustomer(customer)} 
                          />
                          <FaTrash
                          style={{ cursor: "pointer", color: "#d9534f" }}
                          onClick={() => handleDeleteCustomer(customer.customer_id)} 
                          />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No customers found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <AddEntityModal
          showModal={showModal}
          handleClose={handleCloseModal}
          handleSave={handleSaveNewCustomer}
          entityTitle="Customer"
          entityData={newCustomer}
          entityFields={[
            { label: "First Name", name: "first_name", type: "text" },
            { label: "Last Name", name: "last_name", type: "text" },
            { label: "Phone Number", name: "phone_num", type: "text" },
            { label: "National ID", name: "national_id", type: "text" },
            { label: "Address", name: "address", type: "text" },
            { label: "Date of Birth", name: "dob", type: "date" },
            { label: "Password", name: "password", type: "password" }
          ]}
          handleInputChange={handleInputChange}
          validationErrors={validationErrors}
/>

        <ViewModal
          showViewModal={showViewModal}
          selectedEntity={selectedCustomer}
          handleClose={handleCloseViewModal}
          entityTitle="Customer"
          entityFields={[
            { label: "Customer ID", name: "customer_id" },
            { label: "First Name", name: "first_name" },
            { label: "Last Name", name: "last_name" },
            { label: "Phone Number", name: "phone_num" },
            { label: "Address", name: "address" },
            { label: "National ID", name: "national_id" },
            { label: "Date of Birth", name: "dob", format: formatDate },
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
            { label: "Date of Birth", name: "dob", format: formatDate },
          ]}
          handleClose={handleCloseEditModal}
          handleSaveEditEntity={handleSaveEditCustomer}
          handleEditInputChange={handleEditInputChange}
        />
      </div>
    </div>
  );
}

export default Customers;
