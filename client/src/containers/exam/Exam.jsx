import React, { useState, useEffect } from "react";
import { Timer, WebLiveCapture } from "./../../components";
import "./exam.css";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";

const Exam = ({
  examName = "Periodic Test - DBMS: 20th January, 2022",
  studentID = localStorage.getItem("user_id"),
  studentEmail = localStorage.getItem("user_email"),
  studentName = localStorage.getItem("user_name"),
  duration = 60,
  formLink = localStorage.getItem("examlink"),
}) => {
  const [warningCnt, setWarningCnt] = useState(0);
  const [peopledetected, setPeopledetected] = useState(0);
  const [showMessage, setShowMessage] = useState("");
  const [terminatedUsers, setTerminatedUsers] = useState([]);
  const [userStatus, setUserStatus] = useState("");
  const [isTerminated, setIsTerminated] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      setShowMessage("You have switched tabs or minimized the window.");
      setWarningCnt((prev) => prev + 1);
      disableForm();
      increasePersonDetected();
    }
  };

  const handleFocusChange = () => {
    if (!document.hasFocus()) {
      setShowMessage("You have switched tabs or minimized the window.");
      setWarningCnt((prev) => prev + 1);
      disableForm();
      increasePersonDetected();
    }
  };

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleFocusChange);
    window.addEventListener("focus", handleFocusChange);

    // Cleanup event listeners on component unmount
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleFocusChange);
      window.removeEventListener("focus", handleFocusChange);
    };
  }, []);

  // TO EMBED
  formLink += "?embedded=true";

  const increasePersonDetected = async () => {
    try {
      await axios.patch(
        "/api/warning-person-detected",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      console.error("Failed to increase person detected warning count:", error);
    }
  };

  const notify = () => toast.error("You no longer access to this exam");

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
        alert("User Terminated");
        setIsTerminated(true);
        setUserStatus("block");
      }
    } catch (error) {
      console.error(
        "Failed to Terminate",
        error.response?.data || error.message
      );
    }
  };

  const fetchTerminatedUsers = async () => {
    try {
      const response = await axios.get("/api/terminated-users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTerminatedUsers(response.data);
      const user = response.data.find((user) => studentID === user._id);
      if (user) setUserStatus(user.status);
    } catch (error) {
      console.error(
        "Failed to fetch terminated users:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    fetchTerminatedUsers();
  }, []);

  useEffect(() => {
    if (userStatus === "block") {
      notify();
      setShowMessage("You are Not Allowed. Please contact admin");
      disableForm();
      let overlay = document.getElementById("overlay");
      overlay.classList.add("terminate");
    }
  }, [userStatus]);

  useEffect(() => {
    setTimeout(() => {
      const interval = setInterval(captureCheck, 10000);
      return () => clearInterval(interval);
    }, [25000]);
  }, []);

  function captureCheck() {
    let btn = document.querySelector(
      "#root > div > div > div.left-column > div.image-capture > button"
    );
    btn?.click();
  }

  useEffect(() => {
    let intervalId;
    let initialTimeoutId;

    if (initialLoad) {
      // Set a timeout to handle initial load delay
      initialTimeoutId = setTimeout(() => {
        setInitialLoad(false);
      }, 15000); // Delay for 5 seconds
    } else {
      if (peopledetected !== 1) {
        setWarningCnt((prev) => prev + 1);
        setShowMessage(
          peopledetected > 1
            ? "More Than One Person detected"
            : "No people found"
        );
        disableForm();
        increasePersonDetected();

        // Display the message every 5 seconds
        intervalId = setInterval(() => {
          setShowMessage(
            peopledetected > 1 ? "Multiple People detected" : "No people found"
          );

          // Increment the count if peopledetected stays not equal to 1
          if (peopledetected !== 1) {
            setWarningCnt((prev) => prev + 1);
            increasePersonDetected();
          }
        }, 5000);
      } else {
        if (userStatus !== "block") {
          enableForm();
        }
        clearInterval(intervalId);
      }
    }

    return () => {
      clearTimeout(initialTimeoutId);
      clearInterval(intervalId);
    };
  }, [peopledetected, userStatus, initialLoad]);

  function disableForm() {
    let overlay = document.getElementById("overlay");
    let formBlur = document.getElementById("form-blur");
    overlay.classList.remove("hide");
    overlay.classList.add("disable");
    formBlur.classList.add("blur");
  }

  function enableForm() {
    if (userStatus !== "block") {
      let overlay = document.getElementById("overlay");
      let formBlur = document.getElementById("form-blur");
      overlay.classList.add("hide");
      overlay.classList.remove("disable");
      formBlur.classList.remove("blur");
    }
  }

  // function terminateExam() {
  //   if (warningCnt > 5 && !isTerminated) {
  //     // Check if already terminated
  //     disableForm();
  //     let overlay = document.getElementById("overlay");
  //     overlay.classList.add("terminate");
  //     Terminate();
  //   }
  // }

  return (
    <div className="exam-container">
      <div className="left-column">
        <div className="image-capture">
          <WebLiveCapture setPeopledetected={setPeopledetected} />
        </div>
        <div className="exam-details">
          <h3 className="title-heading">Student Details</h3>
          <div className="details">
            <h4 className="student-id">
              {" "}
              <strong>ID:</strong> {studentID}
            </h4>
            <h4 className="student-id">
              {" "}
              <strong>Name:</strong> {studentName}
            </h4>
            <h4 className="student-email">
              <strong>Email:</strong> {studentEmail}
            </h4>
          </div>
          <ToastContainer />
        </div>
      </div>
      <div className="embedded-form">
        <div className="hide" id="overlay">
          <h2>Message: {showMessage}</h2>
          <h2>Warnings: {warningCnt}</h2>
          {/* <h1>Exam Terminated</h1>
          <h3>Please contact your organization/admin.</h3> */}
        </div>
        <div className="form" id="form-blur">
          <h2 className="title-heading">{examName}</h2>
          <iframe title={examName} className="form-link" src={formLink}>
            Form
          </iframe>
          <div className="responsive-message">
            <h1>Please join via a Laptop/PC for best performance</h1>
          </div>
        </div>
      </div>
      <div className="timer">
        <Timer initialMinute={duration} />
      </div>
    </div>
  );
};

export default Exam;
