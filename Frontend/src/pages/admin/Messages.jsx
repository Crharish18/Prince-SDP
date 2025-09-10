import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa"; 
import { Link } from 'react-router-dom';
import Sidebar from "../../components/sidebar";
import Header from "../../components/Header";
import styles from './Messages.module.css'; // Import as CSS module
import 'bootstrap/dist/css/bootstrap.min.css';
import ViewModal from "../../components/Viewmodal"; 
import EditModal from "../../components/EditModal"; 
import AddEntityModal from "../../components/AddEntityModal";

// Messages management component
function Messages() {
  const [messages, setMessages] = useState([]);
  // State for Add Message modal visibility
  const [showModal, setShowModal] = useState(false);
  const [newMessage, setNewMessage] = useState({
    name: '',
    email: '',
    phone_num: '',
    subject: '',
    message: ''
  });

  // State for validation errors in add form
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // State for search input and column
  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  // State for view modal and selected message
  const [showViewModal, setShowViewModal] = useState(false); 
  const [selectedMessage, setSelectedMessage] = useState(null); 
  const [showEditModal, setShowEditModal] = useState(false); 
  const [editedMessage, setEditedMessage] = useState({}); 

  // Fetch messages from backend on mount
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/messages')
      .then((response) => {
        setMessages(response.data);
      })
      .catch((error) => {
        console.error('Error fetching messages:', error);
      });
  }, []);

  // Format date as YYYY-MM-DD
  const formatDate = (date) => {
    const formattedDate = new Date(date);
    const year = formattedDate.getFullYear();
    const month = (formattedDate.getMonth() + 1).toString().padStart(2, '0'); 
    const day = formattedDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Handle search column dropdown change
  const handleSearchColumnChange = (e) => {
    setSearchColumn(e.target.value);  
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);  
  };
  
  // Filter messages based on search input and column
  const filteredMessages = messages.filter((message) => {
    if (!searchText || !searchColumn) return true; 
    const value = message[searchColumn]?.toString().toLowerCase(); 
    return value && value.includes(searchText.toLowerCase());
  });

  // Field definitions for modals
  const messageFields = [
    { label: "Message ID", name: "msg_id", type: "text" },
    { label: "Name", name: "name", type: "text" },
    { label: "Email", name: "email", type: "email" },
    { label: "Phone", name: "phone_num", type: "text" },
    { label: "Subject", name: "subject", type: "text" },
    { label: "Message", name: "message", type: "textarea" },
    { label: "Created At", name: "created_at", type: "text" }
  ];

  // Close Add Message modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Handle input change in Add Message form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMessage({
      ...newMessage,
      [name]: value
    });
  };

  // Validate and save new message to backend
  const handleSaveNewMessage = () => {
    let errors = {};
    if (!newMessage.name) {
      errors.name = "Name is required.";
    }
    if (!newMessage.email) {
      errors.email = "Email is required.";
    }
    if (!newMessage.subject) {
      errors.subject = "Subject is required.";
    }
    if (!newMessage.message) {
      errors.message = "Message is required.";
    }
  
    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      axios
        .post("http://localhost:5000/api/messages", newMessage)
        .then((response) => {
          setMessages([...messages, response.data]);
          setShowModal(false);
        })
        .catch((error) => {
          console.error("Error adding message:", error);
        });
    }
  };

  // Show view modal for selected message
  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setShowViewModal(true);
  };

  // Close view modal
  const handleCloseViewModal = () => {
    setShowViewModal(false); 
  };

  // Delete a message by its ID
  const handleDeleteMessage = (messageId) => {
    axios
      .delete(`http://localhost:5000/api/messages/${messageId}`)
      .then((response) => {
        setMessages((prevMessages) =>
          prevMessages.filter((message) => message.msg_id !== messageId)
        );
      })
      .catch((error) => {
        console.error("Error deleting message:", error);
      });
  };

  // Show edit modal for selected message
  const handleEditMessage = (message) => {
    setSelectedMessage(message);
    setEditedMessage({ ...message });
    setShowEditModal(true);
  };
  
  // Validate and save edited message to backend
  const handleSaveEditMessage = () => {
    axios
      .put(`http://localhost:5000/api/messages/${editedMessage.msg_id}`, editedMessage)
      .then((response) => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg.msg_id === editedMessage.msg_id ? editedMessage : msg))
        );
        setShowEditModal(false);
      })
      .catch((error) => {
        console.error("Error updating message:", error.response ? error.response.data : error);
      });
  };

  // Handle input change in Edit Message modal
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedMessage((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Close edit modal and reset selected message
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedMessage(null);
  };

  // Main render
  return (
    <div className={styles.ManageEmployeeContainer}>
      <Sidebar />
      <div className={styles.ManageEmployeeContent}>
        <Header />
        <div className={styles.InnerContainer} style={{ marginLeft: "10px", width: "100%" }}>
          <div className={styles.TopSection}>
            <h1 className="section-title" style={{ fontSize: '28px', fontWeight: 'bold' }}>Manage Messages</h1>

            {/* Search and action controls */}
            <div className={styles.SearchWrapper}>
              {/* Search column dropdown */}
              <select
                className="form-control"
                value={searchColumn}
                onChange={handleSearchColumnChange}
                style={{ marginRight: "10px", width: "200px" }}
              >
                <option value="msg_id">Message ID</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="subject">Subject</option>
                <option value="created_at">Date</option>
              </select>
              {/* Search input */}
              <input
                type="text"
                className="form-control search-bar"
                value={searchText}
                onChange={handleSearchChange}
                placeholder={`Search by ${searchColumn}...`}
              />
              <div className={styles.BtnContainer}>
                {/* Link to Reviews page */}
                <Link to="/admin/Reviews" className="btn btn-primary" style={{ width: '150px', marginLeft:"10px" }}>
                  Reviews
                </Link>
                {/* Print button (not implemented in this code) */}
                <button className="btn btn-secondary" style={{ width: '150px', marginLeft:"10px" }}>Print</button>
              </div>
            </div>
          </div>

          {/* Messages table */}
          <div className={styles.TableContainer}>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>PHONE</th>
                  <th>SUBJECT</th>
                  <th>DATE</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((message) => (
                    <tr key={message.msg_id}>
                      <td>{message.msg_id}</td>
                      <td>{message.name}</td>
                      <td>{message.email}</td>
                      <td>{message.phone_num || 'N/A'}</td>
                      <td>{message.subject}</td>
                      <td>{message.created_at ? formatDate(message.created_at) : 'N/A'}</td>
                      <td>
                        {/* View message button */}
                        <FaEye
                          style={{ marginRight: "10px", cursor: "pointer", color: "#2770b4" }}
                          onClick={() => handleViewMessage(message)} 
                        />
                        {/* Edit message button */}
                        <FaEdit
                          style={{ marginRight: "10px", cursor: "pointer", color: "#f0ad4e" }}
                          onClick={() => handleEditMessage(message)} 
                        />
                        {/* Delete message button */}
                        <FaTrash
                          style={{ cursor: "pointer", color: "#d9534f" }}
                          onClick={() => handleDeleteMessage(message.msg_id)} 
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">No messages found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Message Modal */}
        <AddEntityModal
          showModal={showModal}
          handleClose={handleCloseModal}
          handleSave={handleSaveNewMessage}
          entityTitle="Message"
          entityData={newMessage}
          entityFields={[
            { label: "Name", name: "name", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Phone", name: "phone_num", type: "text" },
            { label: "Subject", name: "subject", type: "text" },
            { label: "Message", name: "message", type: "textarea", fullWidth: true }
          ]}
          handleInputChange={handleInputChange}
          validationErrors={validationErrors}
        />

        {/* View Modal for message details */}
        <ViewModal
          showViewModal={showViewModal}
          selectedEntity={selectedMessage}
          handleClose={handleCloseViewModal}
          entityTitle="Message"
          entityFields={[
            { label: "Message ID", name: "msg_id" },
            { label: "Name", name: "name" },
            { label: "Email", name: "email" },
            { label: "Phone", name: "phone_num" },
            { label: "Subject", name: "subject" },
            { label: "Message", name: "message", fullWidth: true },
            { label: "Created At", name: "created_at", format: formatDate }
          ]}
        />

        {/* Edit Modal for message */}
        <EditModal
          showEditModal={showEditModal}
          entityData={editedMessage}
          entityTitle="Message"
          entityFields={[
            { label: "Message ID", name: "msg_id", type: "text", disabled: true },
            { label: "Name", name: "name", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Phone", name: "phone_num", type: "text" },
            { label: "Subject", name: "subject", type: "text" },
            { label: "Message", name: "message", type: "textarea", fullWidth: true }
          ]}
          handleClose={() => setShowEditModal(false)}
          handleSaveEditEntity={handleSaveEditMessage}
          handleEditInputChange={handleEditInputChange}
        />
      </div>
    </div>
  );
}

export default Messages;
