import React, { useEffect, useState } from "react";
import Emp_Sidebar from "../../components/Employee/Emp_Sidebar";  
import Header from "../../components/Header";
import './Emp_Dashboard.module.css';
import { Bar } from 'react-chartjs-2'; // Import Bar chart
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { X } from "lucide-react";

// Register all necessary ChartJS components
ChartJS.register(
  CategoryScale,  // For x-axis
  LinearScale,    // For y-axis
  BarElement,     // Bar chart element
  Title,          // For chart title
  Tooltip,        // Tooltips for interactivity
  Legend          // For the chart legend
);

function Dashboard() {
  const [totalOrders, setTotalOrders] = useState(0);
  const [productsData, setProductsData] = useState(null); // State for products data
  const [pendingOrders, setPendingOrders] = useState(0);  // State for total pending orders
  const [allOrders, setAllOrders] = useState(0); // State for all orders (not just today's)
  const [progressPercentage, setProgressPercentage] = useState(0); // State for progress percentage
  const [lowStockCount, setLowStockCount] = useState(0); // New state for low stock products count

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch today's orders
        const response = await fetch('http://localhost:5000/api/orders/today');
        const data = await response.json();
        setTotalOrders(data.total_orders);  // Sets the total orders for today

        // Fetch sorted products (low to high stock)
        const productResponse = await fetch('http://localhost:5000/api/products/sorted');
        const products = await productResponse.json();
        const productNames = products.map(product => product.name);
        const stockQty = products.map(product => product.stock_qty);

        // Count products with stock less than 10
        const lowStockProducts = products.filter(product => product.stock_qty < 10);
        setLowStockCount(lowStockProducts.length);

        setProductsData({
          labels: productNames,
          datasets: [{
            label: 'Stock Quantity',
            data: stockQty,
            backgroundColor: '#f39c12',
          }]
        });

        // Fetch total pending orders
        const pendingResponse = await fetch('http://localhost:5000/api/orders/pending-all');
        const pendingData = await pendingResponse.json();
        setPendingOrders(pendingData.pending_orders);  // Sets the total pending orders

        // Fetch all orders
        const allOrdersResponse = await fetch('http://localhost:5000/api/orders');
        const allOrdersData = await allOrdersResponse.json();
        setAllOrders(allOrdersData.length);

        // Calculate percentage of pending orders
        if (allOrdersData.length > 0) {
          const percentage = (pendingData.pending_orders / allOrdersData.length) * 100;
          setProgressPercentage(percentage);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-container" style={{ overflow: "hidden" }}>
      <Emp_Sidebar />
      <div className="dashboard-content">
        <Header />
        <div className="card-container" style={{ marginLeft: "0px", width: "134%", height: "18vh", marginTop: "80px" }}>
          <div className="card">
            <h2>Today Orders</h2>
            <div className="metric-value">{totalOrders}</div>
          </div>

          <div className="card">
            <h2>Low Stock Products</h2>
            <div className="metric-value " style={{ color: '#FF0000' }}>{lowStockCount}</div>
          </div>

          <div className="card">
            <h2>Pending Orders</h2>
            <div className="metric-value">{pendingOrders}</div>
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
            <h2 style={{fontSize: '25px'}}>Total Orders vs Pending Orders</h2>
            <div style={{ width: '100%', marginTop: '40px' }}>
              {/* Total Orders vs Pending Orders Stats */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Total Orders: </span>
                  <span style={{ fontSize: '18px' }}>{allOrders}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Pending Orders: </span>
                  <span style={{ fontSize: '18px' }}>{pendingOrders}</span>
                </div>
              </div>
              
              {/* Progress Percentage Display */}
              <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                {progressPercentage.toFixed(1)}% of Orders are Pending
              </div>
              
              {/* Custom Progress Bar */}
              <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '10px', height: '30px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${progressPercentage}%`, 
                    backgroundColor: '#FF474C',
                    height: '100%',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: progressPercentage > 15 ? 'white' : 'transparent',
                    transition: 'width 1s ease-in-out'
                  }}
                >
                  {progressPercentage > 15 ? `${progressPercentage.toFixed(1)}%` : ''}
                </div>
              </div>
              
              {/* Legend */}
              <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#FF474C', borderRadius: '4px' }}></div>
                  <span>Pending Orders</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
                  <span>Completed Orders</span>
                </div>
              </div>
              
              {/* Note */}
              <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                <p style={{ margin: '0', fontSize: '14px' }}>
                  <strong>Note:</strong> Percenatge shows the pending order vs Total order.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
