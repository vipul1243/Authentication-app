import React, { useState, useEffect } from "react";
import styles from "../styles/Username.module.css";
import extend from "../styles/Profile.module.css";
import { getCurrentIPAddress } from "../helper/helper";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [ipAddress, setIpAddress] = useState("ab:bc:cd:ef");

  const handleGetBook = async (e) => {
    e.preventDefault();
    navigate("/book");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ip = await getCurrentIPAddress();
        setIpAddress(ip);
        toast.success(<b>IP Get Successfully: {ip}</b>);
      } catch (error) {
        toast.error(<b>Could not Get IP!</b>);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto">
      <Toaster position="top-center" reverseOrder={false}></Toaster>
      <div className="flex justify-center items-center h-auto w-auto py-10">
        <div
          className={`${styles.glass} ${extend.glass}`}
          style={{ width: "100%", height: "auto" }}
        >
          <div className="title flex flex-col items-center">
            <h4 className="text-5xl font-bold">Current Location Details</h4>
            <span className="py-4 text-xl w-2/3 text-center text-gray-500">
              Your IP Address : {ipAddress}
            </span>
            <button
              onClick={handleGetBook}
              className={styles.btn}
              style={{ width: "40vw" }}
            >
              Book Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
