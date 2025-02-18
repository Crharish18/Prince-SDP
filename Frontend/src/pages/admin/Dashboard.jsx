import React from "react";
import Sidebar from "../../components/sidebar";
import Header from "../../components/Header";
import './Dashboard.css';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Dashboard() {
  // Chart data
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Total Income',
        data: [12000, 15000, 18000, 20000, 25000, 22000, 27000],
        borderColor: '#2770b4',
        backgroundColor: 'rgba(39, 112, 180, 0.2)',
        fill: true,
      },
      {
        label: 'Total Orders',
        data: [100, 150, 180, 200, 250, 230, 300],
        borderColor: '#f39c12',
        backgroundColor: 'rgba(243, 156, 18, 0.2)',
        fill: true,
      }
    ]
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <Sidebar />
      </div>
      <div className="dashboard-content">
        <Header />
        <div className="card-container">
          <div className="card">
            <h2>Total Income</h2>
            <div className="metric-value">$28,982.00</div>
          </div>
          <div className="card">
            <h2>Total Orders</h2>
            <div className="metric-value">1,200</div>
          </div>
          <div className="card">
            <h2>Total Expense</h2>
            <div className="metric-value">$29,249.00</div>
          </div>
          <div className="card">
            <h2>Total Savings</h2>
            <div className="metric-value">$15,340.00</div>
          </div>
        </div>
        {/* Chart Section */}
        <div className="chart-container">
          <h2>Transactions History</h2>
          <Line data={data} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
