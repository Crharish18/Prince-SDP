import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Sidebar from "../../components/sidebar";
import Header from "../../components/Header";
import styles from './Categories.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ViewModal from "../../components/Viewmodal"; 
import EditModal from "../../components/EditModal"; 
import PrintModal from "../../components/PrintModal";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import logodash from "../../assets/PicturesAdmin/logoWhite.png";

/**
 * Categories management component.
 * Handles listing, searching, adding, editing, viewing, deleting, and printing categories.
 */
function Categories() {
 
  const [categories, setCategories] = useState([]);
  // State to control Add Category modal visibility
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    categoryName: '',
    status: 'Active'
  });
  // State for validation errors in add form
  const [validationErrors, setValidationErrors] = useState({
    categoryName: '',
  });
  // State for search input and column
  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null); 
  // State for showing edit modal and edited category
  const [showEditModal, setShowEditModal] = useState(false); 
  const [editedCategory, setEditedCategory] = useState({});
  const [editValidationErrors, setEditValidationErrors] = useState({
    category_name: '',
  });
  // State to control print modal visibility
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Fetch all categories from backend on mount
  useEffect(() => {
    axios.get('http://localhost:5000/api/categories')
      .then(response => {
        setCategories(response.data);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  // Handle change of search column dropdown
  const handleSearchColumnChange = (e) => {
    setSearchColumn(e.target.value);
  };

  // Handle search text input change
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  // Filter categories based on current search input and column
  const filteredCategories = categories.filter((cat) => {
    if (!searchText || !searchColumn) return true;
    const value = cat[searchColumn]?.toString().toLowerCase();
    return value && value.includes(searchText.toLowerCase());
  });

  // Show modal for adding a new category
  const handleAddCategoryClick = () => {
    setShowModal(true);
  };

  // Close add category modal and reset form
  const handleCloseModal = () => {
    setShowModal(false);
    setNewCategory({
      categoryName: '',
      status: 'Active'
    });
    setValidationErrors({
      categoryName: '',
    });
  };

  // Handle input change in add category form
  // Only allow letters and spaces for category name
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'status') {
      setNewCategory({
        ...newCategory,
        [name]: value,
      });
    } else {
      const lettersOnly = value.replace(/[^a-zA-Z ]/g, '');
      setNewCategory({
        ...newCategory,
        [name]: lettersOnly,
      });
    }
  };

  // Validate and save new category to backend
  const handleSaveNewCategory = () => {
    let errors = {};
    if (!newCategory.categoryName || newCategory.categoryName.length < 3) {
      errors.categoryName = "Category name must be at least 3 characters long.";
    } else if (!/^[a-zA-Z ]+$/.test(newCategory.categoryName)) {
      errors.categoryName = "Category name can only contain letters and spaces.";
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      const categoryData = {
        categoryName: newCategory.categoryName,
        status: newCategory.status
      };
      axios.post("http://localhost:5000/api/categories", categoryData)
        .then(response => {
          setCategories([...categories, response.data]);
          setShowModal(false);
          setNewCategory({
            categoryName: '',
            status: 'Active'
          });
        })
        .catch(error => {
          console.error("Error adding category:", error);
        });
    }
  };

  // Show view modal for a selected category
  const handleViewCategory = (category) => {
    setSelectedCategory(category);
    setShowViewModal(true);
  };

  // Close view modal
  const handleCloseViewModal = () => {
    setShowViewModal(false);
  };

  // Delete a category by its ID
  const handleDeleteCategory = (categoryId) => {
    axios.delete(`http://localhost:5000/api/categories/${categoryId}`)
      .then(response => {
        setCategories((prevCategories) =>
          prevCategories.filter((category) => category.category_id !== categoryId)
        );
      })
      .catch(error => {
        console.error("Error deleting category:", error);
        // Display error message to the user if available
        if (error.response && error.response.data && error.response.data.error) {
          alert(error.response.data.error);
        } else {
          alert("An error occurred while deleting the category. Please try again.");
        }
      });
  };

  // Show edit modal for a selected category
  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setEditedCategory(category);
    setShowEditModal(true);
    setEditValidationErrors({
      category_name: '',
    });
  };

  // Validate and save edited category to backend
  const handleSaveEditCategory = () => {
    let errors = {};
    if (!editedCategory.category_name || editedCategory.category_name.length < 3) {
      errors.category_name = "Category name must be at least 3 characters long.";
    } else if (!/^[a-zA-Z ]+$/.test(editedCategory.category_name)) {
      errors.category_name = "Category name can only contain letters and spaces.";
    }

    setEditValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      axios.put(`http://localhost:5000/api/categories/${editedCategory.category_id}`, editedCategory)
        .then(response => {
          setCategories((prevCategories) =>
            prevCategories.map((cat) => (cat.category_id === editedCategory.category_id ? editedCategory : cat))
          );
          setShowEditModal(false);
        })
        .catch(error => {
          console.error("Error updating category:", error);
        });
    }
  };

  // Handle input change for edit category modal (letters and spaces only)
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'status') {
      setEditedCategory({
        ...editedCategory,
        [name]: value,
      });
    } else {
      const lettersOnly = value.replace(/[^a-zA-Z ]/g, '');
      setEditedCategory({
        ...editedCategory,
        [name]: lettersOnly,
      });
    }
  };

  // Close edit modal and reset edit validation errors
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditValidationErrors({
      category_name: '',
    });
  };

  // Show print modal for downloading PDF
  const handleDownloadPDF = () => {
    setShowPrintModal(true);
  };

  // Main render
  return (
    <div className={styles.ManageCategoryContainer}>
      <Sidebar />
      <div className={styles.ManageCategoryContent}>
        <Header />
        <div className={styles.InnerContainer} style={{ marginLeft: "10px", width: "100%" }}>
          <div className={styles.TopSection}>
            <h1 className="section-title" style={{ fontSize: '28px', fontWeight: 'bold' }}>Manage Categories</h1>

            {/* Search and action controls */}
            <div className={styles.SearchWrapper}>
              {/* Search column dropdown */}
              <select
                className="form-control"
                value={searchColumn}
                onChange={handleSearchColumnChange}
                style={{ marginRight: "10px", width: "200px" }}
              >
                <option value="category_id">Category ID</option>
                <option value="category_name">Category Name</option>
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
                {/* Add Category button */}
                <button className="btn btn-primary" style={{ width: '150px', marginLeft:"10px" }} onClick={handleAddCategoryClick}>
                  Add Category
                </button>
                {/* Print button */}
                <button className="btn btn-secondary" onClick={handleDownloadPDF} style={{ width: '150px', marginLeft:"10px" }}>Print</button>
              </div>
            </div>
          </div>
          
          {/* Categories table */}
          <div className={styles.TableContainer}>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Category ID</th>
                  <th>Category Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => (
                    <tr key={cat.category_id}>
                      <td>{cat.category_id}</td>
                      <td>{cat.category_name}</td>
                      <td>
                        <span style={{ 
                          color: cat.status === 'Active' ? 'green' : 'red',
                          fontWeight: 'bold'
                        }}>
                          {cat.status || 'Active'}
                        </span>
                      </td>
                      <td>
                        {/* View category button */}
                        <FaEye
                          style={{ marginRight: "10px", cursor: "pointer", color: "#2770b4" }}
                          onClick={() => handleViewCategory(cat)} 
                        />
                        {/* Edit category button */}
                        <FaEdit
                          style={{ marginRight: "10px", cursor: "pointer", color: "#f0ad4e" }}
                          onClick={() => handleEditCategory(cat)} 
                        />
                        {/* Delete category button */}
                        <FaTrash
                          style={{ cursor: "pointer", color: "#d9534f" }}
                          onClick={() => handleDeleteCategory(cat.category_id)} 
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No categories found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Category Modal */}
        {showModal && (
          <div className={styles.ModalOverlay}>
            <div className={styles.ModalContent}>
              <h2 style={{ alignSelf: "center" }}>Add Category</h2>
              <form className={styles.ModalForm}>
                <div className={styles.GridContainer}>
                  {/* Category Name field */}
                  <div className={styles.FormGroup}>
                    <label style={{ fontWeight: "bold" }}>Category Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Category Name"
                      name="categoryName"
                      value={newCategory.categoryName}
                      onChange={handleInputChange}
                    />
                    {/* Validation error for category name */}
                    {validationErrors.categoryName && (
                      <div className="error" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                        {validationErrors.categoryName}
                      </div>
                    )}
                  </div>
                  {/* Status field */}
                  <div className={styles.FormGroup}>
                    <label style={{ fontWeight: "bold" }}>Status</label>
                    <select
                      className="form-control"
                      name="status"
                      value={newCategory.status}
                      onChange={handleInputChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Disable">Disable</option>
                    </select>
                  </div>
                </div>
                <div className={styles.BtnContainer}>
                  {/* Close modal button */}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                    style={{
                      marginLeft: "115px",
                      width: "140px",
                      height: "50px",
                      borderRadius: "10px",
                    }}
                  >
                    Close
                  </button>
                  {/* Save new category button */}
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: "140px", borderRadius: "10px" }}
                    onClick={handleSaveNewCategory}
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal for category details */}
        <ViewModal
          showViewModal={showViewModal}
          selectedEntity={selectedCategory}
          handleClose={handleCloseViewModal}
          entityTitle="Category"
          entityFields={[
            { label: "Category ID", name: "category_id" },
            { label: "Category Name", name: "category_name" },
            { label: "Status", name: "status" }
          ]}
        />

        {/* Edit Modal for category */}
        <EditModal
          showEditModal={showEditModal}
          entityData={editedCategory}
          entityTitle="Category"
          entityFields={[
            { label: "Category Name", name: "category_name" },
            { label: "Status", name: "status", type: "select", options: ["Active", "Disable"] }
          ]}
          handleClose={handleCloseEditModal}
          handleSaveEditEntity={handleSaveEditCategory}
          handleEditInputChange={handleEditInputChange}
          validationErrors={editValidationErrors}
        />

        {/* Print Modal for categories */}
        <PrintModal
          show={showPrintModal}
          handleClose={() => setShowPrintModal(false)}
          title="Print Categories Report"
          data={filteredCategories}
          fields={[
            { label: "Category ID", field: "category_id" },
            { label: "Category Name", field: "category_name" },
            { label: "Status", field: "status" }
          ]}
          filename="categories_report.pdf"
          reportTitle="Categories Details Report"
        />
      </div>
    </div>
  );
}

export default Categories;
