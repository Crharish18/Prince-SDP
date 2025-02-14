import Sidebar from "../../components/sidebar";
import Header from "../../components/Header";
import './Dashboard.css';
// import { Header } from "../components/Header";
// import { DashboardStats } from "../components/DashboardStats";
// import { RevenueChart } from "../components/RevenueChart";
// import { SalesProductChart } from "../components/SalesProductChart";
// import { ReportsSection } from "../components/ReportsSection";


function Dashboard() {
  return (
    
    <div className="dashboard-container" >
    <Header/>
        <div className="dashboard-content">
          <Sidebar/>
          </div>
   
   </div>
  
  );
}

export default Dashboard;