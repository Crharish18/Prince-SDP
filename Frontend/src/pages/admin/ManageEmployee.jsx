import Sidebar from "../../components/sidebar";
import Header from "../../components/Header";
import './ManageEmployee.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

function ManageEmployee() {
  return (
    <div className="ManageEmployee-container">
      <Sidebar /> {/* Sidebar remains fixed */}
      <div className="ManageEmployee-content">
        <Header />

        <div className="inner-container">
          {/* Search and Button Section */}
          <div className="top-section">
            {/* Heading (Properly Aligned at Top) */}
            <h1 className="section-title">Manage Employees</h1>

            {/* Search and Button Section (Appears Below Heading) */}
            <div className="search-wrapper">
              <input
                type="text"
                className="form-control search-bar"
                placeholder="Search employees..."
              />
              <div className="btn-container">
                <button className="btn btn-primary">Add Employee</button>
                <button className="btn btn-secondary">Filter</button>
              </div>
            </div>
          </div>

          {/* Employee Table */}
          
          <div className="table-container">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Address</th>
                  <th>DOB</th>
                  <th>Mobile</th>
                  <th>National ID</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td>123 Main St, City</td>
                  <td>1990-01-01</td>
                  <td>123-456-7890</td>
                  <td>123456789V</td>
                  <td>johndoe@email.com</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Jane Smith</td>
                  <td>456 Oak Rd, Town</td>
                  <td>1985-05-10</td>
                  <td>098-765-4321</td>
                  <td>987654321V</td>
                  <td>janesmith@email.com</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>Mike Johnson</td>
                  <td>789 Pine Ln, Suburb</td>
                  <td>1980-03-25</td>
                  <td>111-222-3333</td>
                  <td>112233445V</td>
                  <td>mikejohnson@email.com</td>
                </tr>
                <tr>
                  <td>4</td>
                  <td>Emily Davis</td>
                  <td>321 Birch Blvd, City</td>
                  <td>1995-08-15</td>
                  <td>444-555-6666</td>
                  <td>223344556V</td>
                  <td>emilydavis@email.com</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ManageEmployee;
