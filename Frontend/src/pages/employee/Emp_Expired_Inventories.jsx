import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa"; 
import Emp_Sidebar from "../../components/Employee/Emp_Sidebar"
import Header from "../../components/Header";

import styles from './Emp_Expired_Inventories.module.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import ViewModal from "../../components/Viewmodal"; 
import EditModal from "../../components/EditModal"; 
import AddEntityModal from "../../components/AddEntityModal";
import PrintModal from "../../components/PrintModal";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import logodash from "../../assets/PicturesAdmin/logoWhite.png";

function ExpiredInventories() {
  const [expiredInventories, setExpiredInventories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newExpiredInventory, setNewExpiredInventory] = useState({
    inventory_id: '',
    product_id: '',
    qty_expired: '',
    expiry_date: ''
  });

  const [validationErrors, setValidationErrors] = useState({
    inventory_id: '',
    product_id: '',
    qty_expired: '',
    expiry_date: ''
  });
  
  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [showViewModal, setShowViewModal] = useState(false); 
  const [selectedExpiredInventory, setSelectedExpiredInventory] = useState(null); 
  const [showEditModal, setShowEditModal] = useState(false); 
  const [editedExpiredInventory, setEditedExpiredInventory] = useState({}); 
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/Expired_Inventories')
      .then((response) => {
        setExpiredInventories(response.data);
      })
      .catch((error) => {
        console.error('Error fetching expired inventories:', error);
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
  
  const filteredExpiredInventories = expiredInventories.filter((inventory) => {
    if (!searchText || !searchColumn) return true; 
    const value = inventory[searchColumn]?.toString().toLowerCase(); 
    return value && value.includes(searchText.toLowerCase());
  });

  const expiredInventoryFields = [
    { label: "Log ID", name: "log_id", type: "text" },
    { label: "Inventory ID", name: "inventory_id", type: "text" },
    { label: "Product ID", name: "product_id", type: "text" },
    { label: "Quantity Expired", name: "qty_expired", type: "number" },
    { label: "Expiry Date", name: "expiry_date", type: "date" },
    { label: "Processed Date", name: "processed_date", type: "text" }
  ];

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpiredInventory({
      ...newExpiredInventory,
      [name]: value
    });
  };

  const handleSaveNewExpiredInventory = () => {
    let errors = {};
    if (!newExpiredInventory.inventory_id) {
      errors.inventory_id = "Inventory ID is required.";
    }
    if (!newExpiredInventory.product_id) {
      errors.product_id = "Product ID is required.";
    }
    if (!newExpiredInventory.qty_expired || isNaN(newExpiredInventory.qty_expired) || parseInt(newExpiredInventory.qty_expired) <= 0) {
      errors.qty_expired = "Quantity expired must be a positive number.";
    }
    if (!newExpiredInventory.expiry_date) {
      errors.expiry_date = "Expiry date is required.";
    }
  
    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      axios
        .post("http://localhost:5000/api/Expired_Inventories", newExpiredInventory)
        .then((response) => {
          setExpiredInventories([...expiredInventories, response.data]);
          setShowModal(false);
        })
        .catch((error) => {
          console.error("Error adding expired inventory:", error);
        });
    }
  };

  const handleViewExpiredInventory = (expiredInventory) => {
    setSelectedExpiredInventory(expiredInventory);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false); 
  };

  const handleDeleteExpiredInventory = (logId) => {
    axios
      .delete(`http://localhost:5000/api/Expired_Inventories/${logId}`)
      .then((response) => {
        setExpiredInventories((prevExpiredInventories) =>
          prevExpiredInventories.filter((expiredInventory) => expiredInventory.log_id !== logId)
        );
      })
      .catch((error) => {
        console.error("Error deleting expired inventory:", error);
      });
  };

  const handleEditExpiredInventory = (expiredInventory) => {
    setSelectedExpiredInventory(expiredInventory);
    setEditedExpiredInventory({ ...expiredInventory });
    setShowEditModal(true);
  };
  
  const handleSaveEditExpiredInventory = () => {
    const { processed_date, ...expiredInventoryData } = editedExpiredInventory;
    axios
      .put(`http://localhost:5000/api/Expired_Inventories/${editedExpiredInventory.log_id}`, expiredInventoryData)
      .then((response) => {
        setExpiredInventories((prevExpiredInventories) =>
          prevExpiredInventories.map((inv) => (inv.log_id === editedExpiredInventory.log_id ? editedExpiredInventory : inv))
        );
        setShowEditModal(false);
      })
      .catch((error) => {
        console.error("Error updating expired inventory:", error.response ? error.response.data : error);
      });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedExpiredInventory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedExpiredInventory(null);
  };

  const handleDownloadPDF = () => {
    setShowPrintModal(true);
  };

  return (
    <div className={styles.ManageEmployeeContainer}>
      <Emp_Sidebar />
      <div className={styles.ManageEmployeeContent}>
        <Header />
        <div className={styles.InnerContainer} style={{ marginLeft: "10px", width: "100%" }}>
          <div className={styles.TopSection}>
            <h1 className="section-title" style={{ fontSize: '28px', fontWeight: 'bold' }}>Manage Expired Inventories</h1>

            <div className={styles.SearchWrapper}>
              <select
                className="form-control"
                value={searchColumn}
                onChange={handleSearchColumnChange}
                style={{ marginRight: "10px", width: "200px" }}
              >
                <option value="log_id">Log ID</option>
                <option value="inventory_id">Inventory ID</option>
                <option value="product_id">Product ID</option>
                <option value="qty_expired">Quantity Expired</option>
                <option value="expiry_date">Expiry Date</option>
              </select>
              <input
                type="text"
                className="form-control search-bar"
                value={searchText}
                onChange={handleSearchChange}
                placeholder={`Search by ${searchColumn}...`}
              />
              <div className={styles.BtnContainer}>
                <button className="btn btn-secondary" onClick={handleDownloadPDF} style={{ width: '150px', marginLeft:"10px" }}>Print</button>
              </div>
            </div>
          </div>

          <div className={styles.TableContainer}>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>LOG ID</th>
                  <th>INVENTORY ID</th>
                  <th>PRODUCT ID</th>
                  <th>QUANTITY EXPIRED</th>
                  <th>EXPIRY DATE</th>
                  <th>PROCESSED DATE</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpiredInventories.length > 0 ? (
                  filteredExpiredInventories.map((inventory) => (
                    <tr key={inventory.log_id}>
                      <td>{inventory.log_id}</td>
                      <td>{inventory.inventory_id}</td>
                      <td>{inventory.product_id}</td>
                      <td>{inventory.qty_expired}</td>
                      <td>{formatDate(inventory.expiry_date)}</td>
                      <td>{formatDate(inventory.processed_date)}</td>
                      <td>
                        <FaEye
                          style={{ marginRight: "10px", cursor: "pointer", color: "#2770b4" }}
                          onClick={() => handleViewExpiredInventory(inventory)} 
                        />
                        <FaEdit
                          style={{ marginRight: "10px", cursor: "pointer", color: "#f0ad4e" }}
                          onClick={() => handleEditExpiredInventory(inventory)} 
                        />
                        <FaTrash
                          style={{ cursor: "pointer", color: "#d9534f" }}
                          onClick={() => handleDeleteExpiredInventory(inventory.log_id)} 
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">No expired inventories found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <AddEntityModal
          showModal={showModal}
          handleClose={handleCloseModal}
          handleSave={handleSaveNewExpiredInventory}
          entityTitle="Expired Inventory"
          entityData={newExpiredInventory}
          entityFields={[
            { label: "Inventory ID", name: "inventory_id", type: "text" },
            { label: "Product ID", name: "product_id", type: "text" },
            { label: "Quantity Expired", name: "qty_expired", type: "number" },
            { label: "Expiry Date", name: "expiry_date", type: "date" }
          ]}
          handleInputChange={handleInputChange}
          validationErrors={validationErrors}
        />

        <ViewModal
          showViewModal={showViewModal}
          selectedEntity={selectedExpiredInventory}
          handleClose={handleCloseViewModal}
          entityTitle="Expired Inventory"
          entityFields={[
            { label: "Log ID", name: "log_id" },
            { label: "Inventory ID", name: "inventory_id" },
            { label: "Product ID", name: "product_id" },
            { label: "Quantity Expired", name: "qty_expired" },
            { label: "Expiry Date", name: "expiry_date", format: formatDate },
            { label: "Processed Date", name: "processed_date", format: formatDate }
          ]}
        />

        <EditModal
          showEditModal={showEditModal}
          entityData={editedExpiredInventory}
          entityTitle="Expired Inventory"
          entityFields={[
            { label: "Log ID", name: "log_id", type: "text", disabled: true },
            { label: "Inventory ID", name: "inventory_id", type: "text" },
            { label: "Product ID", name: "product_id", type: "text" },
            { label: "Quantity Expired", name: "qty_expired", type: "number" },
            { label: "Expiry Date", name: "expiry_date", type: "date" }
          ]}
          handleClose={() => setShowEditModal(false)}
          handleSaveEditEntity={handleSaveEditExpiredInventory}
          handleEditInputChange={handleEditInputChange}
        />

        <PrintModal
          show={showPrintModal}
          handleClose={() => setShowPrintModal(false)}
          title="Print Expired Inventory Report"
          data={filteredExpiredInventories}
          fields={[
            { label: "Log ID", field: "log_id" },
            { label: "Inventory ID", field: "inventory_id" },
            { label: "Product ID", field: "product_id" },
            { label: "Quantity Expired", field: "qty_expired" },
            { label: "Expiry Date", field: "expiry_date", format: (date) => date ? new Date(date).toLocaleDateString() : "" },
            { label: "Processed Date", field: "processed_date", format: (date) => date ? new Date(date).toLocaleDateString() : "" }
          ]}
          filename="expired_inventory_report.pdf"
          reportTitle="Expired Inventory Details Report"
        />
      </div>
    </div>
  );
}

export default ExpiredInventories;
