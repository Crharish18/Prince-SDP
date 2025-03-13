import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";
import Header from "../../components/Header";
import './dashboard.css';
import { Bar } from 'react-chartjs-2'; // Import Bar chart
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'; // Import BarElement

// Register all necessary ChartJS components
ChartJS.register(
  CategoryScale,  // For x-axis
  LinearScale,    // For y-axis
  BarElement,     // Bar chart element (make sure this is imported and registered)
  Title,          // For chart title
  Tooltip,        // Tooltips for interactivity
  Legend          // For the chart legend
);

function Dashboard() {
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);  // State for total expense
  const [productsData, setProductsData] = useState(null); // State for products data

  useEffect(() => {
    const fetchTodayOrders = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/orders/today');
        const data = await response.json();
        setTotalOrders(data.total_orders);  // Sets the total orders for today

        // Fetch today's total income
        const incomeResponse = await fetch('http://localhost:5000/api/orders/today-income');
        const incomeData = await incomeResponse.json();
        // Ensure totalIncome is a valid number or set to 0 if not
        setTotalIncome(Number(incomeData.total_income) || 0);  // Ensures it's a number

        // Fetch today's total expense
        const expenseResponse = await fetch('http://localhost:5000/api/inventory/today-expense');
        const expenseData = await expenseResponse.json();
        setTotalExpense(Number(expenseData.total_expense) || 0);  // Set total expense

        // Fetch sorted products (low to high stock)
        const productResponse = await fetch('http://localhost:5000/api/products/sorted');
        const products = await productResponse.json();

        // Prepare the data for the bar chart
        const productNames = products.map(product => product.name);
        const stockQty = products.map(product => product.stock_qty);

        // Set the products data for the bar chart
        setProductsData({
          labels: productNames,
          datasets: [{
            label: 'Stock Quantity',
            data: stockQty,
            backgroundColor: '#f39c12', // Bar color
          }]
        });

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchTodayOrders();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <Sidebar />
      </div>
      <div className="dashboard-content">
        <Header />
        <div className="card-container">
          <div className="card">
            <h2>Today Orders</h2>
            <div className="metric-value" >{totalOrders}</div> {/* This should show the total orders fetched from the backend */}
          </div>

          <div className="card">
            <h2>Today Income</h2>
            <div className="metric-value">Rs {totalIncome.toFixed(2)}</div> {/* This will show today's total income */}
          </div>

          <div className="card">
            <h2>Today Expense</h2>
            <div className="metric-value">Rs {totalExpense.toFixed(2)}</div> {/* Display today's total expense */}
          </div>

          <div className="card">
            <h2>Today Savings</h2>
            <div className="metric-value">$15,340.00</div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="chart-container">
          <h2 style={{fontSize: '25px'}}>Product Stock Quantities (Lowest)</h2>
          {productsData ? (
            <Bar 
              data={productsData} 
              key={Date.now()}  // Ensure the chart is re-rendered correctly
              options={{
                responsive: true,
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Product Names',
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: 'Stock Quantity',
                    },
                    beginAtZero: true, // Ensures the y-axis starts from 0
                  },
                },
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }} 
            />
          ) : (
            <p>Loading products...</p>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
