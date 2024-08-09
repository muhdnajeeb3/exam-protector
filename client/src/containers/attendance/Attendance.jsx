import React, { useState } from "react";
import axios from "axios";
import { Table } from "react-bootstrap";
import { Navbar } from "../../components";
import { format } from "date-fns";

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testCode, setTestCode] = useState("");

  const handleTestCodeChange = (e) => {
    setTestCode(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAttendanceRecords([]);

    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(`/api/attendance/${testCode}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAttendanceRecords(response.data.attendanceRecords);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="m-wrap">
        <div className="malicious-input-wrap">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="testCode">Test Code:</label>
              <input
                type="text"
                id="testCode"
                value={testCode}
                onChange={handleTestCodeChange}
              />
            </div>
            <button type="submit" className="ctabutton">
              Submit
            </button>
          </form>
        </div>
        {loading && <div>Loading...</div>}
        {error && <div>No data found!</div>}
        {attendanceRecords.length > 0 && (
          <>
            <h3 className="text-center py-3">
              <b>Attendance Details</b>
            </h3>
            <div className="shadow bg-white p-4">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Sl no.</th>
                    <th>User ID</th>
                    <th>User Name</th>
                    <th>Email</th>
                    <th>Attendance Time</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{record.userId}</td>
                      <td>{record.fullName}</td>
                      <td>{record.email}</td>
                      <td>{format(new Date(record.attendance_time), 'yyyy-MM-dd HH:mm:ss')}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Attendance;
