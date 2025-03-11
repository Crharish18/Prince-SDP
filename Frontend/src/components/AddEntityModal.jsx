import React from "react";
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
  if (!showModal) return null;

  return (
    <div className={styles.ModalOverlay}>
      <div className={styles.ModalContent}>
        <h2 style={{ alignSelf: "center" }}>Add {entityTitle}</h2>
        <form className={styles.ModalForm}  autoComplete="off">
          <div className={styles.GridContainer}>
            {entityFields.map((field) => (
              <div key={field.name} className={styles.FormGroup}>
                <label style={{ fontWeight: "bold" }}>{field.label}</label>
                <input
                  type={field.type}
                  className="form-control"
                  placeholder={`Enter ${field.label}`}
                  name={field.name}
                  value={entityData[field.name] || ""}
                  onChange={handleInputChange}
                />
                {validationErrors[field.name] && (
                  <div className="error">{validationErrors[field.name]}</div>
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
              style={{ width: "140px",height: "50px", borderRadius: "10px" }}
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
