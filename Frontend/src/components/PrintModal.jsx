import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logodash from "../assets/PicturesAdmin/logoBlack.png"; // Update this path to your logo

const PrintModal = ({
  show,
  handleClose,
  title = "Print Report",
  data = [],
  fields = [],
  filename = "report.pdf",
  reportTitle = "Report"
}) => {
  //which fields are selected for printing
  const [selectedFields, setSelectedFields] = useState(fields.map(f => f.field));
  //  date range for filtering
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  //filtered data to be printed
  const [filteredData, setFilteredData] = useState(data);
  //logo image for PDF header
  const [logoImage, setLogoImage] = useState(null);

  // Load logo image for PDF
  useEffect(() => {
    const img = new Image();
    img.src = logodash;
    img.onload = () => {
      setLogoImage(img);
    };
  }, []);

  // Reset field selection and date range when modal opens or fields/data change
  useEffect(() => {
    if (show) {
      setSelectedFields(fields.map(f => f.field));
      setStartDate('');
      setEndDate('');
      setFilteredData(data);
    }
  }, [show, fields, data]);

  // Filter data by date range when startDate or endDate changes
  useEffect(() => {
    if (!startDate && !endDate) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(item => {
      if (!item.created_at) return false;
      
      const itemDate = new Date(item.created_at);
      const start = startDate ? new Date(startDate) : new Date(0); // If no start date, use epoch
      const end = endDate ? new Date(endDate) : new Date('2099-12-31'); // If no end date, use far future
      
      // Set hours to 0 for start date and 23:59:59 for end date for inclusive comparison
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      
      return itemDate >= start && itemDate <= end;
    });
    
    setFilteredData(filtered);
  }, [startDate, endDate, data]);

  // Toggle field selection for printing
  const handleFieldChange = (field) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  // Generate and download PDF report
  const handlePrint = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Only print selected fields
    const fieldsToPrint = fields.filter(f => selectedFields.includes(f.field));
    if (fieldsToPrint.length === 0) return; // Don't print if nothing selected

    // Add header with logo and date
    if (logoImage) {
      // Add logo to top left
      const logoWidth = 50;
      const logoHeight = 60;
      doc.addImage(logoImage, 'PNG', 12, -14, logoWidth, logoHeight);
    }
     
    // Add generated date to top right
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${formattedDate}`, pageWidth - 14, 15, { align: 'right' });
    
    // Add report title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(reportTitle, pageWidth / 2, 30, { align: 'center' });
    
    // Add date range to report if specified
    if (startDate || endDate) {
      doc.setFontSize(10);
      const dateRangeText = `Date Range: ${startDate || 'Any'} to ${endDate || 'Any'}`;
      doc.text(dateRangeText, pageWidth / 2, 38, { align: 'center' });
    }

    // Add table
    autoTable(doc, {
      head: [fieldsToPrint.map(f => f.label)],
      body: filteredData.map(item =>
        fieldsToPrint.map(f =>
          f.format ? f.format(item[f.field]) : (item[f.field] ?? "")
        )
      ),
      startY: startDate || endDate ? 45 : 40,
      theme: "grid",
      styles: { fontSize: 10, halign: 'center', valign: 'middle' },
      headStyles: { fillColor: [39, 112, 180], textColor: 255, halign: 'center' },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      didDrawPage: function(data) {
        // Add footer on each page and page number
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, 14, pageHeight - 10);
        
        // Company name on bottom right
        doc.text("Prince Lanka Agency Pvt(Ltd)", pageWidth - 14, pageHeight - 10, { align: 'right' });
      }
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
        <Form>
          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <p className="mt-3">Select columns to include in the report:</p>
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
          {filteredData.length === 0 ? (
            <span className="text-danger">No records match the selected date range.</span>
          ) : (
            `Click 'Print' to generate a PDF report with ${filteredData.length} ${filteredData.length === 1 ? 'record' : 'records'}.`
          )}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handlePrint}
          disabled={selectedFields.length === 0 || filteredData.length === 0}
        >
          Print
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PrintModal;
