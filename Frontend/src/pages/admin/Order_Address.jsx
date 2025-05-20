import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa"; 
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { Link } from "react-router-dom";
import styles from './Order_Address.module.css'; // Import as CSS module
import 'bootstrap/dist/css/bootstrap.min.css';
import ViewModal from "../../components/Viewmodal"; 
import EditModal from "../../components/EditModal"; 
import AddEntityModal from "../../components/AddEntityModal";
import PrintModal from "../../components/PrintModal";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';  // This is an additional library to handle tables in PDFs
import logodash from "../../assets/PicturesAdmin/logoWhite.png";

function OrderAddress() {
  const [orderAddresses, setOrderAddresses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newOrderAddress, setNewOrderAddress] = useState({
    order_id: '',
    fullname: '',
    street: '',
    apartment: '',
    city: '',
    province: '',
    postal_code: '',
    country: '',
    shipment_method: 'standard shipping',
    type: 'shipping'
  });
  const [validationErrors, setValidationErrors] = useState({
    order_id: '',
    fullname: '',
    street: '',
    city: '',
    province: '',
    postal_code: '',
    country: '',
    shipment_method: '',
    type: ''
  });

  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [showViewModal, setShowViewModal] = useState(false); 
  const [selectedOrderAddress, setSelectedOrderAddress] = useState(null); 
  const [showEditModal, setShowEditModal] = useState(false); 
  const [editedOrderAddress, setEditedOrderAddress] = useState({}); 
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/order_address')
      .then((response) => {
        setOrderAddresses(response.data);
      })
      .catch((error) => {
        console.error('Error fetching order addresses:', error);
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
  
  const filteredOrderAddresses = orderAddresses.filter((address) => {
    if (!searchText || !searchColumn) return true; 
    const value = address[searchColumn]?.toString().toLowerCase(); 
    return value && value.includes(searchText.toLowerCase());
  });

  const orderAddressFields = [
    { label: "Address ID", name: "order_address_id", type: "text" },
    { label: "Order ID", name: "order_id", type: "text" },
    { label: "Full Name", name: "fullname", type: "text" },
    { label: "Street", name: "street", type: "text" },
    { label: "Apartment", name: "apartment", type: "text" },
    { label: "City", name: "city", type: "text" },
    { label: "Province", name: "province", type: "text" },
    { label: "Postal Code", name: "postal_code", type: "text" },
    { label: "Country", name: "country", type: "text" },
    { label: "Shipment Method", name: "shipment_method", type: "select", options: ["standard shipping", "pickup"] },
    { label: "Type", name: "type", type: "select", options: ["shipping", "billing"] }
  ];

  const handleAddOrderAddressClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrderAddress({
      ...newOrderAddress,
      [name]: value
    });
  };

  const handleSaveNewOrderAddress = () => {
    let errors = {};
    if (!newOrderAddress.order_id) {
      errors.order_id = "Order ID is required.";
    }
    if (!newOrderAddress.fullname) {
      errors.fullname = "Full Name is required.";
    }
    if (!newOrderAddress.street) {
      errors.street = "Street is required.";
    }
    if (!newOrderAddress.city) {
      errors.city = "City is required.";
    }
    if (!newOrderAddress.province) {
      errors.province = "Province is required.";
    }
    if (!newOrderAddress.postal_code) {
      errors.postal_code = "Postal Code is required.";
    }
    if (!newOrderAddress.country) {
      errors.country = "Country is required.";
    }
    if (!newOrderAddress.shipment_method) {
      errors.shipment_method = "Shipment Method is required.";
    }
    if (!newOrderAddress.type) {
      errors.type = "Type is required.";
    }
  
    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      axios
        .post("http://localhost:5000/api/order_address", newOrderAddress)
        .then((response) => {
          setOrderAddresses([...orderAddresses, response.data]);
          setShowModal(false);
        })
        .catch((error) => {
          console.error("Error adding order address:", error);
        });
    }
  };

  const handleViewOrderAddress = (orderAddress) => {
    setSelectedOrderAddress(orderAddress);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false); 
  };

  const handleDeleteOrderAddress = (addressId) => {
    axios
      .delete(`http://localhost:5000/api/order_address/${addressId}`)
      .then((response) => {
        setOrderAddresses((prevOrderAddresses) =>
          prevOrderAddresses.filter((address) => address.order_address_id !== addressId)
        );
      })
      .catch((error) => {
        console.error("Error deleting order address:", error);
      });
  };

  const handleEditOrderAddress = (orderAddress) => {
    setSelectedOrderAddress(orderAddress);
    setEditedOrderAddress({ ...orderAddress });
    setShowEditModal(true);
  };
  
  const handleSaveEditOrderAddress = () => {
    axios
      .put(`http://localhost:5000/api/order_address/${editedOrderAddress.order_address_id}`, editedOrderAddress)
      .then((response) => {
        setOrderAddresses((prevOrderAddresses) =>
          prevOrderAddresses.map((addr) => (addr.order_address_id === editedOrderAddress.order_address_id ? editedOrderAddress : addr))
        );
        setShowEditModal(false);
      })
      .catch((error) => {
        console.error("Error updating order address:", error.response ? error.response.data : error);
      });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedOrderAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedOrderAddress(null);
  };

  const handleDownloadPDF = () => {
    setShowPrintModal(true);
  };

  return (
    <div className={styles.ManageEmployeeContainer}>
      <Sidebar />
      <div className={styles.ManageEmployeeContent}>
        <Header />
        <div className={styles.InnerContainer} style={{ marginLeft: "10px", width: "100%" }}>
          <div className={styles.TopSection}>
            <h1 className="section-title" style={{ fontSize: '28px', fontWeight: 'bold' }}>Manage Order Addresses</h1>

            <div className={styles.SearchWrapper}>
              <select
                className="form-control"
                value={searchColumn}
                onChange={handleSearchColumnChange}
                style={{ marginRight: "10px", width: "200px" }}
              >
                <option value="order_address_id">Address ID</option>
                <option value="order_id">Order ID</option>
                <option value="fullname">Full Name</option>
                <option value="city">City</option>
                <option value="type">Type</option>
              </select>
              <input
                type="text"
                className="form-control search-bar"
                value={searchText}
                onChange={handleSearchChange}
                placeholder={`Search by ${searchColumn}...`}
              />
              <div className={styles.BtnContainer}>
                <Link to="/admin/Orders" className="btn btn-primary" style={{ width: '150px', marginLeft:"10px" }}>
                  Orders
                </Link>
                <button className="btn btn-secondary" onClick={handleDownloadPDF} style={{ width: '150px', marginLeft:"10px" }}>Print</button>
              </div>
            </div>
          </div>

          <div className={styles.TableContainer}>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>ORDER ID</th>
                  <th>FULL NAME</th>
                  <th>CITY</th>
                  <th>PROVINCE</th>
                  <th>TYPE</th>
                  <th>SHIPMENT METHOD</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrderAddresses.length > 0 ? (
                  filteredOrderAddresses.map((address) => (
                    <tr key={address.order_address_id}>
                      <td>{address.order_address_id}</td>
                      <td>{address.order_id}</td>
                      <td>{address.fullname}</td>
                      <td>{address.city}</td>
                      <td>{address.province}</td>
                      <td>{address.type}</td>
                      <td>{address.shipment_method}</td>
                      <td>
                        <FaEye
                          style={{ marginRight: "10px", cursor: "pointer", color: "#2770b4" }}
                          onClick={() => handleViewOrderAddress(address)} 
                        />
                        <FaEdit
                          style={{ marginRight: "10px", cursor: "pointer", color: "#f0ad4e" }}
                          onClick={() => handleEditOrderAddress(address)} 
                        />
                        <FaTrash
                          style={{ cursor: "pointer", color: "#d9534f" }}
                          onClick={() => handleDeleteOrderAddress(address.order_address_id)} 
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">No order addresses found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <AddEntityModal
          showModal={showModal}
          handleClose={handleCloseModal}
          handleSave={handleSaveNewOrderAddress}
          entityTitle="Order Address"
          entityData={newOrderAddress}
          entityFields={[
            { label: "Order ID", name: "order_id", type: "text" },
            { label: "Full Name", name: "fullname", type: "text" },
            { label: "Street", name: "street", type: "text" },
            { label: "Apartment", name: "apartment", type: "text" },
            { label: "City", name: "city", type: "text" },
            { label: "Province", name: "province", type: "text" },
            { label: "Postal Code", name: "postal_code", type: "text" },
            { label: "Country", name: "country", type: "text" },
            { label: "Shipment Method", name: "shipment_method", type: "select", options: ["standard shipping", "pickup"] },
            { label: "Type", name: "type", type: "select", options: ["shipping", "billing"] }
          ]}
          handleInputChange={handleInputChange}
          validationErrors={validationErrors}
        />

        <ViewModal
          showViewModal={showViewModal}
          selectedEntity={selectedOrderAddress}
          handleClose={handleCloseViewModal}
          entityTitle="Order Address"
          entityFields={[
            { label: "Address ID", name: "order_address_id" },
            { label: "Order ID", name: "order_id" },
            { label: "Full Name", name: "fullname" },
            { label: "Street", name: "street" },
            { label: "Apartment", name: "apartment" },
            { label: "City", name: "city" },
            { label: "Province", name: "province" },
            { label: "Postal Code", name: "postal_code" },
            { label: "Country", name: "country" },
            { label: "Shipment Method", name: "shipment_method" },
            { label: "Type", name: "type" }
          ]}
        />

        <EditModal
          showEditModal={showEditModal}
          entityData={editedOrderAddress}
          entityTitle="Order Address"
          entityFields={[
            { label: "Address ID", name: "order_address_id", type: "text", disabled: true },
            { label: "Order ID", name: "order_id", type: "text" },
            { label: "Full Name", name: "fullname", type: "text" },
            { label: "Street", name: "street", type: "text" },
            { label: "Apartment", name: "apartment", type: "text" },
            { label: "City", name: "city", type: "text" },
            { label: "Province", name: "province", type: "text" },
            { label: "Postal Code", name: "postal_code", type: "text" },
            { label: "Country", name: "country", type: "text" },
            { label: "Shipment Method", name: "shipment_method", type: "select", options: ["standard shipping", "pickup"] },
            { label: "Type", name: "type", type: "select", options: ["shipping", "billing"] }
          ]}
          handleClose={() => setShowEditModal(false)}
          handleSaveEditEntity={handleSaveEditOrderAddress}
          handleEditInputChange={handleEditInputChange}
        />

        <PrintModal
          show={showPrintModal}
          handleClose={() => setShowPrintModal(false)}
          title="Print Order Address Report"
          data={filteredOrderAddresses}
          fields={[
            { label: "Address ID", field: "order_address_id" },
            { label: "Order ID", field: "order_id" },
            { label: "Full Name", field: "fullname" },
            { label: "Street", field: "street" },
            { label: "City", field: "city" },
            { label: "Province", field: "province" },
            { label: "Postal Code", field: "postal_code" },
            { label: "Country", field: "country" },
            { label: "Shipment Method", field: "shipment_method" },
            { label: "Type", field: "type" }
          ]}
          filename="order_address_report.pdf"
          reportTitle="Order Address Details Report"
        />
      </div>
    </div>
  );
}

export default OrderAddress;
