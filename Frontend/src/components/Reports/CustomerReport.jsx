import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaFilePdf, FaChartBar, FaSpinner } from "react-icons/fa";
import styles from '../../pages/admin/Reports.module.css';
import Chart from 'chart.js/auto';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import companyLogo from '../../assets/logoBlack.png'; // Update this path to your actual logo

function CustomerReport({ dateRange1, dateRange2, isComparing, isLoading, setIsLoading, previewData, setPreviewData, error, setError, validateInputs }) {
  const [charts, setCharts] = useState({ customers: null, topCustomers: null });
  const chartRefs = { customers: useRef(null), topCustomers: useRef(null) };
  
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
        reportType: "Customer Report",
        primaryRange: dateRange1,
        comparisonRange: isComparing ? dateRange2 : null
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
        reportType: "Customer Report",
        primaryRange: dateRange1,
        comparisonRange: isComparing ? dateRange2 : null
      });
      
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const currentDate = new Date().toLocaleDateString();
      
      // Add blue header
      doc.setFillColor(39, 112, 180);
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
      doc.addImage(companyLogo, 'PNG', 12, 5, 40, 30);
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(`Generated on: ${currentDate}`, 195, 20, { align: 'right' });
      
      // Add report title and date info
      doc.setFontSize(22);
      doc.setTextColor(39, 112, 180);
      doc.text('Customer Report', 105, 55, { align: 'center' });
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
      
      // Add customer summary section
      doc.setFontSize(16);
      doc.setTextColor(39, 112, 180);
      doc.text('Customer Summary', 15, 85);
      
      // Create summary table data
      const summaryData = [
        isComparing ? ['Metric', 'Primary Period', 'Comparison Period', 'Change %'] : ['Metric', 'Value', ''],
        ['New Customers', data.customerSummary.totalNewCustomers.toString(),
         isComparing ? data.comparisonSummary.totalNewCustomers.toString() : '',
         isComparing ? `${Number(data.customerSummary.newCustomersChange).toFixed(2)}%` : '']
      ];
      
      // Add summary table
      autoTable(doc, {
        startY: 90,
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
      let finalY = 120;
      try { finalY = doc.lastAutoTable.finalY; } catch (e) {}
      
      // Add new customers chart
      const chartTitleY = finalY + 15;
      doc.setFontSize(16);
      doc.setTextColor(39, 112, 180);
      doc.text('New Customer Registrations', 15, chartTitleY);
      
      // Create new customers chart config
      let chartConfig;
      
      if (isComparing) {
        chartConfig = {
          type: 'bar',
          data: {
            labels: ['Primary Period', 'Comparison Period'],
            datasets: [{
              label: 'New Customers',
              data: [
                Number(data.customerSummary.totalNewCustomers),
                Number(data.comparisonSummary.totalNewCustomers)
              ],
              backgroundColor: ['rgba(39, 112, 180, 0.7)', 'rgba(255, 99, 132, 0.7)'],
              borderColor: ['rgb(39, 112, 180)', 'rgb(255, 99, 132)'],
              borderWidth: 1
            }]
          },
          options: {
            responsive: false,
            plugins: {
              legend: { display: false },
              title: { display: true, text: 'New Customer Registrations Comparison', font: { size: 14 } }
            },
            scales: { 
              y: { 
                beginAtZero: true, 
                min: 0,
                title: { display: true, text: 'Number of Customers' } 
              } 
            },
            animation: false
          }
        };
      } else {
        // For single period, create a bar chart of new customers by day
        let labels = data.newCustomersByDay.map(day => {
          const date = new Date(day.date);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        });
        
        let customerCounts = data.newCustomersByDay.map(day => Number(day.total_new_customers));
        
        // If there's only one data point, add dummy points for better visualization
        if (labels.length === 1) {
          // Add empty labels and null data for better visualization
          labels = ['', labels[0], ''];
          customerCounts = [null, customerCounts[0], null];
        }
        
        chartConfig = {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'New Customers',
              data: customerCounts,
              backgroundColor: 'rgba(39, 112, 180, 0.7)',
              borderColor: 'rgb(39, 112, 180)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: false,
            plugins: {
              legend: { display: false },
              title: { display: true, text: 'Daily New Customer Registrations', font: { size: 14 } }
            },
            scales: { 
              y: { 
                beginAtZero: true, 
                min: 0,
                suggestedMax: Math.max(...customerCounts.filter(c => c !== null)) + 1,
                title: { display: true, text: 'Number of Customers' } 
              }
            },
            animation: false
          }
        };
      }
      
      // Add chart to PDF
      try {
        const chartImage = await createChartImage(chartConfig, 600, 300);
        doc.addImage(chartImage, 'PNG', 15, chartTitleY + 10, 180, 90);
        finalY = chartTitleY + 105;
      } catch (e) {
        console.error("Error creating chart:", e);
        finalY = chartTitleY + 20;
      }
      
      // Check if there's enough space for top customers table
      const spaceNeeded = 150;
      if (doc.internal.pageSize.getHeight() - finalY - 30 < spaceNeeded) {
        doc.addPage();
        finalY = 20;
      } else {
        finalY += 15;
      }
      
      // Add top customers section
      doc.setFontSize(16);
      doc.setTextColor(39, 112, 180);
      doc.text('Top Customers by Order Count', 15, finalY);
      finalY += 5;
      
      // Add top customers table
      if (isComparing) {
        // Comparison table
        const tableData = [
          ['Primary Period', '', '', 'Comparison Period', '', ''],
          ['Customer', 'Orders', 'Total Spent', 'Customer', 'Orders', 'Total Spent']
        ];
        
        for (let i = 0; i < Math.min(5, Math.max(data.topCustomers.length, data.comparisonTopCustomers.length)); i++) {
          const primary = data.topCustomers[i] || { customer_name: '-', order_count: 0, total_spent: 0 };
          const comparison = data.comparisonTopCustomers[i] || { customer_name: '-', order_count: 0, total_spent: 0 };
          
          tableData.push([
            primary.customer_name || '-', 
            primary.order_count.toString(), 
            formatCurrency(primary.total_spent),
            comparison.customer_name || '-', 
            comparison.order_count.toString(), 
            formatCurrency(comparison.total_spent)
          ]);
        }
        
        autoTable(doc, {
          startY: finalY,
          head: tableData.slice(0, 2),
          body: tableData.slice(2),
          theme: 'grid',
          pageBreak: 'avoid',
          headStyles: { fillColor: [39, 112, 180], textColor: [255, 255, 255], fontStyle: 'bold' },
          columnStyles: {
            1: { halign: 'right' }, 2: { halign: 'right' },
            4: { halign: 'right' }, 5: { halign: 'right' }
          }
        });
      } else {
        // Single period top customers table
        autoTable(doc, {
          startY: finalY,
          head: [['Customer', 'Order Count', 'Total Spent']],
          body: data.topCustomers.map(customer => [
            customer.customer_name || '-',
            customer.order_count.toString(),
            formatCurrency(customer.total_spent)
          ]),
          theme: 'grid',
          pageBreak: 'avoid',
          headStyles: { fillColor: [39, 112, 180], textColor: [255, 255, 255], fontStyle: 'bold' },
          columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } }
        });
      }
      
      try { finalY = doc.lastAutoTable.finalY; } catch (e) { finalY += 100; }
      
      // Check space for top customers chart
      if (doc.internal.pageSize.getHeight() - finalY - 20 < 100) {
        doc.addPage();
        finalY = 20;
      } else {
        finalY += 15;
      }
      
      // Add top customers chart
      doc.setFontSize(16);
      doc.setTextColor(39, 112, 180);
      doc.text('Top 5 Customers by Revenue', 15, finalY);
      finalY += 10;
      
      // Create top customers chart
      try {
        const top5Customers = data.topCustomers.slice(0, 5);
        
        const topCustomersConfig = {
          type: 'bar',
          data: {
            labels: top5Customers.map(c => c.customer_name),
            datasets: [{
              label: 'Total Spent',
              data: top5Customers.map(c => Number(c.total_spent)),
              backgroundColor: [
                'rgba(39, 112, 180, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)',
                'rgba(255, 159, 64, 0.8)'
              ],
              borderColor: 'white',
              borderWidth: 1
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: false,
            plugins: {
              legend: { display: false },
              title: { display: true, text: 'Top 5 Customers by Revenue', font: { size: 14 } }
            },
            scales: {
              x: { 
                beginAtZero: true,
                min: 0,
                title: { display: true, text: 'Revenue (Rs)' }
              }
            },
            animation: false
          }
        };
        
        const topCustomersImage = await createChartImage(topCustomersConfig, 600, 300);
        doc.addImage(topCustomersImage, 'PNG', 15, finalY, 180, 90);
      } catch (e) {
        console.error("Error creating top customers chart:", e);
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
      doc.save(`Customer_Report_${new Date().toISOString().split('T')[0]}.pdf`);
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
    
    // Render new customers chart
    const ctx = document.getElementById('customersChart');
    if (ctx) {
      if (isComparing) {
        // Bar chart comparing new customers between periods
        newCharts.customers = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Primary Period', 'Comparison Period'],
            datasets: [{
              label: 'New Customers',
              data: [
                Number(previewData.customerSummary.totalNewCustomers),
                Number(previewData.comparisonSummary.totalNewCustomers)
              ],
              backgroundColor: ['rgba(39, 112, 180, 0.7)', 'rgba(255, 99, 132, 0.7)'],
              borderColor: ['rgb(39, 112, 180)', 'rgb(255, 99, 132)'],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: true, text: 'New Customer Registrations Comparison' }
            },
            scales: {
              y: { 
                beginAtZero: true, 
                min: 0,
                title: { display: true, text: 'Number of Customers' } 
              }
            }
          }
        });
      } else {
        // Bar chart showing daily new customer registrations
        let labels = previewData.newCustomersByDay.map(day => {
          const date = new Date(day.date);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        });
        
        let customerCounts = previewData.newCustomersByDay.map(day => Number(day.total_new_customers));
        
        // If there's only one data point, add dummy points for better visualization
        if (labels.length === 1) {
          // Add empty labels and null data for better visualization
          labels = ['', labels[0], ''];
          customerCounts = [null, customerCounts[0], null];
        }
        
        newCharts.customers = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'New Customers',
              data: customerCounts,
              backgroundColor: 'rgba(39, 112, 180, 0.7)',
              borderColor: 'rgb(39, 112, 180)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: true, text: 'Daily New Customer Registrations' }
            },
            scales: {
              y: { 
                beginAtZero: true, 
                min: 0,
                suggestedMax: Math.max(...customerCounts.filter(c => c !== null)) + 1,
                title: { display: true, text: 'Number of Customers' } 
              }
            }
          }
        });
      }
      
      chartRefs.customers.current = ctx;
    }
    
    // Render top customers chart
    const topCtx = document.getElementById('topCustomersChart');
    if (topCtx && previewData.topCustomers && previewData.topCustomers.length > 0) {
      const top5Customers = previewData.topCustomers.slice(0, 5);
      
      newCharts.topCustomers = new Chart(topCtx, {
        type: 'bar',
        data: {
          labels: top5Customers.map(c => c.customer_name),
          datasets: [{
            label: 'Total Spent',
            data: top5Customers.map(c => Number(c.total_spent)),
            backgroundColor: [
              'rgba(39, 112, 180, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)'
            ],
            borderColor: 'white',
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Top 5 Customers by Revenue' }
          },
          scales: {
            x: { 
              beginAtZero: true, 
              min: 0,
              title: { display: true, text: 'Revenue (Rs)' } 
            }
          }
        }
      });
      
      chartRefs.topCustomers.current = topCtx;
    }
    
    setCharts(newCharts);
  }, [previewData, isComparing]);

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
          <p>Select report parameters and click Preview to see data</p>
        </div>
        
        {isLoading ? (
          <div className={styles.LoadingContainer}>
            <FaSpinner className={styles.LoadingSpinner} />
            <p>Generating report preview...</p>
          </div>
        ) : previewData ? (
          <div className={styles.PreviewContent}>
            <div className={styles.ReportInfo}>
              <h4>Customer Report</h4>
              <p>Primary Period: {dateRange1.startDate} to {dateRange1.endDate}</p>
              {isComparing && <p>Comparison Period: {dateRange2.startDate} to {dateRange2.endDate}</p>}
            </div>
            
            {previewData.customerSummary && (
              <div className={styles.SummarySection}>
                <h5>Customer Summary</h5>
                <div className={styles.SummaryGrid}>
                  <div className={styles.SummaryCard}>
                    <h6>New Customers</h6>
                    <p className={styles.SummaryValue}>{previewData.customerSummary.totalNewCustomers}</p>
                    {previewData.comparisonSummary && (
                      <p className={styles.ComparisonValue}>
                        {previewData.customerSummary.newCustomersChange > 0 ? '↑' : '↓'} 
                        {Math.abs(previewData.customerSummary.newCustomersChange).toFixed(2)}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className={styles.ChartSection}>
              <h5>New Customer Registrations</h5>
              <div className={styles.ChartContainer}>
                <canvas id="customersChart" width="400" height="200"></canvas>
              </div>
            </div>
            
            {previewData.topCustomers?.length > 0 && (
              <div className={styles.TopItemsSection}>
                <h5>Top Customers by Order Count</h5>
                <div className={styles.TopItemsTable}>
                  <table className="table table-striped">
                    <thead>
                      <tr><th>Customer</th><th>Order Count</th><th>Total Spent</th></tr>
                    </thead>
                    <tbody>
                      {previewData.topCustomers.map((customer, index) => (
                        <tr key={index}>
                          <td>{customer.customer_name}</td>
                          <td>{customer.order_count}</td>
                          <td>{formatCurrency(customer.total_spent)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {previewData.topCustomers?.length > 0 && (
              <div className={styles.ChartSection}>
                <h5>Top 5 Customers by Revenue</h5>
                <div className={styles.ChartContainer}>
                  <canvas id="topCustomersChart" width="400" height="250"></canvas>
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

export default CustomerReport;
