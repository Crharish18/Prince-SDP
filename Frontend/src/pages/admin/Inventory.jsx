import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaEdit, FaTrash, FaSortUp, FaSortDown } from "react-icons/fa";
import Sidebar from "../../components/sidebar";
import Header from "../../components/Header";
import styles from './inventory.module.css';
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
  // Add sorting state for expiry date
  const [expiryDateSort, setExpiryDateSort] = useState(null); // null, 'asc', or 'desc'
  const [newInventory, setNewInventory] = useState({
    qty_added: '',
    user_id: '',
    supplier_id: '',
    product_id: '',
    buying_price_per_unit: '',
    expiry_date: ''
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
    buying_price_per_unit: '',
    expiry_date: ''
  });
  
  // Get tomorrow's date for min attribute on date inputs
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };
  
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    price: '',
    image_url: '',
    category_id: '',
    discount_percentage: '',
    min_quantity: '',
    description: '',
    qty_added: '',
    user_id: '',
    supplier_id: '',
    product_id: '',
    buying_price_per_unit: '',
    expiry_date: '',
    image: ''
  });
  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedInventory, setEditedInventory] = useState({});
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [modalMode, setModalMode] = useState('new'); // 'new' or 'existing'

  // Toggle expiry date sorting
  const toggleExpiryDateSort = () => {
    if (expiryDateSort === null) {
      setExpiryDateSort('asc');
    } else if (expiryDateSort === 'asc') {
      setExpiryDateSort('desc');
    } else {
      setExpiryDateSort(null);
    }
  };

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
      .then((response) => {
        // Filter categories to only include those with Active status
        const activeCategories = response.data.filter(category => category.status === 'Active');
        setCategories(activeCategories);
      })
      .catch((error) => console.error('Error fetching categories:', error));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:5000/api/suppliers')
      .then((response) => {
        // Filter suppliers to only include those with Active status
        const activeSuppliers = response.data.filter(supplier => supplier.status === 'Active');
        setSuppliers(activeSuppliers);
      })
      .catch((error) => console.error('Error fetching suppliers:', error));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then((response) => {
        // Filter products to only include those with Active status
        const activeProducts = response.data.filter(product => product.status === 'Active');
        setProducts(activeProducts);
      })
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

  // Updated filteredInventories to include sorting by expiry date
  const filteredInventories = React.useMemo(() => {
    // First filter the data
    let filtered = inventories.filter((inv) => {
      if (!searchText || !searchColumn) return true;
      const value = inv[searchColumn]?.toString().toLowerCase();
      return value && value.includes(searchText.toLowerCase());
    });
    
    // Then sort by expiry date if sorting is active
    if (expiryDateSort) {
      filtered = [...filtered].sort((a, b) => {
        const dateA = a.expiry_date ? new Date(a.expiry_date) : null;
        const dateB = b.expiry_date ? new Date(b.expiry_date) : null;
        
        // Handle null values
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1; // null values at the end
        if (!dateB) return -1;
        
        // Sort based on direction
        if (expiryDateSort === 'asc') {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });
    }
    
    return filtered;
  }, [inventories, searchText, searchColumn, expiryDateSort]);

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
    { label: "Buying Price Per Unit", name: "buying_price_per_unit", type: "number" },
    { 
      label: "Expiry Date", 
      name: "expiry_date", 
      type: "date",
      min: getTomorrowDate()
    }
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
    { 
      label: "Expiry Date", 
      name: "expiry_date", 
      type: "date",
      min: getTomorrowDate()
    },
    { label: "Product Image", name: "image", type: "file", onChange: handleImageFileChange }
  ];

  const inventoryFields = [
    { label: "Quantity Added", name: "qty_added", type: "number" },
    { label: "User ID", name: "user_id", type: "number" },
    { label: "Supplier ID", name: "supplier_id", type: "number" },
    { label: "Product ID", name: "product_id", type: "number" },
    { label: "Buying Price Per Unit", name: "buying_price_per_unit", type: "number" },
    { 
      label: "Expiry Date", 
      name: "expiry_date", 
      type: "date",
      min: getTomorrowDate()
    }
  ];

  const handleCloseModal = () => {
    setShowModal(false);
    // Reset validation errors
    setValidationErrors({
      name: '',
      price: '',
      image_url: '',
      category_id: '',
      discount_percentage: '',
      min_quantity: '',
      description: '',
      qty_added: '',
      user_id: '',
      supplier_id: '',
      product_id: '',
      buying_price_per_unit: '',
      expiry_date: '',
      image: ''
    });
    // Reset form data
    setNewEntity({
      name: '',
      price: '',
      image_url: '',
      category_id: '',
      discount_percentage: '',
      min_quantity: '',
      description: '',
      qty_added: '',
      user_id: '',
      supplier_id: '',
      buying_price_per_unit: '',
      product_id: '',
      expiry_date: ''
    });
    setImageFile(null);
    setSelectedProduct(null);
    setInputProductName('');
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
  
  // Product name validation: more than 5 characters with letters or numbers only
  if (!newEntity.name || newEntity.name.length <= 5) {
    errors.name = "Product name must be more than 5 characters.";
  } else if (!/^[a-zA-Z0-9 ]+$/.test(newEntity.name)) {
    errors.name = "Product name can only contain letters, numbers, and spaces.";
  }
  
  // Price validation: only positive numbers
  if (!newEntity.price) {
    errors.price = "Price is required.";
  } else if (isNaN(newEntity.price) || parseFloat(newEntity.price) <= 0) {
    errors.price = "Price must be greater than 0.";
  }
  
  // Discount validation: only 0 or positive numbers
  if (newEntity.discount_percentage && (isNaN(newEntity.discount_percentage) || parseFloat(newEntity.discount_percentage) < 0)) {
    errors.discount_percentage = "Discount must be 0 or a positive number.";
  }
  
  // Min quantity validation: only 0 or positive numbers
  if (newEntity.min_quantity && (isNaN(newEntity.min_quantity) || parseInt(newEntity.min_quantity) < 0)) {
    errors.min_quantity = "Minimum quantity must be 0 or a positive number.";
  }
  
  // Description validation: more than 5 characters
  if (!newEntity.description || newEntity.description.length <= 5) {
    errors.description = "Description must be more than 5 characters.";
  }
  
  // Quantity added validation: only positive numbers greater than 0
  if (!newEntity.qty_added) {
    errors.qty_added = "Quantity is required.";
  } else if (isNaN(newEntity.qty_added) || parseInt(newEntity.qty_added) <= 0) {
    errors.qty_added = "Quantity must be greater than 0.";
  }
  
  // Buying price per unit validation: only positive numbers greater than 0
  if (!newEntity.buying_price_per_unit) {
    errors.buying_price_per_unit = "Buying price is required.";
  } else if (isNaN(newEntity.buying_price_per_unit) || parseFloat(newEntity.buying_price_per_unit) <= 0) {
    errors.buying_price_per_unit = "Buying price must be greater than 0.";
  }
  
  // Category validation: not null
  if (!newEntity.category_id) {
    errors.category_id = "Category is required.";
  }
  
  // Supplier validation: not null
  if (!newEntity.supplier_id) {
    errors.supplier_id = "Supplier is required.";
  }
  
  // User ID validation: not null
  if (!newEntity.user_id) {
    errors.user_id = "User ID is required.";
  }
  
  // Expiry date validation: not null and must be future date
  if (!newEntity.expiry_date) {
    errors.expiry_date = "Expiry date is required.";
  } else {
    const selectedDate = new Date(newEntity.expiry_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time part for accurate comparison
    
    if (selectedDate <= today) {
      errors.expiry_date = "Expiry date must be a future date.";
    }
  }
  
  // Only require image for new products
  if (modalMode === 'new' && !imageFile) {
    errors.image = "Product image is required for new products.";
  }
  
  // For existing products, validate product_id
  if (modalMode === 'existing' && !newEntity.product_id) {
    errors.product_id = "Please select a product.";
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
    formData.append("expiry_date", newEntity.expiry_date);
    
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
      expiry_date: newEntity.expiry_date,
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
          .then(response => {
            // Filter products to only include those with Active status
            const activeProducts = response.data.filter(product => product.status === 'Active');
            setProducts(activeProducts);
          })
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
    // Add validation for edit inventory
    let errors = {};
    
    // Quantity added validation: only numbers
    if (!editedInventory.qty_added) {
      errors.qty_added = "Quantity is required.";
    } else if (isNaN(editedInventory.qty_added) || parseInt(editedInventory.qty_added) < 1) {
      errors.qty_added = "Quantity must be a positive number.";
    }
    
    // Buying price per unit validation: only numbers
    if (!editedInventory.buying_price_per_unit) {
      errors.buying_price_per_unit = "Buying price is required.";
    } else if (isNaN(editedInventory.buying_price_per_unit) || parseFloat(editedInventory.buying_price_per_unit) < 0) {
      errors.buying_price_per_unit = "Buying price must be a positive number.";
    }
    
    // Supplier validation: not null
    if (!editedInventory.supplier_id) {
      errors.supplier_id = "Supplier is required.";
    }
    
    // Expiry date validation: not null and must be future date
    if (!editedInventory.expiry_date) {
      errors.expiry_date = "Expiry date is required.";
    } else {
      const selectedDate = new Date(editedInventory.expiry_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time part for accurate comparison
      
      if (selectedDate <= today) {
        errors.expiry_date = "Expiry date must be a future date.";
      }
    }
    
    if (Object.keys(errors).length > 0) {
      // Display error messages
      alert(Object.values(errors).join('\n'));
      return;
    }
    
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
      product_id: '',
      expiry_date: ''
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
            
            {/* Add expiry date sort controls */}
            <div style={{ marginTop: "10px", display: "flex", alignItems: "center" }}>
              <span style={{ marginRight: "10px", fontWeight: "bold" }}>Sort by Expiry Date:</span>
              <div className="btn-group">
                <button 
                  className={`btn ${expiryDateSort === 'asc' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setExpiryDateSort('asc')}
                >
                  Earliest First <FaSortUp />
                </button>
                <button 
                  className={`btn ${expiryDateSort === 'desc' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setExpiryDateSort('desc')}
                >
                  Latest First <FaSortDown />
                </button>
                {expiryDateSort && (
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => setExpiryDateSort(null)}
                  >
                    Clear Sort
                  </button>
                )}
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
                  <th>
                    Expiry Date
                    {expiryDateSort === 'asc' && <FaSortUp style={{ marginLeft: "5px" }} />}
                    {expiryDateSort === 'desc' && <FaSortDown style={{ marginLeft: "5px" }} />}
                  </th>
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
                      <td> Rs.{inv.buying_price_per_unit}</td>
                      <td>{inv.added_on ? new Date(inv.added_on).toLocaleString() : ""}</td>
                      <td>{inv.expiry_date ? new Date(inv.expiry_date).toLocaleDateString() : ""}</td>
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
                    <td colSpan="9">No inventory records found</td>
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
             { label: "Buying Price", name: "buying_price_per_unit", format: (price) => `Rs. ${price}` },
            { label: "Added On", name: "added_on", format: (date) => date ? new Date(date).toLocaleString() : "" },
            { label: "Expiry Date", name: "expiry_date", format: (date) => date ? new Date(date).toLocaleDateString() : "" }
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
            { label: "Added On", field: "added_on", format: (date) => date ? new Date(date).toLocaleString() : "" },
            { label: "Expiry Date", field: "expiry_date", format: (date) => date ? new Date(date).toLocaleDateString() : "" }
          ]}
          filename="inventory_report.pdf"
          reportTitle="Inventory Details Report"
        />
      </div>
    </div>
  );
}

export default Inventory;
