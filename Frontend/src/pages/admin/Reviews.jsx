import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaTrash, FaStar, FaSortUp, FaSortDown } from "react-icons/fa";
import { Link } from 'react-router-dom';
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from './Reviews.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ViewModal from "../../components/Viewmodal"; 
import PrintModal from "../../components/PrintModal";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import logodash from "../../assets/PicturesAdmin/logoWhite.png";

function Reviews() {
  // State for reviews data
  const [reviews, setReviews] = useState([]);
  // State for product details keyed by product_id
  const [products, setProducts] = useState({});
  // State for search input and selected column
  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  // State for view modal visibility and selected review
  const [showViewModal, setShowViewModal] = useState(false); 
  const [selectedReview, setSelectedReview] = useState(null); 
  // State for print modal visibility
  const [showPrintModal, setShowPrintModal] = useState(false);
  // State for date sorting: null, 'asc', or 'desc'
  const [dateSort, setDateSort] = useState(null);

  // Fetch reviews and related product data on mount
  useEffect(() => {
    axios.get('http://localhost:5000/api/reviews')
      .then(response => {
        // Ensure each review has a created_at date
        const reviewsWithDates = response.data.map(review => ({
          ...review,
          created_at: review.created_at || new Date().toISOString()
        }));
        setReviews(reviewsWithDates);
        
        // Extract unique product IDs
        const productIds = [...new Set(response.data.map(review => review.product_id))];
        
        // Fetch product details for each product ID
        productIds.forEach(productId => {
          axios.get(`http://localhost:5000/api/products/${productId}`)
            .then(productResponse => {
              setProducts(prevProducts => ({
                ...prevProducts,
                [productId]: productResponse.data
              }));
            })
            .catch(error => {
              console.error(`Error fetching product ${productId}:`, error);
            });
        });
      })
      .catch(error => {
        console.error('Error fetching reviews:', error);
      });
  }, []);

  // Format date for display as MM/DD/YYYY
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };
  
  // Handle change in search column dropdown
  const handleSearchColumnChange = (e) => {
    setSearchColumn(e.target.value);
  };

  // Handle change in search input
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  // Handle change in date sort direction
  const handleDateSortChange = (sortDirection) => {
    setDateSort(sortDirection);
  };

  // Filter and sort reviews based on search and date sort
  const filteredAndSortedReviews = React.useMemo(() => {
    // Filter reviews by search text and column
    let filtered = reviews.filter((review) => {
      if (!searchText || !searchColumn) return true;
      if (searchColumn === "product_name") {
        const productName = products[review.product_id]?.name?.toLowerCase() || "";
        return productName.includes(searchText.toLowerCase());
      }
      const value = review[searchColumn]?.toString().toLowerCase();
      return value && value.includes(searchText.toLowerCase());
    });
    
    // Sort reviews by date if sorting is active
    if (dateSort) {
      filtered = [...filtered].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : null;
        const dateB = b.created_at ? new Date(b.created_at) : null;
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        if (dateSort === 'asc') {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });
    }
    return filtered;
  }, [reviews, searchText, searchColumn, dateSort, products]);

  // Show view modal with selected review details
  const handleViewReview = (review) => {
    setSelectedReview({
      ...review,
      product_name: products[review.product_id]?.name || "Unknown Product"
    });
    setShowViewModal(true);
  };

  // Close view modal
  const handleCloseViewModal = () => {
    setShowViewModal(false);
  };

  // Delete review by ID with confirmation
  const handleDeleteReview = (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      axios.delete(`http://localhost:5000/api/reviews/${reviewId}`)
        .then(() => {
          setReviews(prevReviews =>
            prevReviews.filter(review => review.review_id !== reviewId)
          );
        })
        .catch(error => {
          console.error("Error deleting review:", error);
        });
    }
  };

  // Render star rating visualization
  const renderRatingStars = (rating) => {
    return (
      <div className="d-flex align-items-center">
        {[...Array(5)].map((_, i) => (
          <FaStar 
            key={i} 
            color={i < rating ? "#ffc107" : "#e4e5e9"} 
            style={{ marginRight: "2px" }}
          />
        ))}
        <span className="ms-1">({rating})</span>
      </div>
    );
  };

  // Render review images thumbnails
  const renderReviewImages = (images) => {
    return (
      <div className="d-flex flex-wrap">
        {images && images.length > 0 ? (
          images.map((url, index) => (
            <img 
              key={index} 
              src={url} 
              alt={`Review image ${index + 1}`} 
              style={{ width: "100px", height: "100px", objectFit: "cover", margin: "5px" }}
            />
          ))
        ) : (
          <span>No images</span>
        )}
      </div>
    );
  };

  // Open print modal
  const handleDownloadPDF = () => {
    setShowPrintModal(true);
  };

  // Prepare reviews with product names for printing
  const reviewsWithProductNames = filteredAndSortedReviews.map(review => ({
    ...review,
    product_name: products[review.product_id]?.name || "Unknown Product"
  }));

  // Main render
  return (
    <div className={styles.ManageReviewsContainer}>
      <Sidebar />
      <div className={styles.ManageReviewsContent}>
        <Header />
        <div className={styles.InnerContainer} style={{ marginLeft: "10px", width: "100%" }}>
          <div className={styles.TopSection}>
            <h1 className="section-title" style={{ fontSize: '28px', fontWeight: 'bold' }}>Manage Reviews</h1>

            <div className={styles.SearchWrapper}>
              {/* Search column dropdown */}
              <select
                className="form-control"
                value={searchColumn}
                onChange={handleSearchColumnChange}
                style={{ marginRight: "10px", width: "200px" }}
              >
                <option value="review_id">Review ID</option>
                <option value="product_name">Product Name</option>
                <option value="order_id">Order ID</option>
                <option value="rating">Rating</option>
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
                {/* Print button */}
                <button className="btn btn-secondary" style={{ width: '150px', marginLeft:"10px" }} onClick={handleDownloadPDF}>Print</button>
              </div>
              <div className={styles.BtnContainer}>
                {/* Link to Messages page */}
                <Link to="/admin/Messages" className="btn btn-primary" style={{ width: '150px', marginLeft:"10px" }}>
                  Messages
                </Link>
              </div>
            </div>

            {/* Date sort controls */}
            <div className={styles.DateSortContainer}>
              <span className={styles.SortLabel}>Sort by Date:</span>
              <div className={styles.SortButtonGroup}>
                <button 
                  className={`${styles.SortButton} ${dateSort === 'asc' ? styles.active : styles.inactive}`}
                  onClick={() => handleDateSortChange('asc')}
                >
                  Oldest First <FaSortUp className={styles.SortIcon} />
                </button>
                <button 
                  className={`${styles.SortButton} ${dateSort === 'desc' ? styles.active : styles.inactive}`}
                  onClick={() => handleDateSortChange('desc')}
                >
                  Newest First <FaSortDown className={styles.SortIcon} />
                </button>
                {dateSort && (
                  <button 
                    className={`${styles.SortButton} ${styles.clear}`}
                    onClick={() => handleDateSortChange(null)}
                  >
                    Clear Sort
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Reviews table */}
          <div className={styles.TableContainer}>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Review ID</th>
                  <th>Product</th>
                  <th>Order ID</th>
                  <th>Rating</th>
                  <th className={styles.SortableHeader}>
                    Date
                    {dateSort === 'asc' && <FaSortUp className={styles.SortIcon} />}
                    {dateSort === 'desc' && <FaSortDown className={styles.SortIcon} />}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedReviews.length > 0 ? (
                  filteredAndSortedReviews.map((review) => (
                    <tr key={review.review_id}>
                      <td>{review.review_id}</td>
                      <td>{products[review.product_id]?.name || "Loading..."}</td>
                      <td>{review.order_id}</td>
                      <td>{renderRatingStars(review.rating)}</td>
                      <td>{formatDate(review.created_at)}</td>
                      <td>
                        {/* View review button */}
                        <FaEye
                          style={{ marginRight: "10px", cursor: "pointer", color: "#2770b4" }}
                          onClick={() => handleViewReview(review)} 
                        />
                        {/* Delete review button */}
                        <FaTrash
                          style={{ cursor: "pointer", color: "#d9534f" }}
                          onClick={() => handleDeleteReview(review.review_id)} 
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No reviews found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Modal for review details */}
        <ViewModal
          showViewModal={showViewModal}
          selectedEntity={selectedReview}
          handleClose={handleCloseViewModal}
          entityTitle="Review"
          entityFields={[
            { label: "Review ID", name: "review_id" },
            { label: "Product", name: "product_name" },
            { label: "Order ID", name: "order_id" },
            { label: "Rating", name: "rating" },
            { label: "Review Text", name: "review_text", fullWidth: true },
            { label: "Date", name: "created_at", format: formatDate },
            { label: "Images", name: "images", fullWidth: true, format: renderReviewImages }
          ]}
        />

        {/* Print Modal for reviews */}
        <PrintModal
          show={showPrintModal}
          handleClose={() => setShowPrintModal(false)}
          title="Print Reviews Report"
          data={reviewsWithProductNames}
          fields={[
            { label: "Review ID", field: "review_id" },
            { label: "Product", field: "product_name" },
            { label: "Order ID", field: "order_id" },
            { label: "Rating", field: "rating" },
            { label: "Review Text", field: "review_text" },
            { label: "Date", field: "created_at", format: (date) => formatDate(date) }
          ]}
          filename="reviews_report.pdf"
          reportTitle="Reviews Details Report"
        />
      </div>
    </div>
  );
}

export default Reviews;
