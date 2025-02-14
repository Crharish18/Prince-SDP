import Sidebar from "../../components/sidebar";
import Header from "../../components/Header";
import './ManageEmployee.css';
// import { Header } from "../components/Header";
// import { DashboardStats } from "../components/DashboardStats";
// import { RevenueChart } from "../components/RevenueChart";
// import { SalesProductChart } from "../components/SalesProductChart";
// import { ReportsSection } from "../components/ReportsSection";


function ManageEmployee() {
  return (
    
    <div className="ManageEmployee-container" >
    <Header/>
        <div className="ManageEmployee-content">
          <Sidebar/>
          
          </div>
   
   </div>
  
  );
}

export default ManageEmployee;