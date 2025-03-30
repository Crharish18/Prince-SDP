import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa"; 
import Sidebar from "../../components/sidebar";
import Header from "../../components/Header";
import styles from './Order.module.css'; // Exact same CSS as ManageEmployee
import 'bootstrap/dist/css/bootstrap.min.css';
import OrderItemsModal from "../../components/orderitemsmodal";
import ViewModal from "../../components/Viewmodal"; 
import EditModal from "../../components/EditModal"; 
import AddEntityModal from "../../components/AddEntityModal";

function ManageOrder() {
  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState([]); // ✅ Store order items
  const [showOrderItemsModal, setShowOrderItemsModal] = useState(false); // ✅ State to show the new modal
  
  const [showModal, setShowModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customer_id: '',
    total_price: '',
    status: ''
  });

  const [validationErrors, setValidationErrors] = useState({
    customer_id: '',
    total_price: '',
    status: ''
  });

  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [showViewModal, setShowViewModal] = useState(false); 
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [showEditModal, setShowEditModal] = useState(false); 
  const [editedOrder, setEditedOrder] = useState({}); 

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

  const handleSearchColumnChange = (e) => {
    setSearchColumn(e.target.value);  
  };
  
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);  
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchText || !searchColumn) return true; 
    const value = order[searchColumn]?.toString().toLowerCase(); 
    return value && value.includes(searchText.toLowerCase());
  });

  const orderFields = [
    { label: "Customer ID", name: "customer_id", type: "text" },
    { label: "Total Price", name: "total_price", type: "text" },
    { label: "Status", name: "status", type: "text" }
  ];

  const handleAddOrderClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrder({
      ...newOrder,
      [name]: value
    });
  };

  const handleSaveNewOrder = () => {
    let errors = {};
    if (!newOrder.customer_id) {
      errors.customer_id = "Customer ID is required.";
    }
    if (!newOrder.total_price || isNaN(newOrder.total_price)) {
      errors.total_price = "Total Price must be a number.";
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

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true); // ✅ Opens the standard ViewModal

    // ✅ Fetch order items from backend
    axios.get(`http://localhost:5000/api/order_items/${order.order_id}/items`)
        .then((response) => {
            setOrderItems(response.data);
            setShowOrderItemsModal(true); // ✅ Open order items modal
        })
        .catch((error) => {
            console.error("Error fetching order items:", error);
            setOrderItems([]); // If error, set empty array
            setShowOrderItemsModal(false);
        });
};


  const handleCloseViewModal = () => {
    setShowViewModal(false); 
  };

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

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setEditedOrder({ ...order });
    setShowEditModal(true);
  };
  
  const handleSaveEditOrder = () => {
    axios
      .put(`http://localhost:5000/api/orders/${editedOrder.order_id}`, editedOrder)
      .then(() => {
        setOrders((prevOrders) =>
          prevOrders.map((ord) => (ord.order_id === editedOrder.order_id ? editedOrder : ord))
        );
        setShowEditModal(false);
      })
      .catch((error) => {
        console.error("Error updating order:", error);
      });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedOrder((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedOrder(null);
  };

  

  return (
    <div className={styles.ManageEmployeeContainer}>
      <Sidebar />
      <div className={styles.ManageEmployeeContent}>
        <Header />
        <div className={styles.InnerContainer} style={{ marginLeft: "10px", width: "100%" }}>
          <div className={styles.TopSection}>
            <h1 className="section-title" style={{ fontSize: '28px', fontWeight: 'bold' }}>Manage Orders</h1>

            <div className={styles.SearchWrapper}>
              <select
                className="form-control"
                value={searchColumn}
                onChange={handleSearchColumnChange}
                style={{ marginRight: "10px", width: "200px" }}
              >
                <option value="order_id">Order ID</option>
                <option value="customer_id">Customer ID</option>
                <option value="total_price">Total Price</option>
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
                
                <button className="btn btn-secondary" style={{ width: '150px', marginLeft:"10px" }}>Report</button>
              </div>
            </div>
          </div>

          <div className={styles.TableContainer}>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer ID</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.order_id}>
                      <td>{order.order_id}</td>
                      <td>{order.customer_id}</td>
                      <td>{order.total_price}</td>
                      <td>{order.status}</td>
                      <td>
                        <FaEye 
                        style={{ marginRight: "10px", cursor: "pointer", color: "#2770b4" }}
                        onClick={() => handleViewOrder(order)} />
                        
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No orders found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <OrderItemsModal 
    showOrderItemsModal={showOrderItemsModal}
    orderItems={orderItems}
    handleClose={() => setShowOrderItemsModal(false)} 
/>

      </div>
    </div>
  );
}

export default ManageOrder;
