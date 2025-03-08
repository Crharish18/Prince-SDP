import React from "react";
import './EditModal.css';  // Add or update the corresponding CSS for styling

const EditModal = ({
  showEditModal,
  entityData,  // Pass the specific data for the entity
  entityFields, // Pass the fields for the entity
  entityTitle,  // Title of the entity (e.g., Employee, Product, etc.)
  handleClose,
  handleSaveEditEntity,  // Save the entity data
  handleEditInputChange   // Handle the change of inputs
}) => {
  if (!showEditModal || !entityData) return null; // Don't render if modal is not open or there's no data

  return (
    <div className="modal-overlay1">
      <div className="modal-content1">
        <h2 className="modal-title1">{`Edit ${entityTitle}`}</h2>
        <form className="modal-form1">
          <div className="grid-container">
            {entityFields.map((field, index) => (
              <div className="form-group" key={index}>
                <label style={{ fontWeight: "bold" }}>{field.label}</label>
                <input
                  type={field.type || "text"} // Allow dynamic input types (e.g., text, email, date, etc.)
                  className="form-control"
                  name={field.name}
                  value={entityData[field.name] || ""}
                  onChange={handleEditInputChange}
                />
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
