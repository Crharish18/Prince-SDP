import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash, FaSortUp, FaSortDown } from "react-icons/fa"; 
import Emp_Sidebar from "../../components/Employee/Emp_Sidebar"; 
import Header from "../../components/Header";
import styles from './Emp_Products.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ViewModal from "../../components/Viewmodal"; 
import EditModal from "../../components/EditModal"; 
import PrintModal from "../../components/PrintModal";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import logodash from "../../assets/PicturesAdmin/logoWhite.png";

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [showViewModal, setShowViewModal] = useState(false); 
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [showEditModal, setShowEditModal] = useState(false); 
  const [editedProduct, setEditedProduct] = useState({}); 
  const [editImageFile, setEditImageFile] = useState(null);
  const [quantitySort, setQuantitySort] = useState(null); // null, 'asc', or 'desc'
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Debug check when component mounts
  useEffect(() => {
    console.log("Component mounted");
  }, []);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/products')
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
      });
  }, []);

  const handleSearchColumnChange = (e) => setSearchColumn(e.target.value);
  const handleSearchChange = (e) => setSearchText(e.target.value);

  // Updated filteredProducts to include sorting by quantity
  const filteredProducts = React.useMemo(() => {
    // First filter the data
    let filtered = products.filter((prod) => {
      if (!searchText || !searchColumn) return true; 
      const value = prod[searchColumn]?.toString().toLowerCase(); 
      return value && value.includes(searchText.toLowerCase());
    });
    
    // Then sort by quantity if sorting is active
    if (quantitySort) {
      filtered = [...filtered].sort((a, b) => {
        const qtyA = parseInt(a.stock_qty) || 0;
        const qtyB = parseInt(b.stock_qty) || 0;
        
        // Sort based on direction
        if (quantitySort === 'asc') {
          return qtyA - qtyB; // Lowest first
        } else {
          return qtyB - qtyA; // Highest first
        }
      });
    }
    
    return filtered;
  }, [products, searchText, searchColumn, quantitySort]);

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => setShowViewModal(false);

  const handleDeleteProduct = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      axios
        .delete(`http://localhost:5000/api/products/${productId}`)
        .then(() => {
          setProducts((prevProducts) =>
            prevProducts.filter((product) => product.product_id !== productId)
          );
          alert("Product deleted successfully");
        })
        .catch((error) => {
          console.error("Error deleting product:", error);
          alert("Error deleting product");
        });
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setEditedProduct({ ...product });
    setShowEditModal(true);
  };

  // Update the handleSaveEditProduct function to handle file uploads
  const handleSaveEditProduct = () => {
    // If there's a new image file, use FormData to upload it
    if (editImageFile) {
      const formData = new FormData();
      
      // Add all product fields to FormData
      Object.keys(editedProduct).forEach(key => {
        if (key !== 'image_url') { // Skip the image_url field
          formData.append(key, editedProduct[key]);
        }
      });
      
      // Add the new image file
      formData.append('image', editImageFile);
      
      // Make the API request with FormData
      axios
        .put(`http://localhost:5000/api/products/${editedProduct.product_id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          // Update the products list with the updated product
          setProducts((prevProducts) =>
            prevProducts.map((prod) => 
              prod.product_id === editedProduct.product_id ? 
                {...editedProduct, image_url: response.data.image_url} : prod
            )
          );
          setShowEditModal(false);
          setEditImageFile(null);
        })
        .catch((error) => console.error("Error updating product:", error));
    } else {
      // No new image, use regular JSON request
      axios
        .put(`http://localhost:5000/api/products/${editedProduct.product_id}`, editedProduct)
        .then(() => {
          setProducts((prevProducts) =>
            prevProducts.map((prod) => (prod.product_id === editedProduct.product_id ? editedProduct : prod))
          );
          setShowEditModal(false);
        })
        .catch((error) => console.error("Error updating product:", error));
    }
  };

  // Update the handleEditInputChange function
  const handleEditInputChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      // Handle file input
      setEditImageFile(value);
    } else {
      // Handle regular input
      setEditedProduct((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const formatTimestamp = (timestamp) => {
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
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };
  
  const handleDownloadPDF = () => {
    setShowPrintModal(true);
  };
  
  return (
    <div className={styles.ManageProductsContainer}>
      <Emp_Sidebar />
      <div className={styles.ManageProductsContent}>
        <Header />
        <div className={styles.InnerContainer} style={{ marginLeft: "10px", width: "100%" }}>
          <div className={styles.TopSection}>
            <h1 className="section-title" style={{ fontSize: '28px', fontWeight: 'bold' }}>Manage Products</h1>
            <div className={styles.SearchWrapper}>
              <select 
                className="form-control"  
                value={searchColumn}
                onChange={handleSearchColumnChange}
                style={{ marginRight: "10px", width: "200px" }}
              >
                <option value="">Select Search Field</option>
                <option value="product_id">Product ID</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="stock_qty">Stock Quantity</option>
              </select>
              <input 
                type="text" 
                className="form-control search-bar"
                value={searchText} 
                onChange={handleSearchChange}
                placeholder={searchColumn ? `Search by ${searchColumn}...` : "Select search field first"}
                disabled={!searchColumn}
              />
              <div className={styles.BtnContainer}>
                <button className="btn btn-secondary" onClick={handleDownloadPDF} style={{ width: '150px', marginLeft:"10px" }}>Print</button>
              </div>
            </div>
            
            {/* Add quantity sort controls */}
            <div className={styles.QuantitySortContainer}>
              <span className={styles.SortLabel}>Sort by Quantity:</span>
              <div className={styles.SortButtonGroup}>
                <button 
                  className={`${styles.SortButton} ${quantitySort === 'asc' ? styles.active : styles.inactive}`}
                  onClick={() => setQuantitySort('asc')}
                >
                  Lowest First <FaSortUp className={styles.SortIcon} />
                </button>
                <button 
                  className={`${styles.SortButton} ${quantitySort === 'desc' ? styles.active : styles.inactive}`}
                  onClick={() => setQuantitySort('desc')}
                >
                  Highest First <FaSortDown className={styles.SortIcon} />
                </button>
                {quantitySort && (
                  <button 
                    className={`${styles.SortButton} ${styles.clear}`}
                    onClick={() => setQuantitySort(null)}
                  >
                    Clear Sort
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={styles.TableContainer}>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>
                    Stock Quantity
                    {quantitySort === 'asc' && <FaSortUp style={{ marginLeft: "5px" }} />}
                    {quantitySort === 'desc' && <FaSortDown style={{ marginLeft: "5px" }} />}
                  </th>
                  <th>created_at</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((prod) => (
                    <tr key={prod.product_id}>
                      <td>{prod.product_id}</td>
                      <td>{prod.name}</td>
                      <td>Rs.{parseFloat(prod.price).toFixed(2)}</td>
                      <td>{prod.stock_qty}</td>
                     

                      <td>{formatTimestamp(prod.created_at)}</td>
                      <td>
                        <FaEye 
                          style={{ marginRight: "10px", cursor: "pointer", color: "#2770b4" }}
                          onClick={() => handleViewProduct(prod)} />
                        <FaEdit 
                          style={{ marginRight: "10px", cursor: "pointer", color: "#f0ad4e" }}
                          onClick={() => handleEditProduct(prod)} />
                        <FaTrash 
                          style={{ cursor: "pointer", color: "#d9534f" }}
                          onClick={() => handleDeleteProduct(prod.product_id)} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No products found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ViewModal 
          showViewModal={showViewModal} 
          selectedEntity={selectedProduct} 
          handleClose={handleCloseViewModal} 
          entityTitle="Product" 
          entityFields={[
            { label: "Product ID", name: "product_id"},
            { label: "Name", name: "name"},
            { label: "Description", name: "description"},
            { label: "Price", name: "price" },
            { label: "Stock Quantity", name: "stock_qty"},
            { label: "Category ID", name: "category_id"},
            { label: "Discount Percentage", name: "discount_percentage"},
            { label: "Minimum Quantity", name: "min_quantity" },
            { label: "Image", name: "image_url", type: "image" }
          ]} 
        />

        <EditModal 
          showEditModal={showEditModal} 
          entityData={editedProduct}
          entityTitle="Product"
          entityFields={[
            { label: "Name", name: "name"},
            { label: "Description", name: "description"},
            { label: "Price", name: "price" },
            { label: "Stock Quantity", name: "stock_qty"},
            { label: "Category ID", name: "category_id"},
            { label: "Discount Percentage", name: "discount_percentage"},
            { label: "Minimum Quantity", name: "min_quantity" },
            { label: "Image", name: "image_url", type: "image" }
          ]}
          handleClose={() => setShowEditModal(false)} 
          handleSaveEditEntity={handleSaveEditProduct} 
          handleEditInputChange={handleEditInputChange}   
        />

        <PrintModal
          show={showPrintModal}
          handleClose={() => setShowPrintModal(false)}
          title="Print Products Report"
          data={filteredProducts}
          fields={[
            { label: "Product ID", field: "product_id" },
            { label: "Name", field: "name" },
            { label: "Price", field: "price", format: (price) => `Rs.${parseFloat(price).toFixed(2)}` },
            { label: "Stock Quantity", field: "stock_qty" },
            { label: "Created At", field: "created_at", format: (date) => date ? formatTimestamp(date) : "N/A" }
          ]}
          filename="products_report.pdf"
          reportTitle="Products Details Report"
        />
      </div>
    </div>
  );
}

export default ManageProducts;
