import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaFilePdf, FaChartBar, FaSpinner } from "react-icons/fa";
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
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  
  // Report content filters
  const [reportFilters, setReportFilters] = useState({
    includeSummary: true,
    includeProducts: true,
    includeCategories: true,
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
    setPreviewData(null);
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
    setPreviewData(null);
  };

  const handleFilterChange = (filter) => {
    setReportFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
    setPreviewData(null);
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
            previewData={previewData}
            setPreviewData={setPreviewData}
            error={error}
            setError={setError}
            validateInputs={validateInputs}
            reportFilters={reportFilters}
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
            previewData={previewData}
            setPreviewData={setPreviewData}
            error={error}
            setError={setError}
            validateInputs={validateInputs}
          />
        );
      case "Inventory Report":
        return (
          <InventoryReport 
            currentDate={currentDate}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            previewData={previewData}
            setPreviewData={setPreviewData}
            error={error}
            setError={setError}
            validateInputs={validateInputs}
          />
        );
      case "Transaction Report":
        // Future implementation
        return <div>Transaction Report - Coming Soon</div>;
      case "Employee Report":
        // Future implementation
        return <div>Employee Report - Coming Soon</div>;
      default:
        return <div>Select a report type</div>;
    }
  };

  // Determine if date range selection should be shown
  const showDateRangeSelection = reportType !== "Inventory Report";
  
  // Determine if content filters should be shown
  const showContentFilters = reportType === "Sales Report";

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
                  <option value="Transaction Report">Transaction Report</option>
                  <option value="Employee Report">Employee Report</option>
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
          
          {/* Report Content Filters */}
          {showContentFilters && (
            <div className={styles.DateRangeSection}>
              <div className={styles.DateRangeContainer}>
                <h3>Report Content</h3>
                <p className="text-muted mb-3">Select the sections to include in your report</p>
                <div className={styles.FilterOptions}>
                  <div className={styles.FilterOption}>
                    <label>
                      <input
                        type="checkbox"
                        checked={reportFilters.includeSummary}
                        onChange={() => handleFilterChange('includeSummary')}
                        className={styles.FilterCheckbox}
                      />
                      <span>Sales Summary</span>
                    </label>
                  </div>
                  <div className={styles.FilterOption}>
                    <label>
                      <input
                        type="checkbox"
                        checked={reportFilters.includeProducts}
                        onChange={() => handleFilterChange('includeProducts')}
                        className={styles.FilterCheckbox}
                      />
                      <span>Top Products</span>
                    </label>
                  </div>
                  <div className={styles.FilterOption}>
                    <label>
                      <input
                        type="checkbox"
                        checked={reportFilters.includeCategories}
                        onChange={() => handleFilterChange('includeCategories')}
                        className={styles.FilterCheckbox}
                      />
                      <span>Categories</span>
                    </label>
                  </div>
                  <div className={styles.FilterOption}>
                    <label>
                      <input
                        type="checkbox"
                        checked={reportFilters.includeCharts}
                        onChange={() => handleFilterChange('includeCharts')}
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
