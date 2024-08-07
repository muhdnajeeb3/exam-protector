import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MaliciousScreen.css";
import Loading from "../../components/Loading/Loading";
import { Table, Modal, Button } from "react-bootstrap";
import { Navbar } from "../../components";
import { format } from "date-fns";

const MaliciousScreen = () => {
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingmore, setLoadingmore] = useState(false);
  const [error, setError] = useState(null);
  const [testCode, setTestCode] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const handleTestCodeChange = (e) => {
    setTestCode(e.target.value);
  };

  const handleUserIdChange = (e) => {
    setUserId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setScreenshots([]);
    setOffset(0);
    setHasMore(true);

    try {
      const response = await axios.get(`/api/screenshots/${testCode}/${userId}`, {
        params: { limit: 10, offset: 0 },
      });
      setUserName(response.data.fullName);
      setUserId(response.data.user_id);
      setScreenshots(response.data.screenshots);
      setHasMore(response.data.screenshots.length === 10);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    setLoadingmore(true);
    try {
      const response = await axios.get(`/api/screenshots/${testCode}/${userId}`, {
        params: { limit: 10, offset: offset + 10 },
      });
      setScreenshots((prev) => [...prev, ...response.data.screenshots]);
      setOffset((prev) => prev + 10);
      setHasMore(response.data.screenshots.length === 10);
    } catch (err) {
      setError(err);
    } finally {
      setLoadingmore(false);
    }
  };

  const handleViewClick = (screenshot) => {
    setSelectedScreenshot(screenshot);
  };

  const handleCloseModal = () => {
    setSelectedScreenshot(null);
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
            <label htmlFor="userId">User ID:</label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={handleUserIdChange}
            />
            <button type="submit" className="ctabutton">
              Submit
            </button>
          </form>
        </div>
        {loading && <Loading />}
        {error && <div>No data found!</div>}
        {screenshots.length > 0 && (
          <>
            <h3 className="text-center py-3">
              <b>Suspicious Activity</b>
            </h3>
            <div className="shadow bg-white p-4">
              <h5>
                <b>User ID:</b> {userId}
              </h5>
              <h5>
                <b>User Name:</b> {userName}
              </h5>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Sl no.</th>
                    <th>Message</th>
                    <th>Timestamp</th>
                    <th>ScreenShots</th>
                  </tr>
                </thead>
                <tbody>
                  {screenshots?.map((data, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{data.message}</td>
                      <td>{format(data.timestamp, 'yyyy-MM-dd HH:mm:ss')}</td>
                      <td>
                        <Button onClick={() => handleViewClick(data)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {hasMore && (
                <div className="text-center">
                  <Button onClick={loadMore} disabled={loadingmore}>
                    {loadingmore ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <Modal show={selectedScreenshot !== null} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Screenshot</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedScreenshot && (
            <img
              src={selectedScreenshot.screenshot}
              alt="Screenshot"
              width="100%"
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MaliciousScreen;
