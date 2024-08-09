import React, { useEffect, useState } from "react";
import logo from "./../../assets/logofont.svg";
import { CopyLink, Navbar } from "../../components";
import "./dashboard.css";
import axios from "axios";
import { format } from "date-fns";
import Loading from "../../components/Loading/Loading";

const mockTests = [
  {
    name: "Periodic Test - DBMS",
    link: "asd-qwvs-dfs",
    time: "20/01/2022 17:30",
  },
  {
    name: "Periodic Test - OSLT",
    link: "pbl-dfse-phd",
    time: "21/01/2022 17:30",
  },
  {
    name: "Periodic Test - SPCC",
    link: "fhh-dfgg-aee",
    time: "22/01/2022 17:30",
  },
];

const Dashboard = () => {
  const [mockTestdata, setMockTestdata] = useState([]);
  const mockTests1 = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("/api/all-created-test", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const tests = await response.data._allTests;
      setMockTestdata(tests);

      console.log(tests);
    } catch (error) {
      alert("Invalid join code. Please try again.");
      console.log(error);
    }
  };

  useEffect(() => {
    mockTests1();
  }, []);
  return (
    <>
      <Navbar />
      <div className="section-type admin-dashboard">
        <h1 className="title-heading" style={{ fontSize: "2rem" }}>
          <b>Admin Dashboard</b>
        </h1>

        <div className="test-dashboard">
          <h2
            className="title-heading text-center w-100"
            style={{ fontSize: "1.5rem" }}
          >
            <strong>Tests</strong>
          </h2>

          <div className="test-items">
            {mockTestdata.map((test) => (
              <div className="test-item">
                <h4 className="test-time">
                  {format(test.createdAt, "yyyy-MM-dd HH:mm:ss")}
                </h4>

                <h4 className="test-name">
                  <a href="/status">{test.test_name}</a>
                </h4>

                <CopyLink link={test.test_code} />
              </div>
            ))}
            {mockTestdata?.length < 1 && <Loading />}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
