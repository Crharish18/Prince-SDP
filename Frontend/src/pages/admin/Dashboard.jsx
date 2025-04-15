import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";
import Header from "../../components/Header";
import './dashboard.css';
import { Bar } from 'react-chartjs-2'; // Import Bar chart
import { Pie } from 'react-chartjs-2'; // Import Pie chart
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'; // Import BarElement and Pie elements
import { X } from "lucide-react";

// Register all necessary ChartJS components
ChartJS.register(
  CategoryScale,  // For x-axis
  LinearScale,    // For y-axis
  BarElement,     // Bar chart element
  ArcElement,     // Pie chart element
  Title,          // For chart title
  Tooltip,        // Tooltips for interactivity
  Legend          // For the chart legend
);

function Dashboard() {
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);  // State for total expense
  const [productsData, setProductsData] = useState(null); // State for products data
  const [soldThisMonthData, setSoldThisMonthData] = useState(null); // State for products sold this month data
  const [pendingOrders, setPendingOrders] = useState(0);  // State for total pending orders

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/orders/today');
        const data = await response.json();
        setTotalOrders(data.total_orders);  // Sets the total orders for today

        // Fetch today's total income
        const incomeResponse = await fetch('http://localhost:5000/api/orders/today-income');
        const incomeData = await incomeResponse.json();
        setTotalIncome(Number(incomeData.total_income) || 0);

        // Fetch today's total expense
        const expenseResponse = await fetch('http://localhost:5000/api/inventory/today-expense');
        const expenseData = await expenseResponse.json();
        setTotalExpense(Number(expenseData.total_expense) || 0);

        // Fetch sorted products (low to high stock)
        const productResponse = await fetch('http://localhost:5000/api/products/sorted');
        const products = await productResponse.json();
        const productNames = products.map(product => product.name);
        const stockQty = products.map(product => product.stock_qty);

        setProductsData({
          labels: productNames,
          datasets: [{
            label: 'Stock Quantity',
            data: stockQty,
            backgroundColor: '#f39c12',
          }]
        });

        // Fetch products sold this month
        const soldResponse = await fetch('http://localhost:5000/api/orders/sold-this-month');
        const soldData = await soldResponse.json();
        const soldProductNames = soldData.map(product => product.product_name);
        const soldTotalSales = soldData.map(product => product.total_sales);

        setSoldThisMonthData({
          labels: soldProductNames,
          datasets: [{
            label: 'Products Sold This Month',
            data: soldTotalSales,
            backgroundColor: ['#ff5733', '#33ff57', '#3357ff', '#f3c12c', '#8e44ad'],
          }]
        });

        // Fetch total pending orders
        const pendingResponse = await fetch('http://localhost:5000/api/orders/pending-all');
        const pendingData = await pendingResponse.json();
        setPendingOrders(pendingData.pending_orders);  // Sets the total pending orders

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-container" style={{ overflow: "hidden" }}>
      <Sidebar />
      <div className="dashboard-content">
        <Header />
        <div className="card-container" style={{ marginLeft: "0px", width: "100%", height: "18vh", marginTop: "80px" }}>
          <div className="card">
            <h2>Today Orders</h2>
            <div className="metric-value">{totalOrders}</div>
          </div>

          <div className="card">
            <h2>Today Income</h2>
            <div className="metric-value">Rs {totalIncome.toFixed(2)}</div>
          </div>

          <div className="card">
            <h2>Today Expense</h2>
            <div className="metric-value">Rs {totalExpense.toFixed(2)}</div>
          </div>

          <div className="card">
          <h2>Pending Orders</h2>
          <div className="metric-value">{pendingOrders}</div>  {/* Display total pending orders */}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', gap: '5px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', width: '49%', height: '400px' }}>
            <h2 style={{ fontSize: '25px' }}>Product Stock Quantities (Lowest)</h2>
            <div style={{marginTop:'40px'}}>
              {productsData ? (
                <Bar
                  data={productsData}
                  key={Date.now()}
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
                        beginAtZero: true,
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

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', width: '49%', height: '400px' }}>
              <h2 style={{fontSize: '25px'}}>Products Sold This Month</h2>
              <div style={{ width: '500px', height: '500px', marginLeft:'70px', marginTop:'-80px' }}>
                {soldThisMonthData ? (
                  <Pie
                    data={soldThisMonthData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'right', // Positioning the legend to the right
                          labels: {
                            boxWidth: 25, // Optional: Adjust the box width for better readability
                            padding: 20,  // Optional: Add space between the legend and the chart
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => `${context.label}: ${context.raw} units`,
                          }
                        },
                      },
                    }}
                  />
                ) : (
                  <p>Loading product sales data...</p>
                )}
              </div>
            </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
