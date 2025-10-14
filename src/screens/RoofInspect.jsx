import React, { useEffect, useState } from "react";
import { Container, Button, Modal } from "react-bootstrap";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DataGrid } from "@mui/x-data-grid";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const partDescriptions = [
  "UHF Antena",
  "VHF Antena",
  "Field shunting resistor vent",
  "Dynamic Grid Blower Motor Mesh Guard",
  "Exhaust manifold roof cover"
];

const checkboxFields = ["Good", "Refurbish", "Missing", "DamageReplaced"];

const RoofInspect = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");
  const [rows, setRows] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [coords, setCoords] = useState({ latitude: 0, longitude: 0 });
  const locoNumber = localStorage.getItem("locoNumber");
  const userID = localStorage.getItem("userId");
const [loading, setLoading] = useState(false);
  // Get user coordinates
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }),
      (error) => console.warn("Geolocation not available", error),
      { enableHighAccuracy: true }
    );
  }, []);

  // Initialize rows
  useEffect(() => {
    setRows(
      partDescriptions.map((desc, index) => ({
        Id: index + 1,
        PartDescr: desc,
        Good: "No",
        Refurbish: "No",
        Missing: "No",
        DamageReplaced: "No",
        ReplacementValue: "",
        RefurbishValue: ""
      }))
    );
  }, []);

  const handleCheckboxChange = (id, field) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.Id !== id) return row;
        const isCurrentlyYes = row[field] === "Yes";
        const updatedRow = { ...row };
        checkboxFields.forEach((f) => {
          updatedRow[f] = f === field ? (isCurrentlyYes ? "No" : "Yes") : "No";
        });
        return updatedRow;
      })
    );
  };

  const handleInputChange = (id, field, value) => {
    if (/^[0-9.,]*$/.test(value)) {
      setRows((prev) =>
        prev.map((row) => (row.Id === id ? { ...row, [field]: value } : row))
      );
    }
  };

  const getCheckboxDisabled = (row, field) =>
    row[field] === "No" && checkboxFields.some((f) => f !== field && row[f] === "Yes");

  const handleSubmit = async () => {
    if (!locoNumber || isNaN(parseInt(locoNumber))) return alert("Invalid Loco Number");
    if (!userID) return alert("UserID missing");

    const payload = {
      LocoNumber: parseInt(locoNumber),
      UserId: userID,
      InspectFormId: "RFI001",
      Rows: rows.map((row) => ({
        Id: row.Id,
        PartDescr: row.PartDescr || "",
        Good: row.Good === "Yes" ? "Yes" : "No",
        Refurbish: row.Refurbish === "Yes" ? "Yes" : "No",
        Missing: row.Missing === "Yes" ? "Yes" : "No",
        DamageReplaced: row.DamageReplaced === "Yes" ? "Yes" : "No",
        ReplacementValue: row.ReplacementValue || "",
        RefurbishValue: row.RefurbishValue || ""
      })),
      Latitude: coords?.latitude,
      Longitude: coords?.longitude
    };

    try {
      await api.post("RoofInspect/submit", payload);
      navigate("/dashboard");
    } catch (err) {
       const isOffline =
    !navigator.onLine ||
    err.message === "Network Error" ||
    err.code === "ERR_NETWORK";

  if (isOffline) {
   const offlineData = JSON.parse(localStorage.getItem("offlineRoofInspect") || "[]");
  offlineData.push(payload);
  localStorage.setItem("offlineRoofInspect", JSON.stringify(offlineData));
  alert("No internet connection. Data saved locally and will sync automatically.");
  navigate("/dashboard");
  }
    }
    finally
    {
      setLoading(false);
    }
  };

  // Render checkbox group
  const renderCheckboxes = (row) =>
    checkboxFields.map((field) => (
      <div
        key={field}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "4px",
          height: "35px"
        }}
      >
        <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
        <input
          type="checkbox"
          style={{ height: "20px", width: "20px" }}
          checked={row[field] === "Yes"}
          disabled={getCheckboxDisabled(row, field)}
          onChange={() => handleCheckboxChange(row.Id, field)}
        />
      </div>
    ));

  return (
    <>
                                  {loading && <Loader fullscreen />}
    <Container className="mt-4" style={{ marginBottom: "1rem" }}>
      <h3
        className="text-center mb-4"
        style={{ fontWeight: "bold", fontFamily: "Poppins, sans-serif", color: "white" }}
      >
        Roof Inspect
      </h3>

      {isMobile ? (
        <Box>
          {rows.map((row) => (
            <Box key={row.Id} className="mb-3 p-2 border rounded" bgcolor="white">
              <div style={{ paddingBottom: "7px" }}>
                <strong>Num:</strong> {row.Id}
              </div>
              <div style={{ paddingBottom: "7px" }}>
                <strong>Part:</strong> {row.PartDescr}
              </div>
              {renderCheckboxes(row)}
              <div style={{ marginTop: "4px" }}>
                <label>Replacement Value</label>
                <input
                  type="text"
                  value={row.ReplacementValue}
                  disabled={row.DamageReplaced !== "Yes"}
                  onChange={(e) => handleInputChange(row.Id, "ReplacementValue", e.target.value)}
                  className="form-control mt-1"
                />
              </div>
              <div style={{ marginTop: "4px" }}>
                <label>Refurbish Value</label>
                <input
                  type="text"
                  value={row.RefurbishValue}
                  disabled={row.Refurbish !== "Yes"}
                  onChange={(e) => handleInputChange(row.Id, "RefurbishValue", e.target.value)}
                  className="form-control mt-1"
                />
              </div>
            </Box>
          ))}
        </Box>
      ) : (
        <div style={{ height: 465, width: "100%" }}>
          <DataGrid
            rows={rows}
            getRowId={(row) => row.Id}
            columns={[
              { field: "Id", headerName: "Num", width: 80 },
              { field: "PartDescr", headerName: "Part Descr", width: 300 },
              ...checkboxFields.map((field) => ({
                field,
                headerName: field,
                width: 130,
                renderCell: (params) => (
                  <input
                    type="checkbox"
                    checked={params.value === "Yes"}
                    disabled={getCheckboxDisabled(params.row, field)}
                    onChange={() => handleCheckboxChange(params.row.Id, field)}
                    style={{ transform: "scale(1.5)" }}
                  />
                )
              })),
              {
                field: "ReplacementValue",
                headerName: "Replacement Value",
                width: 150,
                renderCell: (params) => (
                  <input
                    type="text"
                    value={params.value}
                    disabled={params.row.DamageReplaced !== "Yes"}
                    onChange={(e) => handleInputChange(params.row.Id, "ReplacementValue", e.target.value)}
                    className="form-control"
                  />
                )
              },
              {
                field: "RefurbishValue",
                headerName: "Refurbish Value",
                width: 150,
                renderCell: (params) => (
                  <input
                    type="text"
                    value={params.value}
                    disabled={params.row.Refurbish !== "Yes"}
                    onChange={(e) => handleInputChange(params.row.Id, "RefurbishValue", e.target.value)}
                    className="form-control"
                  />
                )
              }
            ]}
            pageSize={10}
          />
        </div>
      )}

      <div className="d-flex justify-content-end mt-3">
        <Button onClick={() => setShowConfirm(true)}>Complete Inspection</Button>
      </div>

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm</Modal.Title>
        </Modal.Header>
        <Modal.Body>Do you want to complete the inspection process?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Yes, Complete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
    </>
  );
};

export default RoofInspect;
