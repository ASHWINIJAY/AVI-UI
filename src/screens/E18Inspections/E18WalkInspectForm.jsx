import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Button, Modal, Spinner } from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "../../api/axios";

// 🔹 Define all forms in correct order
export const FORM_ORDER = [
  "BD001", // BELOW DECK Walk around loco
  "FL001", // Front of Loco above
  "BE001", // Back of loco No.2 end
  "EE001", // 18E cab
  "LV001", // Low voltage compartment
  "CR001", // Corridor
  "HV001", // HT high voltage compartment No
  "MA001", // Motor Alternator set
  "EH001", // Exhauster
  "MB001", // Machine brake compartment
  "HS001", // High Speed Circuit breaker Comp
  "ES001", // Exciter set.2
  "HC001", // High Voltage Compartment No 1
  "CC001", // Compressor Compartment
  "CT001", // Cab and toilet No 1 end
  "RF001", // Roof Top Inspect
];

// 🔹 Label mapping for each form
export const FORM_LABELS = {
  BD001: "Below Deck Walk Around Loco",
  FL001: "Front of Loco Above",
  BE001: "Back of Loco No.2 End",
  EE001: "18E Cab",
  LV001: "Low Voltage Compartment",
  CR001: "Corridor",
  HV001: "HT High Voltage Compartment No",
  MA001: "Motor Alternator Set",
  EH001: "Exhauster",
  MB001: "Machine Brake Compartment",
  HS001: "High Speed Circuit Breaker Compartment",
  ES001: "Exciter Set 2",
  HC001: "High Voltage Compartment No 1",
  CC001: "Compressor Compartment",
  CT001: "Cab and Toilet No 1 End",
  RF001: "Roof Top Inspect",
};

const E18WalkInspectForm = () => {
  const { formID } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");

  const storedLocoNumber = localStorage.getItem("locoNumber") ?? "";
  const storedLocoClass = localStorage.getItem("locoClass") ?? "";
  const storedLocoModel = localStorage.getItem("locoModel") ?? "";
  const userId = localStorage.getItem("userId") ?? "";
const storedUserId = localStorage.getItem("userId") ?? "";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectAllGood, setSelectAllGood] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [modalRowId, setModalRowId] = useState(null);
  const [modalPhotoType, setModalPhotoType] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 🔹 Fetch Parts
  useEffect(() => {
    const fetchParts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`E18Inspect/getParts/${formID}`);
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
      } catch {
        setError("Failed to load parts.");
      } finally {
        setLoading(false);
      }
    };
    fetchParts();
  }, [formID]);

  const getPartCost = async (partId, field) => {
    try {
      const res = await axios.get(`E18Inspect/getPartCost?partId=${partId}&field=${field}`);
      return res.data || "0.00";
    } catch {
      return "0.00";
    }
  };

  // 🔹 Checkbox Logic
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

  // 🔹 Photo Modal
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

    const res = await axios.post("E18Inspect/UploadPhoto", fd, {
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

  // 🔹 Submit
  const handleSubmit = async () => {
    if (!storedLocoNumber || !userId) {
      alert("Missing loco or user info.");
      return;
    }

    setSubmitting(true);
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
        RefurbishValue: String(r.RefurbishValue ?? "0.00"),
        MissingValue: String(r.MissingValue ?? "0.00"),
        ReplaceValue: String(r.ReplaceValue ?? "0.00"),
        MissingPhoto: r.MissingPhoto,
        ReplacePhoto: r.DamagePhoto,
      }));

      await axios.post("E18Inspect/SubmitInspection", dtos);
      alert("Inspection submitted successfully!");

      const currentIdx = FORM_ORDER.indexOf(formID);
      const nextForm = FORM_ORDER[currentIdx + 1];
      if (nextForm) {
        navigate(`/inspectE18/${nextForm}`);
      } else {
        alert("✅ All inspections completed!");
       const cleanFormID = formID?.trim().toUpperCase();
     
if (cleanFormID === "RF001") {
 const res = await axios.post(`Dashboard/insertLoco?locoNumber=${encodeURIComponent(parseInt(storedLocoNumber))}&userId=${encodeURIComponent(storedUserId)}`);
  navigate("/choose");
}
      }
    } catch {
      alert("Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // 🔹 DataGrid Columns
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
          <input type="checkbox" checked={selectAllGood} onChange={(e) => handleSelectAllGood(e.target.checked)} />{" "}
          <strong>Good</strong>
        </div>
      ),
      renderCell: (params) => (
        <input type="checkbox" checked={params.row.Good} onChange={() => handleCheckboxChange(params.row.id, "Good")} />
      ),
    },
    {
      field: "Refurbish",
      headerName: "Refurbish",
      width: 120,
      renderCell: (params) => (
        <input type="checkbox" checked={params.row.Refurbish} onChange={() => handleCheckboxChange(params.row.id, "Refurbish")} />
      ),
    },
    {
      field: "Missing",
      headerName: "Missing",
      width: 120,
      renderCell: (params) => (
        <input type="checkbox" checked={params.row.Missing} onChange={() => handleCheckboxChange(params.row.id, "Missing")} />
      ),
    },
    {
      field: "Damage",
      headerName: "Damage",
      width: 120,
      renderCell: (params) => (
        <input type="checkbox" checked={params.row.Damage} onChange={() => handleCheckboxChange(params.row.id, "Damage")} />
      ),
    },
  ];

  return (
    <Container className="mt-4 mb-5">
      <h3 className="text-center text-white mb-3">{FORM_LABELS[formID]}</h3>

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
        <Button variant="secondary" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <Button variant="success" onClick={handleSubmit} disabled={submitting}>
          {formID === "RF001" ? (submitting ? "Submitting..." : "Complete") : submitting ? "Saving..." : "Continue →"}
        </Button>
      </div>

      {/* Photo Modal */}
      <Modal show={showPhotoModal} onHide={() => setShowPhotoModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Upload {modalPhotoType} Photo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input type="file" accept="image/*" onChange={handlePhotoFileChange} />
          {photoPreview && <img src={photoPreview} alt="Preview" style={{ width: "100%", marginTop: 10, borderRadius: 6 }} />}
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

export default E18WalkInspectForm;
