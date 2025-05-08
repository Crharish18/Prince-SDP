import React from "react";
import './Viewmodal.css';  // Keep the same CSS file for styling

const ViewModal = ({ showViewModal, selectedEntity, handleClose, entityTitle, entityFields }) => {
  if (!showViewModal || !selectedEntity) return null; // Don't render if modal is not open or there's no selected entity

  const formatDate = (dob) => {
    const date = new Date(dob);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="modal-overlay1">
      <div className="modal-content1">
        <h2 className="modal-title1">{`View ${entityTitle}`}</h2>
        <form className="modal-form1">
          <div className="grid-container">
            {entityFields.map((field, index) => (
              <div className="form-group" key={index}>
                <label style={{ fontWeight: "bold" }}>{field.label}</label>
                {field.type === "image" ? (
                  <div className="image-container">
                    <img 
                      src={selectedEntity[field.name]} 
                      alt={`${field.label}`}
                      className="modal-image"
                      style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain" }}
                    />
                  </div>
                ) : (
                  <input 
                    type="text" 
                    className="form-control" 
                    value={field.format ? field.format(selectedEntity[field.name]) : selectedEntity[field.name]} 
                    disabled 
                  />
                )}
              </div>
            ))}
          </div>
          <div className="btn-container">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose} // Close the modal
              style={{ marginLeft: "200px", width: "150px" }}
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ViewModal;
