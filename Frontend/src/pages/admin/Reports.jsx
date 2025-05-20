import React, { useState, useEffect } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from './Reports.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import SalesReport from "../../components/Reports/SalesReport";
import CustomerReport from "../../components/Reports/CustomerReport";
import InventoryReport from "../../components/Reports/InventoryReport";

function Reports() {
  const [reportType, setReportType] = useState("Sales Report");
  const [dateRange1, setDateRange1] = useState({
    startDate: "",
    endDate: ""
  });
  const [dateRange2, setDateRange2] = useState({
    startDate: "",
    endDate: ""
  });
  const [isComparing, setIsComparing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  
  // Report content filters for Sales Report
  const [salesReportFilters, setSalesReportFilters] = useState({
    includeSummary: true,
    includeProducts: true,
    includeCategories: true,
    includeCharts: true
  });
  
  // Report content filters for Customer Report
  const [customerReportFilters, setCustomerReportFilters] = useState({
    includeSummary: true,
    includeNewCustomers: true,
    includeTopCustomers: true,
    includeCharts: true
  });
  
  // Report content filters for Inventory Report
  const [inventoryReportFilters, setInventoryReportFilters] = useState({
    includeSummary: true,
    includeLowestStock: true,
    includeTopSelling: true,
    includeExpiring: true,
    includeCharts: true
  });

  // Set current date on component mount
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setCurrentDate(formattedDate);
  }, []);

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
  };

  const handleDateChange = (range, field, value) => {
    if (range === 1) {
      setDateRange1({
        ...dateRange1,
        [field]: value
      });
    } else {
      setDateRange2({
        ...dateRange2,
        [field]: value
      });
    }
  };

  const toggleComparison = () => {
    setIsComparing(!isComparing);
  };

  const handleSalesFilterChange = (filter) => {
    setSalesReportFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };
  
  const handleCustomerFilterChange = (filter) => {
    setCustomerReportFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };
  
  const handleInventoryFilterChange = (filter) => {
    setInventoryReportFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  const validateInputs = () => {
    if (!reportType) {
      setError("Please select a report type");
      return false;
    }
    
    // For inventory report, we don't need to validate date ranges
    if (reportType === "Inventory Report") {
      return true;
    }
    
    if (!dateRange1.startDate || !dateRange1.endDate) {
      setError("Please select both start and end dates for the primary date range");
      return false;
    }
    
    if (isComparing && (!dateRange2.startDate || !dateRange2.endDate)) {
      setError("Please select both start and end dates for the comparison date range");
      return false;
    }

    return true;
  };

  // Render the appropriate report component based on the selected report type
  const renderReportComponent = () => {
    switch(reportType) {
      case "Sales Report":
        return (
          <SalesReport 
            dateRange1={dateRange1}
            dateRange2={dateRange2}
            isComparing={isComparing}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            error={error}
            setError={setError}
            validateInputs={validateInputs}
            reportFilters={salesReportFilters}
          />
        );
      case "Customer Report":
        return (
          <CustomerReport 
            dateRange1={dateRange1}
            dateRange2={dateRange2}
            isComparing={isComparing}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            error={error}
            setError={setError}
            validateInputs={validateInputs}
            reportFilters={customerReportFilters}
          />
        );
      case "Inventory Report":
        return (
          <InventoryReport 
            currentDate={currentDate}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            error={error}
            setError={setError}
            validateInputs={validateInputs}
            reportFilters={inventoryReportFilters}
          />
        );
      default:
        return <div>Select a report type</div>;
    }
  };

  // Determine if date range selection should be shown
  const showDateRangeSelection = reportType !== "Inventory Report";
  
  // Determine if content filters should be shown and which ones
  const showSalesContentFilters = reportType === "Sales Report";
  const showCustomerContentFilters = reportType === "Customer Report";
  const showInventoryContentFilters = reportType === "Inventory Report";

  return (
    <div className={styles.ReportsContainer}>
      <Sidebar />
      <div className={styles.ReportsContent}>
        <Header />
        <div className={styles.InnerContainer}>
          <div className={styles.TopSection}>
            <h1 className="section-title" style={{ fontSize: '28px', fontWeight: 'bold' }}>Generate Reports</h1>
            
            <div className={styles.ReportControls}>
              <div className={styles.ReportTypeSection}>
                <label htmlFor="reportType">Report Type</label>
                <select
                  id="reportType"
                  className="form-control"
                  value={reportType}
                  onChange={handleReportTypeChange}
                >
                  <option value="Sales Report">Sales Report</option>
                  <option value="Customer Report">Customer Report</option>
                  <option value="Inventory Report">Inventory Report</option>
                </select>
              </div>
              
              {showDateRangeSelection && (
                <div className={styles.CompareToggle}>
                  <label>
                    <input
                      type="checkbox"
                      checked={isComparing}
                      onChange={toggleComparison}
                    />
                    Compare with another period
                  </label>
                </div>
              )}
            </div>
          </div>

          {showDateRangeSelection ? (
            <div className={styles.DateRangeSection}>
              <div className={styles.DateRangeContainer}>
                <h3>Primary Date Range</h3>
                <div className={styles.DateInputs}>
                  <div className={styles.DateField}>
                    <label>Start Date</label>
                    <div className={styles.DateInputWrapper}>
                      <input
                        type="date"
                        className="form-control"
                        value={dateRange1.startDate}
                        onChange={(e) => handleDateChange(1, "startDate", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className={styles.DateField}>
                    <label>End Date</label>
                    <div className={styles.DateInputWrapper}>
                      <input
                        type="date"
                        className="form-control"
                        value={dateRange1.endDate}
                        onChange={(e) => handleDateChange(1, "endDate", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {isComparing && (
                <div className={styles.DateRangeContainer}>
                  <h3>Comparison Date Range</h3>
                  <div className={styles.DateInputs}>
                    <div className={styles.DateField}>
                      <label>Start Date</label>
                      <div className={styles.DateInputWrapper}>
                        <FaCalendarAlt className={styles.CalendarIcon} />
                        <input
                          type="date"
                          className="form-control"
                          value={dateRange2.startDate}
                          onChange={(e) => handleDateChange(2, "startDate", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className={styles.DateField}>
                      <label>End Date</label>
                      <div className={styles.DateInputWrapper}>
                        <FaCalendarAlt className={styles.CalendarIcon} />
                        <input
                          type="date"
                          className="form-control"
                          value={dateRange2.endDate}
                          onChange={(e) => handleDateChange(2, "endDate", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.DateRangeSection}>
              <div className={styles.DateRangeContainer}>
                <h3>Current Date</h3>
                <div className={styles.DateInputs}>
                  <div className={styles.DateField}>
                    <div className={styles.DateInputWrapper}>
                      <FaCalendarAlt className={styles.CalendarIcon} />
                      <input
                        type="date"
                        className="form-control"
                        value={currentDate}
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Sales Report Content Filters */}
          {showSalesContentFilters && (
            <div className={styles.DateRangeSection}>
              <div className={styles.DateRangeContainer}>
                <h3>Report Content</h3>
                <p className="text-muted mb-3">Select the sections to include in your report</p>
                <div className={styles.FilterOptions}>
                  <div className={styles.FilterOption}>
                    <label>
                      <input
                        type="checkbox"
                        checked={salesReportFilters.includeSummary}
                        onChange={() => handleSalesFilterChange('includeSummary')}
                        className={styles.FilterCheckbox}
                      />
                      <span>Sales Summary</span>
                    </label>
                  </div>
                  <div className={styles.FilterOption}>
                    <label>
                      <input
                        type="checkbox"
                        checked={salesReportFilters.includeProducts}
                        onChange={() => handleSalesFilterChange('includeProducts')}
                        className={styles.FilterCheckbox}
                      />
                      <span>Top Products</span>
                    </label>
                  </div>
                  <div className={styles.FilterOption}>
                    <label>
                      <input
                        type="checkbox"
                        checked={salesReportFilters.includeCategories}
                        onChange={() => handleSalesFilterChange('includeCategories')}
                        className={styles.FilterCheckbox}
                      />
                      <span>Categories</span>
                    </label>
                  </div>
                  <div className={styles.FilterOption}>
                    <label>
                      <input
                        type="checkbox"
                        checked={salesReportFilters.includeCharts}
                        onChange={() => handleSalesFilterChange('includeCharts')}
                        className={styles.FilterCheckbox}
                      />
                      <span>Charts & Graphs</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Customer Report Content Filters */}
          {showCustomerContentFilters && (
            <div className={styles.DateRangeSection}>
              <div className={styles.DateRangeContainer}>
                <h3>Report Content</h3>
                <p className="text-muted mb-3">Select the sections to include in your report</p>
                <div className={styles.FilterOptions}>
                  <div className={styles.FilterOption}>
                    <label>
                      <input
                        type="checkbox"
                        checked={customerReportFilters.includeSummary}
                        onChange={() => handleCustomerFilterChange('includeSummary')}
                        className={styles.FilterCheckbox}
                      />
                      <span>Customer Summary</span>
                    </label>
                  </div>
                  <div className={styles.FilterOption}>
                    <label>
                      <input
                        type="checkbox"
                        checked={customerReportFilters.includeNewCustomers}
                        onChange={() => handleCustomerFilterChange('includeNewCustomers')}
                        className={styles.FilterCheckbox}
                      />
                      <span>New Customers</span>
                    </label>
                  </div>
                  <div className={styles.FilterOption}>
                    <label>
                      <input
                        type="checkbox"
                        checked={customerReportFilters.includeTopCustomers}
                        onChange={() => handleCustomerFilterChange('includeTopCustomers')}
                        className={styles.FilterCheckbox}
                      />
                      <span>Top Customers</span>
                    </label>
                  </div>
                  <div className={styles.FilterOption}>
                    <label>
                      <input
                        type="checkbox"
                        checked={customerReportFilters.includeCharts}
                        onChange={() => handleCustomerFilterChange('includeCharts')}
                        className={styles.FilterCheckbox}
                      />
                      <span>Charts & Graphs</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Inventory Report Content Filters */}
          {showInventoryContentFilters && (
            <div className={styles.DateRangeSection}>
              <div className={styles.DateRangeContainer}>
                <h3>Report Content</h3>
                <p className="text-muted mb-3">Select the sections to include in your report</p>
                <div className={styles.FilterOptions}>
                  <div className={styles.FilterOption}>
                    <label>
                      <input
                        type="checkbox"
                        checked={inventoryReportFilters.includeSummary}
                        onChange={() => handleInventoryFilterChange('includeSummary')}
                        className={styles.FilterCheckbox}
                      />
                      <span>Inventory Summary</span>
                    </label>
                  </div>
                  <div className={styles.FilterOption}>
                    <label>
                      <input
                        type="checkbox"
                        checked={inventoryReportFilters.includeLowestStock}
                        onChange={() => handleInventoryFilterChange('includeLowestStock')}
                        className={styles.FilterCheckbox}
                      />
                      <span>Lowest Stock Products</span>
                    </label>
                  </div>
                  <div className={styles.FilterOption}>
                    <label>
                      <input
                        type="checkbox"
                        checked={inventoryReportFilters.includeTopSelling}
                        onChange={() => handleInventoryFilterChange('includeTopSelling')}
                        className={styles.FilterCheckbox}
                      />
                      <span>Top Selling Products</span>
                    </label>
                  </div>
                  <div className={styles.FilterOption}>
                    <label>
                      <input
                        type="checkbox"
                        checked={inventoryReportFilters.includeExpiring}
                        onChange={() => handleInventoryFilterChange('includeExpiring')}
                        className={styles.FilterCheckbox}
                      />
                      <span>Expiring Products</span>
                    </label>
                  </div>
                  <div className={styles.FilterOption}>
                    <label>
                      <input
                        type="checkbox"
                        checked={inventoryReportFilters.includeCharts}
                        onChange={() => handleInventoryFilterChange('includeCharts')}
                        className={styles.FilterCheckbox}
                      />
                      <span>Charts & Graphs</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className={styles.ErrorMessage}>
              <p>{error}</p>
            </div>
          )}

          {renderReportComponent()}
        </div>
      </div>
    </div>
  );
}

export default Reports;
