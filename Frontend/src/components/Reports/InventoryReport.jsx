import React, { useState } from "react";
import axios from "axios";
import { FaFilePdf, FaSpinner, FaEye } from "react-icons/fa";
import styles from '../../pages/admin/Reports.module.css';
import Chart from 'chart.js/auto';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import companyLogo from '../../assets/logoBlack.png'; // Update this path to your actual logo

function InventoryReport({ 
  currentDate, 
  isLoading, 
  setIsLoading, 
  error, 
  setError, 
  validateInputs,
  reportFilters
}) {
  const [generatingPdf, setGeneratingPdf] = useState(false);
  
  // Helper function to format currency in Sri Lankan Rupees
  const formatCurrency = amount => `Rs ${Number(amount || 0).toFixed(2)}`;

  // Create chart images for PDF
  const createChartImage = (config, width, height) => {
    return new Promise(resolve => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const chart = new Chart(canvas.getContext('2d'), config);
      setTimeout(() => {
        const imageUrl = canvas.toDataURL('image/png');
        chart.destroy();
        resolve(imageUrl);
      }, 500);
    });
  };

  // Generate PDF report
  const generateReport = async () => {
    if (!validateInputs()) return;
    setIsLoading(true);
    setError("");
    
    try {
      // Get data and setup PDF
      const { data } = await axios.post("http://localhost:5000/api/reports/getData", {
        reportType: "Inventory Report",
        filters: reportFilters
      });
      
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const today = new Date().toLocaleDateString();
      
      // Add blue header
      doc.setFillColor(39, 112, 180);
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
      doc.addImage(companyLogo, 'PNG', 12, 5, 40, 30);
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(`Generated on: ${today}`, 195, 20, { align: 'right' });
      
      // Add report title and date info
      doc.setFontSize(22);
      doc.setTextColor(39, 112, 180);
      doc.text('Inventory Report', 105, 55, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text(`Current Date: ${currentDate}`, 105, 65, { align: 'center' });
      
      // Add blue horizontal line
      doc.setDrawColor(39, 112, 180);
      doc.setLineWidth(0.5);
      doc.line(15, 75, doc.internal.pageSize.getWidth() - 15, 75);
      
      let finalY = 75;
      
      // Add inventory summary section if selected
      if (reportFilters.includeSummary && data.inventorySummary) {
        finalY += 10;
        doc.setFontSize(16);
        doc.setTextColor(39, 112, 180);
        doc.text('Inventory Summary', 15, finalY);
        finalY += 5;
        
        // Create summary table data
        const summaryData = [
          ['Metric', 'Value'],
          ['Total Products', data.inventorySummary.totalProducts.toString()],
          ['Total Items in Stock', data.inventorySummary.totalItems.toString()],
          ['Total Inventory Value', formatCurrency(data.inventorySummary.totalValue)]
        ];
        
        // Add summary table
        autoTable(doc, {
          startY: finalY,
          head: [summaryData[0]],
          body: summaryData.slice(1),
          theme: 'grid',
          headStyles: { fillColor: [39, 112, 180], textColor: [255, 255, 255], fontStyle: 'bold' },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 60, halign: 'right' }
          }
        });
        
        // Get position after table
        try { finalY = doc.lastAutoTable.finalY + 15; } catch (e) { finalY += 30; }
      }
      
      // Add lowest stock products section if selected
      if (reportFilters.includeLowestStock && data.lowestStockProducts?.length > 0) {
        // Check if there's enough space
        if (doc.internal.pageSize.getHeight() - finalY - 30 < 100) {
          doc.addPage();
          finalY = 20;
        }
        
        doc.setFontSize(16);
        doc.setTextColor(39, 112, 180);
        doc.text('Products with Lowest Stock', 15, finalY);
        finalY += 5;
        
        // Add lowest stock table
        autoTable(doc, {
          startY: finalY,
          head: [['Product', 'Stock Qty', 'Unit Price', 'Total Value']],
          body: data.lowestStockProducts.map(p => [
            p.name || '-',
            p.stock_qty.toString(),
            formatCurrency(p.price),
            formatCurrency(p.stock_qty * p.price)
          ]),
          theme: 'grid',
          pageBreak: 'avoid',
          headStyles: { fillColor: [39, 112, 180], textColor: [255, 255, 255], fontStyle: 'bold' },
          columnStyles: { 
            1: { halign: 'right' }, 
            2: { halign: 'right' },
            3: { halign: 'right' }
          }
        });
        
        try { finalY = doc.lastAutoTable.finalY + 15; } catch (e) { finalY += 100; }
      }
      
      // Add stock levels chart if charts and top selling are selected
      if (reportFilters.includeCharts && reportFilters.includeTopSelling && data.topSellingProducts?.length > 0) {
        // Check if there's enough space
        if (doc.internal.pageSize.getHeight() - finalY - 30 < 120) {
          doc.addPage();
          finalY = 20;
        }
        
        doc.setFontSize(16);
        doc.setTextColor(39, 112, 180);
        doc.text('Stock Levels of Top Selling Products', 15, finalY);
        finalY += 10;
        
        // Create stock levels chart
        try {
          // Prepare data for chart
          const productNames = data.topSellingProducts.map(p => p.name);
          const stockLevels = data.topSellingProducts.map(p => p.stock_qty);
          
          const stockLevelsConfig = {
            type: 'bar',
            data: {
              labels: productNames,
              datasets: [{
                label: 'Current Stock',
                data: stockLevels,
                backgroundColor: 'rgba(39, 112, 180, 0.7)',
                borderColor: 'rgb(39, 112, 180)',
                borderWidth: 1
              }]
            },
            options: {
              indexAxis: 'y',
              responsive: false,
              plugins: {
                legend: { display: false },
                title: { display: true, text: 'Stock Levels of Top Selling Products', font: { size: 14 } }
              },
              scales: {
                x: { 
                  beginAtZero: true,
                  title: { display: true, text: 'Stock Quantity' }
                }
              },
              animation: false
            }
          };
          
          const stockLevelsImage = await createChartImage(stockLevelsConfig, 600, 300);
          doc.addImage(stockLevelsImage, 'PNG', 15, finalY, 180, 90);
          finalY += 100;
        } catch (e) {
          console.error("Error creating stock levels chart:", e);
          finalY += 10;
        }
      }
      
      // Add expiring products section if selected
      if (reportFilters.includeExpiring && data.expiringProducts?.length > 0) {
        // Check if there's enough space
        if (doc.internal.pageSize.getHeight() - finalY - 30 < 120) {
          doc.addPage();
          finalY = 20;
        } else {
          finalY += 15;
        }
        
        doc.setFontSize(16);
        doc.setTextColor(39, 112, 180);
        doc.text('Products Expiring Soon', 15, finalY);
        finalY += 5;
        
        // Add expiring products table
        autoTable(doc, {
          startY: finalY,
          head: [['Product', 'Stock Qty', 'Expiry Date', 'Days Until Expiry']],
          body: data.expiringProducts.map(p => [
            p.name || '-',
            p.stock_qty.toString(),
            new Date(p.expiry_date).toLocaleDateString(),
            p.days_until_expiry.toString()
          ]),
          theme: 'grid',
          pageBreak: 'avoid',
          headStyles: { fillColor: [39, 112, 180], textColor: [255, 255, 255], fontStyle: 'bold' },
          columnStyles: { 
            1: { halign: 'right' }, 
            3: { halign: 'right' }
          }
        });
        
        try { finalY = doc.lastAutoTable.finalY + 15; } catch (e) { finalY += 100; }
        
        // Add expiring products chart if charts are selected
        if (reportFilters.includeCharts) {
          // Check if there's enough space
          if (doc.internal.pageSize.getHeight() - finalY - 30 < 120) {
            doc.addPage();
            finalY = 20;
          } else {
            finalY += 10;
          }
          
          doc.setFontSize(16);
          doc.setTextColor(39, 112, 180);
          doc.text('Days Until Expiry', 15, finalY);
          finalY += 10;
          
          // Create expiring products chart
          try {
            // Prepare data for chart
            const productNames = data.expiringProducts.map(p => p.name);
            const daysUntilExpiry = data.expiringProducts.map(p => p.days_until_expiry);
            
            // Set colors based on expiry days (red for close to expiry, yellow for medium, green for farther)
            const barColors = daysUntilExpiry.map(days => {
              if (days <= 7) return 'rgba(255, 99, 132, 0.7)'; // Red for <= 7 days
              if (days <= 30) return 'rgba(255, 205, 86, 0.7)'; // Yellow for <= 30 days
              return 'rgba(75, 192, 192, 0.7)'; // Green for > 30 days
            });
            
            const expiryConfig = {
              type: 'bar',
              data: {
                labels: productNames,
                datasets: [{
                  label: 'Days Until Expiry',
                  data: daysUntilExpiry,
                  backgroundColor: barColors,
                  borderColor: barColors.map(color => color.replace('0.7', '1')),
                  borderWidth: 1
                }]
              },
              options: {
                indexAxis: 'y',
                responsive: false,
                plugins: {
                  legend: { display: false },
                  title: { display: true, text: 'Days Until Expiry', font: { size: 14 } }
                },
                scales: {
                  x: { 
                    beginAtZero: true,
                    title: { display: true, text: 'Days' }
                  }
                },
                animation: false
              }
            };
            
            const expiryImage = await createChartImage(expiryConfig, 600, 300);
            doc.addImage(expiryImage, 'PNG', 15, finalY, 180, 90);
          } catch (e) {
            console.error("Error creating expiry chart:", e);
          }
        }
      }
      
      // Add footer to all pages with company name on right and page numbers on left
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        
        // Page number on left
        doc.text(`Page ${i} of ${pageCount}`, 15, doc.internal.pageSize.getHeight() - 10);
        
        // Company name on right
        doc.text("Prince Lanka Agency (Pvt) Ltd", doc.internal.pageSize.getWidth() - 15, 
                doc.internal.pageSize.getHeight() - 10, { align: 'right' });
      }
      
      // Save the PDF
      doc.save(`Inventory_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      setError("Failed to generate PDF report");
      console.error("PDF generation error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate and preview PDF report in a new tab
  const previewPdf = async () => {
    setGeneratingPdf(true);
    setError("");
    
    try {
      if (!validateInputs()) {
        setGeneratingPdf(false);
        return;
      }
      
      // Get data and setup PDF
      const { data } = await axios.post("http://localhost:5000/api/reports/getData", {
        reportType: "Inventory Report",
        filters: reportFilters
      });
      
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const today = new Date().toLocaleDateString();
      
      // Add blue header
      doc.setFillColor(39, 112, 180);
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
      doc.addImage(companyLogo, 'PNG', 12, 5, 40, 30);
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(`Generated on: ${today}`, 195, 20, { align: 'right' });
      
      // Add report title and date info
      doc.setFontSize(22);
      doc.setTextColor(39, 112, 180);
      doc.text('Inventory Report', 105, 55, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text(`Current Date: ${currentDate}`, 105, 65, { align: 'center' });
      
      // Add blue horizontal line
      doc.setDrawColor(39, 112, 180);
      doc.setLineWidth(0.5);
      doc.line(15, 75, doc.internal.pageSize.getWidth() - 15, 75);
      
      let finalY = 75;
      
      // Add inventory summary section if selected
      if (reportFilters.includeSummary && data.inventorySummary) {
        finalY += 10;
        doc.setFontSize(16);
        doc.setTextColor(39, 112, 180);
        doc.text('Inventory Summary', 15, finalY);
        finalY += 5;
        
        // Create summary table data
        const summaryData = [
          ['Metric', 'Value'],
          ['Total Products', data.inventorySummary.totalProducts.toString()],
          ['Total Items in Stock', data.inventorySummary.totalItems.toString()],
          ['Total Inventory Value', formatCurrency(data.inventorySummary.totalValue)]
        ];
        
        // Add summary table
        autoTable(doc, {
          startY: finalY,
          head: [summaryData[0]],
          body: summaryData.slice(1),
          theme: 'grid',
          headStyles: { fillColor: [39, 112, 180], textColor: [255, 255, 255], fontStyle: 'bold' },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 60, halign: 'right' }
          }
        });
        
        // Get position after table
        try { finalY = doc.lastAutoTable.finalY + 15; } catch (e) { finalY += 30; }
      }
      
      // Add lowest stock products section if selected
      if (reportFilters.includeLowestStock && data.lowestStockProducts?.length > 0) {
        // Check if there's enough space
        if (doc.internal.pageSize.getHeight() - finalY - 30 < 100) {
          doc.addPage();
          finalY = 20;
        }
        
        doc.setFontSize(16);
        doc.setTextColor(39, 112, 180);
        doc.text('Products with Lowest Stock', 15, finalY);
        finalY += 5;
        
        // Add lowest stock table
        autoTable(doc, {
          startY: finalY,
          head: [['Product', 'Stock Qty', 'Unit Price', 'Total Value']],
          body: data.lowestStockProducts.map(p => [
            p.name || '-',
            p.stock_qty.toString(),
            formatCurrency(p.price),
            formatCurrency(p.stock_qty * p.price)
          ]),
          theme: 'grid',
          pageBreak: 'avoid',
          headStyles: { fillColor: [39, 112, 180], textColor: [255, 255, 255], fontStyle: 'bold' },
          columnStyles: { 
            1: { halign: 'right' }, 
            2: { halign: 'right' },
            3: { halign: 'right' }
          }
        });
        
        try { finalY = doc.lastAutoTable.finalY + 15; } catch (e) { finalY += 100; }
      }
      
      // Add stock levels chart if charts and top selling are selected
      if (reportFilters.includeCharts && reportFilters.includeTopSelling && data.topSellingProducts?.length > 0) {
        // Check if there's enough space
        if (doc.internal.pageSize.getHeight() - finalY - 30 < 120) {
          doc.addPage();
          finalY = 20;
        }
        
        doc.setFontSize(16);
        doc.setTextColor(39, 112, 180);
        doc.text('Stock Levels of Top Selling Products', 15, finalY);
        finalY += 10;
        
        // Create stock levels chart
        try {
          // Prepare data for chart
          const productNames = data.topSellingProducts.map(p => p.name);
          const stockLevels = data.topSellingProducts.map(p => p.stock_qty);
          
          const stockLevelsConfig = {
            type: 'bar',
            data: {
              labels: productNames,
              datasets: [{
                label: 'Current Stock',
                data: stockLevels,
                backgroundColor: 'rgba(39, 112, 180, 0.7)',
                borderColor: 'rgb(39, 112, 180)',
                borderWidth: 1
              }]
            },
            options: {
              indexAxis: 'y',
              responsive: false,
              plugins: {
                legend: { display: false },
                title: { display: true, text: 'Stock Levels of Top Selling Products', font: { size: 14 } }
              },
              scales: {
                x: { 
                  beginAtZero: true,
                  title: { display: true, text: 'Stock Quantity' }
                }
              },
              animation: false
            }
          };
          
          const stockLevelsImage = await createChartImage(stockLevelsConfig, 600, 300);
          doc.addImage(stockLevelsImage, 'PNG', 15, finalY, 180, 90);
          finalY += 100;
        } catch (e) {
          console.error("Error creating stock levels chart:", e);
          finalY += 10;
        }
      }
      
      // Add expiring products section if selected
      if (reportFilters.includeExpiring && data.expiringProducts?.length > 0) {
        // Check if there's enough space
        if (doc.internal.pageSize.getHeight() - finalY - 30 < 120) {
          doc.addPage();
          finalY = 20;
        } else {
          finalY += 15;
        }
        
        doc.setFontSize(16);
        doc.setTextColor(39, 112, 180);
        doc.text('Products Expiring Soon', 15, finalY);
        finalY += 5;
        
        // Add expiring products table
        autoTable(doc, {
          startY: finalY,
          head: [['Product', 'Stock Qty', 'Expiry Date', 'Days Until Expiry']],
          body: data.expiringProducts.map(p => [
            p.name || '-',
            p.stock_qty.toString(),
            new Date(p.expiry_date).toLocaleDateString(),
            p.days_until_expiry.toString()
          ]),
          theme: 'grid',
          pageBreak: 'avoid',
          headStyles: { fillColor: [39, 112, 180], textColor: [255, 255, 255], fontStyle: 'bold' },
          columnStyles: { 
            1: { halign: 'right' }, 
            3: { halign: 'right' }
          }
        });
        
        try { finalY = doc.lastAutoTable.finalY + 15; } catch (e) { finalY += 100; }
        
        // Add expiring products chart if charts are selected
        if (reportFilters.includeCharts) {
          // Check if there's enough space
          if (doc.internal.pageSize.getHeight() - finalY - 30 < 120) {
            doc.addPage();
            finalY = 20;
          } else {
            finalY += 10;
          }
          
          doc.setFontSize(16);
          doc.setTextColor(39, 112, 180);
          doc.text('Days Until Expiry', 15, finalY);
          finalY += 10;
          
          // Create expiring products chart
          try {
            // Prepare data for chart
            const productNames = data.expiringProducts.map(p => p.name);
            const daysUntilExpiry = data.expiringProducts.map(p => p.days_until_expiry);
            
            // Set colors based on expiry days (red for close to expiry, yellow for medium, green for farther)
            const barColors = daysUntilExpiry.map(days => {
              if (days <= 7) return 'rgba(255, 99, 132, 0.7)'; // Red for <= 7 days
              if (days <= 30) return 'rgba(255, 205, 86, 0.7)'; // Yellow for <= 30 days
              return 'rgba(75, 192, 192, 0.7)'; // Green for > 30 days
            });
            
            const expiryConfig = {
              type: 'bar',
              data: {
                labels: productNames,
                datasets: [{
                  label: 'Days Until Expiry',
                  data: daysUntilExpiry,
                  backgroundColor: barColors,
                  borderColor: barColors.map(color => color.replace('0.7', '1')),
                  borderWidth: 1
                }]
              },
              options: {
                indexAxis: 'y',
                responsive: false,
                plugins: {
                  legend: { display: false },
                  title: { display: true, text: 'Days Until Expiry', font: { size: 14 } }
                },
                scales: {
                  x: { 
                    beginAtZero: true,
                    title: { display: true, text: 'Days' }
                  }
                },
                animation: false
              }
            };
            
            const expiryImage = await createChartImage(expiryConfig, 600, 300);
            doc.addImage(expiryImage, 'PNG', 15, finalY, 180, 90);
          } catch (e) {
            console.error("Error creating expiry chart:", e);
          }
        }
      }
      
      // Add footer to all pages with company name on right and page numbers on left
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        
        // Page number on left
        doc.text(`Page ${i} of ${pageCount}`, 15, doc.internal.pageSize.getHeight() - 10);
        
        // Company name on right
        doc.text("Prince Lanka Agency (Pvt) Ltd", doc.internal.pageSize.getWidth() - 15, 
                doc.internal.pageSize.getHeight() - 10, { align: 'right' });
      }
      
      // Open PDF in a new tab
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      window.open(blobUrl, '_blank');
    } catch (err) {
      setError("Failed to generate PDF preview");
      console.error("PDF preview error:", err);
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <>
      <div className={styles.GenerateSection}>
        <button className="btn btn-primary" onClick={generateReport} disabled={isLoading || generatingPdf}>
          {isLoading ? <FaSpinner className={styles.Spinner} /> : <FaFilePdf className={styles.ButtonIcon} />} 
          Download PDF
        </button>
        <button className="btn btn-info" onClick={previewPdf} disabled={isLoading || generatingPdf}>
          {generatingPdf ? <FaSpinner className={styles.Spinner} /> : <FaEye className={styles.ButtonIcon} />} 
          Preview PDF
        </button>
      </div>
      
      {(isLoading || generatingPdf) && (
        <div className={styles.LoadingContainer}>
          <FaSpinner className={styles.LoadingSpinner} />
          <p>{generatingPdf ? "Generating PDF preview..." : "Processing report data..."}</p>
        </div>
      )}
    </>
  );
}

export default InventoryReport;
