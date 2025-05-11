import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaFilePdf, FaChartBar, FaSpinner } from "react-icons/fa";
import styles from '../../pages/admin/Reports.module.css';
import Chart from 'chart.js/auto';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import companyLogo from '../../assets/logoBlack.png'; // Update this path to your actual logo

function SalesReport({ 
  dateRange1, 
  dateRange2, 
  isComparing, 
  isLoading, 
  setIsLoading, 
  previewData, 
  setPreviewData, 
  error, 
  setError, 
  validateInputs 
}) {
  const [salesChart, setSalesChart] = useState(null);
  const [primaryPieChart, setPrimaryPieChart] = useState(null);
  const [comparisonPieChart, setComparisonPieChart] = useState(null);
  
  const salesChartRef = useRef(null);
  const primaryPieChartRef = useRef(null);
  const comparisonPieChartRef = useRef(null);

  // Helper function to format currency in Sri Lankan Rupees
  const formatCurrency = (amount) => `Rs ${Number(amount || 0).toFixed(2)}`;

  // Clean up charts when component unmounts
  useEffect(() => {
    return () => {
      if (salesChart) salesChart.destroy();
      if (primaryPieChart) primaryPieChart.destroy();
      if (comparisonPieChart) comparisonPieChart.destroy();
    };
  }, [salesChart, primaryPieChart, comparisonPieChart]);

  // Preview report data
  const previewReport = async () => {
    if (!validateInputs()) return;
    setIsLoading(true);
    setError("");
    
    try {
      const response = await axios.post("http://localhost:5000/api/reports/getData", {
        reportType: "Sales Report",
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
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      const chart = new Chart(ctx, config);
      
      setTimeout(() => {
        const imageUrl = canvas.toDataURL('image/png');
        chart.destroy();
        resolve(imageUrl);
      }, 500);
    });
  };

  // Function to add header to first page only
  const addHeaderToFirstPage = (doc, currentDate) => {
    // Add blue header background
    doc.setFillColor(39, 112, 180);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
    
    // Add larger logo
    const img = new Image();
    img.src = companyLogo;
    doc.addImage(img, 'PNG', 12, -10, 50, 60);
    
    // Add current date at right side of header
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`Generated on: ${currentDate}`, 195, 20, { align: 'right' });
  };

  // Generate PDF report
  const generateReport = async () => {
    if (!validateInputs()) return;
    setIsLoading(true);
    setError("");
    
    try {
      // Get report data
      const response = await axios.post("http://localhost:5000/api/reports/getData", {
        reportType: "Sales Report",
        primaryRange: dateRange1,
        comparisonRange: isComparing ? dateRange2 : null
      });
      
      const reportData = response.data;
      
      // Initialize PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const currentDate = new Date().toLocaleDateString();
      
      // Add header to first page only
      addHeaderToFirstPage(doc, currentDate);
      
      // Add report title below header
      doc.setFontSize(22);
      doc.setTextColor(39, 112, 180);
      doc.text('Sales Report', 105, 55, { align: 'center' });
      
      // Add date information centered
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text(`Primary Period: ${dateRange1.startDate} to ${dateRange1.endDate}`, 105, 65, { align: 'center' });
      
      if (isComparing) {
        doc.text(`Comparison Period: ${dateRange2.startDate} to ${dateRange2.endDate}`, 105, 72, { align: 'center' });
      }
      
      // Add blue horizontal line after date range
      doc.setDrawColor(39, 112, 180);
      doc.setLineWidth(0.5);
      doc.line(15, 75, doc.internal.pageSize.getWidth() - 15, 75);
      
      // Add sales summary section
      doc.setFontSize(16);
      doc.setTextColor(39, 112, 180);
      doc.text('Sales Summary', 15, 85);
      
      // Create summary table
      const summaryData = [
        isComparing 
          ? ['Metric', 'Primary Period', 'Comparison Period', 'Change %']
          : ['Metric', 'Value', ''],
        [
          'Total Revenue', 
          formatCurrency(reportData.salesSummary.totalRevenue),
          isComparing ? formatCurrency(reportData.comparisonSummary.totalRevenue) : '',
          isComparing ? `${Number(reportData.salesSummary.revenueChange).toFixed(2)}%` : ''
        ],
        [
          'Total Orders', 
          Number(reportData.salesSummary.totalOrders).toString(),
          isComparing ? Number(reportData.comparisonSummary.totalOrders).toString() : '',
          isComparing ? `${Number(reportData.salesSummary.ordersChange).toFixed(2)}%` : ''
        ],
        [
          'Avg. Order Value', 
          formatCurrency(reportData.salesSummary.avgOrderValue),
          isComparing ? formatCurrency(reportData.comparisonSummary.avgOrderValue) : '',
          isComparing ? `${Number(reportData.salesSummary.avgOrderChange).toFixed(2)}%` : ''
        ]
      ];
      
      // Add summary table to PDF
      autoTable(doc, {
        startY: 90,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        theme: 'grid',
        headStyles: { 
          fillColor: [39, 112, 180], 
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: isComparing ? 45 : 60, halign: 'right' },
          2: { cellWidth: isComparing ? 45 : 40, halign: 'right' },
          3: isComparing ? { cellWidth: 40, halign: 'right' } : {}
        },
        tableWidth: 'wrap'
      });
      
      // Get position after table
      let finalY = 120;
      try { finalY = doc.lastAutoTable.finalY; } catch (e) {}
      
      // Add sales comparison section
      const chartTitleY = finalY + 15;
      doc.setFontSize(16);
      doc.setTextColor(39, 112, 180);
      doc.text('Sales Comparison', 15, chartTitleY);
      
      // Create sales chart config
      const labels = isComparing ? ['Primary Period', 'Comparison Period'] : ['Total Revenue'];
      const data = isComparing 
        ? [Number(reportData.salesSummary.totalRevenue), Number(reportData.comparisonSummary.totalRevenue)]
        : [Number(reportData.salesSummary.totalRevenue)];
      
      const colors = isComparing 
        ? ['rgba(39, 112, 180, 0.7)', 'rgba(255, 99, 132, 0.7)']
        : ['rgba(39, 112, 180, 0.7)'];
      
      const borderColors = isComparing 
        ? ['rgb(39, 112, 180)', 'rgb(255, 99, 132)']
        : ['rgb(39, 112, 180)'];
      
      const salesChartConfig = {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Total Revenue',
            data,
            backgroundColor: colors,
            borderColor: borderColors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: false,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: 'Total Revenue Comparison',
              font: { size: 14 }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Revenue (Rs)'
              }
            }
          },
          animation: false
        }
      };
      
      // Add chart to PDF
      try {
        const salesChartImage = await createChartImage(salesChartConfig, 600, 300);
        doc.addImage(salesChartImage, 'PNG', 15, chartTitleY + 10, 180, 90);
        finalY = chartTitleY + 105;
      } catch (e) {
        console.error("Error creating sales chart:", e);
        finalY = chartTitleY + 20;
      }
      
      // Add top products section
      const topProductsY = finalY + 15;
      doc.setFontSize(16);
      doc.setTextColor(39, 112, 180);
      doc.text('Top Selling Products', 15, topProductsY);
      
      // Add top products table
      if (isComparing) {
        // Comparison table
        const topProductsTableData = [
          ['Primary Period', '', '', 'Comparison Period', '', ''],
          ['Product', 'Quantity', 'Revenue', 'Product', 'Quantity', 'Revenue']
        ];
        
        for (let i = 0; i < 5; i++) {
          const primaryProduct = reportData.topProducts[i] || { name: '-', quantity: 0, revenue: 0 };
          const comparisonProduct = reportData.comparisonTopProducts[i] || { name: '-', quantity: 0, revenue: 0 };
          
          topProductsTableData.push([
            primaryProduct.name || '-',
            Number(primaryProduct.quantity || 0).toString(),
            formatCurrency(primaryProduct.revenue || 0),
            comparisonProduct.name || '-',
            Number(comparisonProduct.quantity || 0).toString(),
            formatCurrency(comparisonProduct.revenue || 0)
          ]);
        }
        
        autoTable(doc, {
          startY: topProductsY + 5,
          head: topProductsTableData.slice(0, 2),
          body: topProductsTableData.slice(2),
          theme: 'grid',
          headStyles: { 
            fillColor: [39, 112, 180], 
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          columnStyles: {
            1: { halign: 'right' },
            2: { halign: 'right' },
            4: { halign: 'right' },
            5: { halign: 'right' }
          },
          tableWidth: 'wrap'
        });
        
        try { finalY = doc.lastAutoTable.finalY; } catch (e) { finalY = topProductsY + 100; }
        
        // For comparison view, add pie charts on the same page if there's enough space
        let remainingSpace = doc.internal.pageSize.getHeight() - finalY - 20; // 20mm margin
        
        if (remainingSpace >= 140) { // If we have enough space for pie charts (at least 140mm)
          // Add title for pie charts
          doc.setFontSize(16);
          doc.setTextColor(39, 112, 180);
          doc.text('Top Products Distribution', 15, finalY + 15);
          
          // Create pie chart data
          if (reportData.topProducts && reportData.topProducts.length > 0) {
            const primaryProductsData = reportData.topProducts.map(p => ({
              name: p.name || 'Unknown',
              quantity: Number(p.quantity || 0)
            }));
            
            const comparisonProductsData = reportData.comparisonTopProducts.map(p => ({
              name: p.name || 'Unknown',
              quantity: Number(p.quantity || 0)
            }));
            
            // Handle zero values
            const allPrimaryZero = primaryProductsData.every(p => p.quantity === 0);
            const allComparisonZero = comparisonProductsData.every(p => p.quantity === 0);
            
            if (allPrimaryZero) {
              primaryProductsData.forEach((p, i) => { p.quantity = 10 + i * 5; });
            }
            
            if (allComparisonZero) {
              comparisonProductsData.forEach((p, i) => { p.quantity = 10 + i * 5; });
            }
            
            // Primary pie chart config
            const primaryPieConfig = {
              type: 'pie',
              data: {
                labels: primaryProductsData.slice(0, 5).map(p => p.name),
                datasets: [{
                  data: primaryProductsData.slice(0, 5).map(p => p.quantity),
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
                responsive: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { boxWidth: 12, font: { size: 10 } }
                  },
                  title: {
                    display: true,
                    text: 'Primary Period - Top Products by Quantity',
                    font: { size: 14 }
                  }
                },
                animation: false
              }
            };
            
            // Comparison pie chart config
            const comparisonPieConfig = {
              type: 'pie',
              data: {
                labels: comparisonProductsData.slice(0, 5).map(p => p.name),
                datasets: [{
                  data: comparisonProductsData.slice(0, 5).map(p => p.quantity),
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(54, 162, 235, 0.8)'
                  ],
                  borderColor: 'white',
                  borderWidth: 1
                }]
              },
              options: {
                responsive: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { boxWidth: 12, font: { size: 10 } }
                  },
                  title: {
                    display: true,
                    text: 'Comparison Period - Top Products by Quantity',
                    font: { size: 14 }
                  }
                },
                animation: false
              }
            };
            
            try {
              const primaryPieImage = await createChartImage(primaryPieConfig, 400, 300);
              const comparisonPieImage = await createChartImage(comparisonPieConfig, 400, 300);
              
              doc.addImage(primaryPieImage, 'PNG', 15, finalY + 20, 85, 85);
              doc.addImage(comparisonPieImage, 'PNG', 105, finalY + 20, 85, 85);
              
              finalY = finalY + 110;
            } catch (e) {
              console.error("Error creating pie charts:", e);
              finalY = finalY + 20;
            }
          }
          
          // Add categories section on the same page
          doc.setFontSize(16);
          doc.setTextColor(39, 112, 180);
          doc.text('Top Selling Categories', 15, finalY + 15);
          
          autoTable(doc, {
            startY: finalY + 20,
            head: [['Category', 'Products Sold', 'Revenue']],
            body: reportData.topCategories.map(category => [
              category.name || '-',
              Number(category.quantity || 0).toString(),
              formatCurrency(category.revenue || 0)
            ]),
            theme: 'grid',
            headStyles: { 
              fillColor: [39, 112, 180], 
              textColor: [255, 255, 255],
              fontStyle: 'bold'
            },
            columnStyles: {
              1: { halign: 'right' },
              2: { halign: 'right' }
            },
            tableWidth: 'wrap'
          });
        } else {
          // Not enough space, add a new page but without header
          doc.addPage();
          
          // Add title for pie charts
          doc.setFontSize(16);
          doc.setTextColor(39, 112, 180);
          doc.text('Top Products Distribution', 15, 20);
          
          if (reportData.topProducts && reportData.topProducts.length > 0) {
            const primaryProductsData = reportData.topProducts.map(p => ({
              name: p.name || 'Unknown',
              quantity: Number(p.quantity || 0)
            }));
            
            const comparisonProductsData = reportData.comparisonTopProducts.map(p => ({
              name: p.name || 'Unknown',
              quantity: Number(p.quantity || 0)
            }));
            
            // Handle zero values
            const allPrimaryZero = primaryProductsData.every(p => p.quantity === 0);
            const allComparisonZero = comparisonProductsData.every(p => p.quantity === 0);
            
            if (allPrimaryZero) {
              primaryProductsData.forEach((p, i) => { p.quantity = 10 + i * 5; });
            }
            
            if (allComparisonZero) {
              comparisonProductsData.forEach((p, i) => { p.quantity = 10 + i * 5; });
            }
            
            // Primary pie chart config
            const primaryPieConfig = {
              type: 'pie',
              data: {
                labels: primaryProductsData.slice(0, 5).map(p => p.name),
                datasets: [{
                  data: primaryProductsData.slice(0, 5).map(p => p.quantity),
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
                responsive: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { boxWidth: 12, font: { size: 10 } }
                  },
                  title: {
                    display: true,
                    text: 'Primary Period - Top Products by Quantity',
                    font: { size: 14 }
                  }
                },
                animation: false
              }
            };
            
            // Comparison pie chart config
            const comparisonPieConfig = {
              type: 'pie',
              data: {
                labels: comparisonProductsData.slice(0, 5).map(p => p.name),
                datasets: [{
                  data: comparisonProductsData.slice(0, 5).map(p => p.quantity),
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(54, 162, 235, 0.8)'
                  ],
                  borderColor: 'white',
                  borderWidth: 1
                }]
              },
              options: {
                responsive: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { boxWidth: 12, font: { size: 10 } }
                  },
                  title: {
                    display: true,
                    text: 'Comparison Period - Top Products by Quantity',
                    font: { size: 14 }
                  }
                },
                animation: false
              }
            };
            
            try {
              const primaryPieImage = await createChartImage(primaryPieConfig, 400, 300);
              const comparisonPieImage = await createChartImage(comparisonPieConfig, 400, 300);
              
              doc.addImage(primaryPieImage, 'PNG', 15, 25, 85, 85);
              doc.addImage(comparisonPieImage, 'PNG', 105, 25, 85, 85);
            } catch (e) {
              console.error("Error creating pie charts:", e);
            }
          }
          
          // Add categories section
          doc.setFontSize(16);
          doc.setTextColor(39, 112, 180);
          doc.text('Top Selling Categories', 15, 120);
          
          autoTable(doc, {
            startY: 125,
            head: [['Category', 'Products Sold', 'Revenue']],
            body: reportData.topCategories.map(category => [
              category.name || '-',
              Number(category.quantity || 0).toString(),
              formatCurrency(category.revenue || 0)
            ]),
            theme: 'grid',
            headStyles: { 
              fillColor: [39, 112, 180], 
              textColor: [255, 255, 255],
              fontStyle: 'bold'
            },
            columnStyles: {
              1: { halign: 'right' },
              2: { halign: 'right' }
            },
            tableWidth: 'wrap'
          });
        }
      } else {
        // Single period top products table
        autoTable(doc, {
          startY: topProductsY + 5,
          head: [['Product', 'Quantity Sold', 'Revenue']],
          body: reportData.topProducts.map(product => [
            product.name || '-',
            Number(product.quantity || 0).toString(),
            formatCurrency(product.revenue || 0)
          ]),
          theme: 'grid',
          headStyles: { 
            fillColor: [39, 112, 180], 
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          columnStyles: {
            1: { halign: 'right' },
            2: { halign: 'right' }
          },
          tableWidth: 'wrap'
        });
        
        try { finalY = doc.lastAutoTable.finalY; } catch (e) { finalY = topProductsY + 100; }
        
        // Add pie chart and categories on same page if space allows
        if (finalY < 160) {
          // Add title for pie chart
          doc.setFontSize(16);
          doc.setTextColor(39, 112, 180);
          doc.text('Top Products Distribution', 15, finalY + 15);
          
          if (reportData.topProducts && reportData.topProducts.length > 0) {
            const productsData = reportData.topProducts.map(p => ({
              name: p.name || 'Unknown',
              quantity: Number(p.quantity || 0)
            }));
            
            const allZero = productsData.every(p => p.quantity === 0);
            
            if (allZero) {
              productsData.forEach((p, i) => { p.quantity = 10 + i * 5; });
            }
            
            const pieConfig = {
              type: 'pie',
              data: {
                labels: productsData.slice(0, 5).map(p => p.name),
                datasets: [{
                  data: productsData.slice(0, 5).map(p => p.quantity),
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
                responsive: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { boxWidth: 12, font: { size: 10 } }
                  },
                  title: {
                    display: true,
                    text: 'Top Products by Quantity',
                    font: { size: 14 },
                    align: 'start'
                  }
                },
                animation: false
              }
            };
            
            try {
              const pieChartImage = await createChartImage(pieConfig, 500, 300);
              doc.addImage(pieChartImage, 'PNG', 30, finalY + 20, 150, 80);
              finalY = finalY + 105;
            } catch (e) {
              console.error("Error creating pie chart:", e);
              finalY = finalY + 20;
            }
          }
          
          // Add categories section
          doc.setFontSize(16);
          doc.setTextColor(39, 112, 180);
          doc.text('Top Selling Categories', 15, finalY + 15);
          
          autoTable(doc, {
            startY: finalY + 20,
            head: [['Category', 'Products Sold', 'Revenue']],
            body: reportData.topCategories.map(category => [
              category.name || '-',
              Number(category.quantity || 0).toString(),
              formatCurrency(category.revenue || 0)
            ]),
            theme: 'grid',
            headStyles: { 
              fillColor: [39, 112, 180], 
              textColor: [255, 255, 255],
              fontStyle: 'bold'
            },
            columnStyles: {
              1: { halign: 'right' },
              2: { halign: 'right' }
            },
            tableWidth: 'wrap'
          });
        } else {
          // Add a new page without header
          doc.addPage();
          
          // Add title for pie chart
          doc.setFontSize(16);
          doc.setTextColor(39, 112, 180);
          doc.text('Top Products Distribution', 15, 20);
          
          if (reportData.topProducts && reportData.topProducts.length > 0) {
            const productsData = reportData.topProducts.map(p => ({
              name: p.name || 'Unknown',
              quantity: Number(p.quantity || 0)
            }));
            
            const allZero = productsData.every(p => p.quantity === 0);
            
            if (allZero) {
              productsData.forEach((p, i) => { p.quantity = 10 + i * 5; });
            }
            
            const pieConfig = {
              type: 'pie',
              data: {
                labels: productsData.slice(0, 5).map(p => p.name),
                datasets: [{
                  data: productsData.slice(0, 5).map(p => p.quantity),
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
                responsive: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { boxWidth: 12, font: { size: 10 } }
                  },
                  title: {
                    display: true,
                    text: 'Top Products by Quantity',
                    font: { size: 14 },
                    align: 'start'
                  }
                },
                animation: false
              }
            };
            
            try {
              const pieChartImage = await createChartImage(pieConfig, 500, 300);
              doc.addImage(pieChartImage, 'PNG', 30, 25, 150, 90);
            } catch (e) {
              console.error("Error creating pie chart:", e);
            }
          }
          
          // Add categories section
          doc.setFontSize(16);
          doc.setTextColor(39, 112, 180);
          doc.text('Top Selling Categories', 15, 120);
          
          autoTable(doc, {
            startY: 125,
            head: [['Category', 'Products Sold', 'Revenue']],
            body: reportData.topCategories.map(category => [
              category.name || '-',
              Number(category.quantity || 0).toString(),
              formatCurrency(category.revenue || 0)
            ]),
            theme: 'grid',
            headStyles: { 
              fillColor: [39, 112, 180], 
              textColor: [255, 255, 255],
              fontStyle: 'bold'
            },
            columnStyles: {
              1: { halign: 'right' },
              2: { halign: 'right' }
            },
            tableWidth: 'wrap'
          });
        }
      }
      
      // Add footer to all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      // Save the PDF
      doc.save(`Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
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
    
    // Render sales chart
    if (previewData.salesByDay && previewData.salesByDay.length > 0) {
      const ctx = document.getElementById('salesChart');
      if (!ctx) return;
      
      if (salesChart) salesChart.destroy();
      
      // Prepare data for chart
      const labels = isComparing ? ['Primary Period', 'Comparison Period'] : ['Total Revenue'];
      const primaryTotalRevenue = Number(previewData.salesSummary.totalRevenue);
      const comparisonTotalRevenue = isComparing && previewData.comparisonSummary 
        ? Number(previewData.comparisonSummary.totalRevenue) : 0;
      
      const data = isComparing ? [primaryTotalRevenue, comparisonTotalRevenue] : [primaryTotalRevenue];
      const colors = isComparing 
        ? ['rgba(39, 112, 180, 0.7)', 'rgba(255, 99, 132, 0.7)']
        : ['rgba(39, 112, 180, 0.7)'];
      
      // Create chart
      const newSalesChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Total Revenue',
            data,
            backgroundColor: colors,
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
            title: {
              display: true,
              text: 'Total Revenue Comparison'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Revenue (Rs)'
              }
            }
          }
        }
      });
      
      setSalesChart(newSalesChart);
      salesChartRef.current = ctx;
    }
    
    // Render primary pie chart
    if (previewData.topProducts && previewData.topProducts.length > 0) {
      const ctx = document.getElementById('primaryProductsChart');
      if (!ctx) return;
      
      if (primaryPieChart) primaryPieChart.destroy();
      
      // Prepare data for chart
      const productsData = previewData.topProducts.map(p => ({
        name: p.name || 'Unknown',
        quantity: Number(p.quantity || 0)
      }));
      
      const allZero = productsData.every(p => p.quantity === 0);
      if (allZero) {
        productsData.forEach((p, i) => { p.quantity = 10 + i * 5; });
      }
      
      // Create chart
      const newPrimaryPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: productsData.map(p => p.name),
          datasets: [{
            data: productsData.map(p => p.quantity),
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
          responsive: true,
          plugins: {
            legend: { position: 'right' },
            title: {
              display: true,
              text: 'Primary Period - Top Products by Quantity',
              align: 'start'
            }
          }
        }
      });
      
      setPrimaryPieChart(newPrimaryPieChart);
      primaryPieChartRef.current = ctx;
    }
    
    // Render comparison pie chart
    if (previewData.comparisonTopProducts && previewData.comparisonTopProducts.length > 0) {
      const ctx = document.getElementById('comparisonProductsChart');
      if (!ctx) return;
      
      if (comparisonPieChart) comparisonPieChart.destroy();
      
      // Prepare data for chart
      const productsData = previewData.comparisonTopProducts.map(p => ({
        name: p.name || 'Unknown',
        quantity: Number(p.quantity || 0)
      }));
      
      const allZero = productsData.every(p => p.quantity === 0);
      if (allZero) {
        productsData.forEach((p, i) => { p.quantity = 10 + i * 5; });
      }
      
      // Create chart
      const newComparisonPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: productsData.map(p => p.name),
          datasets: [{
            data: productsData.map(p => p.quantity),
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(255, 159, 64, 0.8)',
              'rgba(255, 205, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
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
            title: {
              display: true,
              text: 'Comparison Period - Top Products by Quantity',
              align: 'start'
            }
          }
        }
      });
      
      setComparisonPieChart(newComparisonPieChart);
      comparisonPieChartRef.current = ctx;
    }
  }, [previewData, salesChart, primaryPieChart, comparisonPieChart, isComparing]);

  return (
    <>
      <div className={styles.GenerateSection}>
        <button 
          className="btn btn-primary" 
          onClick={generateReport}
          disabled={isLoading}
        >
          {isLoading ? <FaSpinner className={styles.Spinner} /> : <FaFilePdf className={styles.ButtonIcon} />} 
          Generate PDF Report
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={previewReport}
          disabled={isLoading}
        >
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
              <h4>Sales Report</h4>
              <p>Primary Period: {dateRange1.startDate} to {dateRange1.endDate}</p>
              {isComparing && (
                <p>Comparison Period: {dateRange2.startDate} to {dateRange2.endDate}</p>
              )}
            </div>
            
            {previewData.salesSummary && (
              <div className={styles.SummarySection}>
                <h5>Sales Summary</h5>
                <div className={styles.SummaryGrid}>
                  <div className={styles.SummaryCard}>
                    <h6>Total Revenue</h6>
                    <p className={styles.SummaryValue}>
                      {formatCurrency(previewData.salesSummary.totalRevenue)}
                    </p>
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
                    <p className={styles.SummaryValue}>
                      {formatCurrency(previewData.salesSummary.avgOrderValue)}
                    </p>
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
            
            {previewData.salesSummary && (
              <div className={styles.ChartSection}>
                <h5>Sales Comparison</h5>
                <div className={styles.ChartContainer}>
                  <canvas id="salesChart" width="400" height="200"></canvas>
                </div>
              </div>
            )}
            
            {previewData.topProducts && previewData.topProducts.length > 0 && (
              <div className={styles.ProductsSection}>
                <h5>Top Selling Products</h5>
                
                <div className={styles.ProductsContainer}>
                  {/* Primary period products */}
                  <div className={styles.ProductsColumn}>
                    <h6>Primary Period</h6>
                    <div className={styles.TopItemsTable}>
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Revenue</th>
                          </tr>
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
                    
                    <div className={styles.PieChartContainer}>
                      <canvas id="primaryProductsChart" width="300" height="200"></canvas>
                    </div>
                  </div>
                  
                  {/* Comparison period products */}
                  {previewData.comparisonTopProducts && previewData.comparisonTopProducts.length > 0 && (
                    <div className={styles.ProductsColumn}>
                      <h6>Comparison Period</h6>
                      <div className={styles.TopItemsTable}>
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Quantity</th>
                              <th>Revenue</th>
                            </tr>
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
                      
                      <div className={styles.PieChartContainer}>
                        <canvas id="comparisonProductsChart" width="300" height="200"></canvas>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {previewData.topCategories && previewData.topCategories.length > 0 && (
              <div className={styles.TopItemsSection}>
                <h5>Top Selling Categories</h5>
                <div className={styles.TopItemsTable}>
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Products Sold</th>
                        <th>Revenue</th>
                      </tr>
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
