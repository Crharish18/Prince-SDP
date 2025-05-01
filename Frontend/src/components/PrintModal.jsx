// PrintModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // Correct import!

const PrintModal = ({
  show,
  handleClose,
  title = "Print Report",
  data = [],
  fields = [],
  filename = "report.pdf",
  reportTitle = "Report"
}) => {
  // State: which fields are selected for printing
  const [selectedFields, setSelectedFields] = useState(fields.map(f => f.field));

  // Reset selection when modal opens or fields change
  useEffect(() => {
    if (show) setSelectedFields(fields.map(f => f.field));
  }, [show, fields]);

  // Toggle field selection
  const handleFieldChange = (field) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  // Generate and download PDF
  const handlePrint = () => {
    const doc = new jsPDF();

    // Only print selected fields
    const fieldsToPrint = fields.filter(f => selectedFields.includes(f.field));
    if (fieldsToPrint.length === 0) return; // Don't print if nothing selected

    // Table header
    const head = [fieldsToPrint.map(f => f.label)];
    // Table body
    const body = data.map(item =>
      fieldsToPrint.map(f =>
        f.format ? f.format(item[f.field]) : (item[f.field] ?? "")
      )
    );

    doc.setFontSize(16);
    doc.text(reportTitle, 14, 20);

    autoTable(doc, {
      head,
      body,
      startY: 30,
      theme: "grid",
      styles: { fontSize: 10 }
    });

    doc.save(filename);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Select columns to include in the report:</p>
        <Form>
          {fields.map(field => (
            <Form.Check
              key={field.field}
              type="checkbox"
              label={field.label}
              checked={selectedFields.includes(field.field)}
              onChange={() => handleFieldChange(field.field)}
            />
          ))}
        </Form>
        <p style={{marginTop: 10}}>
          Click 'Print' to generate a PDF report with {data.length} {data.length === 1 ? 'record' : 'records'}.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handlePrint}
          disabled={selectedFields.length === 0}
        >
          Print
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PrintModal;
