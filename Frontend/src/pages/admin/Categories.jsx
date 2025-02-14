import Sidebar from "../../components/sidebar";
import Header from "../../components/Header";
import './Categories.css';
// import { Header } from "../components/Header";
// import { DashboardStats } from "../components/DashboardStats";
// import { RevenueChart } from "../components/RevenueChart";
// import { SalesProductChart } from "../components/SalesProductChart";
// import { ReportsSection } from "../components/ReportsSection";


function Categories() {
  return (
    
    <div className="Categories-container" >
    <Header/>
        <div className="Categories-content">
          <Sidebar/>
          
          </div>
   
   </div>
  
  );
}

export default Categories;