import React, { useState, useEffect } from "react";
import styles from "./AddEntityModal.module.css"; // Import CSS module

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
  const [imagePreview, setImagePreview] = useState(null);
  
  useEffect(() => {
    // Update image preview when entityData changes (for existing products)
    if (entityData && entityData.image_url) {
      setImagePreview(entityData.image_url);
    } else {
      setImagePreview(null);
    }
  }, [entityData]);
  
  if (!showModal) return null;
  
  const handleFileChange = (e, onChange) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Call the original onChange handler
      if (onChange) {
        onChange(e);
      }
    }
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
                  field.render({
                    value: entityData[field.name] || "",
                    onChange: handleInputChange
                  })
                ) : field.type === 'file' ? (
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
                  <select
                    className="form-control"
                    name={field.name}
                    value={entityData[field.name] || ""}
                    onChange={handleInputChange}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options && field.options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
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
              onClick={handleClose}
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
