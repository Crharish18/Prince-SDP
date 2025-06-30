import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBoxOpen, FaEdit, FaTrash, FaSortUp, FaSortDown } from "react-icons/fa"; 
import Emp_Sidebar from "../../components/Employee/Emp_Sidebar";
import Header from "../../components/Header";
import styles from './Emp_Order.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import OrderItemsModal from "../../components/orderitemsmodal";
import { Link } from 'react-router-dom';
import ViewModal from "../../components/Viewmodal"; 
import PrintModal from "../../components/PrintModal";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import logodash from "../../assets/PicturesAdmin/logoWhite.png";

// Custom EditOrderModal component for order status updates
const EditOrderModal = ({ showModal, order, handleClose, handleSave }) => {
  // State for selected status in modal
  const [status, setStatus] = useState(order?.status || "Pending");
  
  // Update status when order changes
  useEffect(() => {
    if (order) {
      setStatus(order.status);
    }
  }, [order]);
  
  // Handle status dropdown change
  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };
  
  // Handle save button click
  const handleSubmit = () => {
    handleSave({ ...order, status });
  };
  
  // Get color for status text
  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "#28a745"; // Green
      case "Shipped":
        return "#007bff"; // Blue
      case "Pending":
        return "#ffc107"; // Yellow
      case "Cancelled":
        return "#dc3545"; // Red
      default:
        return "#6c757d"; // Gray
    }
  };
  
  return (
    <>
      {showModal && order && (
        <div className="modal-overlay1">
          <div className="modal-content1">
            <h2 className="modal-title1">Edit Order Status</h2>
            <div className="modal-form1">
              <div className="form-group">
                <label>Order ID</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={order.order_id} 
                  readOnly 
                />
              </div>
              <div className="form-group">
                <label>Customer ID</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={order.customer_id} 
                  readOnly 
                />
              </div>
              
              <div className="form-group">
                <label>Total Price</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={`Rs ${parseFloat(order.total_price).toFixed(2)}`} 
                  readOnly 
                />
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select 
                  className="form-control" 
                  value={status}
                  onChange={handleStatusChange}
                  style={{ 
                    color: getStatusColor(status),
                    fontWeight: "bold"
                  }}
                >
                  <option value="Pending" style={{ color: "#ffc107" }}>Pending</option>
                  <option value="Shipped" style={{ color: "#007bff" }}>Shipped</option>
                  <option value="Delivered" style={{ color: "#28a745" }}>Delivered</option>
                  <option value="Cancelled" style={{ color: "#dc3545" }}>Cancelled</option>
                </select>
              </div>
              
              <div className="btn-container" style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "10px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                  style={{ width: "150px" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  style={{ width: "150px" }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Employee Order management component
function ManageOrder() {
  // State for all orders
  const [orders, setOrders] = useState([]);
  // State for order items (for OrderItemsModal)
  const [orderItems, setOrderItems] = useState([]);
  // State for showing OrderItemsModal
  const [showOrderItemsModal, setShowOrderItemsModal] = useState(false);
  // State for showing PrintModal
  const [showPrintModal, setShowPrintModal] = useState(false);
  // State for showing Add Order modal (not used in UI)
  const [showModal, setShowModal] = useState(false);
  // State for new order form (not used in UI)
  const [newOrder, setNewOrder] = useState({
    customer_id: '',
    total_price: '',
    status: '',
    price: '',
    total_discount: ''
  });
  // State for validation errors in add form (not used in UI)
  const [validationErrors, setValidationErrors] = useState({
    customer_id: '',
    total_price: '',
    status: '',
    price: '',
    total_discount: ''
  });
  // State for search input and column
  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  // State for view modal and selected order
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null); 
  // State for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  // State for status filter and date sorting
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateSort, setDateSort] = useState(null); // null, 'asc', or 'desc'

  // Fetch all orders from backend on mount
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/orders')
      .then((response) => {
        setOrders(response.data);
      })
      .catch((error) => {
        console.error('Error fetching orders:', error);
      });
  }, []);

  // Format date as readable string
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    
    try {
      const date = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) return "N/A";
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  // Get color for status text
  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "#28a745"; // Green
      case "Shipped":
        return "#007bff"; // Blue
      case "Pending":
        return "#ffc107"; // Yellow
      case "Cancelled":
        return "#dc3545"; // Red
      default:
        return "#6c757d"; // Gray
    }
  };

  // Handle change in search column dropdown
  const handleSearchColumnChange = (e) => {
    setSearchColumn(e.target.value);  
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);  
  };

  // Handle status filter dropdown change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Handle change in date sort direction
  const handleDateSortChange = (sortDirection) => {
    setDateSort(sortDirection);
  };

  // Show Add Order modal (not used in UI)
  const handleAddOrderClick = () => {
    setShowModal(true);
  };

  // Close Add Order modal (not used in UI)
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Handle input change in Add Order form (not used in UI)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrder({
      ...newOrder,
      [name]: value
    });
  };

  // Validate and save new order to backend (not used in UI)
  const handleSaveNewOrder = () => {
    let errors = {};
    if (!newOrder.customer_id) {
      errors.customer_id = "Customer ID is required.";
    }
    if (!newOrder.total_price || isNaN(newOrder.total_price)) {
      errors.total_price = "Total Price must be a number.";
    }
    if (!newOrder.price || isNaN(newOrder.price)) {
      errors.price = "Price must be a number.";
    }
    if (!newOrder.total_discount || isNaN(newOrder.total_discount)) {
      errors.total_discount = "Total Discount must be a number.";
    }
    if (!newOrder.status) {
      errors.status = "Status is required.";
    }
  
    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      axios
        .post("http://localhost:5000/api/orders", newOrder)
        .then((response) => {
          setOrders([...orders, response.data]);
          setShowModal(false);
        })
        .catch((error) => {
          console.error("Error adding order:", error);
        });
    }
  };

  // Show order items modal for selected order
  const handleViewOrderItems = (order) => {
    setSelectedOrder(order);
    // Fetch order items from backend
    axios.get(`http://localhost:5000/api/order_items/${order.order_id}/items`)
        .then((response) => {
            setOrderItems(response.data);
            setShowOrderItemsModal(true);
        })
        .catch((error) => {
            console.error("Error fetching order items:", error);
            setOrderItems([]);
            setShowOrderItemsModal(false);
        });
  };

  // Close view modal
  const handleCloseViewModal = () => {
    setShowViewModal(false); 
  };

  // Delete order by ID
  const handleDeleteOrder = (orderId) => {
    axios
      .delete(`http://localhost:5000/api/orders/${orderId}`)
      .then(() => {
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order.order_id !== orderId)
        );
      })
      .catch((error) => {
        console.error("Error deleting order:", error);
      });
  };

  // Show edit modal for selected order
  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setShowEditModal(true);
  };

  // Validate and save edited order to backend
  const handleSaveEditOrder = (updatedOrder) => {
    axios
      .put(`http://localhost:5000/api/orders/${updatedOrder.order_id}`, updatedOrder)
      .then(() => {
        setOrders((prevOrders) =>
          prevOrders.map((ord) => (ord.order_id === updatedOrder.order_id ? updatedOrder : ord))
        );
        setShowEditModal(false);
      })
      .catch((error) => {
        console.error("Error updating order:", error);
      });
  };

  // Close edit modal and reset selected order
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedOrder(null);
  };

  // Show print modal for downloading PDF
  const handleDownloadPDF = () => {
    setShowPrintModal(true);
  };

  // Filter and sort orders based on search, status, and date
  const filteredOrders = React.useMemo(() => {
    // First apply text search filter
    let filtered = orders.filter((order) => {
      if (!searchText || !searchColumn) return true;
      const value = order[searchColumn]?.toString().toLowerCase();
      return value && value.includes(searchText.toLowerCase());
    });
    
    // Then apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Finally apply date sorting
    if (dateSort) {
      filtered = [...filtered].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : null;
        const dateB = b.created_at ? new Date(b.created_at) : null;
        
        // Handle null values
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1; // null values at the end
        if (!dateB) return -1;
        
        // Sort based on direction
        if (dateSort === 'asc') {
          return dateA - dateB; // Oldest first
        } else {
          return dateB - dateA; // Newest first
        }
      });
    }
    
    return filtered;
  }, [orders, searchText, searchColumn, statusFilter, dateSort]);

  // Field definitions for Add/Edit modals (not used in UI)
  const orderFields = [
    { label: "Customer ID", name: "customer_id", type: "text" },
    { label: "Total Price", name: "total_price", type: "number" },
    { label: "Price", name: "price", type: "number" },
    { label: "Total Discount", name: "total_discount", type: "number" },
    { label: "Status", name: "status", type: "select", options: ["Pending", "Shipped", "Delivered", "Cancelled"] }
  ];

  // Main render
  return (
    <div className={styles.ManageEmployeeContainer}>
      <Emp_Sidebar />
      <div className={styles.ManageEmployeeContent}>
        <Header />
        <div className={styles.InnerContainer} style={{ marginLeft: "10px", width: "100%" }}>
          {/* Top section with search and filters */}
          <div className={styles.TopSection}>
            <h1 className="section-title" style={{ fontSize: '28px', fontWeight: 'bold' }}>Manage Orders</h1>

            <div className={styles.SearchWrapper}>
              {/* Search column dropdown */}
              <select
                className="form-control"
                value={searchColumn}
                onChange={handleSearchColumnChange}
                style={{ marginRight: "10px", width: "200px" }}
              >
                <option value="order_id">Order ID</option>
                <option value="customer_id">Customer ID</option>
                <option value="total_price">Total Price</option>
                <option value="price">Price</option>
                <option value="total_discount">Total Discount</option>
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
              {/* Link to Order Address page */}
              <Link to="/employee/Order_Address" className="btn btn-primary" style={{ width: '150px', marginLeft:"10px" }}>
                  Order-Address
                </Link>
              <div className={styles.BtnContainer}>
                {/* Print button */}
                <button className="btn btn-secondary" style={{ width: '150px', marginLeft:"10px" }} onClick={handleDownloadPDF}>Print</button>
              </div>
            </div>
            
            {/* Filter controls for status and date sorting */}
            <div style={{ display: "flex", marginTop: "15px", gap: "20px" }}>
              {/* Status filter dropdown */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ marginRight: "10px", fontWeight: "bold" }}>Filter by Status:</span>
                <select
                  className="form-control"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  style={{ width: "150px" }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending" style={{ color: "#ffc107" }}>Pending</option>
                  <option value="Shipped" style={{ color: "#007bff" }}>Shipped</option>
                  <option value="Delivered" style={{ color: "#28a745" }}>Delivered</option>
                  <option value="Cancelled" style={{ color: "#dc3545" }}>Cancelled</option>
                </select>
              </div>
              
              {/* Date sort controls */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ marginRight: "10px", fontWeight: "bold" }}>Sort by Date:</span>
                <div className="btn-group">
                  <button 
                    className={`btn ${dateSort === 'asc' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleDateSortChange('asc')}
                  >
                    Oldest First <FaSortUp />
                  </button>
                  <button 
                    className={`btn ${dateSort === 'desc' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleDateSortChange('desc')}
                  >
                    Newest First <FaSortDown />
                  </button>
                  {dateSort && (
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => handleDateSortChange(null)}
                    >
                      Clear Sort
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Orders table */}
          <div className={styles.TableContainer}>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer ID</th>
                  <th>Price</th>
                  <th>Total Discount</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th>
                    Created At
                    {dateSort === 'asc' && <FaSortUp style={{ marginLeft: "5px" }} />}
                    {dateSort === 'desc' && <FaSortDown style={{ marginLeft: "5px" }} />}
                  </th>
                  <th>Updated At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.order_id}>
                      <td>{order.order_id}</td>
                      <td>{order.customer_id}</td>
                      <td>Rs {parseFloat(order.price).toFixed(2)}</td>
                      <td>Rs {parseFloat(order.total_discount).toFixed(2)}</td>
                      <td>Rs {parseFloat(order.total_price).toFixed(2)}</td>
                      <td>
                        <span style={{ 
                          color: getStatusColor(order.status),
                          fontWeight: "bold" 
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td>{formatDate(order.created_at)}</td>
                      <td>{formatDate(order.updated_at)}</td>
                      <td>
                        {/* View order items button */}
                        <FaBoxOpen 
                          style={{ marginRight: "10px", cursor: "pointer", color: "#2770b4" }}
                          onClick={() => handleViewOrderItems(order)} 
                          title="View Order Items"
                        />
                        {/* Edit order status button */}
                        <FaEdit
                          style={{ marginRight: "10px", cursor: "pointer", color: "#f0ad4e" }}
                          onClick={() => handleEditOrder(order)} 
                          title="Edit Order Status"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9">No orders found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modals */}
        <OrderItemsModal 
          showOrderItemsModal={showOrderItemsModal}
          orderItems={orderItems}
          handleClose={() => setShowOrderItemsModal(false)} 
        />

        <ViewModal
          showViewModal={showViewModal}
          selectedEntity={selectedOrder}
          handleClose={handleCloseViewModal}
          entityTitle="Order"
          entityFields={[
            { label: "Order ID", name: "order_id" },
            { label: "Customer ID", name: "customer_id" },
            { label: "Price", name: "price" },
            { label: "Total Discount", name: "total_discount" },
            { label: "Total Price", name: "total_price" },
            { label: "Status", name: "status" },
            { label: "Created At", name: "created_at", format: formatDate },
            { label: "Updated At", name: "updated_at", format: formatDate }
          ]}
        />

        <EditOrderModal
          showModal={showEditModal}
          order={selectedOrder}
          handleClose={handleCloseEditModal}
          handleSave={handleSaveEditOrder}
        />

        <PrintModal
          show={showPrintModal}
          handleClose={() => setShowPrintModal(false)}
          title="Print Orders Report"
          data={filteredOrders}
          fields={[
            { label: "Order ID", field: "order_id" },
            { label: "Customer ID", field: "customer_id" },
            { label: "Price", field: "price", format: (price) => `Rs ${parseFloat(price).toFixed(2)}` },
            { label: "Total Discount", field: "total_discount", format: (discount) => `Rs ${parseFloat(discount).toFixed(2)}` },
            { label: "Total Price", field: "total_price", format: (total) => `Rs ${parseFloat(total).toFixed(2)}` },
            { label: "Status", field: "status" },
            { label: "Created At", field: "created_at", format: (date) => formatDate(date) },
            { label: "Updated At", field: "updated_at", format: (date) => formatDate(date) }
          ]}
          filename="orders_report.pdf"
          reportTitle="Orders Details Report"
        />
      </div>
    </div>
  );
}

export default ManageOrder;
