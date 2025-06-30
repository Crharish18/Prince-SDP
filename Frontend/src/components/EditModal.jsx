import React, { useState } from "react";
import './EditModal.css';

const EditModal = ({
  showEditModal,
  entityData,
  entityFields,
  entityTitle,
  handleClose,
  handleSaveEditEntity,
  handleEditInputChange
}) => {
  // State for image preview URLs
  const [imagePreview, setImagePreview] = useState({});
  
  // Don't render modal if not open or no data
  if (!showEditModal || !entityData) return null;

  // Handle file input change for image fields
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // Set preview URL for selected image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview({
        ...imagePreview,
        [fieldName]: previewUrl
      });
      // Pass file to input change handler
      const customEvent = {
        target: {
          name: fieldName,
          value: file,
          type: 'file'
        }
      };
      handleEditInputChange(customEvent);
    }
  };

  return (
    <div className="modal-overlay1">
      <div className="modal-content1">
        <h2 className="modal-title1">{`Edit ${entityTitle}`}</h2>
        <form className="modal-form1">
          <div className="grid-container">
            {entityFields.map((field, index) => (
              <div className="form-group" key={index}>
                <label style={{ fontWeight: "bold" }}>{field.label}</label>
                {field.type === "image" ? (
                  // Image input with preview
                  <div className="image-edit-container">
                    <div className="current-image">
                      <img 
                        src={imagePreview[field.name] || entityData[field.name]} 
                        alt={`Current ${field.label}`}
                        className="edit-image-preview"
                      />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, field.name)}
                      className="form-control"
                    />
                  </div>
                ) : field.type === "select" ? (
                  // Select dropdown
                  <select
                    className="form-control"
                    name={field.name}
                    value={entityData[field.name] || ""}
                    onChange={handleEditInputChange}
                  >
                    {field.options && field.options.map((option, optionIndex) => (
                      <option key={optionIndex} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  // Standard input field
                  <input
                    type={field.type || "text"}
                    className="form-control"
                    name={field.name}
                    value={entityData[field.name] || ""}
                    onChange={handleEditInputChange}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="btn-container">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleClose} 
              style={{ marginLeft: "200px", width: "150px" }}
            >
              Close
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleSaveEditEntity}
              style={{ marginRight: "210px" }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};



export default EditModal;
