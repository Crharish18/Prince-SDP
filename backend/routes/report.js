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
const getSalesData = async (startDate, endDate, filters) => {
  try {
    const result = {};
    
    // Get overall sales summary if needed
    if (!filters || filters.includeSummary) {
      const salesSummaryQuery = `
        SELECT 
          COUNT(DISTINCT o.order_id) as total_orders,
          SUM(o.total_price) as total_revenue,
          AVG(o.total_price) as avg_order_value
        FROM \`order\` o
        WHERE o.created_at BETWEEN ? AND ?
        AND o.status != 'Cancelled'
      `;
      
      const [salesSummary] = await connection.promise().query(salesSummaryQuery, [
        formatDateForSQL(startDate), 
        formatDateForSQL(endDate)
      ]);
      
      result.salesSummary = {
        totalOrders: salesSummary[0]?.total_orders || 0,
        totalRevenue: salesSummary[0]?.total_revenue || 0,
        avgOrderValue: salesSummary[0]?.avg_order_value || 0
      };
    }
    
    // Get top selling products if needed
    if (!filters || filters.includeProducts) {
      const topProductsQuery = `
        SELECT 
          p.product_id,
          p.name,
          SUM(oi.qty) as quantity,
          SUM(oi.final_price) as revenue
        FROM \`order\` o
        JOIN order_item oi ON o.order_id = oi.order_id
        JOIN products p ON oi.product_id = p.product_id
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
      
      result.topProducts = topProducts;
    }
    
    // Get top selling categories if needed
    if (!filters || filters.includeCategories) {
      const topCategoriesQuery = `
        SELECT 
          c.category_id,
          c.category_name as name,
          SUM(oi.qty) as quantity,
          SUM(oi.final_price) as revenue
        FROM \`order\` o
        JOIN order_item oi ON o.order_id = oi.order_id
        JOIN products p ON oi.product_id = p.product_id
        JOIN categories c ON p.category_id = c.category_id
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
      
      result.topCategories = topCategories;
    }
    
    // Get daily sales data for chart if needed
    if (!filters || filters.includeCharts) {
      const salesByDayQuery = `
        SELECT 
          DATE(o.created_at) as date,
          SUM(o.total_price) as revenue,
          COUNT(DISTINCT o.order_id) as orders
        FROM \`order\` o
        WHERE o.created_at BETWEEN ? AND ?
        AND o.status != 'Cancelled'
        GROUP BY DATE(o.created_at)
        ORDER BY date
      `;
      
      const [salesByDay] = await connection.promise().query(salesByDayQuery, [
        formatDateForSQL(startDate), 
        formatDateForSQL(endDate)
      ]);
      
      result.salesByDay = salesByDay;
    }
    
    return result;
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
      FROM customer
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
      FROM customer
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
      FROM customer c
      JOIN \`order\` o ON c.customer_id = o.customer_id
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
      FROM products p
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
      FROM products p
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
      FROM products p
      JOIN order_item oi ON p.product_id = oi.product_id
      JOIN \`order\` o ON oi.order_id = o.order_id
      WHERE o.status != 'Cancelled'
      GROUP BY p.product_id
      ORDER BY total_sold DESC
      LIMIT 5
    `;
    
    const [topSellingProducts] = await connection.promise().query(topSellingProductsQuery);
    
    // Get total inventory value
    const totalInventoryValueQuery = `
      SELECT 
        SUM(p.stock_qty * p.price) as total_value,
        COUNT(p.product_id) as total_products,
        SUM(p.stock_qty) as total_items
      FROM products p
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
      topSellingProducts
    };
  } catch (error) {
    console.error('Error getting inventory data:', error);
    throw error;
  }
};

// Calculate percentage change between two values
const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Route to get report data
router.post('/getData', async (req, res) => {
  try {
    const { reportType, primaryRange, comparisonRange, filters } = req.body;
    
    if (!reportType) {
      return res.status(400).json({ message: 'Report type is required' });
    }
    
    let result = {};
    
    // Handle different report types
    switch (reportType) {
      case 'Sales Report':
        // Get primary period data
        const primaryData = await getSalesData(
          primaryRange.startDate, 
          primaryRange.endDate,
          filters
        );
        
        result = { ...primaryData };
        
        // If comparison is requested, get comparison data
        if (comparisonRange) {
          const comparisonData = await getSalesData(
            comparisonRange.startDate, 
            comparisonRange.endDate,
            filters
          );
          
          result.comparisonSummary = comparisonData.salesSummary;
          result.comparisonTopProducts = comparisonData.topProducts;
          result.comparisonTopCategories = comparisonData.topCategories;
          result.comparisonSalesByDay = comparisonData.salesByDay;
          
          // Calculate percentage changes
          if (result.salesSummary && result.comparisonSummary) {
            result.salesSummary.revenueChange = calculatePercentageChange(
              result.salesSummary.totalRevenue,
              result.comparisonSummary.totalRevenue
            );
            
            result.salesSummary.ordersChange = calculatePercentageChange(
              result.salesSummary.totalOrders,
              result.comparisonSummary.totalOrders
            );
            
            result.salesSummary.avgOrderChange = calculatePercentageChange(
              result.salesSummary.avgOrderValue,
              result.comparisonSummary.avgOrderValue
            );
          }
        }
        break;
        
      case 'Customer Report':
        // Get primary period data
        const primaryCustomerData = await getCustomerData(
          primaryRange.startDate, 
          primaryRange.endDate
        );
        
        result = { ...primaryCustomerData };
        
        // If comparison is requested, get comparison data
        if (comparisonRange) {
          const comparisonCustomerData = await getCustomerData(
            comparisonRange.startDate, 
            comparisonRange.endDate
          );
          
          result.comparisonCustomerSummary = comparisonCustomerData.customerSummary;
          result.comparisonNewCustomersByDay = comparisonCustomerData.newCustomersByDay;
          result.comparisonTopCustomers = comparisonCustomerData.topCustomers;
          
          // Calculate percentage changes
          if (result.customerSummary && result.comparisonCustomerSummary) {
            result.customerSummary.newCustomersChange = calculatePercentageChange(
              result.customerSummary.totalNewCustomers,
              result.comparisonCustomerSummary.totalNewCustomers
            );
          }
        }
        break;
        
      case 'Inventory Report':
        result = await getInventoryData();
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
});

module.exports = router;
