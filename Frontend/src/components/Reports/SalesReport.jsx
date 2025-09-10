import React, { useState } from "react";
import axios from "axios";
import { FaFilePdf, FaSpinner, FaEye } from "react-icons/fa";
import styles from '../../pages/admin/Reports.module.css';
import Chart from 'chart.js/auto';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import companyLogo from '../../assets/logoBlack.png'; // Update this path to your actual logo

function SalesReport({ dateRange1, dateRange2, isComparing, isLoading, setIsLoading, error, setError, validateInputs, reportFilters }) {
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
        
        // Add primary pie chart for top products if charts are selected
        if (reportFilters.includeCharts && data.topProducts.length > 0) {
          // Create primary pie chart config
          const primaryPieConfig = {
            type: 'pie',
            data: {
              labels: data.topProducts.map(p => p.name || 'Unknown'),
              datasets: [{
                data: data.topProducts.map(p => Number(p.quantity || 0)),
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
              responsive: false,
              plugins: {
                legend: { position: 'right', labels: { boxWidth: 12, font: { size: 10 } } },
                title: { display: true, text: 'Primary Period - Top Products by Quantity', font: { size: 12 } }
              },
              animation: false
            }
          };
          
          // Add primary pie chart to PDF
          const primaryPieImage = await createChartImage(primaryPieConfig, 400, 300);
          
          if (isComparing && data.comparisonTopProducts?.length > 0) {
            // If comparing, add primary pie chart on left side
            doc.addImage(primaryPieImage, 'PNG', 10, finalY, 90, 70);
            
            // Create comparison pie chart config
            const comparisonPieConfig = {
              type: 'pie',
              data: {
                labels: data.comparisonTopProducts.map(p => p.name || 'Unknown'),
                datasets: [{
                  data: data.comparisonTopProducts.map(p => Number(p.quantity || 0)),
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
                responsive: false,
                plugins: {
                  legend: { position: 'right', labels: { boxWidth: 12, font: { size: 10 } } },
                  title: { display: true, text: 'Comparison Period - Top Products by Quantity', font: { size: 12 } }
                },
                animation: false
              }
            };
            
            // Add comparison pie chart to PDF on right side
            const comparisonPieImage = await createChartImage(comparisonPieConfig, 400, 300);
            doc.addImage(comparisonPieImage, 'PNG', 105, finalY, 90, 70);
            
            finalY += 75;
          } else {
            // If not comparing, add primary pie chart centered
            doc.addImage(primaryPieImage, 'PNG', 50, finalY, 110, 85);
            finalY += 90;
          }
        }
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

export default SalesReport;
