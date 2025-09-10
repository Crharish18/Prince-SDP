import React from "react";
import './Viewmodal.css';  // ✅ Using the same CSS file as ViewModal.jsx

// OrderItemsModal: Modal to display the items of a specific order
const OrderItemsModal = ({ showOrderItemsModal, orderItems, handleClose }) => {
  // Don't render the modal if not open
  if (!showOrderItemsModal) return null;

  return (
    <div className="modal-overlay1">
      <div className="modal-content1" style={{ width: "800px", maxWidth: "90%" }}>
        {/* Modal title */}
        <h2 className="modal-title1">Order Items</h2>
        
        {/* Table for displaying order items */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="table table-striped" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th style={{ padding: "12px 15px", textAlign: "center", width: "10%" }}>Order_Item ID</th>
                <th style={{ padding: "12px 15px", textAlign: "center", width: "10%" }}>Product ID</th>
                <th style={{ padding: "12px 15px", textAlign: "center", width: "10%" }}>Inventory ID</th>
                <th style={{ padding: "12px 15px", textAlign: "left", width: "20%" }}>Product Name</th>
                <th style={{ padding: "12px 15px", textAlign: "center", width: "10%" }}>Quantity</th>
                <th style={{ padding: "12px 15px", textAlign: "right", width: "15%" }}>Price</th>
                <th style={{ padding: "12px 15px", textAlign: "right", width: "15%" }}>Discount</th>
                <th style={{ padding: "12px 15px", textAlign: "right", width: "20%" }}>Final Price</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.length > 0 ? (
                orderItems.map((item) => (
                  <tr key={item.order_item_id}>
                    <td style={{ padding: "12px 15px", textAlign: "center" }}>{item.order_item_id}</td>
                    <td style={{ padding: "12px 15px", textAlign: "center" }}>{item.product_id}</td>
                    <td style={{ padding: "12px 15px", textAlign: "center" }}>{item.inventory_id}</td>
                    <td style={{ padding: "12px 15px", textAlign: "left" }}>{item.product_name}</td>
                    <td style={{ padding: "12px 15px", textAlign: "center" }}>{item.qty}</td>
                    <td style={{ padding: "12px 15px", textAlign: "right" }}>Rs {parseFloat(item.price).toFixed(2)}</td>
                    <td style={{ padding: "12px 15px", textAlign: "right" }}>Rs {parseFloat(item.discount).toFixed(2)}</td>
                    <td style={{ padding: "12px 15px", textAlign: "right" }}>Rs {parseFloat(item.final_price).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "15px" }}>No items found for this order</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal close button */}
        <div className="btn-container" style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
            style={{ width: "150px" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderItemsModal;
