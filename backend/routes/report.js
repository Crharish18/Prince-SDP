const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Use your old db.js connection setup
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Helper function to format date for SQL
const formatDateForSQL = (dateString) => {
  return dateString.split('T')[0];
};

// Helper function to generate sales data for a date range
const getSalesData = async (startDate, endDate) => {
  try {
    // Get overall sales summary
    const salesSummaryQuery = `
      SELECT 
        COUNT(DISTINCT o.order_id) as total_orders,
        SUM(o.total_price) as total_revenue,
        AVG(o.total_price) as avg_order_value
      FROM prince.order o
      WHERE o.created_at BETWEEN ? AND ?
      AND o.status != 'Cancelled'
    `;
    
    const [salesSummary] = await connection.promise().query(salesSummaryQuery, [
      formatDateForSQL(startDate), 
      formatDateForSQL(endDate)
    ]);
    
    // Get top selling products - updated to calculate revenue correctly
    const topProductsQuery = `
      SELECT 
        p.product_id,
        p.name,
        SUM(oi.qty) as quantity,
        SUM(oi.qty * oi.price) as revenue
      FROM prince.order o
      JOIN prince.order_item oi ON o.order_id = oi.order_id
      JOIN prince.products p ON oi.product_id = p.product_id
      WHERE o.created_at BETWEEN ? AND ?
      AND o.status != 'Cancelled'
      GROUP BY p.product_id
      ORDER BY revenue DESC
      LIMIT 5
    `;
    
    const [topProducts] = await connection.promise().query(topProductsQuery, [
      formatDateForSQL(startDate), 
      formatDateForSQL(endDate)
    ]);
    
    // Get top selling categories - updated to calculate revenue correctly
    const topCategoriesQuery = `
      SELECT 
        c.category_id,
        c.category_name as name,
        SUM(oi.qty) as quantity,
        SUM(oi.qty * oi.price) as revenue
      FROM prince.order o
      JOIN prince.order_item oi ON o.order_id = oi.order_id
      JOIN prince.products p ON oi.product_id = p.product_id
      JOIN prince.categories c ON p.category_id = c.category_id
      WHERE o.created_at BETWEEN ? AND ?
      AND o.status != 'Cancelled'
      GROUP BY c.category_id
      ORDER BY revenue DESC
      LIMIT 5
    `;
    
    const [topCategories] = await connection.promise().query(topCategoriesQuery, [
      formatDateForSQL(startDate), 
      formatDateForSQL(endDate)
    ]);
    
    // Get daily sales data for chart
    const salesByDayQuery = `
      SELECT 
        DATE(o.created_at) as date,
        SUM(o.total_price) as revenue,
        COUNT(DISTINCT o.order_id) as orders
      FROM prince.order o
      WHERE o.created_at BETWEEN ? AND ?
      AND o.status != 'Cancelled'
      GROUP BY DATE(o.created_at)
      ORDER BY date
    `;
    
    const [salesByDay] = await connection.promise().query(salesByDayQuery, [
      formatDateForSQL(startDate), 
      formatDateForSQL(endDate)
    ]);
    
    return {
      salesSummary: {
        totalOrders: salesSummary[0]?.total_orders || 0,
        totalRevenue: salesSummary[0]?.total_revenue || 0,
        avgOrderValue: salesSummary[0]?.avg_order_value || 0
      },
      topProducts,
      topCategories,
      salesByDay
    };
  } catch (error) {
    console.error('Error getting sales data:', error);
    throw error;
  }
};

// Calculate percentage change between two values
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Get report data
router.post('/getData', async (req, res) => {
  try {
    const { reportType, primaryRange, comparisonRange } = req.body;
    
    if (!primaryRange || !primaryRange.startDate || !primaryRange.endDate) {
      return res.status(400).json({ message: 'Primary date range is required' });
    }
    
    // Get primary period data
    const primaryData = await getSalesData(primaryRange.startDate, primaryRange.endDate);
    
    let comparisonData = null;
    let salesSummaryWithChange = { ...primaryData.salesSummary };
    
    // If comparison is enabled, get comparison period data
    if (comparisonRange && comparisonRange.startDate && comparisonRange.endDate) {
      comparisonData = await getSalesData(comparisonRange.startDate, comparisonRange.endDate);
      
      // Calculate percentage changes
      salesSummaryWithChange.revenueChange = calculatePercentageChange(
        Number(primaryData.salesSummary.totalRevenue),
        Number(comparisonData.salesSummary.totalRevenue)
      );
      
      salesSummaryWithChange.ordersChange = calculatePercentageChange(
        Number(primaryData.salesSummary.totalOrders),
        Number(comparisonData.salesSummary.totalOrders)
      );
      
      salesSummaryWithChange.avgOrderChange = calculatePercentageChange(
        Number(primaryData.salesSummary.avgOrderValue),
        Number(comparisonData.salesSummary.avgOrderValue)
      );
    }
    
    // Return the data
    res.json({
      salesSummary: salesSummaryWithChange,
      comparisonSummary: comparisonData?.salesSummary || null,
      topProducts: primaryData.topProducts,
      comparisonTopProducts: comparisonData?.topProducts || null,
      topCategories: primaryData.topCategories,
      comparisonTopCategories: comparisonData?.topCategories || null,
      salesByDay: primaryData.salesByDay,
      comparisonSalesByDay: comparisonData?.salesByDay || null
    });
    
  } catch (error) {
    console.error('Error generating report data:', error);
    res.status(500).json({ message: 'Failed to generate report data' });
  }
});

module.exports = router;
