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

// Helper function to generate customer data for a date range
const getCustomerData = async (startDate, endDate) => {
  try {
    // Get new customers registered in the period
    const newCustomersQuery = `
      SELECT 
        COUNT(*) as total_new_customers,
        DATE(created_at) as date
      FROM prince.customer
      WHERE created_at BETWEEN ? AND ?
      GROUP BY DATE(created_at)
      ORDER BY date
    `;
    
    const [newCustomersByDay] = await connection.promise().query(newCustomersQuery, [
      formatDateForSQL(startDate), 
      formatDateForSQL(endDate)
    ]);
    
    // Get total new customers
    const totalNewCustomersQuery = `
      SELECT COUNT(*) as total_new_customers
      FROM prince.customer
      WHERE created_at BETWEEN ? AND ?
    `;
    
    const [totalNewCustomers] = await connection.promise().query(totalNewCustomersQuery, [
      formatDateForSQL(startDate), 
      formatDateForSQL(endDate)
    ]);
    
    // Get top customers by order count and revenue
    const topCustomersQuery = `
      SELECT 
        c.customer_id,
        CONCAT(c.first_name, ' ', c.last_name) as customer_name,
        COUNT(DISTINCT o.order_id) as order_count,
        SUM(o.total_price) as total_spent
      FROM prince.customer c
      JOIN prince.order o ON c.customer_id = o.customer_id
      WHERE o.created_at BETWEEN ? AND ?
      AND o.status != 'Cancelled'
      GROUP BY c.customer_id
      ORDER BY order_count DESC, total_spent DESC
      LIMIT 10
    `;
    
    const [topCustomers] = await connection.promise().query(topCustomersQuery, [
      formatDateForSQL(startDate), 
      formatDateForSQL(endDate)
    ]);
    
    return {
      customerSummary: {
        totalNewCustomers: totalNewCustomers[0]?.total_new_customers || 0
      },
      newCustomersByDay,
      topCustomers
    };
  } catch (error) {
    console.error('Error getting customer data:', error);
    throw error;
  }
};

// Helper function to get current inventory data
const getInventoryData = async () => {
  try {
    // Get products with lowest stock
    const lowestStockQuery = `
      SELECT 
        p.product_id,
        p.name,
        p.stock_qty,
        p.price
      FROM prince.products p
      ORDER BY p.stock_qty ASC
      LIMIT 10
    `;
    
    const [lowestStockProducts] = await connection.promise().query(lowestStockQuery);
    
    // Get products with highest stock
    const highestStockQuery = `
      SELECT 
        p.product_id,
        p.name,
        p.stock_qty,
        p.price
      FROM prince.products p
      ORDER BY p.stock_qty DESC
      LIMIT 10
    `;
    
    const [highestStockProducts] = await connection.promise().query(highestStockQuery);
    
    // Get top 5 most selling products with current stock
    const topSellingProductsQuery = `
      SELECT 
        p.product_id,
        p.name,
        p.stock_qty,
        p.price,
        SUM(oi.qty) as total_sold
      FROM prince.products p
      JOIN prince.order_item oi ON p.product_id = oi.product_id
      JOIN prince.order o ON oi.order_id = o.order_id
      WHERE o.status != 'Cancelled'
      GROUP BY p.product_id
      ORDER BY total_sold DESC
      LIMIT 5
    `;
    
    const [topSellingProducts] = await connection.promise().query(topSellingProductsQuery);
    
    // Get products expiring soon
    const expiringProductsQuery = `
      SELECT 
        p.product_id,
        p.name,
        p.stock_qty,
        i.expiry_date,
        DATEDIFF(i.expiry_date, CURDATE()) as days_until_expiry
      FROM prince.products p
      JOIN prince.inventory i ON p.product_id = i.product_id
      WHERE i.expiry_date IS NOT NULL
      ORDER BY days_until_expiry ASC
      LIMIT 5
    `;
    
    const [expiringProducts] = await connection.promise().query(expiringProductsQuery);
    
    // Get total inventory value
    const totalInventoryValueQuery = `
      SELECT 
        SUM(p.stock_qty * p.price) as total_value,
        COUNT(p.product_id) as total_products,
        SUM(p.stock_qty) as total_items
      FROM prince.products p
    `;
    
    const [inventorySummary] = await connection.promise().query(totalInventoryValueQuery);
    
    return {
      inventorySummary: {
        totalValue: inventorySummary[0]?.total_value || 0,
        totalProducts: inventorySummary[0]?.total_products || 0,
        totalItems: inventorySummary[0]?.total_items || 0
      },
      lowestStockProducts,
      highestStockProducts,
      topSellingProducts,
      expiringProducts
    };
  } catch (error) {
    console.error('Error getting inventory data:', error);
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
    
    // Handle different report types
    if (reportType === "Sales Report") {
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
    } 
    else if (reportType === "Customer Report") {
      if (!primaryRange || !primaryRange.startDate || !primaryRange.endDate) {
        return res.status(400).json({ message: 'Primary date range is required' });
      }
      
      // Get primary period data
      const primaryData = await getCustomerData(primaryRange.startDate, primaryRange.endDate);
      
      let comparisonData = null;
      let customerSummaryWithChange = { ...primaryData.customerSummary };
      
      // If comparison is enabled, get comparison period data
      if (comparisonRange && comparisonRange.startDate && comparisonRange.endDate) {
        comparisonData = await getCustomerData(comparisonRange.startDate, comparisonRange.endDate);
        
        // Calculate percentage changes
        customerSummaryWithChange.newCustomersChange = calculatePercentageChange(
          Number(primaryData.customerSummary.totalNewCustomers),
          Number(comparisonData.customerSummary.totalNewCustomers)
        );
      }
      
      // Return the data
      res.json({
        customerSummary: customerSummaryWithChange,
        comparisonSummary: comparisonData?.customerSummary || null,
        newCustomersByDay: primaryData.newCustomersByDay,
        comparisonNewCustomersByDay: comparisonData?.newCustomersByDay || null,
        topCustomers: primaryData.topCustomers,
        comparisonTopCustomers: comparisonData?.topCustomers || null
      });
    }
    else if (reportType === "Inventory Report") {
      // For inventory report, we don't need date ranges as it shows current inventory
      const inventoryData = await getInventoryData();
      
      // Return the data
      res.json(inventoryData);
    }
    else {
      return res.status(400).json({ message: 'Invalid report type' });
    }
    
  } catch (error) {
    console.error('Error generating report data:', error);
    res.status(500).json({ message: 'Failed to generate report data' });
  }
});

module.exports = router;
