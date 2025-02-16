import Sidebar from "../../components/sidebar";
import Header from "../../components/Header";
import './Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <Sidebar />
      </div>
      <div className="dashboard-content">
        <Header />
        {/* Other components go here */}
      </div>
    </div>
  );
}

export default Dashboard;
