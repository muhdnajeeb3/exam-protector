import React from "react";
import "./terminated.css";
import axios from "axios";

const Terminated = ({
  studentID,
  warningCnt,
  // message,
  studentName,
  notify,
}) => {
  const Terminate = async () => {
    try {
      const response = await axios.patch(
        `/api/terminate/${studentID}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {
        notify("User Terminated");
      }
    } catch (error) {
      console.error(
        "Failed to Terminate",
        error.response?.data || error.message
      );
    }
  };

  const AllowInExam = async () => {
    try {
      const response = await axios.patch(
        `/api/allow-in-exam/${studentID}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {
        notify("User Allowed to Continue");
      }
    } catch (error) {
      console.error(
        "Failed to Allow in Exam",
        error.response?.data || error.message
      );
    }
  };

  return (
    <>
      <div className="terminated">
        <div className="terminated-details">
          <h4 className="student-id">ID: {studentID}</h4>
          <h6 className="student-id">Name: {studentName}</h6>
          <h6 className="warning-cnt">Warnings: {warningCnt}</h6>
          {/* <h6 className="message">Message: {message}</h6> */}
        </div>
        <div className="btns">
          <button className="terminate-btn" onClick={Terminate}>
            Terminate
          </button>
          <button className="continue-btn" onClick={AllowInExam}>
            Continue
          </button>
        </div>
      </div>
    </>
  );
};

export default Terminated;
