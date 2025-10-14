import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Modal, Form, Image, Alert } from "react-bootstrap";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DataGrid } from "@mui/x-data-grid";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

const partDescriptions = [
  "No.1 end pilots A-side",
  "No.1 end pilot’s B-side",
  "No.1 end coupler",
  "No.1 End Drag box",
  "No.1 End Yoke Assembly",
  "No.1 End Yoke Support",
  "No.1 End Buffer Box",
  "No.1 end coupler support",
  "No.1B-side steps hand rail"
];

const CabLocoInspect = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const locoNumber = localStorage.getItem("locoNumber");
  const userID = localStorage.getItem("userId");
  var locoClass = localStorage.getItem("locoClass");
  const [formId, setFormId] = useState("");
  const [selectAllGood, setSelectAllGood] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingRowId, setPendingRowId] = useState(null);
  const [pendingField, setPendingField] = useState(null);
  const [error1, setError1] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [capturedPhotos, setCapturedPhotos] = useState({});

  useEffect(() => {
    let inspectFormId = "";

    if (locoClass === "D34") {
      inspectFormId = "CL001";
    }
    else if (locoClass === "D35") {
      inspectFormId = "CL002";
    }
else
{
 locoClass = "D35"
  inspectFormId = "CL002";
}
    setFormId(inspectFormId);

    const fetchParts = async () => {
      try {
       // alert(inspectFormId);
        const response = await api.get(
          `WalkInspect/getParts/${locoClass}/${inspectFormId}`
        );
        const partDescriptions = response.data;

        const initialRows = partDescriptions.map((desc, index) => ({
          Id: index + 1,
          PartDescr: desc,
          Good: "No",
          Refurbish: "No",
          Missing: "No",
          DamageReplaced: "No",
          RefurbishValue: "",
        }));
        setRows(initialRows);
      }
      catch (err) {

      }
        
    };

    fetchParts();
  }, [locoClass]);

  useEffect(() => {
    const allGood = rows.length > 0 && rows.every((row) => row.Good === "Yes");
    setSelectAllGood(allGood);
  }, [rows]);

  const handleSelectAllGood = () => {
    const newValue = !selectAllGood;
    setSelectAllGood(newValue);
    setRows(prev =>
      prev.map(r => ({
        ...r,
        Good: newValue ? "Yes" : "No",
        Refurbish: "No",
        Missing: "No",
        DamageReplaced: "No",
      }))
    );
  };

const handleCheckboxChange = async (id, field) => {
  setRows(prevRows =>
    prevRows.map(row => {
      if (row.Id !== id) return row; // ✅ don't touch other rows

      // toggle the clicked checkbox
      const updatedRow = {
        ...row,
        Good: field === "Good" ? (row.Good === "Yes" ? "No" : "Yes") : "No",
        Refurbish: field === "Refurbish" ? (row.Refurbish === "Yes" ? "No" : "Yes") : "No",
        Missing: field === "Missing" ? (row.Missing === "Yes" ? "No" : "Yes") : "No",
        DamageReplaced: field === "DamageReplaced" ? (row.DamageReplaced === "Yes" ? "No" : "Yes") : "No",
      };

      // Ensure only one checkbox is Yes per row
      Object.keys(updatedRow).forEach(key => {
        if (["Good", "Refurbish", "Missing", "DamageReplaced"].includes(key) && key !== field) {
          updatedRow[key] = "No";
        }
      });

      return updatedRow;
    })
  );

  // ✅ If the field is Refurbish → fetch cost for that row
  if (field === "Refurbish") {
    const row = rows.find(r => r.Id === id);
    try {
      const response = await api.get("WalkInspect/getPartCost", {
        params: {
          locoClass: locoClass,
          partDescription: row.PartDescr,
          field: "Refurbish",
        },
      });

      const cost = response.data.refurbishCost;
      setRows(prev =>
        prev.map(r =>
          r.Id === id ? { ...r, RefurbishValue: cost } : r
        )
      );
    } catch (err) {
      console.error("Error fetching refurbish cost:", err);
    }
  }

  // ✅ If DamageReplaced → open modal
  if (field === "DamageReplaced") {
    setPendingRowId(id);
    setShowModal(true);
  }
};


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    setError1("");

    if (!photo) {
      setError1("Photo is required.");
      return;
    }


    setRows((prev) =>
      prev.map((row) =>
        row.Id === pendingRowId
          ? {
              ...row,
              Good: "No",
              Refurbish: "No",
              Missing: "No",
              DamageReplaced: "Yes",
            }
          : row
      )
    );

    setCapturedPhotos((prev) => ({
      ...prev,
      [pendingRowId]: photo,
    }));

    setShowModal(false);
    setPendingRowId(null);
    setPendingField(null);
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleCancel = () => {
    setShowModal(false);
    setPendingRowId(null);
    setPendingField(null);
    setPhoto(null);
    setPhotoPreview(null);
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
const invalidRows = rows.filter(
    (row) =>
      row.Good !== "Yes" &&
      row.Refurbish !== "Yes" &&
      row.Missing !== "Yes" &&
      row.DamageReplaced !== "Yes"
  );

  if (invalidRows.length > 0) {
    const rowIds = invalidRows.map((r) => r.Id).join(", ");
    alert(`Each part must have at least one option selected`);
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
      InspectFormID: "CLI001",
      Rows: formattedRows,
    };
    try {
      setLoading(true);
      await api.post("CabLocoInspect/submit", payload);
      navigate("/electcabinspect");
    } catch (err) {
      console.error(err);
 const isOffline =
    !navigator.onLine ||
    err.message === "Network Error" ||
    err.code === "ERR_NETWORK";

  if (isOffline) {
   const offlineData = JSON.parse(localStorage.getItem("offlineCabLoco") || "[]");
  offlineData.push(payload);
  localStorage.setItem("offlineCabLoco", JSON.stringify(offlineData));
  alert("No internet connection. Data saved locally and will sync automatically.");
  navigate("/electcabinspect");
  }
    }
    finally
    {
      setLoading(false);
    }
  };

  return (
    <>
                                  {loading && <Loader fullscreen />}
    <Container className="mt-4" style={{marginBottom : "1rem"}}>
      <h3 className="text-center mb-4" style={{ fontWeight: "bold", fontFamily: "Poppins, sans-serif", color : "white" }}>
        Cab Loco Inspect
      </h3>

      {isMobile ? (
        <Box>
          <div 
            className="mb-2 p-2 rounded" 
            style={{ backgroundColor: "white", display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <input
              type="checkbox"
              checked={selectAllGood}
              onChange={handleSelectAllGood}
              style={{ width: "28px", height: "28px", cursor: "pointer" }} // bigger checkbox
            />
            <span style={{ fontWeight: "bold" }}>Select All Good</span>
          </div>
          {rows.map((row) => (
            <Box key={row.Id} className="mb-3 p-2 border rounded" bgcolor={"white"}>
              <div style={{height: "auto", paddingBottom: "7px"}}><strong style={{paddingRight: "3px"}}>Num:</strong> {row.Id}</div>
              <div style={{height: "auto", paddingBottom: "7px"}}><strong style={{paddingRight: "3px"}}>Part:</strong> {row.PartDescr}</div>

              {["Good", "Refurbish", "Missing", "DamageReplaced"].map((field) => (
                <div
                  key={field}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "6px",
                    padding: "4px 8px",
                    backgroundColor: "#f8f9fa", // light background
                    borderRadius: "6px",
                  }}
                >
                  <label style={{ fontWeight: "500" }}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type="checkbox"
                    checked={row[field] === "Yes"}
                    onChange={() => handleCheckboxChange(row.Id, field)}
                    style={{ width: "26px", height: "26px", cursor: "pointer" }} // bigger, easier to tap
                  />
                </div>
              ))}
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
                width: 130,
                renderHeader: () => (
                  <div style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "7px", // space between checkbox and label
                    paddingTop: "4px",
                    paddingBottom: "4px",
                    paddingLeft: "5px"
                  }}>
                    <input
                      type="checkbox"
                      checked={selectAllGood}
                      onChange={handleSelectAllGood}
                      style={{ transform: "scale(1.5)", cursor: "pointer" }} // bigger checkbox
                    />
                    <span>Good</span>
                  </div>
                ),
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

      <Modal show={showModal} onHide={handleCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Photo of Damage</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error1 && <Alert variant="danger">{error1}</Alert>}
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Capture or Upload Photo</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              capture="environment" // Opens camera on mobile
              onChange={handleFileChange}
            />
          </Form.Group>
          {photoPreview && (
            <div className="text-center">
              <Image
                src={photoPreview}
                alt="Preview"
                thumbnail
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: "10px",
                  marginTop: "10px",
                }}
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Photo
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
    </>
  );
};

export default CabLocoInspect;
