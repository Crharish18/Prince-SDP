import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash } from "react-icons/fa"; 
import Emp_Sidebar from "../../components/Employee/Emp_Sidebar";  
import Header from "../../components/Header";
import styles from './Emp_Products.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ViewModal from "../../components/Viewmodal"; 
import EditModal from "../../components/EditModal"; 
import AddEntityModal from "../../components/AddEntityModal";

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock_qty: '',
    category_id: '',
    discount_percentage: '0',
    min_quantity: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [showViewModal, setShowViewModal] = useState(false); 
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [showEditModal, setShowEditModal] = useState(false); 
  const [editedProduct, setEditedProduct] = useState({}); 
  const [imageFile, setImageFile] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);

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

  const filteredProducts = products.filter((prod) => {
    if (!searchText || !searchColumn) return true; 
    const value = prod[searchColumn]?.toString().toLowerCase(); 
    return value && value.includes(searchText.toLowerCase());
  });

  const handleAddProductClick = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    // Reset form state when closing modal
    setNewProduct({
      name: '',
      description: '',
      price: '',
      stock_qty: '',
      category_id: '',
      discount_percentage: '0',
      min_quantity: ''
    });
    setImageFile(null);
    setValidationErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    console.log("File input changed");
    const file = e.target.files[0];
    if (file) {
      console.log("File selected:", file.name);
      setImageFile(file);
    } else {
      console.log("No file selected");
    }
  };

  const handleSaveNewProduct = () => {
    console.log("Save button clicked...");
    console.log("Image file:", imageFile);  // Debug log

    let errors = {};
    // Validation for product details
    if (!newProduct.name) errors.name = "Name is required.";
    if (!newProduct.price || isNaN(newProduct.price)) errors.price = "Valid price is required.";
    if (!newProduct.stock_qty || isNaN(newProduct.stock_qty)) errors.stock_qty = "Valid stock quantity is required.";
    if (!newProduct.min_quantity || isNaN(newProduct.min_quantity)) errors.min_quantity = "Minimum quantity is required.";

    // Validation for image file
    if (!imageFile) errors.image = "Image is required.";

    setValidationErrors(errors);
    if (Object.keys(errors).length === 0) {
        console.log("Form data is valid, submitting to backend...");

        // Prepare FormData object for image upload
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('name', newProduct.name);
        formData.append('description', newProduct.description || '');
        formData.append('price', newProduct.price);
        formData.append('stock_qty', newProduct.stock_qty);
        formData.append('category_id', newProduct.category_id || '');
        formData.append('discount_percentage', newProduct.discount_percentage || '0');
        formData.append('min_quantity', newProduct.min_quantity);

        // Log the form data for debugging
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
        }

        // Submit form data to the backend
        axios
            .post("http://localhost:5000/api/products", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then((response) => {
                console.log("Product added successfully:", response.data);
                setProducts([...products, response.data]);
                handleCloseModal();
            })
            .catch((error) => {
                console.error("Error adding product:", error);
                if (error.response && error.response.data && error.response.data.error) {
                    alert(`Error: ${error.response.data.error}`);
                } else {
                    alert("An error occurred while adding the product");
                }
            });
    } else {
        console.log("Validation errors:", errors);
    }
  };

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
                      <td>${parseFloat(prod.price).toFixed(2)}</td>
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
            { label: "Description", name: "description", type: "text" },
            { label: "Price", name: "price", type: "number" },
            { label: "Stock Quantity", name: "stock_qty", type: "number" },
            { 
              label: "Image", 
              name: "image", 
              type: "file",
              onChange: handleFileChange // Explicitly pass the file change handler
            },
            { label: "Category ID", name: "category_id", type: "text" },
            { label: "Discount Percentage", name: "discount_percentage", type: "number" },
            { label: "Minimum Quantity", name: "min_quantity", type: "number" },
          ]}
          validationErrors={validationErrors}
          handleInputChange={handleInputChange}
        />

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
              { label: "Image", name: "image_url", type: "image" } // This line is correct
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
                { label: "Stock Quantity", name: "stock_qty"}, // Change this line
                { label: "Category ID", name: "category_id"},
                { label: "Discount Percentage", name: "discount_percentage"},
                { label: "Minimum Quantity", name: "min_quantity" },
                { label: "Image", name: "image_url", type: "image" }
              ]} 
              handleClose={() => setShowEditModal(false)} 
              handleSaveEditEntity={handleSaveEditProduct} 
              handleEditInputChange={handleEditInputChange}   
            />
  
      </div>
    </div>
  );
}

export default ManageProducts;