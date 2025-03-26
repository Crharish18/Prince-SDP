import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash } from "react-icons/fa"; 
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from './products.module.css'; // ✅ Using the correct CSS file
import 'bootstrap/dist/css/bootstrap.min.css';
import ViewModal from "../../components/Viewmodal"; 
import EditModal from "../../components/EditModal"; 
import AddEntityModal from "../../components/AddEntityModal";

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    description: '',
    price: '',
    stock_qty: '',
    image_url: '',
    category_id: '',
    discount_percentage: '',
    min_quantity: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [showViewModal, setShowViewModal] = useState(false); 
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [showEditModal, setShowEditModal] = useState(false); 
  const [editedProduct, setEditedProduct] = useState({}); 

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

  const filteredProducts = products.filter((prod) => {
    if (!searchText || !searchColumn) return true; 
    const value = prod[searchColumn]?.toString().toLowerCase(); 
    return value && value.includes(searchText.toLowerCase());
  });

  const productFields = [
    { label: "Name", name: "name", type: "text" },
    { label: "Price", name: "price", type: "number" },
    { label: "Stock Quantity", name: "stock_qty", type: "number" },
    { label: "Image URL", name: "image_url", type: "text" },
    { label: "Category ID", name: "category_id", type: "text" },
    { label: "Discount Percentage", name: "discount_percentage", type: "number" },
    { label: "Minimum Quantity", name: "min_quantity", type: "number" }
  ];

  const handleAddProductClick = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value
    });
  };

  const handleSaveNewProduct = () => {
    let errors = {};
    if (!newProduct.description) errors.description = "Description is required.";
    if (!newProduct.price || isNaN(newProduct.price)) errors.price = "Valid price is required.";
    if (!newProduct.stock_qty || isNaN(newProduct.stock_qty)) errors.stock_qty = "Valid stock quantity is required.";
    if (!newProduct.min_quantity || isNaN(newProduct.min_quantity)) errors.min_quantity = "Minimum quantity is required.";

    setValidationErrors(errors);
    if (Object.keys(errors).length === 0) {
      axios
        .post("http://localhost:5000/api/products", newProduct)
        .then((response) => {
          setProducts([...products, response.data]);
          setShowModal(false);
        })
        .catch((error) => console.error("Error adding product:", error));
    }
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => setShowViewModal(false);

  const handleDeleteProduct = (productId) => {
    axios
      .delete(`http://localhost:5000/api/products/${productId}`)
      .then(() => {
        setProducts((prevProducts) =>
          prevProducts.filter((product) => product.product_id !== productId)
        );
      })
      .catch((error) => console.error("Error deleting product:", error));
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setEditedProduct({ ...product });
    setShowEditModal(true);
  };

  const handleSaveEditProduct = () => {
    axios
      .put(`http://localhost:5000/api/products/${editedProduct.product_id}`, editedProduct)
      .then(() => {
        setProducts((prevProducts) =>
          prevProducts.map((prod) => (prod.product_id === editedProduct.product_id ? editedProduct : prod))
        );
        setShowEditModal(false);
      })
      .catch((error) => console.error("Error updating product:", error));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={styles.ManageProductsContainer}>
      <Sidebar />
      <div className={styles.ManageProductsContent}>
        <Header />
        <div className={styles.InnerContainer}>
          <div className={styles.TopSection}>
            <h1 className="section-title" style={{ fontSize: '28px', fontWeight: 'bold' }}>Manage Products</h1>
            <div className={styles.SearchWrapper}>
              <select 
              className="form-control"  
              value={searchColumn}
               onChange={handleSearchColumnChange}
               style={{ marginRight: "10px", width: "200px" }}
               >
                <option value="product_id">Product ID</option>
                <option value="description">Description</option>
                <option value="price">Price</option>
                <option value="stock_qty">Stock Quantity</option>
              </select>
              <input 
              type="text" 
              className="form-control search-bar"
               value={searchText} 
               onChange={handleSearchChange}
               placeholder={`Search by ${searchColumn}...`}
                />
              <div className={styles.BtnContainer}>
                <button className="btn btn-primary" style={{ width: '150px', marginLeft:"10px" }} onClick={handleAddProductClick}>Add Product</button>
                <Link to="/admin/categories" className="btn btn-secondary" style={{ width: '150px', marginLeft:"10px" }}>
                Categories
                </Link>
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
                  <th>Stock Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((prod) => (
                    <tr key={prod.product_id}>
                      <td>{prod.product_id}</td>
                      <td>{prod.name}</td>
                      <td>{prod.price}</td>
                      <td>{prod.stock_qty}</td>
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

        <AddEntityModal 
        showModal={showModal}
        handleClose={handleCloseModal}
        handleSave={handleSaveNewProduct} 
        entityTitle="Product"
        entityData={newProduct}
        entityFields={[
            { label: "Name", name: "name", type: "text" },
             { label: "Price", name: "price", type: "number" },
             { label: "Stock Quantity", name: "stock_qty", type: "number" },
             { label: "Image URL", name: "image_url", type: "text" },
             { label: "Category ID", name: "category_id", type: "text" },
            { label: "Discount Percentage", name: "discount_percentage", type: "number" },
            { label: "Minimum Quantity", name: "min_quantity", type: "number" }]} 
        handleInputChange={handleInputChange}
        validationErrors={validationErrors} 
        />

        <ViewModal 
        showViewModal={showViewModal} 
        selectedEntity={selectedProduct} 
        handleClose={handleCloseViewModal} 
        entityTitle="Product" 
        entityFields={[
            { label: "ProductID", name: "product_id"},
            { label: "Name", name: "name"},
            { label: "Price", name: "price" },
            { label: "Stock Quantity", name: "stock_qty"},
            { label: "Image URL", name: "image_url" },
            { label: "Category ID", name: "category_id"},
            { label: "Discount Percentage", name: "discount_percentage"},
            { label: "Minimum Quantity", name: "min_quantity" }]} 
        />

        <EditModal 
        showEditModal={showEditModal} 
        entityData={editedProduct} 
        entityTitle="Product"
         entityFields={[
            { label: "Name", name: "name"},
            { label: "Price", name: "price" },
            { label: "Stock Quantity", name: "stock_qty"},
            { label: "Image URL", name: "image_url" },
            { label: "Category ID", name: "category_id"},
            { label: "Discount Percentage", name: "discount_percentage"},
            { label: "Minimum Quantity", name: "min_quantity" }]} 
         handleClose={() => setShowEditModal(false)} 
         handleSaveEditEntity={handleSaveEditProduct} 
         handleEditInputChange={handleEditInputChange}   
         />
      </div>
    </div>
  );
}

export default ManageProducts;
