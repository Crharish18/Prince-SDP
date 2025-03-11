import React from "react";
import './Viewmodal.css';  // ✅ Using the same CSS file as ViewModal.jsx

const OrderItemsModal = ({ showOrderItemsModal, orderItems, handleClose }) => {
  if (!showOrderItemsModal) return null; // ✅ Don't render if modal is not open

  return (
    <div className="modal-overlay1">
      <div className="modal-content1">
        <h2 className="modal-title1">Order Items</h2>
        
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Item ID</th>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {orderItems.length > 0 ? (
              orderItems.map((item) => (
                <tr key={item.order_item_id}>
                  <td>{item.order_item_id}</td>
                  <td>{item.product_name}</td>
                  <td>{item.qty}</td>
                  <td>{item.price}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No items found for this order</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="btn-container">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose} // ✅ Close the modal
            style={{ marginLeft: "200px", width: "150px" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderItemsModal;
