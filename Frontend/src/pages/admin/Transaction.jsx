import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa"; 
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from './Transactions.module.css'; // Import as CSS module
import 'bootstrap/dist/css/bootstrap.min.css';
import ViewModal from "../../components/Viewmodal"; 
import EditModal from "../../components/EditModal"; 
import AddEntityModal from "../../components/AddEntityModal";

function Transaction() {
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    order_id: '',
    customer_id: '',
    amount_paid: '',
    payment_method: '',
    status: ''
  });

  const [validationErrors, setValidationErrors] = useState({
    order_id: '',
    customer_id: '',
    amount_paid: '',
    payment_method: '',
    status: ''
  });
  
  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [showViewModal, setShowViewModal] = useState(false); 
  const [selectedTransaction, setSelectedTransaction] = useState(null); 
  const [showEditModal, setShowEditModal] = useState(false); 
  const [editedTransaction, setEditedTransaction] = useState({}); 

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/transactions')
      .then((response) => {
        setTransactions(response.data);
      })
      .catch((error) => {
        console.error('Error fetching transactions:', error);
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
  
  const filteredTransactions = transactions.filter((trans) => {
    if (!searchText || !searchColumn) return true; 
    const value = trans[searchColumn]?.toString().toLowerCase(); 
    return value && value.includes(searchText.toLowerCase());
  });

  const transactionFields = [
    { label: "Transaction ID", name: "transaction_id", type: "text" },
    { label: "Order ID", name: "order_id", type: "text" },
    { label: "Customer ID", name: "customer_id", type: "text" },
    { label: "Amount Paid", name: "amount_paid", type: "number" },
    { label: "Payment Method", name: "payment_method", type: "text" },
    { label: "Status", name: "status", type: "text" },
    { label: "Created At", name: "created_at", type: "text" }
  ];

  const handleAddTransactionClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction({
      ...newTransaction,
      [name]: value
    });
  };

  const handleSaveNewTransaction = () => {
    let errors = {};
    if (!newTransaction.order_id) {
      errors.order_id = "Order ID is required.";
    }
    if (!newTransaction.customer_id) {
      errors.customer_id = "Customer ID is required.";
    }
    if (!newTransaction.amount_paid || isNaN(newTransaction.amount_paid) || parseFloat(newTransaction.amount_paid) <= 0) {
      errors.amount_paid = "Amount paid must be a positive number.";
    }
    if (!newTransaction.payment_method) {
      errors.payment_method = "Payment method is required.";
    }
    if (!newTransaction.status || !["Success", "Failed", "Pending"].includes(newTransaction.status)) {
      errors.status = "Status must be 'Success', 'Failed', or 'Pending'.";
    }
  
    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      axios
        .post("http://localhost:5000/api/transactions", newTransaction)
        .then((response) => {
          setTransactions([...transactions, response.data]);
          setShowModal(false);
        })
        .catch((error) => {
          console.error("Error adding transaction:", error);
        });
    }
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false); 
  };

  const handleDeleteTransaction = (transactionId) => {
    axios
      .delete(`http://localhost:5000/api/transactions/${transactionId}`)
      .then((response) => {
        setTransactions((prevTransactions) =>
          prevTransactions.filter((transaction) => transaction.transaction_id !== transactionId)
        );
      })
      .catch((error) => {
        console.error("Error deleting transaction:", error);
      });
  };

  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setEditedTransaction({ ...transaction });
    setShowEditModal(true);
  };
  
  const handleSaveEditTransaction = () => {
    const { created_at, ...transactionData } = editedTransaction;
    axios
      .put(`http://localhost:5000/api/transactions/${editedTransaction.transaction_id}`, transactionData)
      .then((response) => {
        setTransactions((prevTransactions) =>
          prevTransactions.map((trans) => (trans.transaction_id === editedTransaction.transaction_id ? editedTransaction : trans))
        );
        setShowEditModal(false);
      })
      .catch((error) => {
        console.error("Error updating transaction:", error.response ? error.response.data : error);
      });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTransaction((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedTransaction(null);
  };

  return (
    <div className={styles.ManageEmployeeContainer}>
      <Sidebar />
      <div className={styles.ManageEmployeeContent}>
        <Header />
        <div className={styles.InnerContainer} style={{ marginLeft: "10px", width: "100%" }}>
          <div className={styles.TopSection}>
          <h1 className="section-title" style={{ fontSize: '28px', fontWeight: 'bold' }}>Manage Transactions</h1>

            <div className={styles.SearchWrapper}>
              <select
                className="form-control"
                value={searchColumn}
                onChange={handleSearchColumnChange}
                style={{ marginRight: "10px", width: "200px" }}
              >
                <option value="transaction_id">Transaction ID</option>
                <option value="order_id">Order ID</option>
                <option value="customer_id">Customer ID</option>
                <option value="amount_paid">Amount</option>
                <option value="payment_method">Payment Method</option>
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
                <button className="btn btn-primary" style={{ width: '150px', marginLeft:"10px" }} onClick={handleAddTransactionClick}>
                  Add Transaction
                </button>
                <button className="btn btn-secondary" style={{ width: '150px', marginLeft:"10px" }}>Report</button>
              </div>
            </div>
          </div>

          <div className={styles.TableContainer}>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>TRANSACTION ID</th>
                  <th>ORDER ID</th>
                  <th>CUSTOMER ID</th>
                  <th>AMOUNT</th>
                  <th>PAYMENT METHOD</th>
                  <th>STATUS</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((trans) => (
                    <tr key={trans.transaction_id}>
                      <td>{trans.transaction_id}</td>
                      <td>{trans.order_id}</td>
                      <td>{trans.customer_id}</td>
                      <td>{trans.amount_paid}</td>
                      <td>{trans.payment_method}</td>
                      <td>{trans.status}</td>
                      <td>
                        <FaEye
                          style={{ marginRight: "10px", cursor: "pointer", color: "#2770b4" }}
                          onClick={() => handleViewTransaction(trans)} 
                        />
                        <FaEdit
                          style={{ marginRight: "10px", cursor: "pointer", color: "#f0ad4e" }}
                          onClick={() => handleEditTransaction(trans)} 
                        />
                        <FaTrash
                          style={{ cursor: "pointer", color: "#d9534f" }}
                          onClick={() => handleDeleteTransaction(trans.transaction_id)} 
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">No transactions found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

       
        <AddEntityModal
          showModal={showModal}
          handleClose={handleCloseModal}
          handleSave={handleSaveNewTransaction}
          entityTitle="Transaction"
          entityData={newTransaction}
          entityFields={[
            { label: "Order ID", name: "order_id", type: "text" },
            { label: "Customer ID", name: "customer_id", type: "text" },
            { label: "Amount Paid", name: "amount_paid", type: "number" },
            { label: "Payment Method", name: "payment_method", type: "text" },
            { label: "Status", name: "status", type: "text" }
          ]}
          handleInputChange={handleInputChange}
          validationErrors={validationErrors}
        />

        <ViewModal
          showViewModal={showViewModal}
          selectedEntity={selectedTransaction}
          handleClose={handleCloseViewModal}
          entityTitle="Transaction"
          entityFields={[
            { label: "Transaction ID", name: "transaction_id" },
            { label: "Order ID", name: "order_id" },
            { label: "Customer ID", name: "customer_id" },
            { label: "Amount Paid", name: "amount_paid" },
            { label: "Payment Method", name: "payment_method" },
            { label: "Status", name: "status" },
            { label: "Created At", name: "created_at", format: formatDate }
          ]}
        />

        <EditModal
          showEditModal={showEditModal}
          entityData={editedTransaction}
          entityTitle="Transaction"
          entityFields={transactionFields}
          handleClose={() => setShowEditModal(false)}
          handleSaveEditEntity={handleSaveEditTransaction}
          handleEditInputChange={handleEditInputChange}
        />
      </div>
    </div>
  );
}

export default Transaction;