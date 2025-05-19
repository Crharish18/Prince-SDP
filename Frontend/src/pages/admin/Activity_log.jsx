import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaTrash, FaSortUp, FaSortDown } from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from './Activity_log.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ViewModal from "../../components/Viewmodal";
import PrintModal from "../../components/PrintModal";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import logodash from "../../assets/PicturesAdmin/logoWhite.png";

function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  // Add date sort state
  const [dateSort, setDateSort] = useState(null); // null, 'asc', or 'desc'

  useEffect(() => {
    axios.get('http://localhost:5000/api/activitylog')
      .then(response => {
        setLogs(response.data);
      })
      .catch(error => {
        console.error('Error fetching activity logs:', error);
      });
  }, []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    
    try {
      const date = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) return "N/A";
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };
  
  const handleSearchColumnChange = (e) => {
    setSearchColumn(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  // Handle date sort change
  const handleDateSortChange = (sortDirection) => {
    setDateSort(sortDirection);
  };

  const filteredAndSortedLogs = React.useMemo(() => {
    // First filter the logs
    let filtered = logs.filter((log) => {
      if (!searchText || !searchColumn) return true;
      const value = log[searchColumn]?.toString().toLowerCase();
      return value && value.includes(searchText.toLowerCase());
    });
    
    // Then sort by date if sorting is active
    if (dateSort) {
      filtered = [...filtered].sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp) : null;
        const dateB = b.timestamp ? new Date(b.timestamp) : null;
        
        // Handle null values
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1; // null values at the end
        if (!dateB) return -1;
        
        // Sort based on direction
        if (dateSort === 'asc') {
          return dateA - dateB; // Oldest first
        } else {
          return dateB - dateA; // Newest first
        }
      });
    }
    
    return filtered;
  }, [logs, searchText, searchColumn, dateSort]);

  const handleViewLog = (log) => {
    setSelectedLog(log);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
  };

  const handleDeleteLog = (logId) => {
    if (window.confirm("Are you sure you want to delete this log?")) {
      axios.delete(`http://localhost:5000/api/activitylog/${logId}`)
        .then(response => {
          setLogs(prevLogs =>
            prevLogs.filter(log => log.log_id !== logId)
          );
        })
        .catch(error => {
          console.error("Error deleting log:", error);
        });
    }
  };

  const handleDownloadPDF = () => {
    setShowPrintModal(true);
  };

  return (
    <div className={styles.ManageActivityLogContainer}>
      <Sidebar />
      <div className={styles.ManageActivityLogContent}>
        <Header />
        <div className={styles.InnerContainer} style={{ marginLeft: "10px", width: "100%" }}>
          <div className={styles.TopSection}>
            <h1 className="section-title" style={{ fontSize: '28px', fontWeight: 'bold' }}>Activity Logs</h1>

            <div className={styles.SearchWrapper}>
              <select
                className="form-control"
                value={searchColumn}
                onChange={handleSearchColumnChange}
                style={{ marginRight: "10px", width: "200px" }}
              >
                <option value="log_id">Log ID</option>
                <option value="user_id">User ID</option>
                <option value="action">Action</option>
              </select>
              <input
                type="text"
                className="form-control search-bar"
                value={searchText}
                onChange={handleSearchChange}
                placeholder={`Search by ${searchColumn}...`}
              />
              <div className={styles.BtnContainer}>
                <button className="btn btn-secondary" style={{ width: '150px', marginLeft:"10px" }} onClick={handleDownloadPDF}>Print</button>
              </div>
            </div>

            {/* Date sort controls */}
            <div className={styles.DateSortContainer}>
              <span className={styles.SortLabel}>Sort by Date:</span>
              <div className={styles.SortButtonGroup}>
                <button 
                  className={`${styles.SortButton} ${dateSort === 'asc' ? styles.active : styles.inactive}`}
                  onClick={() => handleDateSortChange('asc')}
                >
                  Oldest First <FaSortUp className={styles.SortIcon} />
                </button>
                <button 
                  className={`${styles.SortButton} ${dateSort === 'desc' ? styles.active : styles.inactive}`}
                  onClick={() => handleDateSortChange('desc')}
                >
                  Newest First <FaSortDown className={styles.SortIcon} />
                </button>
                {dateSort && (
                  <button 
                    className={`${styles.SortButton} ${styles.clear}`}
                    onClick={() => handleDateSortChange(null)}
                  >
                    Clear Sort
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={styles.TableContainer}>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>User ID</th>
                  <th>Action</th>
                  <th className={styles.SortableHeader}>
                    Date
                    {dateSort === 'asc' && <FaSortUp className={styles.SortIcon} />}
                    {dateSort === 'desc' && <FaSortDown className={styles.SortIcon} />}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedLogs.length > 0 ? (
                  filteredAndSortedLogs.map((log) => (
                    <tr key={log.log_id}>
                      <td>{log.log_id}</td>
                      <td>{log.user_id}</td>
                      <td>{log.action}</td>
                      <td>{formatTimestamp(log.timestamp)}</td>
                      <td>
                        <FaEye
                          style={{ marginRight: "10px", cursor: "pointer", color: "#2770b4" }}
                          onClick={() => handleViewLog(log)} 
                        />
                        <FaTrash
                          style={{ cursor: "pointer", color: "#d9534f" }}
                          onClick={() => handleDeleteLog(log.log_id)} 
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No activity logs found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ViewModal
          showViewModal={showViewModal}
          selectedEntity={selectedLog}
          handleClose={handleCloseViewModal}
          entityTitle="Activity Log"
          entityFields={[
            { label: "Log ID", name: "log_id" },
            { label: "User ID", name: "user_id" },
            { label: "Action", name: "action" },
            { label: "Timestamp", name: "timestamp", format: formatTimestamp }
          ]}
        />

        <PrintModal
          show={showPrintModal}
          handleClose={() => setShowPrintModal(false)}
          title="Print Activity Logs Report"
          data={filteredAndSortedLogs}
          fields={[
            { label: "Log ID", field: "log_id" },
            { label: "User ID", field: "user_id" },
            { label: "Action", field: "action" },
            { label: "Timestamp", field: "timestamp", format: (date) => formatTimestamp(date) }
          ]}
          filename="activity_logs_report.pdf"
          reportTitle="Activity Logs Report"
        />
      </div>
    </div>
  );
}

export default ActivityLog;
