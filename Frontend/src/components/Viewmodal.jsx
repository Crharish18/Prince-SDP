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
              <div className="form-group" key={index} style={{ gridColumn: field.fullWidth ? "1 / span 2" : "auto" }}>
                <label style={{ fontWeight: "bold" }}>{field.label}</label>
                {field.type === "image" ? (
                  <div className="image-container">
                    {selectedEntity[field.name] ? (
                      <img 
                        src={selectedEntity[field.name]} 
                        alt={`${field.label}`}
                        className="modal-image"
                        style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain" }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/150?text=No+Image";
                        }}
                      />
                    ) : (
                      <div style={{
                        height: "150px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f8f9fa",
                        border: "1px dashed #dee2e6",
                        borderRadius: "4px"
                      }}>
                        No profile picture available
                      </div>
                    )}
                  </div>
                ) : field.format ? (
                  <div className="form-control-static" style={{
                    padding: "0.375rem 0.75rem",
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #ced4da",
                    borderRadius: "0.25rem",
                    minHeight: "38px",
                    display: "flex",
                    alignItems: "center"
                  }}>
                    {field.format(selectedEntity[field.name])}
                  </div>
                ) : (
                  <div className="form-control-static" style={{
                    padding: "0.375rem 0.75rem",
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #ced4da",
                    borderRadius: "0.25rem",
                    minHeight: "38px",
                    display: "flex",
                    alignItems: "center"
                  }}>
                    {selectedEntity[field.name] !== null && selectedEntity[field.name] !== undefined 
                      ? selectedEntity[field.name] 
                      : 'Not provided'}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="btn-container">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose} // Close the modal
              style={{ marginLeft: "0", width: "150px" }}
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
