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
import PrintModal from "../../components/PrintModal";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';  // This is an additional library to handle tables in PDFs
import logodash from "../../assets/PicturesAdmin/logoWhite.png";

// Transaction management component
function Transaction() {
  // State for all transactions
  const [transactions, setTransactions] = useState([]);
  // State for Add Transaction modal visibility
  const [showModal, setShowModal] = useState(false);
  // State for new transaction form data
  const [newTransaction, setNewTransaction] = useState({
    order_id: '',
    customer_id: '',
    amount_paid: '',
    payment_method: '',
    status: ''
  });

  // State for validation errors in add form
  const [validationErrors, setValidationErrors] = useState({
    order_id: '',
    customer_id: '',
    amount_paid: '',
    payment_method: '',
    status: ''
  });
  
  // State for search input and column
  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  // State for view modal and selected transaction
  const [showViewModal, setShowViewModal] = useState(false); 
  const [selectedTransaction, setSelectedTransaction] = useState(null); 
  // State for edit modal and edited transaction
  const [showEditModal, setShowEditModal] = useState(false); 
  const [editedTransaction, setEditedTransaction] = useState({}); 
  // State for print modal
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Fetch all transactions from backend on mount
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

  // Format date as YYYY-MM-DD for display
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
  
  // Filter transactions based on search input and column
  const filteredTransactions = transactions.filter((trans) => {
    if (!searchText || !searchColumn) return true; 
    const value = trans[searchColumn]?.toString().toLowerCase(); 
    return value && value.includes(searchText.toLowerCase());
  });

  // Field definitions for EditModal
  const transactionFields = [
    { label: "Transaction ID", name: "transaction_id", type: "text" },
    { label: "Order ID", name: "order_id", type: "text" },
    { label: "Customer ID", name: "customer_id", type: "text" },
    { label: "Amount Paid", name: "amount_paid", type: "number" },
    { label: "Payment Method", name: "payment_method", type: "text" },
    { label: "Status", name: "status", type: "text" },
    { label: "Created At", name: "created_at", type: "text" }
  ];

  // Show Add Transaction modal
  const handleAddTransactionClick = () => {
    setShowModal(true);
  };

  // Close Add Transaction modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Handle input change in Add Transaction form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction({
      ...newTransaction,
      [name]: value
    });
  };

  // Validate and save new transaction to backend
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

  // Show view modal for selected transaction
  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowViewModal(true);
  };

  // Close view modal
  const handleCloseViewModal = () => {
    setShowViewModal(false); 
  };

  // Delete transaction by ID
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

  // Show edit modal for selected transaction
  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setEditedTransaction({ ...transaction });
    setShowEditModal(true);
  };
  
  // Validate and save edited transaction to backend
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

  // Handle input change in Edit Transaction modal
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTransaction((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Close edit modal and reset selected transaction
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedTransaction(null);
  };

  // Show print modal for downloading PDF
  const handleDownloadPDF = () => {
    setShowPrintModal(true);
  };

  // Main render
  return (
    <div className={styles.ManageEmployeeContainer}>
      <Sidebar />
      <div className={styles.ManageEmployeeContent}>
        <Header />
        <div className={styles.InnerContainer} style={{ marginLeft: "10px", width: "100%" }}>
          <div className={styles.TopSection}>
            <h1 className="section-title" style={{ fontSize: '28px', fontWeight: 'bold' }}>Manage Transactions</h1>

            {/* Search and action controls */}
            <div className={styles.SearchWrapper}>
              {/* Search column dropdown */}
              <select
                className="form-control"
                value={searchColumn}
                onChange={handleSearchColumnChange}
                style={{ marginRight: "10px", width: "200px" }}
              >
                <option value="transaction_id">Transaction ID</option>
                <option value="order_id">Order ID</option>
                <option value="amount_paid">Amount</option>
                <option value="status">Status</option>
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
                {/* Add Transaction button */}
                <button className="btn btn-primary" style={{ width: '150px', marginLeft:"10px" }} onClick={handleAddTransactionClick}>
                  Add Transaction
                </button>
                {/* Print button */}
                <button className="btn btn-secondary" onClick={handleDownloadPDF} style={{ width: '150px', marginLeft:"10px" }}>Print</button>
              </div>
            </div>
          </div>

          {/* Transactions table */}
          <div className={styles.TableContainer}>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>TRANSACTION ID</th>
                  <th>ORDER ID</th>
                  <th>AMOUNT</th>
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
                      <td>{trans.amount_paid}</td>
                      <td>{trans.status}</td>
                      <td>
                        {/* View transaction button */}
                        <FaEye
                          style={{ marginRight: "10px", cursor: "pointer", color: "#2770b4" }}
                          onClick={() => handleViewTransaction(trans)} 
                        />
                        {/* Edit transaction button */}
                        <FaEdit
                          style={{ marginRight: "10px", cursor: "pointer", color: "#f0ad4e" }}
                          onClick={() => handleEditTransaction(trans)} 
                        />
                        {/* Delete transaction button */}
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

        {/* Add Transaction Modal */}
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

        {/* View Modal for transaction details */}
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

        {/* Edit Modal for transaction */}
        <EditModal
          showEditModal={showEditModal}
          entityData={editedTransaction}
          entityTitle="Transaction"
          entityFields={transactionFields}
          handleClose={() => setShowEditModal(false)}
          handleSaveEditEntity={handleSaveEditTransaction}
          handleEditInputChange={handleEditInputChange}
        />

        {/* Print Modal for transactions */}
        <PrintModal
          show={showPrintModal}
          handleClose={() => setShowPrintModal(false)}
          title="Print Transaction Report"
          data={filteredTransactions}
          fields={[
            { label: "Transaction ID", field: "transaction_id" },
            { label: "Order ID", field: "order_id" },
            { label: "Amount Paid", field: "amount_paid" },
            { label: "Status", field: "status" },
            { label: "Created At", field: "created_at", format: (date) => date ? new Date(date).toLocaleDateString() : "" }
          ]}
          filename="transaction_report.pdf"
          reportTitle="Transaction Details Report"
        />
      </div>
    </div>
  );
}

export default Transaction;
