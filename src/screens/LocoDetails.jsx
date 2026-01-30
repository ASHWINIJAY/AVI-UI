import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

const LocoDetails = () => {
  const [locoOptions, setLocoOptions] = useState([]);
  const [selectedLoco, setSelectedLoco] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("Inspectiondetails/locolist")
      .then(res => {
        const options = res.data.map(loco => ({
          value: loco,
          label: loco
        }));
        setLocoOptions(options);
      });
  }, []);

  const handleView = () => {
    if (!selectedLoco) return;
    navigate(`/master/inspection-details/${selectedLoco.value}`);
  };

  return (
    <div style={styles.container}>
      <h2>Select Loco Number</h2>

      <Select
        options={locoOptions}
        value={selectedLoco}
        onChange={setSelectedLoco}
        placeholder="Search or select loco number..."
        isSearchable
      />

      <button
        style={{
          ...styles.button,
          backgroundColor: selectedLoco ? "#007bff" : "#ccc"
        }}
        disabled={!selectedLoco}
        onClick={handleView}
      >
        View Details
      </button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "60px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    textAlign: "center"
  },
  button: {
    width: "100%",
    padding: "10px",
    marginTop: "20px",
    fontSize: "16px",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  }
};

export default LocoDetails;
