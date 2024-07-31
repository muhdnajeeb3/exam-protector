import React, { useState, useEffect } from "react";
import axios from "axios";
import { Navbar } from "../../components";
import "./MaliciousScreen.css";

const MaliciousScreen = () => {
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testCode, setTestCode] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");

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

    try {
      const response = await axios.get(
        `/api/screenshots/${testCode}/${userId}`
      );
      console.log(response);
      setUserName(response.data.fullName);
      setUserId(response.data.user_id);
      setScreenshots(response.data.screenshots);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "5rem" }}>
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
        {loading && <div>Loading...</div>}
        {error && <div>Error: {error.message}</div>}
        {screenshots.length > 0 ? (
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
              <div
                className="d-flex gap-4 flex-wrap"
                style={{
                  flexWrap: "wrap",
                  gap: "1rem",
                  justifyContent: "center",
                }}
              >
                {screenshots?.map((screenshot, index) => (
                  <img
                    key={index}
                    src={screenshot}
                    alt={`Screenshot ${index}`}
                    width={200}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default MaliciousScreen;
