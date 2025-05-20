import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa"; 
import { Link } from 'react-router-dom';
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from './Messages.module.css'; // Import as CSS module
import 'bootstrap/dist/css/bootstrap.min.css';
import ViewModal from "../../components/Viewmodal"; 
import EditModal from "../../components/EditModal"; 
import AddEntityModal from "../../components/AddEntityModal";

function Messages() {
  const [messages, setMessages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newMessage, setNewMessage] = useState({
    name: '',
    email: '',
    phone_num: '',
    subject: '',
    message: ''
  });

  const [validationErrors, setValidationErrors] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [showViewModal, setShowViewModal] = useState(false); 
  const [selectedMessage, setSelectedMessage] = useState(null); 
  const [showEditModal, setShowEditModal] = useState(false); 
  const [editedMessage, setEditedMessage] = useState({}); 

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

  const formatDate = (date) => {
    const formattedDate = new Date(date);
    const year = formattedDate.getFullYear();
    const month = (formattedDate.getMonth() + 1).toString().padStart(2, '0'); 
    const day = formattedDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const handleSearchColumnChange = (e) => {
    setSearchColumn(e.target.value);  
  };
  
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);  
  };
  
  const filteredMessages = messages.filter((message) => {
    if (!searchText || !searchColumn) return true; 
    const value = message[searchColumn]?.toString().toLowerCase(); 
    return value && value.includes(searchText.toLowerCase());
  });

  const messageFields = [
    { label: "Message ID", name: "msg_id", type: "text" },
    { label: "Name", name: "name", type: "text" },
    { label: "Email", name: "email", type: "email" },
    { label: "Phone", name: "phone_num", type: "text" },
    { label: "Subject", name: "subject", type: "text" },
    { label: "Message", name: "message", type: "textarea" },
    { label: "Created At", name: "created_at", type: "text" }
  ];

  

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMessage({
      ...newMessage,
      [name]: value
    });
  };

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

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false); 
  };

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

  const handleEditMessage = (message) => {
    setSelectedMessage(message);
    setEditedMessage({ ...message });
    setShowEditModal(true);
  };
  
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

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedMessage((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedMessage(null);
  };

  return (
    <div className={styles.ManageEmployeeContainer}>
      <Sidebar />
      <div className={styles.ManageEmployeeContent}>
        <Header />
        <div className={styles.InnerContainer} style={{ marginLeft: "10px", width: "100%" }}>
          <div className={styles.TopSection}>
            <h1 className="section-title" style={{ fontSize: '28px', fontWeight: 'bold' }}>Manage Messages</h1>

            <div className={styles.SearchWrapper}>
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
              <input
                type="text"
                className="form-control search-bar"
                value={searchText}
                onChange={handleSearchChange}
                placeholder={`Search by ${searchColumn}...`}
              />
              <div className={styles.BtnContainer}>
               <Link to="/admin/Reviews" className="btn btn-primary" style={{ width: '150px', marginLeft:"10px" }}>
                  Reviews
                </Link>
                
                <button className="btn btn-secondary" style={{ width: '150px', marginLeft:"10px" }}>Print</button>
              </div>
            </div>
          </div>

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
                        <FaEye
                          style={{ marginRight: "10px", cursor: "pointer", color: "#2770b4" }}
                          onClick={() => handleViewMessage(message)} 
                        />
                        <FaEdit
                          style={{ marginRight: "10px", cursor: "pointer", color: "#f0ad4e" }}
                          onClick={() => handleEditMessage(message)} 
                        />
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
