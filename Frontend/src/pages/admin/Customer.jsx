import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from './Customer.module.css';
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

  const handleDownloadPDF = () => {
    setShowPrintModal(true);
  };

  return (
    <div className={styles.ManageCustomerContainer}>
      <Sidebar />
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
                        <FaTrash
                          style={{ cursor: "pointer", color: "#d9534f" }}
                          onClick={() => handleDeleteCustomer(customer.customer_id)} 
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
            { label: "Phone Number", name: "phone_num" },
            { label: "Address", name: "address" },
            { label: "National ID", name: "national_id" },
            { label: "Date of Birth", name: "dob", format: formatDate },
            { label: "Status", name: "status" }
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
            { label: "Status", name: "status", type: "select", options: ["active", "disable"] }
          ]}
          handleClose={handleCloseEditModal}
          handleSaveEditEntity={handleSaveEditCustomer}
          handleEditInputChange={handleEditInputChange}
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
