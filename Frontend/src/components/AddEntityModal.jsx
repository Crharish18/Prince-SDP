import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import styles from './AddEntityModal.module.css'; // Style for the modal

const AddEntityModal = ({
  showModal,
  handleClose,
  entityType,
  fields,
  apiEndpoint,
  onSave,
}) => {
  const [formData, setFormData] = useState(fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {}));
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validate = () => {
    let errors = {};
    fields.forEach(field => {
      if (!formData[field.name]) {
        errors[field.name] = `${field.label} is required.`;
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      axios
        .post(apiEndpoint, formData)
        .then((response) => {
          onSave(response.data);
          handleClose();
        })
        .catch((error) => {
          console.error(`Error adding ${entityType}:`, error);
        });
    }
  };

  return (
    showModal && (
      <div className={styles.ModalOverlay}>
        <div className={styles.ModalContent}>
          <h2>{`Add ${entityType}`}</h2>
          <form className={styles.ModalForm}>
            <div className={styles.GridContainer}>
              {fields.map((field) => (
                <div key={field.name} className={styles.FormGroup}>
                  <label>{field.label}</label>
                  <input
                    type={field.type || 'text'}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder={`Enter ${field.label}`}
                  />
                  {validationErrors[field.name] && (
                    <div className="error">{validationErrors[field.name]}</div>
                  )}
                </div>
              ))}
            </div>
            <div className={styles.BtnContainer}>
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Close
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSave}>
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

AddEntityModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  entityType: PropTypes.string.isRequired,
  fields: PropTypes.array.isRequired,
  apiEndpoint: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default AddEntityModal;
