import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Sidebar from "../../components/sidebar";
import Header from "../../components/Header";
import styles from './inventory.module.css'; // Use inventory.module.css
import 'bootstrap/dist/css/bootstrap.min.css';
import ViewModal from "../../components/Viewmodal";
import EditModal from "../../components/EditModal";
import AddEntityModal from "../../components/AddEntityModal";
import PrintModal from "../../components/PrintModal";
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { jwtDecode } from "jwt-decode";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

function Inventory() {
  const [inventories, setInventories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [inputProductName, setInputProductName] = useState('');
  const [newInventory, setNewInventory] = useState({
    qty_added: '',
    user_id: '',
    supplier_id: '',
    product_id: '',
    buying_price_per_unit: ''
  });

  const [newEntity, setNewEntity] = useState({
    // Product fields
    name: '',
    price: '',
    image_url: '',
    category_id: '',
    discount_percentage: '',
    min_quantity: '',
    description: '',
    // Inventory fields
    qty_added: '',
    user_id: '',
    supplier_id: '',
    buying_price_per_unit: ''
  });
  

  const [validationErrors, setValidationErrors] = useState({
    qty_added: '',
    user_id: '',
    supplier_id: '',
    product_id: '',
    buying_price_per_unit: ''
  });

  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedInventory, setEditedInventory] = useState({});
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [modalMode, setModalMode] = useState('new'); // 'new' or 'existing'

  const renderProductAutocomplete = ({ value, onChange }) => (
    <Autocomplete
      freeSolo
      options={products}
      getOptionLabel={option => typeof option === 'string' ? option : option.name}
      isOptionEqualToValue={(option, value) => option.product_id === value.product_id}
      value={selectedProduct || null}
      inputValue={inputProductName}
      onInputChange={(event, newInputValue) => {
        setInputProductName(newInputValue);
      }}
      onChange={(event, newValue) => {
        setSelectedProduct(newValue);
        if (newValue && typeof newValue === 'object') {
          // Auto-fill all product fields except qty_added and buying_price_per_unit
          setNewEntity(prev => ({
            ...prev,
            name: newValue.name,
            price: newValue.price,
            category_id: newValue.category_id,
            discount_percentage: newValue.discount_percentage,
            min_quantity: newValue.min_quantity,
            description: newValue.description,
            image_url: newValue.image_url,
            product_id: newValue.product_id
          }));
          
          // Reset image file since we're using an existing product
          setImageFile(null);
        }
      }}
      renderInput={(params) => (
        <TextField {...params} label="Product Name" variant="outlined" />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.product_id}>
          {option.name}
        </li>
      )}
    />
  );
  
  


  useEffect(() => {
    axios
      .get('http://localhost:5000/api/inventory')
      .then((response) => {
        setInventories(response.data);
      })
      .catch((error) => {
        console.error('Error fetching inventory:', error);
      });
  }, []);

  useEffect(() => {
    axios.get('http://localhost:5000/api/categories')
      .then((response) => setCategories(response.data))
      .catch((error) => console.error('Error fetching categories:', error));
  }, []);

  
  useEffect(() => {
    axios.get('http://localhost:5000/api/suppliers')
      .then((response) => setSuppliers(response.data))
      .catch((error) => console.error('Error fetching suppliers:', error));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then((response) => setProducts(response.data))
      .catch((error) => console.error('Error fetching products:', error));
  }, []);

  const handleSearchColumnChange = (e) => {
    setSearchColumn(e.target.value);
  };

  const handleImageFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log("Selected file:", file.name, file.size, "bytes");
      setImageFile(file);
    }
  };
  

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const filteredInventories = inventories.filter((inv) => {
    if (!searchText || !searchColumn) return true;
    const value = inv[searchColumn]?.toString().toLowerCase();
    return value && value.includes(searchText.toLowerCase());
  });

  const newProductFields = [
    { label: "Product Name", name: "name", type: "text" },
    { label: "Price", name: "price", type: "number" },
    { label: "Product Image", name: "image", type: "file", onChange: handleImageFileChange },
    {
      label: "Category", name: "category_id", type: "select",
      options: categories.map(cat => ({ value: cat.category_id, label: cat.category_name }))
    },
    { label: "Discount (%)", name: "discount_percentage", type: "number" },
    { label: "Min Quantity", name: "min_quantity", type: "number" },
    { label: "Description", name: "description", type: "text" },
    { label: "Quantity Added", name: "qty_added", type: "number" },
    {
      label: "Supplier", name: "supplier_id", type: "select",
      options: suppliers.map(sup => ({ value: sup.supplier_id, label: sup.name }))
    },
    { label: "Buying Price Per Unit", name: "buying_price_per_unit", type: "number" }
  ];
  
  const existingProductFields = [
    {
      label: "Product Name",
      name: "name",
      type: "autocomplete",
      render: renderProductAutocomplete
    },
    { label: "Price", name: "price", type: "number" },
   
    {
      label: "Category", name: "category_id", type: "select",
      options: categories.map(cat => ({ value: cat.category_id, label: cat.category_name }))
    },
    { label: "Discount (%)", name: "discount_percentage", type: "number" },
    { label: "Min Quantity", name: "min_quantity", type: "number" },
    { label: "Description", name: "description", type: "text" },
    { label: "Quantity Added", name: "qty_added", type: "number" },
    {
      label: "Supplier", name: "supplier_id", type: "select",
      options: suppliers.map(sup => ({ value: sup.supplier_id, label: sup.name }))
    },
    { label: "Buying Price Per Unit", name: "buying_price_per_unit", type: "number" },
    { label: "Product Image", name: "image", type: "file", onChange: handleImageFileChange }
  ];
  


  const inventoryFields = [
    { label: "Quantity Added", name: "qty_added", type: "number" },
    { label: "User ID", name: "user_id", type: "number" },
    { label: "Supplier ID", name: "supplier_id", type: "number" },
    { label: "Product ID", name: "product_id", type: "number" },
    { label: "Buying Price Per Unit", name: "buying_price_per_unit", type: "number" }
  ];

  

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      // Handle file input
      setImageFile(files[0]);
    } else {
      // Handle regular input
      setNewEntity({
        ...newEntity,
        [name]: value
      });
    }
  };
  
  
  

  const handleSaveNewEntity = () => {
    let errors = {};
    
    // Basic validation
    if (!newEntity.name) errors.name = "Product name is required.";
    if (!newEntity.price || isNaN(newEntity.price)) errors.price = "Price is required and must be a number.";
    if (!newEntity.qty_added || isNaN(newEntity.qty_added)) errors.qty_added = "Quantity is required and must be a number.";
    if (!newEntity.user_id) errors.user_id = "User ID is required.";
    if (!newEntity.supplier_id) errors.supplier_id = "Supplier ID is required.";
    if (!newEntity.buying_price_per_unit || isNaN(newEntity.buying_price_per_unit)) errors.buying_price_per_unit = "Buying price is required and must be a number.";
    
    // Only require image for new products
    if (modalMode === 'new' && !imageFile) {
      errors.image = "Product image is required for new products.";
    }
    
    setValidationErrors(errors);
  
    if (Object.keys(errors).length === 0) {
      const formData = new FormData();
      
      // Append all fields
      formData.append("name", newEntity.name);
      formData.append("price", newEntity.price);
      formData.append("category_id", newEntity.category_id);
      formData.append("discount_percentage", newEntity.discount_percentage || 0);
      formData.append("min_quantity", newEntity.min_quantity || 1);
      formData.append("description", newEntity.description || "");
      formData.append("qty_added", newEntity.qty_added);
      formData.append("user_id", newEntity.user_id);
      formData.append("supplier_id", newEntity.supplier_id);
      formData.append("buying_price_per_unit", newEntity.buying_price_per_unit);
      
      // If it's an existing product, include the product_id
      if (modalMode === 'existing' && newEntity.product_id) {
        formData.append("product_id", newEntity.product_id);
      }
      
      // Only append image if a file is selected
      if (imageFile) {
        formData.append("image", imageFile);
      }
  
      // Add debugging to see what's being sent
      console.log("Sending data:", {
        name: newEntity.name,
        price: newEntity.price,
        qty_added: newEntity.qty_added,
        user_id: newEntity.user_id,
        supplier_id: newEntity.supplier_id,
        buying_price_per_unit: newEntity.buying_price_per_unit,
        product_id: newEntity.product_id || 'new product',
        hasImage: !!imageFile
      });
  
      axios
        .post("http://localhost:5000/api/inventory/add-entity", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        })
        .then((response) => {
          setShowModal(false);
          setImageFile(null);
          setSelectedProduct(null);
          setInputProductName('');
          
          // Refresh inventory data
          axios.get('http://localhost:5000/api/inventory')
            .then(response => setInventories(response.data))
            .catch(error => console.error('Error fetching inventory:', error));
            
          // Also refresh products data
          axios.get('http://localhost:5000/api/products')
            .then(response => setProducts(response.data))
            .catch(error => console.error('Error fetching products:', error));
        })
        .catch((error) => {
          console.error("Error adding entity:", error);
          if (error.response) {
            console.error("Error response data:", error.response.data);
          }
        });
    }
  };
  

  const handleViewInventory = (inventory) => {
    setSelectedInventory(inventory);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
  };

  const handleDeleteInventory = (inventoryId) => {
    axios
      .delete(`http://localhost:5000/api/inventory/${inventoryId}`)
      .then((response) => {
        setInventories((prevInventories) =>
          prevInventories.filter((inv) => inv.inventory_id !== inventoryId)
        );
      })
      .catch((error) => {
        console.error("Error deleting inventory:", error);
      });
  };

  const handleEditInventory = (inventory) => {
    setSelectedInventory(inventory);
    setEditedInventory({ ...inventory });
    setShowEditModal(true);
  };

  const handleSaveEditInventory = () => {
    axios
      .put(`http://localhost:5000/api/inventory/${editedInventory.inventory_id}`, editedInventory)
      .then((response) => {
        setInventories((prevInventories) =>
          prevInventories.map((inv) =>
            inv.inventory_id === editedInventory.inventory_id ? editedInventory : inv
          )
        );
        setShowEditModal(false);
      })
      .catch((error) => {
        console.error("Error updating inventory:", error.response ? error.response.data : error);
      });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedInventory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedInventory(null);
  };

  const handleDownloadPDF = () => {
    setShowPrintModal(true);
  };

  function getUserIdFromToken() {
    const token = localStorage.getItem("token"); // or whatever key you use
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.id; // or decoded.userid, depending on your token structure
    } catch {
      return null;
    }
  }

  const handleAddInventoryClick = (mode) => {
    const userId = getUserIdFromToken();
    setNewEntity({
      // reset or clear all fields as needed
      name: '',
      price: '',
      image_url: '',
      category_id: '',
      discount_percentage: '',
      min_quantity: '',
      description: '',
      qty_added: '',
      user_id: userId,
      supplier_id: '',
      buying_price_per_unit: '',
      product_id: ''
    });
    setImageFile(null); // Reset image file
    setModalMode(mode); // 'new' or 'existing'
    setShowModal(true);
  };
  

  return (
    <div className={styles.InventoryContainer}>
      <Sidebar />
      <div className={styles.InventoryContent}>
        <Header />
        <div className={styles.InnerContainer} style={{ marginLeft: "10px", width: "100%" }}>
          <div className={styles.TopSection}>
            <h1 className="section-title" style={{ fontSize: '28px', fontWeight: 'bold' }}>Manage Inventory</h1>
            <div className={styles.SearchWrapper}>
              <select
                className="form-control"
                value={searchColumn}
                onChange={handleSearchColumnChange}
                style={{ marginRight: "10px", width: "200px" }}
              >
                <option value="">Select Search Field</option>
                <option value="inventory_id">Inventory ID</option>
                <option value="qty_added">Quantity Added</option>
                <option value="user_id">User ID</option>
                <option value="supplier_id">Supplier ID</option>
                <option value="product_id">Product ID</option>
                <option value="buying_price_per_unit">Buying Price</option>
              </select>
              <input
                type="text"
                className="form-control search-bar"
                value={searchText}
                onChange={handleSearchChange}
                placeholder={`Search by ${searchColumn || "..."}`}
              />
              <div className={styles.BtnContainer} >
                <button
                  className="btn btn-primary"
                  style={{ width: '180px', marginLeft: "10px"  }}
                  onClick={() => handleAddInventoryClick('new')}
                >
                  Add New Product
                </button>
                <button
                  className="btn btn-success"
                  style={{ width: '180px', marginLeft: "10px" }}
                  onClick={() => handleAddInventoryClick('existing')}
                >
                  Add Existing Product
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleDownloadPDF}
                  style={{ width: '150px', marginLeft: "10px" }}
                >
                  Print
                </button>
              </div>

            </div>
          </div>

          <div className={styles.TableContainer}>
            <table className="table table-striped" id="inventoryTable">
              <thead>
                <tr>
                  <th>Inventory ID</th>
                  <th>Quantity Added</th>
                  <th>User ID</th>
                  <th>Supplier ID</th>
                  <th>Product ID</th>
                  <th>Buying Price</th>
                  <th>Added On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventories.length > 0 ? (
                  filteredInventories.map((inv) => (
                    <tr key={inv.inventory_id}>
                      <td>{inv.inventory_id}</td>
                      <td>{inv.qty_added}</td>
                      <td>{inv.user_id}</td>
                      <td>{inv.supplier_id}</td>
                      <td>{inv.product_id}</td>
                      <td>{inv.buying_price_per_unit}</td>
                      <td>{inv.added_on ? new Date(inv.added_on).toLocaleString() : ""}</td>
                      <td>
                        <FaEye
                          style={{ marginRight: "10px", cursor: "pointer", color: "#2770b4" }}
                          onClick={() => handleViewInventory(inv)}
                        />
                        <FaEdit
                          style={{ marginRight: "10px", cursor: "pointer", color: "#f0ad4e" }}
                          onClick={() => handleEditInventory(inv)}
                        />
                        <FaTrash
                          style={{ cursor: "pointer", color: "#d9534f" }}
                          onClick={() => handleDeleteInventory(inv.inventory_id)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">No inventory records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <AddEntityModal
            showModal={showModal}
            handleClose={handleCloseModal}
            handleSave={handleSaveNewEntity}
            entityTitle={modalMode === 'new' ? "Add New Product" : "Add  Existing Product"}
            entityData={newEntity}
            entityFields={modalMode === 'new' ? newProductFields : existingProductFields}
            handleInputChange={handleInputChange}
            validationErrors={validationErrors}
            handleImageFileChange={handleImageFileChange}
          />



        <ViewModal
          showViewModal={showViewModal}
          selectedEntity={selectedInventory}
          handleClose={handleCloseViewModal}
          entityTitle="Inventory"
          entityFields={[
            { label: "Inventory ID", name: "inventory_id" },
            { label: "Quantity Added", name: "qty_added" },
            { label: "User ID", name: "user_id" },
            { label: "Supplier ID", name: "supplier_id" },
            { label: "Product ID", name: "product_id" },
            { label: "Buying Price", name: "buying_price_per_unit" },
            { label: "Added On", name: "added_on", format: (date) => date ? new Date(date).toLocaleString() : "" }
          ]}
        />

        <EditModal
          showEditModal={showEditModal}
          entityData={editedInventory}
          entityTitle="Inventory"
          entityFields={inventoryFields}
          handleClose={handleCloseEditModal}
          handleSaveEditEntity={handleSaveEditInventory}
          handleEditInputChange={handleEditInputChange}
        />

        <PrintModal
          show={showPrintModal}
          handleClose={() => setShowPrintModal(false)}
          title="Print Inventory Report"
          data={filteredInventories}
          fields={[
            { label: "Inventory ID", field: "inventory_id" },
            { label: "Quantity Added", field: "qty_added" },
            { label: "User ID", field: "user_id" },
            { label: "Supplier ID", field: "supplier_id" },
            { label: "Product ID", field: "product_id" },
            { label: "Buying Price", field: "buying_price_per_unit" },
            { label: "Added On", field: "added_on", format: (date) => date ? new Date(date).toLocaleString() : "" }
          ]}
          filename="inventory_report.pdf"
          reportTitle="Inventory Details Report"
        />

      </div>
    </div>
  );
}

export default Inventory;
