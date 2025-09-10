import React, { useState, useEffect } from "react";
import styles from "./AddEntityModal.module.css";

// AddEntityModal component 
const AddEntityModal = ({
  showModal,
  handleClose,
  handleSave,
  entityTitle,
  entityData,
  entityFields,
  handleInputChange,
  validationErrors,
}) => {
  // image preview URL
  const [imagePreview, setImagePreview] = useState(null);
  
  // State to track if modal was previously open
  const [wasOpen, setWasOpen] = useState(false);
  
  
  useEffect(() => {
    // Close handler if modal was open and now closed
    if (wasOpen && !showModal) {
      handleClose();
    }
    setWasOpen(showModal);

    // Set image preview if available in entity data
    if (entityData && entityData.image_url) {
      setImagePreview(entityData.image_url);
    } else {
      setImagePreview(null);
    }
  }, [entityData, showModal, wasOpen, handleClose]);
  
  // Don't render modal if closed
  if (!showModal) return null;
  
  // Handle file input change and preview
  const handleFileChange = (e, onChange) => {
    const file = e.target.files[0];
    if (file) {
      // Set preview for selected image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      // Call input change handler if provided
      if (onChange) {
        onChange(e);
      }
    }
  };
  
  // Handle modal close and cleanup
  const handleModalClose = () => {
    // Clear image preview when closing modal
    setImagePreview(null);
    handleClose();
  };
  
  return (
    <div className={styles.ModalOverlay}>
      <div className={styles.ModalContent}>
        <h2 style={{ alignSelf: "center" }}>{entityTitle}</h2>
        <form className={styles.ModalForm} autoComplete="off">
          <div className={styles.GridContainer}>
            {entityFields.map((field) => (
              <div key={field.name} className={styles.FormGroup}>
                <label style={{ fontWeight: "bold" }}>{field.label}</label>
                {field.render ? (
                  // Custom render for special fields (e.g., autocomplete)
                  field.render({
                    value: entityData[field.name] || "",
                    onChange: handleInputChange
                  })
                ) : field.type === 'file' ? (
                  // File input with image preview
                  <div className={styles.FileInputContainer}>
                    {imagePreview && (
                      <div className={styles.ImagePreviewContainer}>
                        <img 
                          src={imagePreview} 
                          alt="Product preview" 
                          className={styles.ImagePreview} 
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      className="form-control"
                      name={field.name}
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, field.onChange || handleInputChange)}
                    />
                  </div>
                ) : field.type === 'select' ? (
                  // Select dropdown
                  <select
                    className="form-control"
                    name={field.name}
                    value={entityData[field.name] || ""}
                    onChange={handleInputChange}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options && field.options.map(opt => (
                      <option key={typeof opt === 'object' ? opt.value : opt} value={typeof opt === 'object' ? opt.value : opt}>
                        {typeof opt === 'object' ? opt.label : opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  // Regular input field
                  <input
                    type={field.type}
                    className="form-control"
                    placeholder={`Enter ${field.label}`}
                    name={field.name}
                    value={entityData[field.name] || ""}
                    onChange={handleInputChange}
                  />
                )}
                {validationErrors[field.name] && (
                  // Show validation error
                  <div className="error" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                    {validationErrors[field.name]}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className={styles.BtnContainer}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleModalClose}
              style={{
                marginLeft: "0px",
                width: "140px",
                height: "50px",
                borderRadius: "10px",
              }}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: "140px", height: "50px", borderRadius: "10px" }}
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};



export default AddEntityModal;
