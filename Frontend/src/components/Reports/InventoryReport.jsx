import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaFilePdf, FaChartBar, FaSpinner } from "react-icons/fa";
import styles from '../../pages/admin/Reports.module.css';
import Chart from 'chart.js/auto';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import companyLogo from '../../assets/logoBlack.png'; // Update this path to your actual logo

function InventoryReport({ 
  currentDate, 
  isLoading, 
  setIsLoading, 
  previewData, 
  setPreviewData, 
  error, 
  setError, 
  validateInputs 
}) {
  const [charts, setCharts] = useState({ stockLevels: null, expiringSoon: null });
  const chartRefs = { stockLevels: useRef(null), expiringSoon: useRef(null) };
  
  // Helper function to format currency in Sri Lankan Rupees
  const formatCurrency = amount => `Rs ${Number(amount || 0).toFixed(2)}`;
  
  // Clean up charts when component unmounts
  useEffect(() => {
    return () => Object.values(charts).forEach(chart => chart && chart.destroy());
  }, [charts]);

  // Preview report data
  const previewReport = async () => {
    if (!validateInputs()) return;
    setIsLoading(true);
    setError("");
    
    try {
      const response = await axios.post("http://localhost:5000/api/reports/getData", {
        reportType: "Inventory Report"
      });
      setPreviewData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate preview");
      console.error("Preview error:", err);
    } finally {
      setIsLoading(false);
    }
  };

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
        reportType: "Inventory Report"
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
      
      // Add inventory summary section
      doc.setFontSize(16);
      doc.setTextColor(39, 112, 180);
      doc.text('Inventory Summary', 15, 85);
      
      // Create summary table data
      const summaryData = [
        ['Metric', 'Value'],
        ['Total Products', data.inventorySummary.totalProducts.toString()],
        ['Total Items in Stock', data.inventorySummary.totalItems.toString()],
        ['Total Inventory Value', formatCurrency(data.inventorySummary.totalValue)]
      ];
      
      // Add summary table
      autoTable(doc, {
        startY: 90,
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
      let finalY = 120;
      try { finalY = doc.lastAutoTable.finalY; } catch (e) {}
      
      // Add lowest stock products section
      const lowestStockY = finalY + 15;
      doc.setFontSize(16);
      doc.setTextColor(39, 112, 180);
      doc.text('Products with Lowest Stock', 15, lowestStockY);
      
      // Add lowest stock table
      autoTable(doc, {
        startY: lowestStockY + 5,
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
      
      try { finalY = doc.lastAutoTable.finalY; } catch (e) { finalY += 100; }
      
      // Check if there's enough space for stock levels chart
      if (doc.internal.pageSize.getHeight() - finalY - 30 < 120) {
        doc.addPage();
        finalY = 20;
      } else {
        finalY += 15;
      }
      
      // Add stock levels chart
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
      
      // Check if there's enough space for expiring products
      if (doc.internal.pageSize.getHeight() - finalY - 30 < 120) {
        doc.addPage();
        finalY = 20;
      } else {
        finalY += 15;
      }
      
      // Add expiring products section
      doc.setFontSize(16);
      doc.setTextColor(39, 112, 180);
      doc.text('Products Expiring Soon', 15, finalY);
      
      // Add expiring products table
      autoTable(doc, {
        startY: finalY + 5,
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
      
      try { finalY = doc.lastAutoTable.finalY; } catch (e) { finalY += 100; }
      
      // Check if there's enough space for expiring products chart
      if (doc.internal.pageSize.getHeight() - finalY - 30 < 120) {
        doc.addPage();
        finalY = 20;
      } else {
        finalY += 15;
      }
      
      // Add expiring products chart
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

  // Render charts when preview data changes
  useEffect(() => {
    if (!previewData) return;
    
    // Clean up existing charts
    Object.values(charts).forEach(chart => chart && chart.destroy());
    
    const newCharts = {};
    
    // Render stock levels chart
    const stockCtx = document.getElementById('stockLevelsChart');
    if (stockCtx && previewData.topSellingProducts && previewData.topSellingProducts.length > 0) {
      const productNames = previewData.topSellingProducts.map(p => p.name);
      const stockLevels = previewData.topSellingProducts.map(p => p.stock_qty);
      
      newCharts.stockLevels = new Chart(stockCtx, {
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
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Stock Levels of Top Selling Products' }
          },
          scales: {
            x: { 
              beginAtZero: true,
              title: { display: true, text: 'Stock Quantity' }
            }
          }
        }
      });
      
      chartRefs.stockLevels.current = stockCtx;
    }
    
    // Render expiring products chart
    const expiryCtx = document.getElementById('expiryChart');
    if (expiryCtx && previewData.expiringProducts && previewData.expiringProducts.length > 0) {
      const productNames = previewData.expiringProducts.map(p => p.name);
      const daysUntilExpiry = previewData.expiringProducts.map(p => p.days_until_expiry);
      
      // Set colors based on expiry days (red for close to expiry, yellow for medium, green for farther)
      const barColors = daysUntilExpiry.map(days => {
        if (days <= 7) return 'rgba(255, 99, 132, 0.7)'; // Red for <= 7 days
        if (days <= 30) return 'rgba(255, 205, 86, 0.7)'; // Yellow for <= 30 days
        return 'rgba(75, 192, 192, 0.7)'; // Green for > 30 days
      });
      
      newCharts.expiringSoon = new Chart(expiryCtx, {
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
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Days Until Expiry' }
          },
          scales: {
            x: { 
              beginAtZero: true,
              title: { display: true, text: 'Days' }
            }
          }
        }
      });
      
      chartRefs.expiringSoon.current = expiryCtx;
    }
    
    setCharts(newCharts);
  }, [previewData]);

  return (
    <>
      <div className={styles.GenerateSection}>
        <button className="btn btn-primary" onClick={generateReport} disabled={isLoading}>
          {isLoading ? <FaSpinner className={styles.Spinner} /> : <FaFilePdf className={styles.ButtonIcon} />} 
          Generate PDF Report
        </button>
        <button className="btn btn-secondary" onClick={previewReport} disabled={isLoading}>
          {isLoading ? <FaSpinner className={styles.Spinner} /> : <FaChartBar className={styles.ButtonIcon} />} 
          Preview
        </button>
      </div>

      <div className={styles.ReportPreviewContainer}>
        <div className={styles.PreviewHeader}>
          <h3>Report Preview</h3>
          <p>Click Preview to see current inventory data</p>
        </div>
        
        {isLoading ? (
          <div className={styles.LoadingContainer}>
            <FaSpinner className={styles.LoadingSpinner} />
            <p>Generating report preview...</p>
          </div>
        ) : previewData ? (
          <div className={styles.PreviewContent}>
            <div className={styles.ReportInfo}>
              <h4>Inventory Report</h4>
              <p>Current Date: {currentDate}</p>
            </div>
            
            {previewData.inventorySummary && (
              <div className={styles.SummarySection}>
                <h5>Inventory Summary</h5>
                <div className={styles.SummaryGrid}>
                  <div className={styles.SummaryCard}>
                    <h6>Total Products</h6>
                    <p className={styles.SummaryValue}>{previewData.inventorySummary.totalProducts}</p>
                  </div>
                  <div className={styles.SummaryCard}>
                    <h6>Total Items in Stock</h6>
                    <p className={styles.SummaryValue}>{previewData.inventorySummary.totalItems}</p>
                  </div>
                  <div className={styles.SummaryCard}>
                    <h6>Total Inventory Value</h6>
                    <p className={styles.SummaryValue}>{formatCurrency(previewData.inventorySummary.totalValue)}</p>
                  </div>
                </div>
              </div>
            )}
            
            {previewData.lowestStockProducts?.length > 0 && (
              <div className={styles.TopItemsSection}>
                <h5>Products with Lowest Stock</h5>
                <div className={styles.TopItemsTable}>
                  <table className="table table-striped">
                    <thead>
                      <tr><th>Product</th><th>Stock Qty</th><th>Unit Price</th><th>Total Value</th></tr>
                    </thead>
                    <tbody>
                      {previewData.lowestStockProducts.map((product, index) => (
                        <tr key={index}>
                          <td>{product.name}</td>
                          <td>{product.stock_qty}</td>
                          <td>{formatCurrency(product.price)}</td>
                          <td>{formatCurrency(product.stock_qty * product.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {previewData.topSellingProducts?.length > 0 && (
              <div className={styles.ChartSection}>
                <h5>Stock Levels of Top Selling Products</h5>
                <div className={styles.ChartContainer}>
                  <canvas id="stockLevelsChart" width="400" height="250"></canvas>
                </div>
              </div>
            )}
            
            {previewData.expiringProducts?.length > 0 && (
              <div className={styles.TopItemsSection}>
                <h5>Products Expiring Soon</h5>
                <div className={styles.TopItemsTable}>
                  <table className="table table-striped">
                    <thead>
                      <tr><th>Product</th><th>Stock Qty</th><th>Expiry Date</th><th>Days Until Expiry</th></tr>
                    </thead>
                    <tbody>
                      {previewData.expiringProducts.map((product, index) => (
                        <tr key={index}>
                          <td>{product.name}</td>
                          <td>{product.stock_qty}</td>
                          <td>{new Date(product.expiry_date).toLocaleDateString()}</td>
                          <td>{product.days_until_expiry}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {previewData.expiringProducts?.length > 0 && (
              <div className={styles.ChartSection}>
                <h5>Days Until Expiry</h5>
                <div className={styles.ChartContainer}>
                  <canvas id="expiryChart" width="400" height="250"></canvas>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.EmptyPreview}>
            <p>No report data to display. Click Preview to generate report data.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default InventoryReport;
