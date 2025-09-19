import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Modal } from "react-bootstrap";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DataGrid } from "@mui/x-data-grid";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const partDescriptions = [
   "A-Side Car body Inertial air filters",
   "B-Side Car body Inertial Air filter",
   "Inertial filter ducting",
   "Electric AC Dirt exhauster",
   "Dirt Exhauster female plug",
   "TB31 to TB38 panel",
   "Panel bath filters",
   "Panel bath filter housing/stand",
   "Dynamic grid blower motor",
   "Traction Main alternator A10 D14",
   "Auxiliary generator"
];

const CenAirInspect = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");

  const [rows, setRows] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const locoNumber = localStorage.getItem("locoNumber");
  const userID = localStorage.getItem("userId");

  useEffect(() => {
    const initialRows = partDescriptions.map((desc, index) => ({
      Id: index + 1,
      PartDescr: desc,
      Good: "No",
      Refurbish: "No",
      Missing: "No",
      DamageReplaced: "No",
      ReplacementValue: "",
      RefurbishValue: "",
    }));
    setRows(initialRows);
  }, []);

  const handleCheckboxChange = (id, field) => {
    setRows((prev) =>
      prev.map((row) =>
        row.Id === id
          ? {
              ...row,
              Good: field === "Good" ? "Yes" : "No",
              Refurbish: field === "Refurbish" ? "Yes" : "No",
              Missing: field === "Missing" ? "Yes" : "No",
              DamageReplaced: field === "DamageReplaced" ? "Yes" : "No",
            }
          : row
      )
    );
  };

  const handleInputChange = (id, field, value) => {
    // Allow only numbers, "," and "."
    if (/^[0-9.,]*$/.test(value)) {
      setRows((prev) =>
        prev.map((row) =>
          row.Id === id ? { ...row, [field]: value } : row
        )
      );
    }
  };

  const handleSubmit = async () => {

    if (!locoNumber || isNaN(parseInt(locoNumber))) {
        alert("Invalid Loco Number");
        return;
    }
    if (!userID) {
        alert("UserID missing");
        return;
    }

    const formattedRows = rows.map(row => ({
        Id: row.Id,
        PartDescr: row.PartDescr || "",
        Good: row.Good === "Yes" ? "Yes" : "No",
        Refurbish: row.Refurbish === "Yes" ? "Yes" : "No",
        Missing: row.Missing === "Yes" ? "Yes" : "No",
        DamageReplaced: row.DamageReplaced === "Yes" ? "Yes" : "No",
        ReplacementValue: row.ReplacementValue || "",
        RefurbishValue: row.RefurbishValue || ""
    }));

    const payload = {
      LocoNumber: parseInt(locoNumber),
      UserID : userID,
      InspectFormID: "CAI001",
      Rows: formattedRows,
    };
    try {
      await api.post("CenAirInspect/submit", payload);
      navigate("/enginedeckinspect");
    } catch (err) {
      console.error(err);
      alert("Error submitting form");
    }
  };

  return (
    <Container className="mt-4" style={{marginBottom : "1rem"}}>
      <h3 className="text-center mb-4" style={{ fontWeight: "bold", fontFamily: "Poppins, sans-serif", color : "white" }}>
        Central Air Inspect
      </h3>

      {isMobile ? (
        <Box>
          {rows.map((row) => (
            <Box key={row.Id} className="mb-3 p-2 border rounded" bgcolor={"white"}>
              <div style={{height: "auto", paddingBottom: "7px"}}><strong style={{paddingRight: "3px"}}>Num:</strong> {row.Id}</div>
              <div style={{height: "auto", paddingBottom: "7px"}}><strong style={{paddingRight: "3px"}}>Part:</strong> {row.PartDescr}</div>

              {["Good", "Refurbish", "Missing", "DamageReplaced"].map((field) => (
                <div key={field} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px", height: "35px" }}>
                  <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <input
                    type="checkbox"
                    style={{height: "20px", width: "20px"}}
                    checked={row[field] === "Yes"}
                    onChange={() => handleCheckboxChange(row.Id, field)}
                  />
                </div>
              ))}

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
              {
                field: "Good",
                headerName: "Good",
                width: 120,
                renderCell: (params) => (
                  <input
                    type="checkbox"
                    checked={params.value === "Yes"}
                    onChange={() => handleCheckboxChange(params.row.Id, "Good")}
                    style={{ transform: "scale(1.5)" }}
                  />
                ),
              },
              {
                field: "Refurbish",
                headerName: "Refurbish",
                width: 120,
                renderCell: (params) => (
                  <input
                    type="checkbox"
                    checked={params.value === "Yes"}
                    onChange={() => handleCheckboxChange(params.row.Id, "Refurbish")}
                    style={{ transform: "scale(1.5)" }}
                  />
                ),
              },
              {
                field: "Missing",
                headerName: "Missing",
                width: 120,
                renderCell: (params) => (
                  <input
                    type="checkbox"
                    checked={params.value === "Yes"}
                    onChange={() => handleCheckboxChange(params.row.Id, "Missing")}
                    style={{ transform: "scale(1.5)" }}
                  />
                ),
              },
              {
                field: "DamageReplaced",
                headerName: "Damage Replaced",
                width: 150,
                renderCell: (params) => (
                  <input
                    type="checkbox"
                    checked={params.value === "Yes"}
                    onChange={() => handleCheckboxChange(params.row.Id, "DamageReplaced")}
                    style={{ transform: "scale(1.5)" }}
                  />
                ),
              },
              {
                field: "ReplacementValue",
                headerName: "Replacement Value",
                width: 150,
                display: "flex",
                alignItems: "center",
                renderCell: (params) => (
                  <input
                    type="text"
                    value={params.value}
                    disabled={params.row.DamageReplaced !== "Yes"}
                    onChange={(e) => handleInputChange(params.row.Id, "ReplacementValue", e.target.value)}
                    className="form-control"
                  />
                ),
              },
              {
                field: "RefurbishValue",
                headerName: "Refurbish Value",
                width: 150,
                display: "flex",
                alignItems: "center",
                renderCell: (params) => (
                  <input
                    type="text"
                    value={params.value}
                    disabled={params.row.Refurbish !== "Yes"}
                    onChange={(e) => handleInputChange(params.row.Id, "RefurbishValue", e.target.value)}
                    className="form-control"
                  />
                ),
              },
            ]}
            pageSize={10}
          />
        </div>
      )}

      <div className="d-flex justify-content-end mt-3">
        <Button onClick={() => setShowConfirm(true)}>Continue Inspection</Button>
      </div>

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm</Modal.Title>
        </Modal.Header>
        <Modal.Body>Do you want to continue with the inspection process?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Yes, Continue
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CenAirInspect;
