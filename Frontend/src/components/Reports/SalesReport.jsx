import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaFilePdf, FaChartBar, FaSpinner, FaEye } from "react-icons/fa";
import styles from '../../pages/admin/Reports.module.css';
import Chart from 'chart.js/auto';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import companyLogo from '../../assets/logoBlack.png'; // Update this path to your actual logo

function SalesReport({ dateRange1, dateRange2, isComparing, isLoading, setIsLoading, previewData, setPreviewData, error, setError, validateInputs, reportFilters }) {
  const [charts, setCharts] = useState({ sales: null, primaryPie: null, comparisonPie: null });
  const chartRefs = { sales: useRef(null), primaryPie: useRef(null), comparisonPie: useRef(null) };
  const [generatingPdf, setGeneratingPdf] = useState(false);
  
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
        reportType: "Sales Report",
        primaryRange: dateRange1,
        comparisonRange: isComparing ? dateRange2 : null,
        filters: reportFilters
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

  // Generate PDF document and return it
  const generatePdfDocument = async () => {
    if (!validateInputs()) return null;
    
    try {
      // Get data and setup PDF
      const { data } = await axios.post("http://localhost:5000/api/reports/getData", {
        reportType: "Sales Report",
        primaryRange: dateRange1,
        comparisonRange: isComparing ? dateRange2 : null,
        filters: reportFilters
      });
      
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const currentDate = new Date().toLocaleDateString();
      
      // Add blue header
      doc.setFillColor(39, 112, 180);
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
      doc.addImage(companyLogo, 'PNG',  12, -10, 50, 60);
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(`Generated on: ${currentDate}`, 195, 20, { align: 'right' });
      
      // Add report title and date info
      doc.setFontSize(22);
      doc.setTextColor(39, 112, 180);
      doc.text('Sales Report', 105, 55, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text(`Primary Period: ${dateRange1.startDate} to ${dateRange1.endDate}`, 105, 65, { align: 'center' });
      if (isComparing) {
        doc.text(`Comparison Period: ${dateRange2.startDate} to ${dateRange2.endDate}`, 105, 72, { align: 'center' });
      }
      
      // Add blue horizontal line
      doc.setDrawColor(39, 112, 180);
      doc.setLineWidth(0.5);
      doc.line(15, 75, doc.internal.pageSize.getWidth() - 15, 75);
      
      let finalY = 75;
      
      // Add sales summary section if selected
      if (reportFilters.includeSummary && data.salesSummary) {
        finalY += 10;
        doc.setFontSize(16);
        doc.setTextColor(39, 112, 180);
        doc.text('Sales Summary', 15, finalY);
        finalY += 5;
        
        // Create summary table data
        const summaryData = [
          isComparing ? ['Metric', 'Primary Period', 'Comparison Period', 'Change %'] : ['Metric', 'Value'],
          ['Total Revenue', formatCurrency(data.salesSummary.totalRevenue),
           isComparing ? formatCurrency(data.comparisonSummary.totalRevenue) : '',
           isComparing ? `${Number(data.salesSummary.revenueChange).toFixed(2)}%` : ''],
          ['Total Orders', data.salesSummary.totalOrders.toString(),
           isComparing ? data.comparisonSummary.totalOrders.toString() : '',
           isComparing ? `${Number(data.salesSummary.ordersChange).toFixed(2)}%` : ''],
          ['Avg. Order Value', formatCurrency(data.salesSummary.avgOrderValue),
           isComparing ? formatCurrency(data.comparisonSummary.avgOrderValue) : '',
           isComparing ? `${Number(data.salesSummary.avgOrderChange).toFixed(2)}%` : '']
        ];
        
        // Add summary table
        autoTable(doc, {
          startY: finalY,
          head: [summaryData[0]],
          body: summaryData.slice(1),
          theme: 'grid',
          headStyles: { fillColor: [39, 112, 180], textColor: [255, 255, 255], fontStyle: 'bold' },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: isComparing ? 45 : 60, halign: 'right' },
            2: { cellWidth: isComparing ? 45 : 40, halign: 'right' },
            3: isComparing ? { cellWidth: 40, halign: 'right' } : {}
          }
        });
        
        // Get position after table
        finalY = doc.lastAutoTable.finalY + 15;
      }
      
      // Add sales comparison chart if charts are selected
      if (reportFilters.includeCharts) {
        doc.setFontSize(16);
        doc.setTextColor(39, 112, 180);
        doc.text('Sales Comparison', 15, finalY);
        
        // Create sales chart config
        const chartConfig = {
          type: 'bar',
          data: {
            labels: isComparing ? ['Primary Period', 'Comparison Period'] : ['Total Revenue'],
            datasets: [{
              label: 'Total Revenue',
              data: isComparing 
                ? [Number(data.salesSummary.totalRevenue), Number(data.comparisonSummary.totalRevenue)]
                : [Number(data.salesSummary.totalRevenue)],
              backgroundColor: isComparing 
                ? ['rgba(39, 112, 180, 0.7)', 'rgba(255, 99, 132, 0.7)']
                : ['rgba(39, 112, 180, 0.7)'],
              borderColor: isComparing 
                ? ['rgb(39, 112, 180)', 'rgb(255, 99, 132)']
                : ['rgb(39, 112, 180)'],
              borderWidth: 1
            }]
          },
          options: {
            responsive: false,
            plugins: {
              legend: { display: false },
              title: { display: true, text: 'Total Revenue Comparison', font: { size: 14 } }
            },
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Revenue (Rs)' } } },
            animation: false
          }
        };
        
        // Add chart to PDF
        const chartImage = await createChartImage(chartConfig, 600, 300);
        doc.addImage(chartImage, 'PNG', 15, finalY + 10, 180, 90);
        finalY += 105;
      }
      
      // Check if there's enough space for products table
      if (doc.internal.pageSize.getHeight() - finalY - 30 < 100) {
        doc.addPage();
        finalY = 20;
      } else {
        finalY += 15;
      }
      
      // Add top products section if selected
      if (reportFilters.includeProducts && data.topProducts?.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(39, 112, 180);
        doc.text('Top Selling Products', 15, finalY);
        finalY += 5;
        
        // Add products table
        autoTable(doc, {
          startY: finalY,
          head: [['Product', 'Quantity Sold', 'Revenue']],
          body: data.topProducts.map(p => [
            p.name || '-',
            p.quantity.toString(),
            formatCurrency(p.revenue)
          ]),
          theme: 'grid',
          pageBreak: 'avoid',
          headStyles: { fillColor: [39, 112, 180], textColor: [255, 255, 255], fontStyle: 'bold' },
          columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } }
        });
        
        finalY = doc.lastAutoTable.finalY + 15;
      }
      
      // Check space for categories
      if (reportFilters.includeCategories && data.topCategories?.length > 0) {
        if (doc.internal.pageSize.getHeight() - finalY - 20 < 80) {
          doc.addPage();
          finalY = 20;
        } else {
          finalY += 10;
        }
        
        // Add categories section
        doc.setFontSize(16);
        doc.setTextColor(39, 112, 180);
        doc.text('Top Selling Categories', 15, finalY);
        
        autoTable(doc, {
          startY: finalY + 5,
          head: [['Category', 'Products Sold', 'Revenue']],
          body: data.topCategories.map(c => [
            c.name || '-',
            c.quantity.toString(),
            formatCurrency(c.revenue)
          ]),
          theme: 'grid',
          pageBreak: 'avoid',
          headStyles: { fillColor: [39, 112, 180], textColor: [255, 255, 255], fontStyle: 'bold' },
          columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } }
        });
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
      
      return doc;
    } catch (err) {
      console.error("PDF generation error:", err);
      return null;
    }
  };

  // Generate and download PDF report
  const generateReport = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const doc = await generatePdfDocument();
      if (doc) {
        doc.save(`Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      } else {
        setError("Failed to generate PDF report");
      }
    } catch (err) {
      setError("Failed to generate PDF report");
      console.error("PDF download error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate and preview PDF report in a new tab
  const previewPdf = async () => {
    setGeneratingPdf(true);
    setError("");
    
    try {
      const doc = await generatePdfDocument();
      if (doc) {
        // Open PDF in a new tab
        const pdfBlob = doc.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);
        window.open(blobUrl, '_blank');
      } else {
        setError("Failed to generate PDF preview");
      }
    } catch (err) {
      setError("Failed to generate PDF preview");
      console.error("PDF preview error:", err);
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Render charts when preview data changes
  useEffect(() => {
    if (!previewData) return;
    
    // Clean up existing charts
    Object.values(charts).forEach(chart => chart && chart.destroy());
    
    const newCharts = {};
    
    // Only render charts if they're selected in filters
    if (reportFilters.includeCharts) {
      // Render sales chart
      if (previewData.salesSummary) {
        const ctx = document.getElementById('salesChart');
        if (ctx) {
          const primaryRevenue = Number(previewData.salesSummary.totalRevenue);
          const comparisonRevenue = isComparing && previewData.comparisonSummary 
            ? Number(previewData.comparisonSummary.totalRevenue) : 0;
          
          newCharts.sales = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: isComparing ? ['Primary Period', 'Comparison Period'] : ['Total Revenue'],
              datasets: [{
                label: 'Total Revenue',
                data: isComparing ? [primaryRevenue, comparisonRevenue] : [primaryRevenue],
                backgroundColor: isComparing 
                  ? ['rgba(39, 112, 180, 0.7)', 'rgba(255, 99, 132, 0.7)']
                  : ['rgba(39, 112, 180, 0.7)'],
                borderColor: isComparing 
                  ? ['rgb(39, 112, 180)', 'rgb(255, 99, 132)']
                  : ['rgb(39, 112, 180)'],
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: true, text: 'Total Revenue Comparison' }
              },
              scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Revenue (Rs)' } }
              }
            }
          });
          chartRefs.sales.current = ctx;
        }
      }
      
      // Render primary pie chart
      if (previewData.topProducts?.length > 0) {
        const ctx = document.getElementById('primaryProductsChart');
        if (ctx) {
          const productsData = previewData.topProducts.map(p => ({
            name: p.name || 'Unknown',
            quantity: Number(p.quantity || 0)
          }));
          
          if (productsData.every(p => p.quantity === 0)) {
            productsData.forEach((p, i) => { p.quantity = 10 + i * 5; });
          }
          
          newCharts.primaryPie = new Chart(ctx, {
            type: 'pie',
            data: {
              labels: productsData.map(p => p.name),
              datasets: [{
                data: productsData.map(p => p.quantity),
                backgroundColor: [
                  'rgba(39, 112, 180, 0.8)', 'rgba(54, 162, 235, 0.8)', 
                  'rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.8)', 
                  'rgba(255, 159, 64, 0.8)'
                ],
                borderColor: 'white',
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: { position: 'right' },
                title: { display: true, text: 'Primary Period - Top Products by Quantity', align: 'start' }
              }
            }
          });
          chartRefs.primaryPie.current = ctx;
        }
      }
      
      // Render comparison pie chart
      if (previewData.comparisonTopProducts?.length > 0) {
        const ctx = document.getElementById('comparisonProductsChart');
        if (ctx) {
          const productsData = previewData.comparisonTopProducts.map(p => ({
            name: p.name || 'Unknown',
            quantity: Number(p.quantity || 0)
          }));
          
          if (productsData.every(p => p.quantity === 0)) {
            productsData.forEach((p, i) => { p.quantity = 10 + i * 5; });
          }
          
          newCharts.comparisonPie = new Chart(ctx, {
            type: 'pie',
            data: {
              labels: productsData.map(p => p.name),
              datasets: [{
                data: productsData.map(p => p.quantity),
                backgroundColor: [
                  'rgba(255, 99, 132, 0.8)', 'rgba(255, 159, 64, 0.8)', 
                  'rgba(255, 205, 86, 0.8)', 'rgba(75, 192, 192, 0.8)', 
                  'rgba(54, 162, 235, 0.8)'
                ],
                borderColor: 'white',
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: { position: 'right' },
                title: { display: true, text: 'Comparison Period - Top Products by Quantity', align: 'start' }
              }
            }
          });
          chartRefs.comparisonPie.current = ctx;
        }
      }
    }
    
    setCharts(newCharts);
  }, [previewData, isComparing, reportFilters]);

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
        <button className="btn btn-secondary" onClick={previewReport} disabled={isLoading || generatingPdf}>
          {isLoading ? <FaSpinner className={styles.Spinner} /> : <FaChartBar className={styles.ButtonIcon} />} 
          Preview Data
        </button>
      </div>

      <div className={styles.ReportPreviewContainer}>
        <div className={styles.PreviewHeader}>
          <h3>Report Preview</h3>
          <p>Select report parameters and click Preview to see data</p>
        </div>
        
        {isLoading || generatingPdf ? (
          <div className={styles.LoadingContainer}>
            <FaSpinner className={styles.LoadingSpinner} />
            <p>{generatingPdf ? "Generating PDF preview..." : "Generating report preview..."}</p>
          </div>
        ) : previewData ? (
          <div className={styles.PreviewContent}>
            <div className={styles.ReportInfo}>
              <h4>Sales Report</h4>
              <p>Primary Period: {dateRange1.startDate} to {dateRange1.endDate}</p>
              {isComparing && <p>Comparison Period: {dateRange2.startDate} to {dateRange2.endDate}</p>}
            </div>
            
            {/* Sales Summary - Conditionally rendered based on filter */}
            {reportFilters.includeSummary && previewData.salesSummary && (
              <div className={styles.SummarySection}>
                <h5>Sales Summary</h5>
                <div className={styles.SummaryGrid}>
                  <div className={styles.SummaryCard}>
                    <h6>Total Revenue</h6>
                    <p className={styles.SummaryValue}>{formatCurrency(previewData.salesSummary.totalRevenue)}</p>
                    {previewData.comparisonSummary && (
                      <p className={styles.ComparisonValue}>
                        {previewData.salesSummary.revenueChange > 0 ? '↑' : '↓'} 
                        {Math.abs(previewData.salesSummary.revenueChange).toFixed(2)}%
                      </p>
                    )}
                  </div>
                  <div className={styles.SummaryCard}>
                    <h6>Total Orders</h6>
                    <p className={styles.SummaryValue}>{previewData.salesSummary.totalOrders}</p>
                    {previewData.comparisonSummary && (
                      <p className={styles.ComparisonValue}>
                        {previewData.salesSummary.ordersChange > 0 ? '↑' : '↓'} 
                        {Math.abs(previewData.salesSummary.ordersChange).toFixed(2)}%
                      </p>
                    )}
                  </div>
                  <div className={styles.SummaryCard}>
                    <h6>Avg. Order Value</h6>
                    <p className={styles.SummaryValue}>{formatCurrency(previewData.salesSummary.avgOrderValue)}</p>
                    {previewData.comparisonSummary && (
                      <p className={styles.ComparisonValue}>
                        {previewData.salesSummary.avgOrderChange > 0 ? '↑' : '↓'} 
                        {Math.abs(previewData.salesSummary.avgOrderChange).toFixed(2)}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Charts - Conditionally rendered based on filter */}
            {reportFilters.includeCharts && previewData.salesSummary && (
              <div className={styles.ChartSection}>
                <h5>Sales Comparison</h5>
                <div className={styles.ChartContainer}>
                  <canvas id="salesChart" width="400" height="200"></canvas>
                </div>
              </div>
            )}
            
            {/* Top Products - Conditionally rendered based on filter */}
            {reportFilters.includeProducts && previewData.topProducts?.length > 0 && (
              <div className={styles.ProductsSection}>
                <h5>Top Selling Products</h5>
                <div className={styles.ProductsContainer}>
                  <div className={styles.ProductsColumn}>
                    <h6>Primary Period</h6>
                    <div className={styles.TopItemsTable}>
                      <table className="table table-striped">
                        <thead>
                          <tr><th>Product</th><th>Quantity</th><th>Revenue</th></tr>
                        </thead>
                        <tbody>
                          {previewData.topProducts.map((product, index) => (
                            <tr key={index}>
                              <td>{product.name}</td>
                              <td>{product.quantity}</td>
                              <td>{formatCurrency(product.revenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {reportFilters.includeCharts && (
                      <div className={styles.PieChartContainer}>
                        <canvas id="primaryProductsChart" width="300" height="200"></canvas>
                      </div>
                    )}
                  </div>
                  
                  {previewData.comparisonTopProducts?.length > 0 && (
                    <div className={styles.ProductsColumn}>
                      <h6>Comparison Period</h6>
                      <div className={styles.TopItemsTable}>
                        <table className="table table-striped">
                          <thead>
                            <tr><th>Product</th><th>Quantity</th><th>Revenue</th></tr>
                          </thead>
                          <tbody>
                            {previewData.comparisonTopProducts.map((product, index) => (
                              <tr key={index}>
                                <td>{product.name}</td>
                                <td>{product.quantity}</td>
                                <td>{formatCurrency(product.revenue)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {reportFilters.includeCharts && (
                        <div className={styles.PieChartContainer}>
                          <canvas id="comparisonProductsChart" width="300" height="200"></canvas>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Categories - Conditionally rendered based on filter */}
            {reportFilters.includeCategories && previewData.topCategories?.length > 0 && (
              <div className={styles.TopItemsSection}>
                <h5>Top Selling Categories</h5>
                <div className={styles.TopItemsTable}>
                  <table className="table table-striped">
                    <thead>
                      <tr><th>Category</th><th>Products Sold</th><th>Revenue</th></tr>
                    </thead>
                    <tbody>
                      {previewData.topCategories.map((category, index) => (
                        <tr key={index}>
                          <td>{category.name}</td>
                          <td>{category.quantity}</td>
                          <td>{formatCurrency(category.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

export default SalesReport;
