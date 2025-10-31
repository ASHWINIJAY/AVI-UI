import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Button, Modal, Spinner } from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "../../api/axios";

const FORM_ORDER = [
  "BD001", "FL001", "SN001", "CL001", "EL001", "BS001",
  "LM001", "CB001", "TR001", "MP001", "BL001", "CA001",
  "ED001", "CF001", "DE001", "RF001"
];
const FORM_LABELS = {
  BD001: "Below Deck From No.1A to 1B",
  FL001: "Front of Loco Above",
  SN001: "Short Nose",
  CL001: "Cab of Loco Assistant Entrance",
  EL001: "Elect Cabinet Top Left",
  BS001: "Battery Knife Switch Compartment",
  LM001: "Left Middle Door",
  CB001: "Circuit Breaker Control Panel",
  TR001: "Top Right Panel",
  MP001: "Middle Panel",
  BL001: "Bottom Left Panel",
  CA001: "Central Air Compartment",
  ED001: "Engine and Above Deck",
  CF001: "Compressor Fan Rad Compartment",
  DE001: "Compressor Fan Rad Compartment",
  RF001: "Roof Top Inspect",
};


const GM34WalkInspectForm = () => {
  const { formID } = useParams(); // From route /inspect/:formID
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");

  const storedLocoNumber = localStorage.getItem("locoNumber") ?? "";
  const storedLocoClass = localStorage.getItem("locoClass") ?? "";
  const storedLocoModel = localStorage.getItem("locoModel") ?? "";
  const userId = localStorage.getItem("userId") ?? "";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectAllGood, setSelectAllGood] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [modalRowId, setModalRowId] = useState(null);
  const [modalPhotoType, setModalPhotoType] = useState(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 🔹 Fetch Parts from single API
  useEffect(() => {
    const fetchParts = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`GM34Inspect/getParts/${formID}`);
        const parts = Array.isArray(res.data) ? res.data : [];

        const prepared = parts.map((p, idx) => ({
          id: idx + 1,
          PartId: p.partId ?? p.PartId ?? "",
          PartDescr: p.partDescr ?? p.PartDescr ?? "",
          Good: false,
          Refurbish: false,
          Missing: false,
          Damage: false,
          RefurbishValue: "0.00",
          MissingValue: "0.00",
          ReplaceValue: "0.00",
          DamagePhoto: null,
          MissingPhoto: null,
        }));

        setRows(prepared);
setSelectAllGood(false);
      } catch (ex) {
        console.error(ex);
        setError("Failed to load parts.");
      } finally {
        setLoading(false);
      }
    };

    fetchParts();
  }, [formID]);

  // 🔹 Get Part Cost dynamically
  const getPartCost = async (partId, field) => {
    try {
      const res = await axios.get(`GM34Inspect/getPartCost?partId=${partId}&field=${field}`);
      return res.data || "0.00";
    } catch {
      return "0.00";
    }
  };
useEffect(() => {
  setSelectAllGood(false);
}, [formID]);
  // 🔹 Handle Checkbox Logic
  const handleCheckboxChange = async (rowId, field) => {
    const current = rows.find((r) => r.id === rowId);
    if (!current) return;
    const willBeOn = !current[field];
    const reset = { Good: false, Refurbish: false, Missing: false, Damage: false };

    if (field === "Good") {
      setRows((prev) =>
        prev.map((r) =>
          r.id === rowId
            ? { ...r, ...reset, Good: willBeOn, RefurbishValue: "0.00", MissingValue: "0.00", ReplaceValue: "0.00" }
            : r
        )
      );
      return;
    }

    if (field === "Refurbish") {
      const cost = willBeOn ? await getPartCost(current.PartId, "Refurbish") : "0.00";
      setRows((prev) =>
        prev.map((r) =>
          r.id === rowId ? { ...r, ...reset, Refurbish: willBeOn, RefurbishValue: cost } : r
        )
      );
      return;
    }

    if (field === "Missing" || field === "Damage") {
      const costType = field === "Missing" ? "Missing" : "Replace";
      const cost = willBeOn ? await getPartCost(current.PartId, costType) : "0.00";
      setRows((prev) =>
        prev.map((r) =>
          r.id === rowId
            ? {
                ...r,
                ...reset,
                [field]: willBeOn,
                [field === "Missing" ? "MissingValue" : "ReplaceValue"]: cost,
              }
            : r
        )
      );
      if (willBeOn) openPhotoModal(rowId, field);
    }
  };

  // 🔹 Select All Good
  const handleSelectAllGood = (checked) => {
    setSelectAllGood(checked);
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        Good: checked,
        Refurbish: false,
        Missing: false,
        Damage: false,
        RefurbishValue: "0.00",
        MissingValue: "0.00",
        ReplaceValue: "0.00",
      }))
    );
  };

  // 🔹 Photo Modal Controls
  const openPhotoModal = (rowId, type) => {
    setModalRowId(rowId);
    setModalPhotoType(type);
    setPhotoFile(null);
    setPhotoPreview(null);
    setShowPhotoModal(true);
  };

  const handlePhotoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };
// Clears message every time formID changes
useEffect(() => {
  setInfo("");
  setError("");
}, [formID]);

// Auto-hide success message after 2.5s
useEffect(() => {
  if (info) {
    const timer = setTimeout(() => setInfo(""), 2500);
    return () => clearTimeout(timer);
  }
}, [info]);

  const handleSavePhotoModal = async () => {
    if (!photoFile || !modalRowId) return;
    const row = rows.find((r) => r.id === modalRowId);
    if (!row) return;

    const fd = new FormData();
    fd.append("file", photoFile);
    fd.append("formId", formID);
    fd.append("partId", row.PartId);
    fd.append("photoType", modalPhotoType);
    fd.append("locoNumber", storedLocoNumber);
    fd.append("locoModel", storedLocoModel);

    const res = await axios.post("GM34Inspect/UploadPhoto", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const uploadedPath = res.data?.path ?? null;
    setRows((prev) =>
      prev.map((r) =>
        r.id === modalRowId
          ? {
              ...r,
              [modalPhotoType === "Missing" ? "MissingPhoto" : "DamagePhoto"]: uploadedPath,
            }
          : r
      )
    );

    setShowPhotoModal(false);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  // 🔹 Submit Data (Insert / Update)
  const handleSubmit = async () => {
    if (!storedLocoNumber || !userId) {
      setError("Missing loco or user info.");
      return;
    }

    setSubmitting(true);
    setError("");
    setInfo("");

    try {
      const dtos = rows.map((r) => ({
        LocoNumber: storedLocoNumber,
        LocoClass: storedLocoClass,
        LocoModel: storedLocoModel,
        FormId: formID,
        PartId: r.PartId,
        PartDescr: r.PartDescr,
        GoodCheck: r.Good ? "Yes" : "No",
        RefurbishCheck: r.Refurbish ? "Yes" : "No",
        MissingCheck: r.Missing ? "Yes" : "No",
        ReplaceCheck: r.Damage ? "Yes" : "No",
        RefurbishValue: r.RefurbishValue,
        MissingValue: r.MissingValue,
        ReplaceValue: r.ReplaceValue,
        MissingPhoto: r.MissingPhoto,
        ReplacePhoto: r.DamagePhoto,
      }));

      await axios.post("GM34Inspect/SubmitInspection", dtos);
      setInfo("Inspection saved successfully!");

      // Navigate to next form
      const currentIdx = FORM_ORDER.indexOf(formID);
      const nextForm = FORM_ORDER[currentIdx + 1];
      if (nextForm) {
        setTimeout(() => navigate(`/inspect/${nextForm}`), 1000);
      } else {
        setInfo("✅ All inspections completed!");
        navigate("choose");
      }
    } catch (ex) {
      console.error(ex);
      setError("Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // 🔹 Grid Columns
  const columns = [
    { field: "id", headerName: "No.", width: 70 },
    { field: "PartId", headerName: "Part ID", width: 120 },
    { field: "PartDescr", headerName: "Description", flex: 1 },
    {
      field: "Good",
      headerName: "Good",
      width: 100,
      renderHeader: () => (
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <input
            type="checkbox"
            checked={selectAllGood}
            onChange={(e) => handleSelectAllGood(e.target.checked)}
          />{" "}
          <strong>Good</strong>
        </div>
      ),
      renderCell: (params) => (
        <input
          type="checkbox"
          checked={params.row.Good}
          onChange={() => handleCheckboxChange(params.row.id, "Good")}
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
          checked={params.row.Refurbish}
          onChange={() => handleCheckboxChange(params.row.id, "Refurbish")}
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
          checked={params.row.Missing}
          onChange={() => handleCheckboxChange(params.row.id, "Missing")}
        />
      ),
    },
    {
      field: "Damage",
      headerName: "Damage",
      width: 120,
      renderCell: (params) => (
        <input
          type="checkbox"
          checked={params.row.Damage}
          onChange={() => handleCheckboxChange(params.row.id, "Damage")}
        />
      ),
    },
  ];

  return (
    <Container className="mt-4 mb-5">
      <h3 className="text-center text-white mb-3">
  {FORM_LABELS[formID]}
</h3>

      {error && <div style={{ color: "red" }}>{error}</div>}
      {info && <div style={{ color: "green" }}>{info}</div>}

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <Spinner animation="border" />
        </div>
      ) : (
        <div style={{ height: 580, background: "#fff", borderRadius: 8, padding: 8 }}>
          <DataGrid rows={rows} columns={columns} disableRowSelectionOnClick />
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <Button variant="secondary" onClick={() => navigate(-1)}>← Back</Button>
        <Button variant="success" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving..." : "Continue →"}
        </Button>
      </div>

      {/* Photo Modal */}
      <Modal show={showPhotoModal} onHide={() => setShowPhotoModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Upload {modalPhotoType} Photo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input type="file" accept="image/*" onChange={handlePhotoFileChange} />
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Preview"
              style={{ width: "100%", marginTop: 10, borderRadius: 6 }}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPhotoModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSavePhotoModal}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GM34WalkInspectForm;
